import {
	type Angles,
	rotate,
	type SpacePoint,
	unrotate,
} from "~/graphs/rotate.ts";

import { query } from "./query.ts";

interface GraphData {
	/** Pairs of indices of points, for each path of edges. */
	edges: [number, number][][];

	points: [x: number, y: number, z: number][];

	/** Indices of points, for each path of dots. */
	vertices: number[][];
}

const namespace = "http://www.w3.org/2000/svg";

/** Radians that a graph turns by for each pixel it's dragged. */
const turnRate = 0.008;

/** Radians that a graph turns by for each press of a key or button. */
const turnStep = Math.PI / 12;

/** Farthest that a graph can be tilted, so that it's never upside down. */
const pitchLimit = Math.PI / 2;

/** Pixels that a pointer can move without it being a drag. */
const tapDistance = 4;

/** A drawing of a graph that can be turned, and whose vertices can be moved. */
export class MovableDrawing extends HTMLElement {
	#angles: Angles = { pitch: 0, yaw: 0 };
	readonly #data = JSON.parse(this.dataset.graph ?? "") as GraphData;
	#frame = 0;
	#handles: SVGCircleElement[] = [];
	readonly #home = this.#data.points.map(([x, y, z]): SpacePoint => ({
		x,
		y,
		z,
	}));
	readonly #isDeep = this.#home.some(({ z }) => z !== 0);
	readonly #paths = [...this.querySelectorAll("path")];
	#points = [...this.#home];
	readonly #reset = query(this, "[data-action=reset]", HTMLButtonElement);
	#selected: number | undefined;
	readonly #svg = query(this, "svg", SVGSVGElement);

	connectedCallback() {
		this.#addHandles();
		this.#svg.addEventListener("pointerdown", (event) => {
			this.#onPointerDown(event);
		});
		this.#reset.addEventListener("click", () => {
			this.#onReset();
		});

		if (this.#isDeep) {
			this.#svg.tabIndex = 0;
			this.#svg.addEventListener("keydown", (event) => {
				this.#onKeyDown(event);
			});
			this.querySelector("[data-action=turn]")?.addEventListener(
				"click",
				() => {
					this.#turn(turnStep, this.#angles.pitch ? 0 : turnStep * 2);
				},
			);
		}
	}

	#addHandles() {
		const size = Math.min(
			7,
			...this.#home.map(
				({ x, y }, index) =>
					Math.min(
						...this.#home
							.slice(index + 1)
							.map((other) => Math.hypot(other.x - x, other.y - y)),
					) / 1.6,
			),
		);

		this.#handles = this.#data.points.map((_, index) => {
			const handle = document.createElementNS(namespace, "circle");

			if (this.#data.vertices.some((indices) => indices.includes(index))) {
				handle.classList.add("handle");
				handle.dataset.index = index.toString();
				handle.setAttribute("r", Math.max(3.5, size).toFixed(1));
				this.#svg.append(handle);
			}

			return handle;
		});

		this.#draw();
	}

	#draw() {
		const turned = this.#points.map((point) => rotate(point, this.#angles));
		const at = (index: number) =>
			`${turned[index].x.toFixed(1)} ${turned[index].y.toFixed(1)}`;

		for (const [i, pairs] of this.#data.edges.entries()) {
			this.#paths[i].setAttribute(
				"d",
				pairs.map(([from, to]) => `M${at(from)}L${at(to)}`).join(""),
			);
		}

		for (const [i, indices] of this.#data.vertices.entries()) {
			this.#paths[this.#data.edges.length + i].setAttribute(
				"d",
				indices.map((index) => `M${at(index)}h0`).join(""),
			);
		}

		for (const [index, handle] of this.#handles.entries()) {
			handle.setAttribute("cx", turned[index].x.toFixed(1));
			handle.setAttribute("cy", turned[index].y.toFixed(1));
		}

		const isMoved =
			this.#angles.pitch !== 0 ||
			this.#angles.yaw !== 0 ||
			this.#points.some((point, index) => point !== this.#home[index]);

		this.toggleAttribute("data-moved", isMoved);
		this.#reset.disabled = !isMoved;
	}

	/** Moves a vertex to where a pointer is, without changing how near it looks. */
	#move(index: number, { clientX, clientY }: MouseEvent) {
		const matrix = this.#svg.getScreenCTM();

		if (matrix) {
			const { x, y } = new DOMPoint(clientX, clientY).matrixTransform(
				matrix.inverse(),
			);
			const { z } = rotate(this.#points[index], this.#angles);

			this.#points[index] = unrotate({ x, y, z }, this.#angles);
			this.#draw();
		}
	}

	#onKeyDown(event: KeyboardEvent) {
		const turns: Record<string, [yaw: number, pitch: number] | undefined> = {
			ArrowDown: [0, -turnStep],
			ArrowLeft: [-turnStep, 0],
			ArrowRight: [turnStep, 0],
			ArrowUp: [0, turnStep],
		};
		const turn = turns[event.key];

		if (turn && !event.altKey && !event.ctrlKey && !event.metaKey) {
			event.preventDefault();
			this.#turn(...turn);
		}
	}

	#onPointerDown(event: PointerEvent) {
		if (event.button !== 0) {
			return;
		}

		const target = event.target as SVGElement;
		const index = target.dataset.index
			? Number(target.dataset.index)
			: undefined;
		const drag = new AbortController();
		const { signal } = drag;
		let { clientX, clientY } = event;
		let isDragging = false;

		this.#stop();
		this.#svg.setPointerCapture(event.pointerId);

		this.#svg.addEventListener(
			"pointermove",
			(moved) => {
				isDragging ||=
					Math.hypot(moved.clientX - clientX, moved.clientY - clientY) >
					tapDistance;

				if (!isDragging) {
					return;
				}

				this.toggleAttribute("data-moving", true);

				if (index !== undefined) {
					this.#move(index, moved);
				} else if (this.#isDeep) {
					this.#turn(
						(moved.clientX - clientX) * turnRate,
						(clientY - moved.clientY) * turnRate,
					);
					({ clientX, clientY } = moved);
				}
			},
			{ signal },
		);

		const finish = () => {
			drag.abort();
			this.removeAttribute("data-moving");
		};

		this.#svg.addEventListener("pointercancel", finish, { signal });
		this.#svg.addEventListener(
			"pointerup",
			(released) => {
				finish();

				// Dragging isn't possible for everybody: vertices can be tapped, then placed
				if (!isDragging) {
					if (index !== undefined) {
						this.#select(this.#selected === index ? undefined : index);
					} else if (this.#selected !== undefined) {
						this.#move(this.#selected, released);
						this.#select(undefined);
					}
				}
			},
			{ signal },
		);
	}

	#onReset() {
		const startAngles = this.#angles;
		const startPoints = this.#points;
		const startTime = performance.now();
		const duration = matchMedia("(prefers-reduced-motion: reduce)").matches
			? 0
			: 350;

		const step = (time: number) => {
			const progress = duration
				? Math.min(1, Math.max(0, (time - startTime) / duration))
				: 1;
			const left = (1 - progress) ** 3;

			this.#angles = {
				pitch: startAngles.pitch * left,
				yaw: startAngles.yaw * left,
			};
			this.#points = this.#home.map((home, index) =>
				progress === 1
					? home
					: {
							x: home.x + (startPoints[index].x - home.x) * left,
							y: home.y + (startPoints[index].y - home.y) * left,
							z: home.z + (startPoints[index].z - home.z) * left,
						},
			);
			this.#draw();

			if (progress < 1) {
				this.#frame = requestAnimationFrame(step);
			}
		};

		this.#stop();
		this.#select(undefined);

		// It's about to be disabled, which would lose the focus it has
		if (this.#reset.matches(":focus-visible") && this.#isDeep) {
			this.#svg.focus();
		}

		this.#frame = requestAnimationFrame(step);
	}

	#select(index: number | undefined) {
		this.#selected = index;

		for (const [other, handle] of this.#handles.entries()) {
			handle.toggleAttribute("data-selected", other === index);
		}
	}

	#stop() {
		cancelAnimationFrame(this.#frame);
	}

	#turn(yaw: number, pitch: number) {
		this.#angles = {
			pitch: Math.min(
				pitchLimit,
				Math.max(-pitchLimit, this.#angles.pitch + pitch),
			),
			yaw: this.#angles.yaw + yaw,
		};
		this.#draw();
	}
}

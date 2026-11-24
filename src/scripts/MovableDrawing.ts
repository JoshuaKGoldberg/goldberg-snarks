import {
	type Angles,
	rotate,
	type SpacePoint,
	unrotate,
} from "~/graphs/rotate.ts";

import { query } from "./query.ts";
import { type ClientPoint, toDrawing } from "./toDrawing.ts";

export interface MovableGraph {
	/** Indices of points that each path of dots is at. */
	dots: number[][];

	/** Pairs of indices of points, for each path of edges. */
	edges: number[][][];

	names: string[];

	points: number[][];
}

interface View {
	angles: Angles;
	points: readonly SpacePoint[];
}

/** Radians that a graph turns by for each pixel it's dragged. */
const dragRate = 0.008;

/** Radians that a graph turns by for each press of a key or button. */
const turnStep = Math.PI / 12;

/** Radians that a graph that's still flat is also tilted by when it's turned by a button. */
const firstTilt = Math.PI / 6;

/** Farthest that a graph can be tilted, so that it's never upside down. */
const pitchLimit = Math.PI / 2;

/** Units that a vertex moves by for each press of a key. */
const nudgeStep = 5;

/** Pixels that a pointer can move without it being a drag. */
const tapDistance = 4;

/** Farthest that a press can be from the center of a vertex. */
const reachInPixels = { coarse: 22, fine: 12 };

const milliseconds = 350;

const turns: Readonly<Record<string, readonly [yaw: number, pitch: number]>> = {
	ArrowDown: [0, -turnStep],
	ArrowLeft: [-turnStep, 0],
	ArrowRight: [turnStep, 0],
	ArrowUp: [0, turnStep],
};

const nudges: Readonly<Record<string, readonly [x: number, y: number]>> = {
	ArrowDown: [0, nudgeStep],
	ArrowLeft: [-nudgeStep, 0],
	ArrowRight: [nudgeStep, 0],
	ArrowUp: [0, -nudgeStep],
};

const coarsePointer = matchMedia("(pointer: coarse)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

/** A drawing of a graph that can be turned, and whose vertices can be moved. */
export class MovableDrawing extends HTMLElement {
	readonly #data = JSON.parse(this.dataset.graph ?? "") as MovableGraph;
	readonly #dotPaths = this.querySelectorAll("path.dots");
	readonly #edgePaths = this.querySelectorAll("path:not(.dots)");
	#frame = 0;
	readonly #home: View = {
		angles: { pitch: 0, yaw: 0 },
		points: this.#data.points.map(([x, y, z]) => ({ x, y, z })),
	};
	readonly #isDeep = this.hasAttribute("data-deep");
	readonly #labels = [...this.querySelectorAll("text")].map((element) => {
		const index = Number(element.dataset.vertex);
		const { x, y } = this.#home.points[index];

		return {
			element,
			index,
			x: element.x.baseVal[0].value - x,
			y: element.y.baseVal[0].value - y,
		};
	});
	#near: number | undefined;
	readonly #nearMarker = createMarker(this, ".near");
	readonly #next = query(this, "[data-action=next]", HTMLButtonElement);
	readonly #reset = query(this, "[data-action=reset]", HTMLButtonElement);
	#selected: number | undefined;
	readonly #selectedMarker = createMarker(this, ".selected");
	#selection = new AbortController();
	readonly #status = query(this, "[role=status]", HTMLElement);
	readonly #svg = query(this, "svg", SVGSVGElement);

	/** What will be shown once any animation is done. */
	#goal = this.#home;

	#view = this.#home;

	connectedCallback() {
		this.#svg.addEventListener("pointerdown", (event) => {
			this.#onPointerDown(event);
		});
		this.#svg.addEventListener("pointermove", (event) => {
			if (event.pointerType === "mouse" && !event.buttons) {
				this.#mark(this.#findNearest(event));
			}
		});
		this.#svg.addEventListener("pointerleave", () => {
			this.#mark(undefined);
		});

		// Whether a touch scrolls can't depend on where it is by using touch-action
		this.#svg.addEventListener(
			"touchstart",
			(event) => {
				const [touch, ...others] = event.touches;

				if (
					this.#selected !== undefined &&
					!others.length &&
					this.#findNearest(touch) === this.#selected
				) {
					event.preventDefault();
				}
			},
			{ passive: false },
		);

		this.#next.addEventListener("click", () => {
			this.#selectNext();
		});
		this.#next.addEventListener("keydown", (event) => {
			this.#onNextKey(event);
		});
		this.#reset.addEventListener("click", () => {
			this.#onReset();
		});

		if (this.#isDeep) {
			const turn = query(this, "[data-action=turn]", HTMLButtonElement);

			turn.addEventListener("click", () => {
				this.#animateTo(
					this.#turn(
						this.#goal,
						turnStep,
						this.#goal.angles.pitch ? 0 : firstTilt,
					),
				);
			});
			turn.addEventListener("keydown", (event) => {
				const step = getStep(turns, event);

				if (step) {
					event.preventDefault();
					this.#animateTo(this.#turn(this.#goal, ...step));
				}
			});
		}
	}

	#animateTo(goal: View) {
		const start = this.#view;
		const startTime = performance.now();

		const step = (time: number) => {
			const progress = Math.min(
				1,
				Math.max(0, (time - startTime) / milliseconds),
			);

			if (progress === 1) {
				this.#show(goal);
			} else {
				this.#show(mix(goal, start, (1 - progress) ** 3));
				this.#frame = requestAnimationFrame(step);
			}
		};

		this.#mark(undefined);
		this.#setGoal(goal);

		if (reducedMotion.matches) {
			this.#show(goal);
		} else {
			this.#frame = requestAnimationFrame(step);
		}
	}

	#draw() {
		const { angles, points } = this.#view;
		const turned = points.map((point) => rotate(point, angles));
		const at = (index: number) =>
			`${turned[index].x.toFixed(1)} ${turned[index].y.toFixed(1)}`;

		for (const [i, pairs] of this.#data.edges.entries()) {
			this.#edgePaths[i].setAttribute(
				"d",
				pairs.map(([from, to]) => `M${at(from)}L${at(to)}`).join(""),
			);
		}

		for (const [i, indices] of this.#data.dots.entries()) {
			this.#dotPaths[i].setAttribute(
				"d",
				indices.map((index) => `M${at(index)}h0`).join(""),
			);
		}

		for (const { element, index, x, y } of this.#labels) {
			element.setAttribute("x", (turned[index].x + x).toFixed(1));
			element.setAttribute("y", (turned[index].y + y).toFixed(1));
		}

		this.#drawMarkers();
	}

	#drawMarkers() {
		for (const [marker, index] of [
			[this.#nearMarker, this.#near],
			[this.#selectedMarker, this.#selected],
		] as const) {
			marker.element.toggleAttribute("data-shown", index !== undefined);

			// It stays with the vertex that it was on as it fades out
			marker.index = index ?? marker.index;

			const point = this.#view.points[marker.index];
			const { x, y } = rotate(point, this.#view.angles);

			marker.element.setAttribute("cx", x.toFixed(1));
			marker.element.setAttribute("cy", y.toFixed(1));
		}
	}

	/** Finds the vertex that a press would be on, if any. */
	#findNearest(press: ClientPoint) {
		const { scale, x, y } = toDrawing(this.#svg, press);
		const { angles, points } = this.#view;
		let nearest: number | undefined;
		let nearestDistance =
			(coarsePointer.matches ? reachInPixels.coarse : reachInPixels.fine) /
			scale;

		for (const index of this.#data.dots.flat()) {
			const point = rotate(points[index], angles);
			const distance = Math.hypot(point.x - x, point.y - y);

			if (distance < nearestDistance) {
				nearest = index;
				nearestDistance = distance;
			}
		}

		return nearest;
	}

	/** Gets how far a vertex is from where it's being grabbed. */
	#getGrip(press: ClientPoint, index: number | undefined) {
		if (index === undefined) {
			return { x: 0, y: 0 };
		}

		const { x, y } = toDrawing(this.#svg, press);
		const vertex = rotate(this.#view.points[index], this.#view.angles);

		return { x: vertex.x - x, y: vertex.y - y };
	}

	#jumpTo(view: View) {
		this.#setGoal(view);
		this.#show(view);
	}

	#mark(near: number | undefined) {
		if (near !== this.#near) {
			this.#near = near;
			this.toggleAttribute("data-near", near !== undefined);
			this.#drawMarkers();
		}
	}

	#onNextKey(event: KeyboardEvent) {
		const step = getStep(nudges, event);

		if (step) {
			event.preventDefault();

			if (this.#selected === undefined) {
				this.#selectNext();
			} else {
				const { angles, points } = this.#goal;
				const { x, y } = rotate(points[this.#selected], angles);

				this.#animateTo(
					this.#place(this.#goal, this.#selected, x + step[0], y + step[1]),
				);
			}
		}
	}

	#onPointerDown(event: PointerEvent) {
		if (!event.isPrimary || event.button !== 0 || event.ctrlKey) {
			return;
		}

		const { pointerId } = event;
		const isTouch = event.pointerType === "touch";
		const pressed = this.#findNearest(event);

		// Swipes shouldn't move whichever vertices they happen to start on
		const index = isTouch && pressed !== this.#selected ? undefined : pressed;
		const canDrag = index !== undefined || this.#isDeep;
		const drag = new AbortController();
		const { signal } = drag;
		const start = this.#goal;
		let grip = this.#getGrip(event, index);
		let isDragging = false;
		let { clientX, clientY } = event;

		const listen = (
			type:
				"lostpointercapture" | "pointercancel" | "pointermove" | "pointerup",
			listener: (event: PointerEvent) => void,
		) => {
			this.#svg.addEventListener(
				type,
				(listened) => {
					if (listened.pointerId === pointerId) {
						listener(listened);
					}
				},
				{ signal },
			);
		};

		const finish = () => {
			drag.abort();
			this.removeAttribute("data-moving");

			if (isDragging) {
				this.#select(undefined);
			}
		};

		this.#svg.setPointerCapture(pointerId);

		listen("pointermove", (moved) => {
			const acrossBy = moved.clientX - clientX;
			const downBy = moved.clientY - clientY;

			if (!isDragging) {
				if (Math.hypot(acrossBy, downBy) <= tapDistance) {
					return;
				}

				// Vertical swipes are to scroll the page
				if (
					!canDrag ||
					(isTouch &&
						index === undefined &&
						Math.abs(downBy) > Math.abs(acrossBy))
				) {
					finish();

					return;
				}

				isDragging = true;
				this.#jumpTo(start);
				grip = this.#getGrip(event, index);
				this.toggleAttribute("data-moving", true);
			}

			if (index === undefined) {
				this.#jumpTo(
					this.#turn(this.#view, acrossBy * dragRate, -downBy * dragRate),
				);
				({ clientX, clientY } = moved);
			} else {
				const { x, y } = toDrawing(this.#svg, moved);

				this.#jumpTo(this.#place(this.#view, index, x + grip.x, y + grip.y));
			}
		});

		listen("pointercancel", () => {
			if (isDragging) {
				this.#animateTo(start);
			}

			finish();
		});

		listen("pointerup", (released) => {
			finish();

			if (!isDragging) {
				this.#onTap(released, pressed);
			}
		});

		listen("lostpointercapture", finish);
	}

	#onReset() {
		const { angles, points } = this.#view;

		this.#select(undefined);

		// It's about to be disabled, which would lose the focus it has
		if (this.#reset.matches(":focus-visible")) {
			this.#next.focus();
		}

		this.#view = { angles: unwind(angles), points };
		this.#animateTo(this.#home);
	}

	/** Dragging isn't possible for everybody, so vertices can be tapped, then placed. */
	#onTap(event: PointerEvent, pressed: number | undefined) {
		if (pressed !== undefined) {
			this.#select(pressed === this.#selected ? undefined : pressed);
		} else if (this.#selected !== undefined) {
			const { x, y } = toDrawing(this.#svg, event);

			this.#animateTo(this.#place(this.#goal, this.#selected, x, y));
			this.#select(undefined);
		}
	}

	/** Moves a vertex without changing how near it looks. */
	#place({ angles, points }: View, index: number, x: number, y: number): View {
		const { height, width, x: left, y: top } = this.#svg.viewBox.baseVal;
		const start = rotate(points[index], angles);

		// Turning may have already taken it out of view
		const clamp = (value: number, from: number, low: number, size: number) =>
			Math.min(
				Math.max(low + size, from),
				Math.max(Math.min(low, from), value),
			);

		return {
			angles,
			points: points.with(
				index,
				unrotate(
					{
						x: clamp(x, start.x, left, width),
						y: clamp(y, start.y, top, height),
						z: start.z,
					},
					angles,
				),
			),
		};
	}

	#select(index: number | undefined) {
		this.#selection.abort();
		this.#selected = index;
		this.#status.textContent =
			index === undefined ? "" : `Selected ${this.#data.names[index]}.`;
		this.#drawMarkers();

		if (index === undefined) {
			return;
		}

		this.#selection = new AbortController();

		const { signal } = this.#selection;

		document.addEventListener(
			"keydown",
			({ key }) => {
				if (key === "Escape") {
					this.#select(undefined);
				}
			},
			{ signal },
		);
		document.addEventListener(
			"pointerdown",
			({ target }) => {
				if (target instanceof Node && !this.contains(target)) {
					this.#select(undefined);
				}
			},
			{ signal },
		);
	}

	#selectNext() {
		const indices = this.#data.dots.flat().sort((a, b) => a - b);
		const next =
			this.#selected === undefined ? 0 : indices.indexOf(this.#selected) + 1;

		this.#select(indices[next % indices.length]);
	}

	#setGoal(goal: View) {
		cancelAnimationFrame(this.#frame);

		this.#goal = goal;
		this.#reset.disabled = goal === this.#home;
	}

	#show(view: View) {
		this.#view = view;
		this.#draw();
	}

	#turn({ angles, points }: View, yaw: number, pitch: number): View {
		return {
			angles: {
				pitch: Math.min(
					pitchLimit,
					Math.max(-pitchLimit, angles.pitch + pitch),
				),
				yaw: angles.yaw + yaw,
			},
			points,
		};
	}
}

function createMarker(host: HTMLElement, selector: string) {
	return { element: query(host, selector, SVGCircleElement), index: 0 };
}

function getStep(
	steps: Readonly<Record<string, readonly [number, number]>>,
	{ altKey, ctrlKey, key, metaKey }: KeyboardEvent,
) {
	return altKey || ctrlKey || metaKey || !Object.hasOwn(steps, key)
		? undefined
		: steps[key];
}

/** Finds a view that's partway from one to another. */
function mix(from: View, to: View, portion: number): View {
	const mixNumbers = (a: number, b: number) => a + (b - a) * portion;

	return {
		angles: {
			pitch: mixNumbers(from.angles.pitch, to.angles.pitch),
			yaw: mixNumbers(from.angles.yaw, to.angles.yaw),
		},
		points: from.points.map(({ x, y, z }, index) => ({
			x: mixNumbers(x, to.points[index].x),
			y: mixNumbers(y, to.points[index].y),
			z: mixNumbers(z, to.points[index].z),
		})),
	};
}

/** Finds the angles that look the same, but with the least turning. */
function unwind({ pitch, yaw }: Angles): Angles {
	return { pitch, yaw: Math.atan2(Math.sin(yaw), Math.cos(yaw)) };
}

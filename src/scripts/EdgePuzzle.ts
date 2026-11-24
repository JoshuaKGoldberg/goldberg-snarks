import type { Point } from "~/graphs/types.ts";

import { edgesPerBlock } from "~/graphs/block.ts";
import { describeProgress, findClashes } from "~/graphs/clashes.ts";
import { type Coloring, colorMostEdges } from "~/graphs/colorEdges.ts";
import { createGoldbergGraph } from "~/graphs/createGoldbergGraph.ts";
import { locate } from "~/graphs/draw.ts";
import { colorNames } from "~/graphs/edgeClasses.ts";

import { query } from "./query.ts";
import { type ClientPoint, toDrawing } from "./toDrawing.ts";

/** Farthest that a press can be from an edge. */
const reachInPixels = 22;

type Color = Coloring[number];

/** An attempt at coloring edges so that no two of a color meet. */
export class EdgePuzzle extends HTMLElement {
	readonly #board = query(this, ".board", SVGSVGElement);
	readonly #change = query(this, ".change", HTMLElement);
	readonly #circles = this.querySelectorAll(".vertices circle");
	readonly #graph = createGoldbergGraph(Number(this.dataset.blocks));
	#coloring: Coloring = this.#graph.edges.map(() => undefined);
	readonly #edges = [...this.querySelectorAll<SVGPathElement>(".edge")];
	readonly #halo = query(this, ".halo", SVGPathElement);
	readonly #history: Coloring[] = [];
	#near: number | undefined;
	readonly #progress = query(this, ".progress", HTMLElement);
	readonly #undo = query(this, "[data-action=undo]", HTMLButtonElement);

	get #selected(): Color {
		const { value } = query(this, "input:checked", HTMLInputElement);
		const color = colorNames.findIndex((name) => name === value);

		return color === -1 ? undefined : color;
	}

	connectedCallback() {
		const instructions = query(this, ".instructions", HTMLElement);

		this.#board.setAttribute("aria-describedby", instructions.id);
		this.#board.setAttribute("role", "toolbar");

		for (const [index, edge] of this.#edges.entries()) {
			edge.setAttribute("role", "button");
			edge.tabIndex = index ? -1 : 0;
		}

		this.#show();

		this.#board.addEventListener("click", (event) => {
			// Assistive technologies may click on edges without being anywhere near them
			const index =
				event.detail === 0
					? this.#edges.findIndex((edge) => edge === event.target)
					: this.#findNearest(event);

			if (index !== undefined && index !== -1) {
				this.#press(index);
				this.#focus(index, event.detail === 0);
			}
		});
		this.#board.addEventListener("keydown", (event) => {
			this.#onKeyDown(event);
		});
		this.addEventListener("focusin", ({ target }) => {
			const edge = this.#edges.find((other) => other === target);

			if (edge?.matches(":focus-visible")) {
				this.#halo.setAttribute("d", edge.getAttribute("d") ?? "");
			}
		});
		this.addEventListener("focusout", () => {
			this.#halo.removeAttribute("d");
		});
		this.#board.addEventListener("pointermove", (event) => {
			if (event.pointerType === "mouse") {
				this.#setNear(this.#findNearest(event));
			}
		});
		this.#board.addEventListener("pointerleave", () => {
			this.#setNear(undefined);
		});

		query(this, "[data-action=best]", HTMLElement).addEventListener(
			"click",
			() => {
				this.#recolor(colorMostEdges(this.#graph));
			},
		);
		query(this, "[data-action=reset]", HTMLElement).addEventListener(
			"click",
			() => {
				this.#recolor(this.#graph.edges.map(() => undefined));
			},
		);
		this.#undo.addEventListener("click", () => {
			this.#onUndo();
		});
	}

	#color(index: number, color: Color) {
		if (this.#recolor(this.#coloring.with(index, color))) {
			this.#change.textContent = `${this.#describe(index)}. `;
		}
	}

	#describe(index: number) {
		const { from, to } = this.#graph.edges[index];
		const color = this.#coloring[index];

		return [
			"Edge",
			this.#graph.vertices[from].name,
			"to",
			`${this.#graph.vertices[to].name}:`,
			color === undefined ? "no color" : colorNames[color],
		].join(" ");
	}

	#findNearest(press: ClientPoint) {
		const { scale, ...point } = toDrawing(this.#board, press);
		const { edges, vertices } = this.#graph;
		let nearest: number | undefined;
		let nearestDistance = reachInPixels / scale;

		for (const [index, { from, to }] of edges.entries()) {
			const distance = getDistance(
				point,
				locate(vertices[from]),
				locate(vertices[to]),
			);

			if (distance < nearestDistance) {
				nearest = index;
				nearestDistance = distance;
			}
		}

		return nearest;
	}

	#focus(index: number, focusVisible: boolean) {
		for (const [other, edge] of this.#edges.entries()) {
			edge.tabIndex = other === index ? 0 : -1;
		}

		this.#edges[index].focus({ focusVisible, preventScroll: true });
	}

	#onKeyDown(event: KeyboardEvent) {
		const current = this.#edges.findIndex((edge) => edge === event.target);

		if (current === -1 || event.altKey || event.ctrlKey || event.metaKey) {
			return;
		}

		const move = (index: number) => {
			const next = (index + this.#edges.length) % this.#edges.length;

			this.#focus(next, true);
			this.#edges[next].scrollIntoView({ block: "nearest", inline: "nearest" });
		};

		switch (event.key) {
			case " ":
			case "Enter":
				if (!event.repeat) {
					this.#press(current);
				}

				break;

			case "0":
			case "Backspace":
			case "Delete":
				this.#color(current, undefined);
				break;

			case "1":
			case "2":
			case "3":
				this.#color(current, Number(event.key) - 1);
				break;

			case "ArrowDown":
				move(current + edgesPerBlock);
				break;

			case "ArrowLeft":
				move(current - 1);
				break;

			case "ArrowRight":
				move(current + 1);
				break;

			case "ArrowUp":
				move(current - edgesPerBlock);
				break;

			case "End":
				move(-1);
				break;

			case "Home":
				move(0);
				break;

			default:
				return;
		}

		event.preventDefault();
	}

	#onUndo() {
		const previous = this.#history.pop();
		const hadFocus = this.#undo.matches(":focus-visible");

		if (previous) {
			this.#coloring = previous;
			this.#show();
		}

		// Disabled buttons can't be focused, so it'd be lost
		if (hadFocus && this.#undo.disabled) {
			this.#edges.find(({ tabIndex }) => tabIndex === 0)?.focus();
		}
	}

	/** Colors an edge, or erases it if it's already the selected color. */
	#press(index: number) {
		const color = this.#selected;

		this.#color(index, this.#coloring[index] === color ? undefined : color);
	}

	#recolor(coloring: Coloring) {
		if (coloring.every((color, index) => color === this.#coloring[index])) {
			return false;
		}

		this.#history.push(this.#coloring);
		this.#coloring = coloring;
		this.#show();

		return true;
	}

	#setNear(index: number | undefined) {
		if (index !== this.#near) {
			this.#near = index;

			for (const [other, edge] of this.#edges.entries()) {
				edge.toggleAttribute("data-near", other === index);
			}
		}
	}

	#show() {
		const clashes = findClashes(this.#graph, this.#coloring);

		for (const [index, edge] of this.#edges.entries()) {
			const color = this.#coloring[index];
			const { from, to } = this.#graph.edges[index];
			const clashing = [from, to]
				.filter((vertex) => color !== undefined && clashes.has(vertex))
				.map((vertex) => this.#graph.vertices[vertex].name);

			edge.setAttribute(
				"aria-label",
				[
					this.#describe(index),
					...(clashing.length
						? [`same color twice at ${clashing.join(" and ")}`]
						: []),
				].join(", "),
			);

			if (color === undefined) {
				delete edge.dataset.color;
			} else {
				edge.dataset.color = colorNames[color];
			}
		}

		for (const [index, circle] of this.#circles.entries()) {
			circle.toggleAttribute("data-clashing", clashes.has(index));
		}

		this.#undo.disabled = !this.#history.length;
		this.#change.textContent = "";
		this.#progress.textContent = describeProgress(this.#graph, this.#coloring);
	}
}

/** Gets how far a point is from the nearest part of a line between two others. */
function getDistance({ x, y }: Point, from: Point, to: Point) {
	const deltaX = to.x - from.x;
	const deltaY = to.y - from.y;
	const along = Math.min(
		1,
		Math.max(
			0,
			((x - from.x) * deltaX + (y - from.y) * deltaY) /
				(deltaX * deltaX + deltaY * deltaY),
		),
	);

	return Math.hypot(x - from.x - along * deltaX, y - from.y - along * deltaY);
}

import { edgesToNextBlock, edgesWithinBlock } from "~/graphs/block.ts";
import { colorNames } from "~/graphs/edgeClasses.ts";

import { query } from "./query.ts";

const edgesPerBlock = edgesWithinBlock.length + edgesToNextBlock.length;

/** How far from an edge, in pixels, a press can be and still count. */
const reach = 22;

type Color = string | undefined;

/** An attempt at coloring edges so that no two of a color meet. */
export class EdgePuzzle extends HTMLElement {
	readonly #board = query(this, ".board", SVGSVGElement);
	readonly #circles = [
		...this.querySelectorAll<SVGCircleElement>(".vertices circle"),
	];
	readonly #edges = [...this.querySelectorAll<SVGPathElement>(".edge")];

	/** Every edge's color from before each change. */
	readonly #history: Color[][] = [];

	#near: SVGPathElement | undefined;
	readonly #status = query(this, ".status", HTMLElement);
	readonly #undo = query(this, "[data-action=undo]", HTMLButtonElement);

	get #selected(): Color {
		const { value } = query(this, "input:checked", HTMLInputElement);

		return value === "" ? undefined : value;
	}

	connectedCallback() {
		// Edges are thin, so presses count for whichever of them is nearest
		this.#board.addEventListener("click", (event) => {
			// Assistive technologies may click on edges without being anywhere near them
			const edge =
				event.detail === 0
					? this.#edges.find((other) => other === event.target)
					: this.#findNearest(event);

			if (edge) {
				this.#press(edge);
				this.#focus(edge);
			}
		});
		this.#board.addEventListener("keydown", (event) => {
			this.#onKeyDown(event);
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
				this.#change(this.#edges.map(({ dataset }) => dataset.solution));
			},
		);
		query(this, "[data-action=reset]", HTMLElement).addEventListener(
			"click",
			() => {
				this.#change(this.#edges.map(() => undefined));
			},
		);
		this.#undo.addEventListener("click", () => {
			const previous = this.#history.pop();

			if (previous) {
				this.#show(previous);
			}

			// Disabled buttons can't be focused, so it'd be lost
			if (this.#undo.disabled) {
				this.#edges.find(({ tabIndex }) => tabIndex === 0)?.focus();
			}
		});
	}

	#change(colors: Color[]) {
		const previous = this.#edges.map(({ dataset }) => dataset.color);

		if (colors.some((color, index) => color !== previous[index])) {
			this.#history.push(previous);
			this.#show(colors);
		}
	}

	#color(edge: SVGPathElement, color: Color) {
		this.#change(
			this.#edges.map((other) =>
				other === edge ? color : other.dataset.color,
			),
		);
	}

	#findNearest({ clientX, clientY }: MouseEvent) {
		const matrix = this.#board.getScreenCTM();

		if (!matrix) {
			return undefined;
		}

		const point = new DOMPoint(clientX, clientY).matrixTransform(
			matrix.inverse(),
		);
		let nearest: SVGPathElement | undefined;
		let nearestDistance = reach / matrix.a;

		for (const edge of this.#edges) {
			const distance = getDistance(point, edge);

			if (distance < nearestDistance) {
				nearest = edge;
				nearestDistance = distance;
			}
		}

		return nearest;
	}

	#focus(edge: SVGPathElement) {
		for (const other of this.#edges) {
			other.tabIndex = other === edge ? 0 : -1;
		}

		edge.focus({ preventScroll: true });
	}

	#onKeyDown(event: KeyboardEvent) {
		const current = this.#edges.indexOf(event.target as SVGPathElement);

		if (current === -1 || event.altKey || event.ctrlKey || event.metaKey) {
			return;
		}

		const edge = this.#edges[current];
		const move = (index: number) => {
			this.#focus(
				this.#edges[(index + this.#edges.length) % this.#edges.length],
			);
		};

		switch (event.key) {
			case " ":
			case "Enter":
				this.#press(edge);
				break;

			case "0":
			case "Backspace":
			case "Delete":
				this.#color(edge, undefined);
				break;

			case "1":
			case "2":
			case "3":
				this.#color(edge, (Number(event.key) - 1).toString());
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

	/** Colors an edge, or erases it if it's already the selected color. */
	#press(edge: SVGPathElement) {
		const color = this.#selected;

		this.#color(edge, edge.dataset.color === color ? undefined : color);
	}

	#setNear(edge: SVGPathElement | undefined) {
		this.#near?.removeAttribute("data-near");
		this.#near = edge;
		edge?.setAttribute("data-near", "");
	}

	#show(colors: Color[]) {
		for (const [index, edge] of this.#edges.entries()) {
			setColor(edge, colors[index]);
		}

		const clashes = findClashes(this.#edges);

		for (const circle of this.#circles) {
			circle.toggleAttribute(
				"data-clashing",
				clashes.has(circle.dataset.name ?? ""),
			);
		}

		this.#undo.disabled = !this.#history.length;
		this.#status.textContent = describe(
			colors.filter((color) => color !== undefined).length,
			colors.length,
			[...clashes],
		);
	}
}

const formatter = new Intl.ListFormat("en");

/** How many clashes are few enough to list. */
const listedClashes = 4;

function describe(colored: number, total: number, clashes: string[]) {
	const count = `${colored.toString()} of ${total.toString()} edges colored`;

	if (clashes.length > listedClashes) {
		return `${count}, with clashes at ${clashes.length.toString()} vertices.`;
	}

	if (clashes.length) {
		return `${count}, with ${clashes.length === 1 ? "a clash" : "clashes"} at ${formatter.format(clashes)}.`;
	}

	return colored === total - 2
		? `${count}. Nobody can do better!`
		: `${count}${colored ? ", and no clashes" : ""}.`;
}

function findClashes(edges: SVGPathElement[]) {
	const clashes = new Set<string>();
	const seen = new Set<string>();

	for (const { dataset } of edges) {
		if (dataset.color) {
			for (const vertex of [dataset.from ?? "", dataset.to ?? ""]) {
				const key = `${vertex}:${dataset.color}`;

				if (seen.has(key)) {
					clashes.add(vertex);
				}

				seen.add(key);
			}
		}
	}

	return clashes;
}

function getDistance({ x, y }: DOMPoint, edge: SVGPathElement) {
	const [fromX, fromY, toX, toY] = (edge.getAttribute("d") ?? "")
		.slice(1)
		.split(/[L ]/)
		.map(Number);
	const deltaX = toX - fromX;
	const deltaY = toY - fromY;
	const along = Math.min(
		1,
		Math.max(
			0,
			((x - fromX) * deltaX + (y - fromY) * deltaY) /
				(deltaX * deltaX + deltaY * deltaY),
		),
	);

	return Math.hypot(x - fromX - along * deltaX, y - fromY - along * deltaY);
}

function setColor(edge: SVGPathElement, color: Color) {
	const { from = "", to = "" } = edge.dataset;

	if (color === undefined) {
		delete edge.dataset.color;
	} else {
		edge.dataset.color = color;
	}

	edge.setAttribute(
		"aria-label",
		`Edge ${from} to ${to}: ${color === undefined ? "no color" : colorNames[Number(color)]}`,
	);
}

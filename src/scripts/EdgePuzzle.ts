import { colorNames } from "~/graphs/edgeClasses.ts";

import { query } from "./query.ts";

/** How far from an edge, in pixels, a press can be and still count. */
const reach = 22;

/** An attempt at coloring edges so that no two of a color meet. */
export class EdgePuzzle extends HTMLElement {
	readonly #board = query(this, ".board", SVGSVGElement);
	readonly #circles = [
		...this.querySelectorAll<SVGCircleElement>(".vertices circle"),
	];
	readonly #edges = [...this.querySelectorAll<SVGPathElement>(".edge")];
	#near: SVGPathElement | undefined;
	readonly #status = query(this, ".status", HTMLElement);

	get #selected() {
		const { value } = query(this, "input:checked", HTMLInputElement);

		return value === "" ? undefined : value;
	}

	connectedCallback() {
		// Edges are thin, so presses count for whichever of them is nearest
		this.#board.addEventListener("click", (event) => {
			const edge =
				event.detail === 0
					? this.#edges.find((other) => other === event.target)
					: this.#findNearest(event);

			if (edge) {
				this.#color(edge, this.#selected);
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

		for (const button of this.querySelectorAll<HTMLElement>("[data-action]")) {
			button.addEventListener("click", () => {
				for (const edge of this.#edges) {
					setColor(
						edge,
						button.dataset.action === "best"
							? edge.dataset.solution
							: undefined,
					);
				}

				this.#update();
			});
		}
	}

	#color(edge: SVGPathElement, color: string | undefined) {
		setColor(edge, color);
		this.#update();
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
				this.#color(edge, this.#selected);
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
			case "ArrowRight":
				move(current + 1);
				break;

			case "ArrowLeft":
			case "ArrowUp":
				move(current - 1);
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

	#setNear(edge: SVGPathElement | undefined) {
		this.#near?.removeAttribute("data-near");
		this.#near = edge;
		edge?.setAttribute("data-near", "");
	}

	#update() {
		const colored = this.#edges.filter((edge) => edge.dataset.color);
		const clashing = new Set<number>();
		const seen = new Set<string>();

		for (const { dataset } of colored) {
			for (const vertex of [dataset.from, dataset.to]) {
				const key = `${vertex ?? ""}:${dataset.color ?? ""}`;

				if (seen.has(key)) {
					clashing.add(Number(vertex));
				}

				seen.add(key);
			}
		}

		for (const [index, circle] of this.#circles.entries()) {
			circle.toggleAttribute("data-clashing", clashing.has(index));
		}

		this.#status.textContent = describe(
			colored.length,
			this.#edges.length,
			clashing.size,
		);
	}
}

function describe(colored: number, total: number, clashes: number) {
	const count = `${colored.toString()} of ${total.toString()} edges colored`;

	if (clashes) {
		return `${count}, with clashes at ${clashes.toString()} ${clashes === 1 ? "vertex" : "vertices"}.`;
	}

	return colored === total - 2
		? `${count}. Nobody can do better!`
		: `${count}${colored ? ", and no clashes." : "."}`;
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

function setColor(edge: SVGPathElement, color: string | undefined) {
	if (color === undefined) {
		delete edge.dataset.color;
	} else {
		edge.dataset.color = color;
	}

	edge.setAttribute(
		"aria-label",
		`Edge ${edge.dataset.name ?? ""}: ${color === undefined ? "no color" : colorNames[Number(color)]}`,
	);
}

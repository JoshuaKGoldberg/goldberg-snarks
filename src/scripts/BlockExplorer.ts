import { colorEdges } from "~/graphs/colorEdges.ts";
import { createGoldbergGraph } from "~/graphs/createGoldbergGraph.ts";
import {
	drawEdgesByClass,
	getVertexRadius,
	getViewBox,
	locate,
} from "~/graphs/draw.ts";
import { getColorClass } from "~/graphs/edgeClasses.ts";

import { query } from "./query.ts";

/** Edges that snarks' best colorings can always leave out: a1 to b1, and c1 to e1. */
const spares = new Set([0, 3]);

/** Shows the Goldberg graph of however many blocks, as colored as it can be. */
export class BlockExplorer extends HTMLElement {
	connectedCallback() {
		const input = query(this, "input", HTMLInputElement);

		input.addEventListener("input", () => {
			this.#show(input.valueAsNumber);
		});

		// Browsers may restore what it was set to before the page was reloaded
		if (input.value !== input.defaultValue) {
			this.#show(input.valueAsNumber);
		}
	}

	#show(blocks: number) {
		const graph = createGoldbergGraph(blocks);
		const isSnark = blocks % 2 === 1;
		const coloring = colorEdges(graph, isSnark ? { skipped: spares } : {});
		const svg = query(this, ".picture svg", SVGSVGElement);
		const dots = query(svg, ".dots", SVGPathElement);

		svg.setAttribute("viewBox", getViewBox(graph, 4));
		svg.replaceChildren(
			...drawEdgesByClass(graph, (index) =>
				getColorClass(coloring?.[index]),
			).map(([name, d]) => {
				const path = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"path",
				);

				path.setAttribute("class", name);
				path.setAttribute("d", d);

				return path;
			}),
			dots,
		);

		dots.style.strokeWidth = `${(getVertexRadius(graph) * 2).toFixed(1)}px`;
		dots.setAttribute(
			"d",
			graph.vertices
				.map(locate)
				.map(({ x, y }) => `M${x.toString()} ${y.toString()}h0`)
				.join(""),
		);

		const heading = document.createElement("strong");
		const total = graph.edges.length;

		heading.textContent = `${blocks.toString()} blocks.`;
		query(this, "output", HTMLElement).replaceChildren(
			heading,
			isSnark
				? ` Three colors can manage only ${(total - 2).toString()} of the ${total.toString()} edges.`
				: ` Three colors are enough for all ${total.toString()} edges.`,
		);
	}
}

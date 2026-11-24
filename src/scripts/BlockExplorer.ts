import { colorEdges, spareEdges } from "~/graphs/colorEdges.ts";
import { createGoldbergGraph } from "~/graphs/createGoldbergGraph.ts";
import { drawEdgesByClass, getVertexRadius, locate } from "~/graphs/draw.ts";
import { getColorClass } from "~/graphs/edgeClasses.ts";

import { query } from "./query.ts";

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
		const coloring = colorEdges(graph, isSnark ? { skipped: spareEdges } : {});
		const svg = query(this, ".picture svg", SVGSVGElement);
		const dots = query(svg, ".dots", SVGPathElement);

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

		svg.style.setProperty(
			"--dot",
			`${(getVertexRadius(graph) * 2).toFixed(1)}px`,
		);
		dots.setAttribute(
			"d",
			graph.vertices
				.map(locate)
				.map(({ x, y }) => `M${x.toString()} ${y.toString()}h0`)
				.join(""),
		);

		const heading = document.createElement("strong");
		const result = document.createElement("span");
		const total = graph.edges.length;

		heading.textContent = `${blocks.toString()} blocks`;
		result.textContent = isSnark
			? `Three colors can manage only ${(total - 2).toString()} of the ${total.toString()} edges.`
			: `Three colors are enough for all ${total.toString()} edges.`;
		query(this, "output", HTMLElement).replaceChildren(heading, result);
	}
}

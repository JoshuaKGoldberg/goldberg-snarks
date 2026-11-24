import { colorMostEdges } from "~/graphs/colorEdges.ts";
import { createGoldbergGraph } from "~/graphs/createGoldbergGraph.ts";
import { describeColoring } from "~/graphs/describeColoring.ts";
import {
	drawDot,
	drawEdge,
	getVertexRadius,
	groupEdges,
} from "~/graphs/draw.ts";
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
		const coloring = colorMostEdges(graph);
		const svg = query(this, ".picture svg", SVGSVGElement);
		const dots = query(svg, ".dots", SVGPathElement);

		svg.replaceChildren(
			...groupEdges(graph, (index) => getColorClass(coloring[index])).map(
				([name, indices]) => {
					const path = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"path",
					);

					path.setAttribute("class", name);
					path.setAttribute(
						"d",
						indices.map((index) => drawEdge(graph, index)).join(""),
					);

					return path;
				},
			),
			dots,
		);
		svg.style.setProperty(
			"--dot",
			`${(getVertexRadius(graph) * 2).toString()}px`,
		);
		dots.setAttribute("d", graph.vertices.map(drawDot).join(""));

		query(this, ".count", HTMLElement).textContent =
			`${blocks.toString()} blocks`;
		query(this, ".result", HTMLElement).textContent =
			describeColoring(coloring);
	}
}

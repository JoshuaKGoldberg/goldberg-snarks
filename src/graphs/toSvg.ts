import { createGoldbergGraph } from "./createGoldbergGraph.ts";
import { drawEdgesByClass, getVertexRadius, locate } from "./draw.ts";
import { getPartClass } from "./edgeClasses.ts";

const colors: Record<string, string> = {
	hub: "#b52e63",
	middle: "#0d7d5b",
	outer: "#1b6bb5",
	spoke: "#4d5b7b",
};

/** Draws a Goldberg graph as an SVG that stands alone. */
export function toSvg(blocks: number) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-110 -110 220 220" width="1100" height="1100"><title>Goldberg graph G${blocks.toString()}</title>${toSvgContents(blocks)}</svg>\n`;
}

export function toSvgContents(blocks: number) {
	const graph = createGoldbergGraph(blocks);
	const radius = getVertexRadius(graph).toFixed(2);
	const edges = drawEdgesByClass(graph, (index) => getPartClass(graph, index))
		.map(([name, d]) => `<path d="${d}" stroke="${colors[name]}"/>`)
		.join("");
	const vertices = graph.vertices
		.map(locate)
		.map(
			({ x, y }) =>
				`<circle cx="${x.toString()}" cy="${y.toString()}" r="${radius}"/>`,
		)
		.join("");

	return `<g fill="none" stroke-linecap="round" stroke-width="0.9">${edges}</g><g fill="#142842">${vertices}</g>`;
}

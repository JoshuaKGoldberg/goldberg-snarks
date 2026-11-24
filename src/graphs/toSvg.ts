import { palette } from "../palette.ts";
import { createGoldbergGraph } from "./createGoldbergGraph.ts";
import {
	drawEdge,
	getRingViewBox,
	getVertexRadius,
	groupEdges,
	locate,
} from "./draw.ts";
import { getPartClass } from "./edgeClasses.ts";

const colors: Record<ReturnType<typeof getPartClass>, string> = {
	inner: palette.Red[0],
	middle: palette.Gold[0],
	outer: palette.Blue[0],
	spoke: palette.Ink[0],
};

/** Draws a Goldberg graph as an SVG that stands alone, over a background if there is one. */
export function toSvg(blocks: number, background?: string) {
	const backdrop = background
		? `<rect x="-50%" y="-50%" width="100%" height="100%" fill="${background}"/>`
		: "";

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${getRingViewBox(10)}" width="1100" height="1100"><title>Goldberg graph G${blocks.toString()}</title>${backdrop}${toSvgContents(blocks)}</svg>\n`;
}

/** Draws a Goldberg graph as what would be within an SVG. */
export function toSvgContents(blocks: number) {
	const graph = createGoldbergGraph(blocks);
	const radius = getVertexRadius(graph).toFixed(2);
	const edges = groupEdges(graph, (index) => getPartClass(graph, index))
		.map(
			([part, indices]) =>
				`<path d="${indices.map((index) => drawEdge(graph, index)).join("")}" stroke="${colors[part]}"/>`,
		)
		.join("");
	const vertices = graph.vertices
		.map(locate)
		.map(
			({ x, y }) =>
				`<circle cx="${x.toString()}" cy="${y.toString()}" r="${radius}"/>`,
		)
		.join("");

	return `<g fill="none" stroke-linecap="round" stroke-width="0.9">${edges}</g><g fill="${palette.Ink[0]}">${vertices}</g>`;
}

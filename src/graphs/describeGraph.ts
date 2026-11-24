import { colorMostEdges, countUncolored } from "./colorEdges.ts";
import { createGoldbergGraph } from "./createGoldbergGraph.ts";
import { createLongestCycle } from "./createLongestCycle.ts";
import {
	countCycles,
	countSymmetries,
	getEccentricities,
	getGirth,
} from "./measure.ts";

/** Most blocks for which a crossing number is known, per MathWorld's page on Goldberg graphs. */
const mostBlocksWithKnownCrossings = 12;

/** Computes what's known about the Goldberg graph of an odd number of blocks. */
export function describeGraph(blocks: number) {
	const graph = createGoldbergGraph(blocks);

	return {
		blocks,
		chromaticIndex: 4,
		circumference: createLongestCycle(blocks).length,
		crossings: blocks === 3 ? 5 : blocks * 2,
		edges: graph.edges.length,
		girth: getGirth(graph),
		isCrossingsKnown: blocks <= mostBlocksWithKnownCrossings,
		pentagons: countCycles(graph, 5),
		resistance: countUncolored(colorMostEdges(graph)),
		symmetries: countSymmetries(graph),
		vertices: graph.vertices.length,
		...getEccentricities(graph),
	};
}

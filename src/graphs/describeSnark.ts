import { createGoldbergGraph } from "./createGoldbergGraph.ts";
import {
	countCycles,
	countSymmetries,
	getEccentricities,
	getGirth,
} from "./measure.ts";

/** Crossing numbers that have been found, per MathWorld's page on Goldberg graphs. */
const knownCrossings: Record<number, number> = {
	3: 5,
	5: 10,
	7: 14,
	9: 18,
	11: 22,
};

export interface SnarkFacts {
	blocks: number;
	crossings: number | undefined;
	diameter: number;
	edges: number;
	girth: number;
	pentagons: number;
	radius: number;
	symmetries: number;
	vertices: number;
}

/** Computes what's known about the Goldberg graph of some number of blocks. */
export function describeSnark(blocks: number): SnarkFacts {
	const graph = createGoldbergGraph(blocks);

	return {
		blocks,
		crossings: knownCrossings[blocks],
		edges: graph.edges.length,
		girth: getGirth(graph),
		pentagons: countCycles(graph, 5),
		symmetries: countSymmetries(graph),
		vertices: graph.vertices.length,
		...getEccentricities(graph),
	};
}

import type { Coloring } from "./colorEdges.ts";
import type { Graph } from "./types.ts";

import { countUncolored, spareEdges } from "./colorEdges.ts";

/** How many clashes are few enough to list. */
const listedClashes = 4;

const formatter = new Intl.ListFormat("en");

/** Describes how far along an attempt at a coloring is. */
export function describeProgress(graph: Graph, coloring: Coloring) {
	const total = coloring.length;
	const uncolored = countUncolored(coloring);
	const count = `${(total - uncolored).toString()} of ${total.toString()} edges colored.`;
	const clashes = [...findClashes(graph, coloring)].map(
		(index) => graph.vertices[index].name,
	);

	if (clashes.length > listedClashes) {
		return `${count} Same color twice at ${clashes.length.toString()} vertices.`;
	}

	if (clashes.length) {
		return `${count} Same color twice at ${formatter.format(clashes)}.`;
	}

	return uncolored === spareEdges.size
		? `${count} This is the maximum.`
		: count;
}

/** Finds the indices of vertices at which edges of the same color meet. */
export function findClashes({ edges }: Graph, coloring: Coloring) {
	const clashes = new Set<number>();
	const seen = new Set<string>();

	for (const [index, { from, to }] of edges.entries()) {
		const color = coloring[index];

		if (color === undefined) {
			continue;
		}

		for (const vertex of [from, to]) {
			const key = [vertex, color].join();

			if (seen.has(key)) {
				clashes.add(vertex);
			}

			seen.add(key);
		}
	}

	return clashes;
}

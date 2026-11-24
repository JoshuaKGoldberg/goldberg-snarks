import { describe, expect, it } from "vitest";

import { getVertexIndex } from "./block.ts";
import { createGoldbergGraph } from "./createGoldbergGraph.ts";
import { createLongestCycle } from "./createLongestCycle.ts";
import { getNeighbors } from "./measure.ts";

describe(createLongestCycle, () => {
	it.each([3, 5, 7, 9, 11, 13, 15, 101])(
		"visits every vertex but c1 along edges when there are %i blocks",
		(blocks) => {
			const neighbors = getNeighbors(createGoldbergGraph(blocks));
			const cycle = createLongestCycle(blocks);
			const all = [...neighbors.keys()];

			expect(cycle.toSorted((a, b) => a - b)).toEqual(
				all.toSpliced(getVertexIndex(0, "c"), 1),
			);
			expect(
				cycle.filter(
					(vertex, i) =>
						!neighbors[vertex].some((neighbor) => neighbor === cycle.at(i - 1)),
				),
			).toEqual([]);
		},
	);
});

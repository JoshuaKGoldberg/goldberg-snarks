import { describe, expect, it } from "vitest";

import { getVertexIndex } from "./block.ts";
import { createGoldbergGraph } from "./createGoldbergGraph.ts";
import { createPetersenGraph } from "./createPetersenGraph.ts";
import {
	countCycles,
	countSymmetries,
	findShortestPath,
	getEccentricities,
	getGirth,
} from "./measure.ts";

describe(countCycles, () => {
	it.each([
		[3, 7, 0],
		[5, 6, 5],
		[5, 7, 0],
		[7, 6, 7],
		[7, 7, 1],
		[7, 8, 42],
		[9, 6, 9],
		[9, 7, 0],
		[15, 7, 0],
	])(
		"counts cycles when there are %i blocks and the length is %i",
		(blocks, length, count) => {
			expect(countCycles(createGoldbergGraph(blocks), length)).toBe(count);
		},
	);
});

describe(countSymmetries, () => {
	it("is 120 when the graph is the Petersen graph", () => {
		expect(countSymmetries(createPetersenGraph())).toBe(120);
	});
});

describe(findShortestPath, () => {
	it("visits each vertex along the way when one is far from another", () => {
		const graph = createGoldbergGraph(11);

		expect(
			findShortestPath(
				graph,
				getVertexIndex(0, "e"),
				getVertexIndex(5, "h"),
			).map((index) => graph.vertices[index].name),
		).toEqual([
			...["e1", "c1", "b1"],
			...["a1", "a2", "a3", "a4", "a5", "a6"],
			...["b6", "d6", "h6"],
		]);
	});

	it("is only one vertex when it's from a vertex to itself", () => {
		expect(findShortestPath(createGoldbergGraph(5), 2, 2)).toEqual([2]);
	});
});

describe(getEccentricities, () => {
	it.each([
		[5, 6, 5],
		[7, 8, 6],
		[9, 10, 7],
		[11, 11, 8],
		[13, 12, 9],
		[15, 13, 10],
		[17, 14, 11],
		[19, 15, 12],
		[21, 16, 13],
		[23, 17, 14],
		[25, 18, 15],
	])(
		"measures distances when there are %i blocks",
		(blocks, diameter, radius) => {
			expect(getEccentricities(createGoldbergGraph(blocks))).toEqual({
				diameter,
				radius,
			});
		},
	);
});

describe(getGirth, () => {
	it("is infinite when there are no cycles", () => {
		expect(
			getGirth({
				edges: [{ from: 0, to: 1 }],
				vertices: [
					{ name: "a", x: 0, y: 0 },
					{ name: "b", x: 0, y: 1 },
				],
			}),
		).toBe(Infinity);
	});
});

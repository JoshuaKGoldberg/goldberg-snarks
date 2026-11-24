import { describe, expect, it } from "vitest";

import { getVertexIndex, type Role, roles } from "./block.ts";
import { createGoldbergGraph } from "./createGoldbergGraph.ts";
import { getNeighbors } from "./measure.ts";
import { toEdgeList } from "./serialize.ts";

describe(createGoldbergGraph, () => {
	it("matches the edges in Mohar & Vodopivec (2006) when there are three blocks", () => {
		expect(toEdgeList(createGoldbergGraph(3)).trim().split("\n")).toEqual([
			...["a1 b1", "b1 c1", "b1 d1", "c1 e1", "c1 g1", "d1 f1", "d1 h1"],
			...["e1 f1", "g1 h1", "a1 a2", "e1 f2", "h1 g2"],
			...["a2 b2", "b2 c2", "b2 d2", "c2 e2", "c2 g2", "d2 f2", "d2 h2"],
			...["e2 f2", "g2 h2", "a2 a3", "e2 f3", "h2 g3"],
			...["a3 b3", "b3 c3", "b3 d3", "c3 e3", "c3 g3", "d3 f3", "d3 h3"],
			...["e3 f3", "g3 h3", "a3 a1", "e3 f1", "h3 g1"],
		]);
	});

	it("places vertices around a ring", () => {
		expect(createGoldbergGraph(3).vertices.slice(0, 9)).toMatchInlineSnapshot(`
			[
			  {
			    "depth": 0.8,
			    "name": "a1",
			    "x": 0.02065136142625183,
			    "y": -0.30931136621734795,
			  },
			  {
			    "depth": 0.7,
			    "name": "b1",
			    "x": 0.04578030391017064,
			    "y": -0.5480913826853078,
			  },
			  {
			    "depth": 0.54,
			    "name": "c1",
			    "x": 0.15694877132809834,
			    "y": -0.7742525964945809,
			  },
			  {
			    "depth": 0.57,
			    "name": "d1",
			    "x": -0.06242768715023268,
			    "y": -0.7473973400254196,
			  },
			  {
			    "depth": 0.36,
			    "name": "e1",
			    "x": 0.4647332543713175,
			    "y": -0.8854507339662915,
			  },
			  {
			    "depth": 0.5,
			    "name": "f1",
			    "x": -0.4562993114848672,
			    "y": -0.7171408078881274,
			  },
			  {
			    "depth": 0.63,
			    "name": "g1",
			    "x": -0.31601861297249595,
			    "y": -0.6021064990970783,
			  },
			  {
			    "depth": 0.63,
			    "name": "h1",
			    "x": 0.3932569263935253,
			    "y": -0.5547512864730622,
			  },
			  {
			    "depth": 0.8,
			    "name": "a2",
			    "x": 0.2575458201103692,
			    "y": 0.17254028672654206,
			  },
			]
		`);
	});

	it.each([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])(
		"joins every vertex to three others when there are %i blocks",
		(blocks) => {
			const neighbors = getNeighbors(createGoldbergGraph(blocks));

			expect(neighbors.map((each) => new Set(each).size)).toEqual(
				new Array<number>(8 * blocks).fill(3),
			);
		},
	);

	it.each([2, 4.5, -1])(
		"throws an error when there are %d blocks",
		(blocks) => {
			expect(() => createGoldbergGraph(blocks)).toThrow(
				`There is no Goldberg graph of ${blocks.toString()} blocks.`,
			);
		},
	);

	it.each([
		[9, 3],
		[15, 3],
		[15, 5],
	])(
		"covers the graph of fewer blocks when %i is a multiple of %i",
		(blocks, fewer) => {
			const wrap = (index: number) => index % (fewer * roles.length);
			const covered = getNeighbors(createGoldbergGraph(fewer)).map((each) =>
				each.toSorted(),
			);

			expect(
				getNeighbors(createGoldbergGraph(blocks)).map((each) =>
					each.map(wrap).toSorted(),
				),
			).toEqual(Array.from({ length: blocks / fewer }, () => covered).flat());
		},
	);

	it("has the same edges when its outer and middle rings are exchanged", () => {
		const swaps: Record<Role, Role> = {
			a: "a",
			b: "b",
			c: "d",
			d: "c",
			e: "h",
			f: "g",
			g: "f",
			h: "e",
		};
		const neighbors = getNeighbors(createGoldbergGraph(13));
		const swap = (index: number) =>
			getVertexIndex(
				Math.floor(index / roles.length),
				swaps[roles[index % roles.length]],
			);

		expect(
			neighbors.map((_, index) => neighbors[swap(index)].map(swap).toSorted()),
		).toEqual(neighbors.map((each) => each.toSorted()));
	});
});

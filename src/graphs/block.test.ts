import { describe, expect, it } from "vitest";

import { edgesPerBlock, getFirstBlockEdge, getVertexIndex } from "./block.ts";
import { createGoldbergGraph } from "./createGoldbergGraph.ts";

describe("edgesPerBlock", () => {
	it("counts a block's edges and its links to the next block", () => {
		expect(edgesPerBlock).toBe(12);
	});
});

describe(getFirstBlockEdge, () => {
	it("finds the edge between two vertices of a graph's first block", () => {
		const { edges } = createGoldbergGraph(5);

		expect(edges[getFirstBlockEdge("d", "h")]).toEqual({
			from: getVertexIndex(0, "d"),
			to: getVertexIndex(0, "h"),
		});
	});
});

describe(getVertexIndex, () => {
	it("finds the vertex with a block's number and a letter", () => {
		const { vertices } = createGoldbergGraph(5);

		expect(vertices[getVertexIndex(2, "f")].name).toBe("f3");
	});
});

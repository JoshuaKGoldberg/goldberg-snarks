import { describe, expect, it } from "vitest";

import type { Graph } from "./types.ts";

import {
	drawDot,
	drawEdge,
	getCroppedViewBox,
	getRingViewBox,
	getVertexRadius,
	groupDots,
	groupEdges,
} from "./draw.ts";

const graph: Graph = {
	edges: [
		{ from: 0, to: 1 },
		{ from: 1, ring: "inner", to: 2 },
		{ from: 2, to: 0 },
	],
	vertices: [
		{ name: "a", x: 0, y: 0.1234 },
		{ name: "b", x: 1, y: 0 },
		{ name: "", x: -1, y: -0.5 },
	],
};

describe(drawDot, () => {
	it("draws a line of no length", () => {
		expect(drawDot(graph.vertices[0])).toBe("M0 12.3h0");
	});
});

describe(drawEdge, () => {
	it("draws a line between two vertices", () => {
		expect(drawEdge(graph, 1)).toBe("M100 0L-100 -50");
	});
});

describe(getCroppedViewBox, () => {
	it("includes padding around every vertex", () => {
		expect(getCroppedViewBox(graph, 10)).toBe("-110.0 -60.0 220.0 82.3");
	});
});

describe(getRingViewBox, () => {
	it("is centered, with padding on every side", () => {
		expect(getRingViewBox(5)).toBe("-105 -105 210 210");
	});
});

describe(getVertexRadius, () => {
	it.each([
		[1, 2.6],
		[49, 2],
		[10_000, 1],
	])("stays within limits when there are %i vertices", (count, expected) => {
		expect(
			getVertexRadius({
				edges: [],
				vertices: Array.from({ length: count }, () => graph.vertices[0]),
			}),
		).toBe(expected);
	});
});

describe(groupDots, () => {
	it("leaves out vertices that don't have names", () => {
		expect(groupDots(graph)).toEqual([[undefined, [0, 1]]]);
	});

	it("groups vertices by class when they have them", () => {
		expect(groupDots(graph, (index) => index.toString())).toEqual([
			["0", [0]],
			["1", [1]],
		]);
	});
});

describe(groupEdges, () => {
	it("groups edges by class", () => {
		expect(
			groupEdges(graph, (index) => graph.edges[index].ring ?? "none"),
		).toEqual([
			["none", [0, 2]],
			["inner", [1]],
		]);
	});
});

import { describe, expect, it } from "vitest";

import { describeProgress, findClashes } from "./clashes.ts";
import { colorMostEdges } from "./colorEdges.ts";
import { createGoldbergGraph } from "./createGoldbergGraph.ts";

const graph = createGoldbergGraph(5);

function color(...indices: number[]) {
	return graph.edges.map((_, index) =>
		indices.includes(index) ? 0 : undefined,
	);
}

describe(describeProgress, () => {
	it.each([
		["nothing is colored", color(), "0 of 60 edges colored."],
		[
			"there are a few clashes",
			color(0, 1),
			"2 of 60 edges colored. Same color twice at b1.",
		],
		[
			"there are as many clashes as are listed",
			color(0, 1, 12, 13, 24, 25, 36, 37),
			"8 of 60 edges colored. Same color twice at b1, b2, b3, and b4.",
		],
		[
			"there are more clashes than are listed",
			color(0, 1, 12, 13, 24, 25, 36, 37, 48, 49),
			"10 of 60 edges colored. Same color twice at 5 vertices.",
		],
		[
			"as many are colored as can be",
			colorMostEdges(graph),
			"58 of 60 edges colored. This is the maximum.",
		],
	])("describes a coloring when %s", (_, coloring, expected) => {
		expect(describeProgress(graph, coloring)).toBe(expected);
	});
});

describe(findClashes, () => {
	it("finds the vertices that have two edges of a color", () => {
		expect(findClashes(graph, color(0, 1, 3))).toEqual(new Set([1, 2]));
	});
});

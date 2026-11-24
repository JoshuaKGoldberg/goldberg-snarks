import { describe, expect, it } from "vitest";

import { createGoldbergGraph } from "./createGoldbergGraph.ts";
import { getHighlight, type HighlightKind } from "./highlights.ts";

function findHighlighted(kind: HighlightKind, blocks: number) {
	const graph = createGoldbergGraph(blocks);
	const { edgeClass } = getHighlight(graph, kind);

	return graph.edges
		.map(({ from, to }, index) =>
			[
				edgeClass(index),
				`${graph.vertices[from].name}-${graph.vertices[to].name}`,
			].join(" "),
		)
		.filter((text) => !text.startsWith("faint"));
}

describe(getHighlight, () => {
	it("emphasizes two cycles when its kind is block-cycles", () => {
		expect(findHighlighted("block-cycles", 7)).toEqual([
			"outer heavy b1-c1",
			"outer heavy b1-d1",
			"outer heavy c1-e1",
			"outer heavy d1-f1",
			"outer heavy e1-f1",
			"middle heavy c3-e3",
			"middle heavy c3-g3",
			"middle heavy d3-f3",
			"middle heavy d3-h3",
			"middle heavy e3-f3",
			"middle heavy g3-h3",
		]);
	});

	it("emphasizes a path when its kind is farthest", () => {
		expect(findHighlighted("farthest", 11)).toEqual([
			"strong a1-b1",
			"strong b1-c1",
			"strong c1-e1",
			"strong a1-a2",
			"strong a2-a3",
			"strong a3-a4",
			"strong a4-a5",
			"strong a5-a6",
			"strong a6-b6",
			"strong b6-d6",
			"strong d6-h6",
		]);
	});

	it("emphasizes the inner ring when its kind is inner", () => {
		expect(findHighlighted("inner", 3)).toEqual([
			"strong a1-a2",
			"strong a2-a3",
			"strong a3-a1",
		]);
	});

	it("emphasizes blocks when its kind is every-fifth", () => {
		expect(findHighlighted("every-fifth", 15)).toMatchInlineSnapshot(`
			[
			  "strong a1-b1",
			  "strong b1-c1",
			  "strong b1-d1",
			  "strong c1-e1",
			  "strong c1-g1",
			  "strong d1-f1",
			  "strong d1-h1",
			  "strong e1-f1",
			  "strong g1-h1",
			  "strong a6-b6",
			  "strong b6-c6",
			  "strong b6-d6",
			  "strong c6-e6",
			  "strong c6-g6",
			  "strong d6-f6",
			  "strong d6-h6",
			  "strong e6-f6",
			  "strong g6-h6",
			  "strong a11-b11",
			  "strong b11-c11",
			  "strong b11-d11",
			  "strong c11-e11",
			  "strong c11-g11",
			  "strong d11-f11",
			  "strong d11-h11",
			  "strong e11-f11",
			  "strong g11-h11",
			]
		`);
	});

	it("emphasizes blocks when its kind is every-third", () => {
		expect(findHighlighted("every-third", 9)).toMatchInlineSnapshot(`
			[
			  "strong a1-b1",
			  "strong b1-c1",
			  "strong b1-d1",
			  "strong c1-e1",
			  "strong c1-g1",
			  "strong d1-f1",
			  "strong d1-h1",
			  "strong e1-f1",
			  "strong g1-h1",
			  "strong a4-b4",
			  "strong b4-c4",
			  "strong b4-d4",
			  "strong c4-e4",
			  "strong c4-g4",
			  "strong d4-f4",
			  "strong d4-h4",
			  "strong e4-f4",
			  "strong g4-h4",
			  "strong a7-b7",
			  "strong b7-c7",
			  "strong b7-d7",
			  "strong c7-e7",
			  "strong c7-g7",
			  "strong d7-f7",
			  "strong d7-h7",
			  "strong e7-f7",
			  "strong g7-h7",
			]
		`);
	});

	it("emphasizes a cycle when its kind is longest", () => {
		expect(findHighlighted("longest", 5)).toMatchInlineSnapshot(`
			[
			  "strong a1-b1",
			  "strong b1-d1",
			  "strong d1-h1",
			  "strong e1-f1",
			  "strong g1-h1",
			  "strong e1-f2",
			  "strong a2-b2",
			  "strong b2-d2",
			  "strong c2-e2",
			  "strong c2-g2",
			  "strong d2-h2",
			  "strong e2-f2",
			  "strong g2-h2",
			  "strong a2-a3",
			  "strong a3-b3",
			  "strong b3-d3",
			  "strong c3-e3",
			  "strong c3-g3",
			  "strong d3-f3",
			  "strong e3-f3",
			  "strong g3-h3",
			  "strong h3-g4",
			  "strong a4-b4",
			  "strong b4-c4",
			  "strong c4-e4",
			  "strong d4-f4",
			  "strong d4-h4",
			  "strong e4-f4",
			  "strong g4-h4",
			  "strong a4-a5",
			  "strong b5-c5",
			  "strong b5-d5",
			  "strong c5-g5",
			  "strong d5-f5",
			  "strong e5-f5",
			  "strong g5-h5",
			  "strong a5-a1",
			  "strong e5-f1",
			  "strong h5-g1",
			]
		`);
	});

	it("emphasizes two rings when its kind is swapped", () => {
		expect(findHighlighted("swapped", 5)).toMatchInlineSnapshot(`
			[
			  "outer heavy e1-f1",
			  "middle heavy g1-h1",
			  "outer heavy e1-f2",
			  "middle heavy h1-g2",
			  "outer heavy e2-f2",
			  "middle heavy g2-h2",
			  "outer heavy e2-f3",
			  "middle heavy h2-g3",
			  "outer heavy e3-f3",
			  "middle heavy g3-h3",
			  "outer heavy e3-f4",
			  "middle heavy h3-g4",
			  "outer heavy e4-f4",
			  "middle heavy g4-h4",
			  "outer heavy e4-f5",
			  "middle heavy h4-g5",
			  "outer heavy e5-f5",
			  "middle heavy g5-h5",
			  "outer heavy e5-f1",
			  "middle heavy h5-g1",
			]
		`);
	});

	it("fades the vertices that aren't on a path", () => {
		const graph = createGoldbergGraph(3);
		const { vertexClass } = getHighlight(graph, "inner");

		expect(
			graph.vertices
				.filter((_, index) => vertexClass(index) === undefined)
				.map(({ name }) => name),
		).toEqual(["a1", "a2", "a3"]);
	});

	it("fades the vertices that aren't in every third block", () => {
		const graph = createGoldbergGraph(6);
		const { vertexClass } = getHighlight(graph, "every-third");

		expect(
			graph.vertices
				.filter((_, index) => vertexClass(index) === undefined)
				.map(({ name }) => name),
		).toEqual([
			...["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"],
			...["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"],
		]);
	});
});

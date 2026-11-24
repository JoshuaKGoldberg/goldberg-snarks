import { describe, expect, it } from "vitest";

import { edgesPerBlock } from "./block.ts";
import { findClashes } from "./clashes.ts";
import {
	colorEdges,
	colorMostEdges,
	requireColoring,
	spareEdges,
} from "./colorEdges.ts";
import { createBlockChain, getLooseLinks } from "./createBlockChain.ts";
import { createGoldbergGraph } from "./createGoldbergGraph.ts";
import { createPetersenGraph } from "./createPetersenGraph.ts";

const evens = [4, 6, 8, 10, 12, 14];
const odds = [3, 5, 7, 9, 11, 13, 15];
const colors = [0, 1, 2];

/** Every way to pick a color for each of several edges. */
function pickColors(count: number): number[][] {
	return count
		? pickColors(count - 1).flatMap((picks) =>
				colors.map((color) => [...picks, color]),
			)
		: [[]];
}

describe(colorEdges, () => {
	it.each(odds)("finds no coloring when there are %i blocks", (blocks) => {
		expect(colorEdges(createGoldbergGraph(blocks))).toBeUndefined();
	});

	it("finds no coloring when it's of the Petersen graph", () => {
		expect(colorEdges(createPetersenGraph())).toBeUndefined();
	});

	it.each(evens)(
		"colors every edge without clashes when there are %i blocks",
		(blocks) => {
			const graph = createGoldbergGraph(blocks);
			const coloring = requireColoring(graph);

			expect(coloring).toHaveLength(graph.edges.length);
			expect(coloring).not.toContain(undefined);
			expect(findClashes(graph, coloring)).toEqual(new Set());
		},
	);

	it.each(odds)(
		"finds no coloring when one edge of %i blocks is skipped",
		(blocks) => {
			const graph = createGoldbergGraph(blocks);
			const colorings = Array.from({ length: edgesPerBlock }, (_, index) =>
				colorEdges(graph, { skipped: new Set([index]) }),
			);

			expect(colorings).toEqual(new Array(edgesPerBlock).fill(undefined));
		},
	);

	it("only colors a block and its links when they match on exactly one side", () => {
		const block = createBlockChain(1);
		const links = getLooseLinks(block);
		const ways = pickColors(links.length).filter((picks) =>
			colorEdges(block, {
				fixed: new Map(links.map((link, i) => [link, picks[i]])),
			}),
		);

		expect(ways).toHaveLength(72);
		expect(
			ways.filter(
				([, outerLeft, middleLeft, , outerRight, middleRight]) =>
					(outerLeft === middleLeft) === (outerRight === middleRight),
			),
		).toEqual([]);
	});

	it.each([
		{ blocks: 3, skipped: spareEdges },
		{ blocks: 2, skipped: new Set<number>() },
	])(
		"colors $blocks blocks with the same links at both ends",
		({ blocks, skipped }) => {
			const chain = createBlockChain(blocks);
			const fixed = new Map(
				getLooseLinks(chain).map((link, i) => [link, [0, 0, 1][i % 3]]),
			);
			const coloring = requireColoring(chain, { fixed, skipped });

			expect(coloring).toHaveLength(chain.edges.length);
			expect(findClashes(chain, coloring)).toEqual(new Set());
		},
	);
});

describe(colorMostEdges, () => {
	it.each(odds)(
		"leaves out a1 to b1 and c1 to e1 when there are %i blocks",
		(blocks) => {
			const graph = createGoldbergGraph(blocks);
			const coloring = colorMostEdges(graph);
			const uncolored = graph.edges
				.filter((_, index) => coloring[index] === undefined)
				.map(({ from, to }) =>
					[graph.vertices[from].name, graph.vertices[to].name].join(" to "),
				);

			expect(uncolored).toEqual(["a1 to b1", "c1 to e1"]);
			expect(findClashes(graph, coloring)).toEqual(new Set());
		},
	);

	it("leaves out no edges when all of them can be colored", () => {
		expect(colorMostEdges(createGoldbergGraph(6))).not.toContain(undefined);
	});

	it("throws an error when more than the spare edges can't be colored", () => {
		expect(() => colorMostEdges(createPetersenGraph())).toThrow(
			"Expected to find a coloring.",
		);
	});
});

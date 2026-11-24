import { describe, expect, it } from "vitest";

import type { Graph } from "./types.ts";

import { edgesToNextBlock, edgesWithinBlock, roles } from "./block.ts";
import { colorEdges, colorMostEdges, spareEdges } from "./colorEdges.ts";
import { createBlockChain, stub } from "./createBlockChain.ts";
import { createGoldbergGraph, getVertexIndex } from "./createGoldbergGraph.ts";
import { createPetersenAroundBlock } from "./createPetersenAroundBlock.ts";
import { createPetersenGraph } from "./createPetersenGraph.ts";
import { describeSnark } from "./describeSnark.ts";
import { getVertexName } from "./getVertexName.ts";
import { longestCycles } from "./longestCycles.ts";
import {
	countCycles,
	countSymmetries,
	findShortestPath,
	getDistances,
	getEccentricities,
	getGirth,
	getNeighbors,
} from "./measure.ts";
import { rotate, unrotate } from "./rotate.ts";
import { toEdgeList, toGraph6 } from "./serialize.ts";

/** Whether no two colored edges that share a vertex have the same color. */
function isWellColored(
	{ edges, vertices }: Graph,
	coloring: (number | undefined)[],
) {
	const seen = vertices.map(() => new Set<number>());

	return edges.every(({ from, to }, index) => {
		const color = coloring[index];

		if (color === undefined) {
			return true;
		}

		const isFresh = !seen[from].has(color) && !seen[to].has(color);

		seen[from].add(color);
		seen[to].add(color);

		return isFresh;
	});
}

const evens = [4, 6, 8, 10, 12, 14];
const odds = [3, 5, 7, 9, 11, 13, 15];

describe(createGoldbergGraph, () => {
	it.each([...odds, ...evens])(
		"has three edges per vertex with %i blocks",
		(blocks) => {
			const graph = createGoldbergGraph(blocks);

			expect(graph.vertices).toHaveLength(8 * blocks);
			expect(graph.edges).toHaveLength(12 * blocks);
			expect(
				getNeighbors(graph).every((neighbors) => new Set(neighbors).size === 3),
			).toBe(true);
		},
	);

	it.each([2, 4.5, -1])("throws an error for %d blocks", (blocks) => {
		expect(() => createGoldbergGraph(blocks)).toThrow("no Goldberg graph");
	});

	it.each([
		[9, 3],
		[15, 3],
		[15, 5],
	])("wraps %i blocks evenly around %i", (larger, smaller) => {
		const wrap = (index: number) => index % (smaller * roles.length);
		const small = getNeighbors(createGoldbergGraph(smaller));

		for (const [index, neighbors] of getNeighbors(
			createGoldbergGraph(larger),
		).entries()) {
			expect(neighbors.map(wrap).sort()).toEqual(
				[...small[wrap(index)]].sort(),
			);
		}
	});

	it("can be turned inside out, without its blocks going anywhere", () => {
		const swaps = {
			a: "a",
			b: "b",
			c: "d",
			d: "c",
			e: "h",
			f: "g",
			g: "f",
			h: "e",
		} as const;
		const graph = createGoldbergGraph(13);
		const neighbors = getNeighbors(graph);
		const swap = (index: number) =>
			getVertexIndex(
				Math.floor(index / roles.length),
				swaps[roles[index % roles.length]],
			);

		for (const { from, to } of graph.edges) {
			expect(neighbors[swap(from)]).toContain(swap(to));
		}
	});
});

describe(createBlockChain, () => {
	it("has six loose links, whatever its length", () => {
		expect(
			createBlockChain(3).vertices.filter(({ role }) => role === stub),
		).toHaveLength(6);
	});
});

describe(createPetersenAroundBlock, () => {
	it("is the Petersen graph, which is the only graph with these properties", () => {
		const graph = createPetersenAroundBlock();

		expect(graph.vertices).toHaveLength(10);
		expect(
			getNeighbors(graph).every((neighbors) => new Set(neighbors).size === 3),
		).toBe(true);
		expect(getGirth(graph)).toBe(5);
		expect(countSymmetries(graph)).toBe(countSymmetries(createPetersenGraph()));
	});
});

describe(colorEdges, () => {
	it.each(odds)("can't color any snark of %i blocks", (blocks) => {
		expect(colorEdges(createGoldbergGraph(blocks))).toBeUndefined();
	});

	it.each(evens)("can color the graph of %i blocks", (blocks) => {
		const graph = createGoldbergGraph(blocks);
		const coloring = colorEdges(graph);

		expect(coloring).not.toContain(undefined);
		expect(isWellColored(graph, coloring ?? [])).toBe(true);
	});

	it.each(odds)(
		"can't color any snark of %i blocks with one edge left out",
		(blocks) => {
			const graph = createGoldbergGraph(blocks);

			// Blocks are interchangeable, so it's enough to leave out edges of the first
			for (
				let index = 0;
				index < edgesWithinBlock.length + edgesToNextBlock.length;
				index += 1
			) {
				expect(
					colorEdges(graph, { skipped: new Set([index]) }),
				).toBeUndefined();
			}
		},
	);

	it("only colors a block's loose links in 72 ways, all of which flip its outer two", () => {
		const block = createBlockChain(1);
		const links = [...block.edges.keys()].slice(edgesWithinBlock.length);
		const ways = Array.from({ length: 3 ** links.length }, (_, code) =>
			links.map((_, i) => Math.floor(code / 3 ** i) % 3),
		).filter((picks) =>
			colorEdges(block, {
				fixed: new Map(links.map((link, i) => [link, picks[i]])),
			}),
		);

		expect(ways).toHaveLength(72);
		expect(
			ways.filter(
				([, outerIn, middleIn, , outerOut, middleOut]) =>
					(outerIn === middleIn) === (outerOut === middleOut),
			),
		).toEqual([]);
	});
});

describe(colorMostEdges, () => {
	it.each(odds)("leaves out two edges of the snark of %i blocks", (blocks) => {
		const graph = createGoldbergGraph(blocks);
		const coloring = colorMostEdges(graph);

		expect(coloring.filter((color) => color === undefined)).toHaveLength(2);
		expect(isWellColored(graph, coloring)).toBe(true);
	});

	it("leaves out two edges of the Petersen graph", () => {
		const graph = createPetersenGraph();
		const coloring = colorMostEdges(graph, new Set([0, 2]));

		expect(coloring.filter((color) => color === undefined)).toHaveLength(2);
		expect(isWellColored(graph, coloring)).toBe(true);
	});

	it("throws an error when the edges it's told to leave out aren't enough", () => {
		expect(() => colorMostEdges(createPetersenGraph(), new Set([0]))).toThrow(
			"enough",
		);
	});

	it("leaves out the same two edges however many pairs of blocks there are", () => {
		const block = createBlockChain(1);
		const pair = createBlockChain(2);
		const getSides = (graph: Graph) => {
			const links = [...graph.edges.keys()].filter(
				(index) => graph.edges[index].isLink,
			);

			return [...links.slice(0, 3), ...links.slice(-3)];
		};

		const fix = (graph: Graph, ...colors: number[]) =>
			new Map(getSides(graph).map((link, i) => [link, colors[i]]));

		// One block from 1, 2, 1 to 0, 2, 0, then a pair back again, then any number of pairs
		expect(
			colorEdges(block, {
				fixed: fix(block, 1, 2, 1, 0, 2, 0),
				skipped: spareEdges,
			}),
		).toBeDefined();
		expect(
			colorEdges(pair, { fixed: fix(pair, 0, 2, 0, 1, 2, 1) }),
		).toBeDefined();
		expect(
			colorEdges(pair, { fixed: fix(pair, 1, 2, 1, 1, 2, 1) }),
		).toBeDefined();
	});

	it("colors every edge of graphs that can be", () => {
		expect(colorMostEdges(createGoldbergGraph(6))).not.toContain(undefined);
	});
});

describe(describeSnark, () => {
	// Cross-checked with NetworkX
	it.each([
		{
			blocks: 3,
			crossings: 5,
			diameter: 4,
			edges: 36,
			girth: 3,
			pentagons: 6,
			radius: 4,
			symmetries: 12,
			vertices: 24,
		},
		{
			blocks: 5,
			crossings: 10,
			diameter: 6,
			edges: 60,
			girth: 5,
			pentagons: 11,
			radius: 5,
			symmetries: 20,
			vertices: 40,
		},
		{
			blocks: 7,
			crossings: 14,
			diameter: 8,
			edges: 84,
			girth: 5,
			pentagons: 14,
			radius: 6,
			symmetries: 28,
			vertices: 56,
		},
		{
			blocks: 9,
			crossings: 18,
			diameter: 10,
			edges: 108,
			girth: 5,
			pentagons: 18,
			radius: 7,
			symmetries: 36,
			vertices: 72,
		},
		{
			blocks: 11,
			crossings: 22,
			diameter: 11,
			edges: 132,
			girth: 5,
			pentagons: 22,
			radius: 8,
			symmetries: 44,
			vertices: 88,
		},
		{
			blocks: 13,
			crossings: undefined,
			diameter: 12,
			edges: 156,
			girth: 5,
			pentagons: 26,
			radius: 9,
			symmetries: 52,
			vertices: 104,
		},
		{
			blocks: 15,
			crossings: undefined,
			diameter: 13,
			edges: 180,
			girth: 5,
			pentagons: 30,
			radius: 10,
			symmetries: 60,
			vertices: 120,
		},
	])("measures the snark of $blocks blocks", (facts) => {
		expect(describeSnark(facts.blocks)).toEqual(facts);
	});
});

describe(countCycles, () => {
	it.each([
		[3, 0],
		[5, 0],
		[7, 1],
		[9, 0],
		[11, 0],
		[13, 0],
		[15, 0],
	])(
		"finds that the snark of %i blocks has %i cycles of length seven",
		(blocks, count) => {
			expect(countCycles(createGoldbergGraph(blocks), 7)).toBe(count);
		},
	);

	it.each([
		[3, 5],
		[5, 5],
		[7, 7],
		[9, 9],
	])("finds that the snark of %i blocks has %i hexagons", (blocks, count) => {
		expect(countCycles(createGoldbergGraph(blocks), 6)).toBe(count);
	});
});

describe(countSymmetries, () => {
	it("finds the Petersen graph's 120", () => {
		expect(countSymmetries(createPetersenGraph())).toBe(120);
	});
});

describe(findShortestPath, () => {
	it("is as long as the snark of eleven blocks' diameter at most", () => {
		const graph = createGoldbergGraph(11);
		const neighbors = getNeighbors(graph);
		const distances = getDistances(neighbors, 4);
		const farthest = distances.indexOf(Math.max(...distances));

		expect(findShortestPath(graph, 4, farthest)).toHaveLength(12);
	});
});

describe(getEccentricities, () => {
	it.each([5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25])(
		"follows formulas for the snark of %i blocks",
		(blocks) => {
			expect(getEccentricities(createGoldbergGraph(blocks))).toEqual({
				diameter: blocks > 9 ? (blocks + 11) / 2 : blocks + 1,
				radius: (blocks + 5) / 2,
			});
		},
	);
});

describe(getGirth, () => {
	it("is infinite for graphs with no cycles", () => {
		expect(
			getGirth({
				edges: [{ from: 0, isLink: false, to: 1 }],
				vertices: [
					{ block: 0, role: "a", x: 0, y: 0 },
					{ block: 0, role: "b", x: 0, y: 1 },
				],
			}),
		).toBe(Infinity);
	});
});

describe("longestCycles", () => {
	it.each(odds)(
		"visits all %i blocks' vertices but c1, along edges",
		(blocks) => {
			const graph = createGoldbergGraph(blocks);
			const cycle = longestCycles[blocks].split(" ");
			const edges = new Set(toEdgeList(graph).split("\n"));

			expect([...cycle].sort()).toEqual(
				graph.vertices
					.map(getVertexName)
					.filter((name) => name !== "c1")
					.sort(),
			);
			expect(
				cycle.filter((name, i) => {
					const next = cycle[(i + 1) % cycle.length];

					return !edges.has(`${name} ${next}`) && !edges.has(`${next} ${name}`);
				}),
			).toEqual([]);
		},
	);
});

describe(toGraph6, () => {
	// From the formats documentation's example, and the Petersen graph with the same vertex order in NetworkX
	it("encodes a small graph", () => {
		const vertex = { block: 0, role: "a", x: 0, y: 0 };

		expect(
			toGraph6({
				edges: [
					{ from: 0, isLink: false, to: 2 },
					{ from: 0, isLink: false, to: 4 },
					{ from: 1, isLink: false, to: 3 },
					{ from: 3, isLink: false, to: 4 },
				],
				vertices: Array.from({ length: 5 }, () => vertex),
			}),
		).toBe("DQc");
	});

	it("encodes a graph of more than 62 vertices with a longer size", () => {
		expect(toGraph6(createGoldbergGraph(9)).slice(0, 4)).toBe("~?@G");
	});
});

describe(toEdgeList, () => {
	it("lists one edge per line", () => {
		const list = toEdgeList(createGoldbergGraph(5));

		expect(list.split("\n")).toHaveLength(61);
		expect(list.startsWith("a1 b1\nb1 c1\n")).toBe(true);
	});
});

describe(rotate, () => {
	it("turns what's on the right away from the viewer", () => {
		const turned = rotate({ x: 1, y: 2, z: 0 }, { pitch: 0, yaw: Math.PI / 2 });

		expect(turned.x).toBeCloseTo(0);
		expect(turned.y).toBeCloseTo(2);
		expect(turned.z).toBeCloseTo(-1);
	});
});

describe(unrotate, () => {
	it("undoes a rotation", () => {
		const angles = { pitch: 0.7, yaw: -1.9 };
		const point = unrotate(rotate({ x: 3, y: -5, z: 7 }, angles), angles);

		expect(point.x).toBeCloseTo(3);
		expect(point.y).toBeCloseTo(-5);
		expect(point.z).toBeCloseTo(7);
	});
});

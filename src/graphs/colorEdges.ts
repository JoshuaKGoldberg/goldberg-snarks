import type { Graph } from "./types.ts";

import { getFirstBlockEdge } from "./block.ts";

export type Coloring = readonly (number | undefined)[];

export interface ColoringOptions {
	/** Colors that edges must have, by index. */
	fixed?: ReadonlyMap<number, number>;

	/** Indices of edges to leave without a color. */
	skipped?: ReadonlySet<number>;
}

const colors = [0, 1, 2];

/**
 * Colors edges with three colors such that edges sharing a vertex differ,
 * or returns undefined if there's no way to.
 *
 * Edges of rings of blocks are ordered so that only a few vertices at a time are
 * partially colored. Remembering which combinations of those are dead ends keeps
 * this fast, including when it has to rule out every coloring there is.
 */
export function colorEdges(
	{ edges, vertices }: Graph,
	{ fixed, skipped }: ColoringOptions = {},
): Coloring | undefined {
	const order = [...edges.keys()].filter((index) => !skipped?.has(index));
	const result: (number | undefined)[] = edges.map(() => undefined);
	const remaining = vertices.map(() => 0);
	const used = vertices.map(() => 0);
	const deadEnds = new Set<string>();
	const frontier = new Set<number>();

	for (const index of order) {
		remaining[edges[index].from] += 1;
		remaining[edges[index].to] += 1;
	}

	function toggle(index: number, color: number, change: number) {
		const { from, to } = edges[index];

		for (const vertex of [from, to]) {
			remaining[vertex] -= change;
			used[vertex] ^= 1 << color;

			if (used[vertex] && remaining[vertex]) {
				frontier.add(vertex);
			} else {
				frontier.delete(vertex);
			}
		}
	}

	function describeFrontier() {
		return [...frontier]
			.sort((a, b) => a - b)
			.map((vertex) => `${vertex.toString()}:${used[vertex].toString()}`)
			.join();
	}

	/** Colors that haven't been used yet are interchangeable, so only one is tried. */
	function colorFrom(position: number, distinct: number): boolean {
		if (position === order.length) {
			return true;
		}

		const state = `${position.toString()}|${describeFrontier()}`;

		if (deadEnds.has(state)) {
			return false;
		}

		const index = order[position];
		const { from, to } = edges[index];
		const only = fixed?.get(index);
		const candidates =
			only === undefined ? colors.slice(0, distinct + 1) : [only];

		for (const color of candidates) {
			if (!((used[from] | used[to]) & (1 << color))) {
				result[index] = color;
				toggle(index, color, 1);

				if (colorFrom(position + 1, Math.max(distinct, color + 1))) {
					return true;
				}

				toggle(index, color, -1);
			}
		}

		deadEnds.add(state);

		return false;
	}

	return colorFrom(0, fixed ? colors.length : 0) ? result : undefined;
}

/** Colors as many of a Goldberg graph's edges as three colors can. */
export function colorMostEdges(graph: Graph) {
	return colorEdges(graph) ?? requireColoring(graph, { skipped: spareEdges });
}

/** Indices of two edges, a1 to b1 and c1 to e1, that three colors can do without. */
export const spareEdges: ReadonlySet<number> = new Set([
	getFirstBlockEdge("a", "b"),
	getFirstBlockEdge("c", "e"),
]);

export function countUncolored(coloring: Coloring) {
	return coloring.filter((color) => color === undefined).length;
}

/** Colors edges of a graph that there's known to be a way to color. */
export function requireColoring(graph: Graph, options?: ColoringOptions) {
	const coloring = colorEdges(graph, options);

	if (!coloring) {
		throw new Error("Expected to find a coloring.");
	}

	return coloring;
}

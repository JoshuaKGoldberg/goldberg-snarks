import type { Graph } from "./types.ts";

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
) {
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

	function colorFrom(position: number): boolean {
		if (position === order.length) {
			return true;
		}

		// Each vertex's colors are packed beside it, in an order that's always the same
		const state = [
			position,
			...[...frontier]
				.map((vertex) => vertex * 8 + used[vertex])
				.sort((a, b) => a - b),
		].join();

		if (deadEnds.has(state)) {
			return false;
		}

		const index = order[position];
		const { from, to } = edges[index];
		const only = fixed?.get(index);

		for (const color of only === undefined ? colors : [only]) {
			if (!((used[from] | used[to]) & (1 << color))) {
				result[index] = color;
				toggle(index, color, 1);

				if (colorFrom(position + 1)) {
					return true;
				}

				toggle(index, color, -1);
			}
		}

		result[index] = undefined;
		deadEnds.add(state);

		return false;
	}

	return colorFrom(0) ? result : undefined;
}

/** Colors as many edges as three colors can, leaving as few others as possible. */
export function colorMostEdges(graph: Graph) {
	const complete = colorEdges(graph);

	if (complete) {
		return complete;
	}

	const all = [...graph.edges.keys()];

	// Never just one, as edges' colors have to balance out: hence starting from pairs
	for (const first of all) {
		for (const second of all.slice(first + 1)) {
			const coloring = colorEdges(graph, { skipped: new Set([first, second]) });

			if (coloring) {
				return coloring;
			}
		}
	}

	throw new Error("More than two edges would have to be left uncolored.");
}

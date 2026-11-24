import type { Graph } from "./types.ts";

import { getVertexName } from "./getVertexName.ts";

/** Lists a graph's edges, one per line, as the names of their vertices. */
export function toEdgeList({ edges, vertices }: Graph) {
	return edges
		.map(
			({ from, to }) =>
				`${getVertexName(vertices[from])} ${getVertexName(vertices[to])}\n`,
		)
		.join("");
}

/**
 * Encodes a graph of up to 258,047 vertices in graph6 format.
 * @see https://users.cecs.anu.edu.au/~bdm/data/formats.txt
 */
export function toGraph6({ edges, vertices }: Graph) {
	const size = vertices.length;
	const connected = new Set(
		edges.map(({ from, to }) => Math.max(from, to) * size + Math.min(from, to)),
	);
	const bits: number[] = [];

	for (let high = 1; high < size; high += 1) {
		for (let low = 0; low < high; low += 1) {
			bits.push(Number(connected.has(high * size + low)));
		}
	}

	const codes: number[] = [];

	for (let i = 0; i < bits.length; i += 6) {
		codes.push(
			[0, 1, 2, 3, 4, 5].reduce(
				(code, offset) => code * 2 + (bits[i + offset] ?? 0),
				0,
			),
		);
	}

	const sizes =
		size < 63 ? [size] : [63, (size >> 12) & 63, (size >> 6) & 63, size & 63];

	return String.fromCharCode(...[...sizes, ...codes].map((code) => code + 63));
}

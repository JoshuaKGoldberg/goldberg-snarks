import type { Graph } from "./types.ts";

import { createBlockChain, stub } from "./createBlockChain.ts";

/** Vertices that are cut from the Petersen graph to make a block. */
const cut = {
	u: { joins: ["e", "h"], x: 1.3, y: -0.13 },
	v: { joins: ["b"], x: 0, y: 1.3 },
	w: { joins: ["f", "g"], x: -1.3, y: -0.13 },
};

/** Creates the Petersen graph, laid out around the part of it that's in blocks. */
export function createPetersenAroundBlock(): Graph {
	const block = createBlockChain(1);
	const kept = block.vertices.filter(
		({ role }) => role !== "a" && role !== stub,
	);
	const vertices = [
		...kept,
		...Object.entries(cut).map(([role, { x, y }]) => ({
			block: -1,
			role,
			x,
			y,
		})),
	];
	const find = (role: string) =>
		vertices.findIndex((vertex) => vertex.role === role);
	const edges = block.edges
		.map(({ from, isLink, to }) => ({
			from: kept.indexOf(block.vertices[from]),
			isLink,
			to: kept.indexOf(block.vertices[to]),
		}))
		.filter(({ from, to }) => from !== -1 && to !== -1);

	for (const [role, { joins }] of Object.entries(cut)) {
		for (const other of role === "v" ? [...joins, "u", "w"] : joins) {
			edges.push({ from: find(role), isLink: true, to: find(other) });
		}
	}

	return { edges, vertices };
}

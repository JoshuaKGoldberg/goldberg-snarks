import type { Graph, Point } from "./types.ts";

import { edgesWithinBlock, flatPositions, roles } from "./block.ts";

/** Vertices that are cut from the Petersen graph to make a block. */
const cutPositions: Readonly<Record<string, Point>> = {
	u: { x: 1.3, y: -0.13 },
	v: { x: 0, y: 1.3 },
	w: { x: -1.3, y: -0.13 },
};

const cutEdges = [
	{ from: "u", to: "e" },
	{ from: "u", to: "h" },
	{ from: "u", to: "v" },
	{ from: "v", to: "b" },
	{ from: "v", to: "w" },
	{ from: "w", to: "f" },
	{ from: "w", to: "g" },
];

/** Creates the Petersen graph, laid out around the part of it that's in blocks. */
export function createPetersenAroundBlock(): Graph {
	const vertices = [
		...roles
			.filter((role) => role !== "a")
			.map((name) => ({ name, ...flatPositions[name] })),
		...Object.entries(cutPositions).map(([name, position]) => ({
			name,
			...position,
		})),
	];
	const find = (name: string) =>
		vertices.findIndex((vertex) => vertex.name === name);
	const edges = [
		...edgesWithinBlock.filter(({ from }) => from !== "a"),
		...cutEdges,
	].map(({ from, to }) => ({ from: find(from), to: find(to) }));

	return { edges, vertices };
}

/** Gets whether an edge was cut from the Petersen graph to make a block. */
export function isCut({ edges, vertices }: Graph, index: number) {
	return vertices[edges[index].from].name in cutPositions;
}

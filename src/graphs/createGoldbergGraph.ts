import type { Edge, Graph, Vertex } from "./types.ts";

import {
	edgesToNextBlock,
	edgesWithinBlock,
	polarPositions,
	type Role,
	roles,
} from "./block.ts";

/** Creates the Goldberg graph with some number of blocks, at least three. */
export function createGoldbergGraph(blocks: number): Graph {
	if (!Number.isInteger(blocks) || blocks < 3) {
		throw new Error(
			`There is no Goldberg graph of ${blocks.toString()} blocks.`,
		);
	}

	const edges: Edge[] = [];
	const vertices: Vertex[] = [];

	for (let block = 0; block < blocks; block += 1) {
		for (const role of roles) {
			const { angle, radius } = polarPositions[role];
			// Blocks are narrower the more of them there are to fit
			const turned = (angle * 5) / blocks + (block / blocks) * Math.PI * 2;

			vertices.push({
				block,
				role,
				x: Math.sin(turned) * radius,
				y: -Math.cos(turned) * radius,
			});
		}

		for (const [from, to] of edgesWithinBlock) {
			edges.push({
				from: getVertexIndex(block, from),
				isLink: false,
				to: getVertexIndex(block, to),
			});
		}

		for (const [from, to] of edgesToNextBlock) {
			edges.push({
				from: getVertexIndex(block, from),
				isLink: true,
				to: getVertexIndex((block + 1) % blocks, to),
			});
		}
	}

	return { edges, vertices };
}

export function getVertexIndex(block: number, role: Role) {
	return block * roles.length + roles.indexOf(role);
}

import type { Edge, Graph, Vertex } from "./types.ts";

import {
	createBlock,
	edgesToNextBlock,
	getVertexIndex,
	polarPositions,
} from "./block.ts";

/** Number of blocks that positions are for, which others are scaled from. */
const positionedBlocks = 5;

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
		const created = createBlock(block, (role) => {
			const { angle, depth, radius } = polarPositions[role];
			const turned =
				(angle * positionedBlocks) / blocks + (block / blocks) * Math.PI * 2;

			return {
				depth,
				x: Math.sin(turned) * radius,
				y: -Math.cos(turned) * radius,
			};
		});

		vertices.push(...created.vertices);
		edges.push(
			...created.edges,
			...edgesToNextBlock.map(({ from, to, ...edge }) => ({
				...edge,
				from: getVertexIndex(block, from),
				to: getVertexIndex((block + 1) % blocks, to),
			})),
		);
	}

	return { edges, vertices };
}

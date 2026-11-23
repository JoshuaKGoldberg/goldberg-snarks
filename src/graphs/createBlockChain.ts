import type { Edge, Graph, Vertex } from "./types.ts";

import {
	edgesToNextBlock,
	edgesWithinBlock,
	flatPositions,
	roles,
} from "./block.ts";
import { getVertexIndex } from "./createGoldbergGraph.ts";

/** Space from the center of each block to the center of the next. */
const spacing = 1.6;

/** Role of the stubs standing in for blocks that a chain isn't linked to. */
export const stub = "stub";

/** Creates blocks linked in a flat row, with loose links at its two ends. */
export function createBlockChain(blocks: number): Graph {
	const edges: Edge[] = [];
	const vertices: Vertex[] = [];

	for (let block = 0; block < blocks; block += 1) {
		for (const role of roles) {
			const { x, y } = flatPositions[role];

			vertices.push({ block, role, x: x + block * spacing, y });
		}

		for (const [from, to] of edgesWithinBlock) {
			edges.push({
				from: getVertexIndex(block, from),
				isLink: false,
				to: getVertexIndex(block, to),
			});
		}
	}

	for (let block = -1; block < blocks; block += 1) {
		for (const [from, to] of edgesToNextBlock) {
			edges.push({
				from:
					block < 0
						? addStub(flatPositions[to].y, -spacing / 2)
						: getVertexIndex(block, from),
				isLink: true,
				to:
					block + 1 < blocks
						? getVertexIndex(block + 1, to)
						: addStub(flatPositions[from].y, (blocks - 0.5) * spacing),
			});
		}
	}

	return { edges, vertices };

	function addStub(y: number, x: number) {
		vertices.push({ block: -1, role: stub, x, y });

		return vertices.length - 1;
	}
}

import type { Graph, Vertex } from "./types.ts";

import {
	createBlock,
	edgesToNextBlock,
	flatPositions,
	getVertexIndex,
} from "./block.ts";

/** Space from the center of each block to the center of the next. */
const spacing = 1.6;

/** Creates blocks linked in a flat row, with loose links at its two ends. */
export function createBlockChain(blocks: number): Graph {
	const created = Array.from({ length: blocks }, (_, block) =>
		createBlock(block, (role) => {
			const { x, y } = flatPositions[role];

			return { x: x + block * spacing, y };
		}),
	);
	const edges = created.flatMap((block) => block.edges);
	const vertices = created.flatMap((block) => block.vertices);

	const addLooseEnd = (end: Vertex) => vertices.push(end) - 1;

	for (let block = -1; block < blocks; block += 1) {
		for (const { from, to, ...edge } of edgesToNextBlock) {
			edges.push({
				...edge,
				from:
					block === -1
						? addLooseEnd({ name: "", x: -spacing / 2, y: flatPositions[to].y })
						: getVertexIndex(block, from),
				to:
					block === blocks - 1
						? addLooseEnd({
								name: "",
								x: (blocks - 0.5) * spacing,
								y: flatPositions[from].y,
							})
						: getVertexIndex(block + 1, to),
			});
		}
	}

	return { edges, vertices };
}

/** Gets the indices of a chain's loose links: the left side's, then the right's. */
export function getLooseLinks({ edges, vertices }: Graph) {
	return [...edges.keys()].filter(
		(index) =>
			!vertices[edges[index].from].name || !vertices[edges[index].to].name,
	);
}

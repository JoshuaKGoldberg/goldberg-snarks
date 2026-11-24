import { getVerticesIn } from "./block.ts";

/**
 * Finds a cycle through all but one vertex, c1, of the Goldberg graph of an odd
 * number of blocks, as the indices of its vertices in order.
 */
export function createLongestCycle(blocks: number) {
	const last = blocks - 1;
	const cycle = [
		...getVerticesIn(0, "a", "b", "d", "h", "g"),
		...getVerticesIn(last, "h", "g", "c", "b", "d", "f", "e"),
		...getVerticesIn(0, "f", "e"),
		...getVerticesIn(1, "f", "e", "c", "g", "h", "d", "b", "a"),
	];

	for (let block = 2; block < last; block += 2) {
		cycle.push(
			...getVerticesIn(block, "a", "b", "d", "f", "e", "c", "g", "h"),
			...getVerticesIn(block + 1, "g", "h", "d", "f", "e", "c", "b", "a"),
		);
	}

	return [...cycle, ...getVerticesIn(last, "a")];
}

import { getCollection } from "astro:content";

/** Fewest blocks that a Goldberg graph has to have to be a snark. */
const fewestBlocks = 5;

/** Gets the Goldberg graphs that have pages, from fewest blocks to most. */
export async function getGraphs() {
	const entries = await getCollection("snarks");

	return entries
		.map((entry) => {
			const { blocks } = entry.data;

			return {
				...entry.data,
				entry,
				href: `/g${blocks.toString()}`,
				isSnark: blocks >= fewestBlocks,
				name: `G${blocks.toString()}`,
			};
		})
		.sort((a, b) => a.blocks - b.blocks);
}

/** Gets the Goldberg snarks that have pages, from fewest blocks to most. */
export async function getSnarks() {
	return (await getGraphs()).filter(({ isSnark }) => isSnark);
}

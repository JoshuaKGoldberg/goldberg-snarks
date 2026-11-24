import { getCollection } from "astro:content";

/** Fewest blocks that a Goldberg graph has to have to be a snark. */
const fewestBlocks = 5;

/** Gets the Goldberg graphs that have pages, from fewest blocks to most. */
export async function getGraphs() {
	const entries = await getCollection("graphs");

	return entries
		.map((entry) => {
			const blocks = Number(entry.id);

			if (blocks % 2 !== 1) {
				throw new Error(
					`Pages are for odd numbers of blocks, rather than ${entry.id}.`,
				);
			}

			const slug = `g${entry.id}`;

			return {
				blocks,
				entry,
				href: `/${slug}`,
				isSnark: blocks >= fewestBlocks,
				name: `G${entry.id}`,
				slug,
				summary: entry.data.summary,
			};
		})
		.sort((a, b) => a.blocks - b.blocks);
}

/** Gets the Goldberg snarks that have pages, from fewest blocks to most. */
export async function getSnarks() {
	return (await getGraphs()).filter(({ isSnark }) => isSnark);
}

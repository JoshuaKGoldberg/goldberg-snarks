import { getCollection } from "astro:content";

/** Gets the snarks that have pages, from fewest blocks to most. */
export async function getSnarks() {
	const entries = await getCollection("snarks");

	return entries
		.map((entry) => ({
			...entry.data,
			entry,
			href: `/g${entry.data.blocks.toString()}`,
			name: `G${entry.data.blocks.toString()}`,
		}))
		.sort((a, b) => a.blocks - b.blocks);
}

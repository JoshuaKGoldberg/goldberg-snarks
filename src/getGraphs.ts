import { getCollection } from "astro:content";

import { createGoldbergGraph } from "~/graphs/createGoldbergGraph.ts";

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

			const { edges, vertices } = createGoldbergGraph(blocks);
			const isSnark = blocks >= fewestBlocks;
			const kind = isSnark ? "Goldberg snark" : "Goldberg graph";
			const name = `G${entry.id}`;
			const slug = `g${entry.id}`;

			return {
				blocks,
				description: `${kind} ${name}: ${blocks.toString()} blocks, ${vertices.length.toString()} vertices, and ${edges.length.toString()} edges. ${entry.data.fact}`,
				entry,
				href: `/${slug}`,
				isSnark,
				kind,
				name,
				slug,
				summary: `A graph with ${vertices.length.toString()} vertices and ${edges.length.toString()} edges, made of ${blocks.toString()} identical blocks. ${entry.data.fact}`,
			};
		})
		.sort((a, b) => a.blocks - b.blocks);
}

/** Gets the Goldberg snarks that have pages, from fewest blocks to most. */
export async function getSnarks() {
	return (await getGraphs()).filter(({ isSnark }) => isSnark);
}

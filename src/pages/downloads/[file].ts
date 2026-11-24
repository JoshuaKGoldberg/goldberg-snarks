import type { APIRoute, GetStaticPaths } from "astro";

import { getGraphs } from "~/getGraphs.ts";
import { createGoldbergGraph } from "~/graphs/createGoldbergGraph.ts";
import { toEdgeList, toGraph6 } from "~/graphs/serialize.ts";
import { toSvg } from "~/graphs/toSvg.ts";
import { toPng } from "~/toPng.ts";

const formats = {
	g6: (blocks) => `${toGraph6(createGoldbergGraph(blocks))}\n`,
	png: async (blocks) => toPng(toSvg(blocks)),
	svg: toSvg,
	txt: (blocks) => toEdgeList(createGoldbergGraph(blocks)),
} satisfies Record<
	string,
	(
		blocks: number,
	) => Promise<Uint8Array<ArrayBuffer>> | string | Uint8Array<ArrayBuffer>
>;

type Extension = keyof typeof formats;

interface Props {
	blocks: number;
	extension: Extension;
}

export const getStaticPaths = (async () => {
	const graphs = await getGraphs();

	return graphs.flatMap(({ blocks, slug }) =>
		(Object.keys(formats) as Extension[]).map((extension) => ({
			params: { file: `${slug}.${extension}` },
			props: { blocks, extension },
		})),
	);
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props: { blocks, extension } }) =>
	new Response(await formats[extension](blocks));

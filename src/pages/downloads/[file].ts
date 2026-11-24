import type { APIRoute, GetStaticPaths } from "astro";

import sharp from "sharp";

import { getGraphs } from "~/getSnarks.ts";
import { createGoldbergGraph } from "~/graphs/createGoldbergGraph.ts";
import { toEdgeList, toGraph6 } from "~/graphs/serialize.ts";
import { toSvg } from "~/graphs/toSvg.ts";

const formats = {
	g6: (blocks) => `${toGraph6(createGoldbergGraph(blocks))}\n`,
	png: async (blocks) =>
		new Uint8Array(
			await sharp(Buffer.from(toSvg(blocks)))
				.flatten({ background: "white" })
				.png({ compressionLevel: 9 })
				.toBuffer(),
		),
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

	return graphs.flatMap(({ blocks, href }) =>
		(Object.keys(formats) as Extension[]).map((extension) => ({
			params: { file: `${href.slice(1)}.${extension}` },
			props: { blocks, extension },
		})),
	);
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props: { blocks, extension } }) =>
	new Response(await formats[extension](blocks));

import type { APIRoute, GetStaticPaths } from "astro";

import { getSnarks } from "~/getSnarks.ts";
import { createGoldbergGraph } from "~/graphs/createGoldbergGraph.ts";
import { toEdgeList, toGraph6 } from "~/graphs/serialize.ts";
import { toSvg } from "~/graphs/toSvg.ts";

const formats = {
	g6: (blocks) => `${toGraph6(createGoldbergGraph(blocks))}\n`,
	svg: toSvg,
	txt: (blocks) => toEdgeList(createGoldbergGraph(blocks)),
} satisfies Record<string, (blocks: number) => string>;

export const getStaticPaths = (async () => {
	const snarks = await getSnarks();

	return snarks.flatMap(({ blocks, href }) =>
		Object.entries(formats).map(([extension, format]) => ({
			params: { file: `${href.slice(1)}.${extension}` },
			props: { contents: format(blocks) },
		})),
	);
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ contents: string }> = ({ props }) =>
	new Response(props.contents);

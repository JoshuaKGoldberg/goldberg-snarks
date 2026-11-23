import type { APIRoute, GetStaticPaths } from "astro";

import sharp from "sharp";

import { getSnarks } from "~/getSnarks.ts";
import { toSvgContents } from "~/graphs/toSvg.ts";

export const getStaticPaths = (async () => {
	const snarks = await getSnarks();

	return snarks.map(({ blocks, href }) => ({
		params: { snark: href.slice(1) },
		props: { blocks },
	}));
}) satisfies GetStaticPaths;

/** Draws a snark as an image for links to its page. */
export const GET: APIRoute<{ blocks: number }> = async ({ props }) => {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-231 -121 462 242" width="1200" height="630"><rect x="-231" y="-121" width="462" height="242" fill="#ecf4f9"/><circle r="115" fill="#fff"/>${toSvgContents(props.blocks)}</svg>`;

	return new Response(
		new Uint8Array(
			await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer(),
		),
		{ headers: { "Content-Type": "image/png" } },
	);
};

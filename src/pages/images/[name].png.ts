import type { APIRoute, GetStaticPaths } from "astro";

import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

import { getGraphs } from "~/getSnarks.ts";
import { toSvgContents } from "~/graphs/toSvg.ts";

interface Props {
	blocks: number;

	/** Lines of text, with any subscript after an underscore. */
	lines: string[];
}

export const getStaticPaths = (async () => {
	const graphs = await getGraphs();

	return [
		{
			params: { name: "home" },
			props: { blocks: 5, lines: ["Goldberg", "snarks"] },
		},
		...graphs.map(({ blocks, href, isSnark }) => ({
			params: { name: href.slice(1) },
			props: {
				blocks,
				lines: [
					"Goldberg",
					isSnark ? "snark" : "graph",
					`G_${blocks.toString()}`,
				],
			},
		})),
	];
}) satisfies GetStaticPaths;

const fontFile = fileURLToPath(
	import.meta
		.resolve("@fontsource/libertinus-serif/files/libertinus-serif-latin-400-normal.woff"),
);

/** Draws a snark and its name, as an image for links to its page. */
export const GET: APIRoute<Props> = async ({ props: { blocks, lines } }) => {
	const { buffer } = await fs.readFile(fontFile);
	const font = opentype.parse(buffer);
	const top = -((lines.length - 1) * 46) / 2 + 14;

	// Text is drawn as shapes, so as to not depend on which fonts are installed
	const text = lines
		.map((line, i) => {
			const [main, subscript] = line.split("_");
			const y = top + i * 46;
			const end = font.getAdvanceWidth(main, 48);

			return (
				font.getPath(main, -205, y, 48).toSVG(2) +
				(subscript
					? font.getPath(subscript, -205 + end + 1, y + 9, 30).toSVG(2)
					: "")
			);
		})
		.join("");
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-231 -121 462 242" width="1200" height="630"><rect x="-231" y="-121" width="462" height="242" fill="#fffdf8"/><rect x="-231" y="-121" width="462" height="5" fill="#9c1c2b"/><g fill="#1d1a16">${text}</g><g transform="translate(112)"><g transform="scale(0.9)">${toSvgContents(blocks)}</g></g></svg>`;

	return new Response(
		new Uint8Array(
			await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer(),
		),
		{ headers: { "Content-Type": "image/png" } },
	);
};

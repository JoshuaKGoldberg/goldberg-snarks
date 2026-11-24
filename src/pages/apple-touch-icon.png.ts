import type { APIRoute } from "astro";

import fs from "node:fs/promises";
import sharp from "sharp";

import { palette } from "~/palette.ts";

/** Draws the site's icon for where SVGs can't be used. */
export const GET: APIRoute = async () => {
	const svg = await fs.readFile("public/favicon.svg");
	const [background] = palette.Paper;

	return new Response(
		new Uint8Array(
			await sharp(svg, { density: 600 })
				.resize(144, 144)
				.extend({ background, bottom: 18, left: 18, right: 18, top: 18 })
				.flatten({ background })
				.png()
				.toBuffer(),
		),
		{ headers: { "Content-Type": "image/png" } },
	);
};

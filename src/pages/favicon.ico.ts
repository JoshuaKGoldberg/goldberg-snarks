import type { APIRoute } from "astro";

import fs from "node:fs/promises";
import sharp from "sharp";

const size = 32;

/** Draws the site's icon for what looks for it here without reading pages. */
export const GET: APIRoute = async () => {
	const svg = await fs.readFile("public/favicon.svg");
	const image = await sharp(svg, { density: 600 })
		.resize(size, size)
		.png()
		.toBuffer();
	const header = Buffer.alloc(22);

	// A list of one icon, per https://en.wikipedia.org/wiki/ICO_(file_format)
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(1, 4);
	header.writeUInt8(size, 6);
	header.writeUInt8(size, 7);
	header.writeUInt16LE(1, 10);
	header.writeUInt16LE(32, 12);
	header.writeUInt32LE(image.length, 14);
	header.writeUInt32LE(header.length, 18);

	return new Response(new Uint8Array(Buffer.concat([header, image])), {
		headers: { "Content-Type": "image/x-icon" },
	});
};

import sharp from "sharp";

/** Draws an SVG on a white background, as a PNG. */
export async function toPng(svg: string) {
	return new Uint8Array(
		await sharp(Buffer.from(svg))
			.flatten({ background: "white" })
			.png({ compressionLevel: 9, palette: true })
			.toBuffer(),
	);
}

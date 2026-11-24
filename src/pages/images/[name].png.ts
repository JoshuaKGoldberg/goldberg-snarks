import type { APIRoute, GetStaticPaths } from "astro";

import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

import { imageSize, site } from "~/constants.ts";
import { getGraphs } from "~/getGraphs.ts";
import { createGoldbergGraph } from "~/graphs/createGoldbergGraph.ts";
import { toSvgContents } from "~/graphs/toSvg.ts";
import { palette } from "~/palette.ts";
import { toPng } from "~/toPng.ts";

interface Line {
	color?: string;

	/** Space above its baseline, in units of the image. */
	height: number;

	italic?: boolean;
	size: number;
	subscript?: string;
	text: string;
}

interface Props {
	blocks: number;
	lines: Line[];
}

const [ink] = palette.Ink;
const [muted] = palette.InkMuted;
const [paper] = palette.Paper;
const [red] = palette.Red;

export const getStaticPaths = (async () => {
	const graphs = await getGraphs();

	return [
		{
			params: { name: "home" },
			props: {
				blocks: 5,
				lines: [
					{ height: 0, size: 50, text: "Goldberg" },
					{ height: 47, size: 50, text: "snarks" },
					...describe("Graphs whose edges", "need four colors"),
				],
			},
		},
		...graphs.map(({ blocks, isSnark, slug }) => {
			const { edges, vertices } = createGoldbergGraph(blocks);

			return {
				params: { name: slug },
				props: {
					blocks,
					lines: [
						{
							height: 0,
							size: 27,
							text: isSnark ? "Goldberg snark" : "Goldberg graph",
						},
						{
							height: 68,
							italic: true,
							size: 84,
							subscript: blocks.toString(),
							text: "G",
						},
						...describe(
							`${vertices.length.toString()} vertices, ${edges.length.toString()} edges`,
						),
					],
				},
			};
		}),
	];
}) satisfies GetStaticPaths;

function describe(...texts: string[]): Line[] {
	return texts.map((text, i) => ({
		color: muted,
		height: i ? 22 : 40,
		italic: true,
		size: 18,
		text,
	}));
}

const height = 242;
const width = (height * imageSize.width) / imageSize.height;
const left = -width / 2;
const top = -height / 2;
const firstBaseline = -50;
const textLeft = -204;

const regular = await loadFont(
	import.meta
		.resolve("@fontsource/libertinus-serif/files/libertinus-serif-latin-400-normal.woff"),
);
const italic = await loadFont(
	import.meta
		.resolve("@fontsource/libertinus-serif/files/libertinus-serif-latin-400-italic.woff"),
);

async function loadFont(url: string) {
	const file = await fs.readFile(fileURLToPath(url));

	return opentype.parse(new Uint8Array(file).buffer);
}

/** Draws text as shapes, so as to not depend on which fonts are installed. */
function drawText(line: Omit<Line, "height">, y: number) {
	const { color = ink, size, subscript = "", text } = line;
	const font = line.italic ? italic : regular;
	const end = textLeft + font.getAdvanceWidth(text, size) + size * 0.02;

	return [
		font.getPath(text, textLeft, y, size),
		regular.getPath(subscript, end, y + size * 0.17, size * 0.6),
	]
		.map(
			(path) =>
				`<path d="${path.commands.map(toPathData).join("")}" fill="${color}"/>`,
		)
		.join("");
}

/** Used instead of `Path.toSVG`, which sometimes includes `NaN`. */
function toPathData({ type, ...coordinates }: opentype.PathCommand) {
	return (
		type +
		Object.values(coordinates)
			.map((coordinate) => coordinate.toFixed(2))
			.join(" ")
	);
}

/** Draws a graph and its name, as an image for links to its page. */
export const GET: APIRoute<Props> = async ({ props: { blocks, lines } }) => {
	const texts = lines.map((line, i) =>
		drawText(
			line,
			lines
				.slice(0, i + 1)
				.reduce((y, { height }) => y + height, firstBaseline),
		),
	);
	const address = drawText(
		{ color: red, size: 13, text: new URL(site).host },
		100,
	);

	return new Response(
		await toPng(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${[left, top, width, height].join(" ")}" width="${imageSize.width.toString()}" height="${imageSize.height.toString()}"><rect x="${left.toString()}" y="${top.toString()}" width="${width.toString()}" height="${height.toString()}" fill="${paper}"/><rect x="${left.toString()}" y="${top.toString()}" width="${width.toString()}" height="5" fill="${red}"/>${texts.join("")}${address}<g transform="translate(110 3) scale(1.02)">${toSvgContents(blocks)}</g></svg>`,
		),
		{ headers: { "Content-Type": "image/png" } },
	);
};

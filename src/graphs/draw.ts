import type { Graph, Vertex } from "./types.ts";

/** Units that a graph's radius of 1 is drawn at. */
const unit = 100;

const round = (value: number) => Math.round(value * unit * 10) / 10;

/** Groups edges by the names of their classes, each as an SVG path. */
export function drawEdge({ edges, vertices }: Graph, index: number) {
	const from = locate(vertices[edges[index].from]);
	const to = locate(vertices[edges[index].to]);

	return `M${from.x.toString()} ${from.y.toString()}L${to.x.toString()} ${to.y.toString()}`;
}

export function drawEdgesByClass(
	{ edges, vertices }: Graph,
	getClass: (index: number) => string,
) {
	const paths = new Map<string, string>();

	for (const index of edges.keys()) {
		const name = getClass(index);

		paths.set(
			name,
			(paths.get(name) ?? "") + drawEdge({ edges, vertices }, index),
		);
	}

	return [...paths];
}

export function getViewBox({ vertices }: Graph, padding = 8) {
	const points = vertices.map(locate);
	const left = Math.min(...points.map(({ x }) => x)) - padding;
	const right = Math.max(...points.map(({ x }) => x)) + padding;
	const top = Math.min(...points.map(({ y }) => y)) - padding;
	const bottom = Math.max(...points.map(({ y }) => y)) + padding;

	return [left, top, right - left, bottom - top]
		.map((value) => value.toFixed(1))
		.join(" ");
}

/** How big vertices should be for there to be space between them. */
export function getVertexRadius({ vertices }: Graph) {
	return Math.max(1, Math.min(2.6, 14 / Math.sqrt(vertices.length)));
}

export function locate({ x, y }: Vertex) {
	return { x: round(x), y: round(y) };
}

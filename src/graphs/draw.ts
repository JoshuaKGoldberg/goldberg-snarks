import type { Graph, Vertex } from "./types.ts";

/** Units that a graph's radius of 1 is drawn at. */
const unit = 100;

/** Gets the path of a dot: a line of no length, which only has round ends. */
export function drawDot(vertex: Vertex) {
	const { x, y } = locate(vertex);

	return `M${x.toString()} ${y.toString()}h0`;
}

export function drawEdge({ edges, vertices }: Graph, index: number) {
	const from = locate(vertices[edges[index].from]);
	const to = locate(vertices[edges[index].to]);

	return `M${from.x.toString()} ${from.y.toString()}L${to.x.toString()} ${to.y.toString()}`;
}

/** Gets a view box that's cropped to what's in a graph. */
export function getCroppedViewBox({ vertices }: Graph, padding: number) {
	const points = vertices.map(locate);
	const left = Math.min(...points.map(({ x }) => x)) - padding;
	const right = Math.max(...points.map(({ x }) => x)) + padding;
	const top = Math.min(...points.map(({ y }) => y)) - padding;
	const bottom = Math.max(...points.map(({ y }) => y)) + padding;

	return [left, top, right - left, bottom - top]
		.map((value) => value.toFixed(1))
		.join(" ");
}

/** Gets a view box that has the center of a ring at its own center. */
export function getRingViewBox(padding: number) {
	const size = unit + padding;

	return [-size, -size, size * 2, size * 2].join(" ");
}

/** How big vertices should be for there to be space between them. */
export function getVertexRadius({ vertices }: Graph) {
	return Math.max(1, Math.min(2.6, 14 / Math.sqrt(vertices.length)));
}

/** Groups the indices of vertices to draw dots for, by their classes. */
export function groupDots(
	{ vertices }: Graph,
	getClass: (index: number) => string | undefined = () => undefined,
) {
	return [
		...Map.groupBy(
			[...vertices.keys()].filter((index) => vertices[index].name),
			getClass,
		),
	];
}

/** Groups the indices of edges by their classes. */
export function groupEdges<Class extends string>(
	{ edges }: Graph,
	getClass: (index: number) => Class,
) {
	return [...Map.groupBy(edges.keys(), getClass)];
}

export function locate({ x, y }: Vertex) {
	return { x: round(x), y: round(y) };
}

function round(value: number) {
	return Math.round(value * unit * 10) / 10;
}

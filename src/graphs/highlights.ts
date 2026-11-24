import type { Graph } from "./types.ts";

import { getVertexIndex, getVerticesIn, roles } from "./block.ts";
import { createLongestCycle } from "./createLongestCycle.ts";
import { getPartClass } from "./edgeClasses.ts";
import { findShortestPath, getDistances, getNeighbors } from "./measure.ts";

export interface Highlight {
	edgeClass: (index: number) => string;
	vertexClass: (index: number) => string | undefined;
}

export type HighlightKind =
	| "block-cycles"
	| "every-fifth"
	| "every-third"
	| "farthest"
	| "inner"
	| "longest"
	| "swapped";

/** Gets how to draw a Goldberg graph such that something about it stands out. */
export function getHighlight(graph: Graph, kind: HighlightKind): Highlight {
	const blocks = graph.vertices.length / roles.length;

	switch (kind) {
		case "block-cycles": {
			const pentagon = findEdgesAlong(
				graph,
				close(getVerticesIn(0, "b", "c", "e", "f", "d")),
			);
			const hexagon = findEdgesAlong(
				graph,
				close(getVerticesIn(2, "c", "e", "f", "d", "h", "g")),
			);

			return {
				edgeClass: (index) =>
					pentagon.has(index)
						? "outer heavy"
						: hexagon.has(index)
							? "middle heavy"
							: "faint",
				vertexClass: () => undefined,
			};
		}

		case "every-fifth":
			return highlightBlocks(graph, 5);

		case "every-third":
			return highlightBlocks(graph, 3);

		case "farthest":
			return highlightPath(
				graph,
				findPathToFarthest(graph, getVertexIndex(0, "e")),
			);

		case "inner":
			return highlightPath(
				graph,
				close(
					Array.from({ length: blocks }, (_, block) =>
						getVertexIndex(block, "a"),
					),
				),
			);

		case "longest":
			return highlightPath(graph, close(createLongestCycle(blocks)));

		case "swapped":
			return {
				edgeClass: (index) => {
					const part = getPartClass(graph, index);

					return part === "outer" || part === "middle"
						? `${part} heavy`
						: "faint";
				},
				vertexClass: () => undefined,
			};
	}
}

function close(path: number[]) {
	return [...path, path[0]];
}

/** Finds the indices of edges between consecutive vertices of a path. */
function findEdgesAlong({ edges }: Graph, path: number[]) {
	const steps = new Set(
		path.slice(1).map((vertex, i) => [path[i], vertex].sort().join()),
	);

	return new Set(
		[...edges.keys()].filter((index) =>
			steps.has([edges[index].from, edges[index].to].sort().join()),
		),
	);
}

function findPathToFarthest(graph: Graph, from: number) {
	const distances = getDistances(getNeighbors(graph), from);

	return findShortestPath(
		graph,
		from,
		distances.indexOf(Math.max(...distances)),
	);
}

function highlightBlocks({ edges }: Graph, spacing: number): Highlight {
	const isInStep = (vertex: number) =>
		Math.floor(vertex / roles.length) % spacing === 0;

	return {
		edgeClass: (index) =>
			isInStep(edges[index].from) && isInStep(edges[index].to)
				? "strong"
				: "faint",
		vertexClass: (index) => (isInStep(index) ? undefined : "faint"),
	};
}

function highlightPath(graph: Graph, path: number[]): Highlight {
	const along = findEdgesAlong(graph, path);
	const visited = new Set(path);

	return {
		edgeClass: (index) => (along.has(index) ? "strong" : "faint"),
		vertexClass: (index) => (visited.has(index) ? undefined : "faint"),
	};
}

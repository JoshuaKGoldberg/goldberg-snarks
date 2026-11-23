import type { Graph } from "./types.ts";

import { findEdgesAlong, getPartClass } from "./edgeClasses.ts";
import { longestCycle } from "./longestCycle.ts";
import { findShortestPath, getDistances, getNeighbors } from "./measure.ts";

export interface Highlight {
	edgeClass: (index: number) => string;
	vertexClass: (index: number) => string | undefined;
}

export type HighlightKind =
	"every-fifth" | "every-third" | "farthest" | "hub" | "longest" | "swapped";

/** Gets how to draw a Goldberg graph such that something about it stands out. */
export function getHighlight(graph: Graph, kind: HighlightKind): Highlight {
	const { vertices } = graph;

	switch (kind) {
		case "every-fifth":
			return highlightBlocks(graph, 5);

		case "every-third":
			return highlightBlocks(graph, 3);

		case "farthest":
			return highlightPath(graph, findFarthest(graph));

		case "hub":
			return highlightPath(graph, [
				...[...vertices.keys()].filter((index) => vertices[index].role === "a"),
				0,
			]);

		case "longest": {
			const path = longestCycle.map((name) =>
				vertices.findIndex(
					({ block, role }) => `${role}${(block + 1).toString()}` === name,
				),
			);

			return highlightPath(graph, [...path, path[0]]);
		}

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

function findFarthest(graph: Graph) {
	const neighbors = getNeighbors(graph);
	const distances = getDistances(neighbors, 4);

	return findShortestPath(graph, 4, distances.indexOf(Math.max(...distances)));
}

function highlightBlocks(
	{ edges, vertices }: Graph,
	spacing: number,
): Highlight {
	const isInStep = (vertex: number) => vertices[vertex].block % spacing === 0;

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

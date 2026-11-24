import type { Graph } from "./types.ts";

export const colorNames = ["green", "blue", "gold"] as const;

/** Names edges for their place in a Goldberg graph's structure. */
export function getPartClass({ edges, vertices }: Graph, index: number) {
	const { from, to } = edges[index];
	const names = [vertices[from].role, vertices[to].role].sort().join("");

	switch (names) {
		case "aa":
		case "astub":
			return "inner";
		case "ef":
		case "estub":
		case "fstub":
			return "outer";
		case "gh":
		case "gstub":
		case "hstub":
			return "middle";
		default:
			return "spoke";
	}
}

/** Names edges for which of three colors they have, if any. */
export function getColorClass(color: number | undefined) {
	return color === undefined ? "spare" : colorNames[color];
}

/** Finds the indices of edges between consecutive vertices of a path. */
export function findEdgesAlong({ edges }: Graph, path: number[]) {
	const steps = new Set(
		path.slice(1).map((vertex, i) => [path[i], vertex].sort().join()),
	);

	return new Set(
		[...edges.keys()].filter((index) =>
			steps.has([edges[index].from, edges[index].to].sort().join()),
		),
	);
}

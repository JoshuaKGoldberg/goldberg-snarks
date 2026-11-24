import type { Graph } from "./types.ts";

export const colorNames = ["green", "blue", "gold"] as const;

/** Names edges for which of three colors they have, if any. */
export function getColorClass(color: number | undefined) {
	return color === undefined ? "spare" : colorNames[color];
}

/** Names edges for their place in a Goldberg graph's structure. */
export function getPartClass({ edges }: Graph, index: number) {
	return edges[index].ring ?? "spoke";
}

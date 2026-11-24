import { type Coloring, countUncolored } from "./colorEdges.ts";

/** Describes how many of a graph's edges three colors are enough for. */
export function describeColoring(coloring: Coloring) {
	const total = coloring.length;
	const uncolored = countUncolored(coloring);

	return uncolored
		? `At most ${(total - uncolored).toString()} of the ${total.toString()} edges can be colored.`
		: `All ${total.toString()} edges can be colored.`;
}

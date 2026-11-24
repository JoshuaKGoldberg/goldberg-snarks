import { describe, expect, it } from "vitest";

import {
	createPetersenAroundBlock,
	isCut,
} from "./createPetersenAroundBlock.ts";
import { countSymmetries, getGirth, getNeighbors } from "./measure.ts";

describe(createPetersenAroundBlock, () => {
	it("has the Petersen graph's degrees, girth, and symmetries", () => {
		const graph = createPetersenAroundBlock();

		expect({
			degrees: getNeighbors(graph).map((each) => new Set(each).size),
			girth: getGirth(graph),
			symmetries: countSymmetries(graph),
		}).toEqual({
			degrees: new Array<number>(10).fill(3),
			girth: 5,
			symmetries: 120,
		});
	});
});

describe(isCut, () => {
	it("finds the edges that meet u, v, or w", () => {
		const graph = createPetersenAroundBlock();

		expect(
			graph.edges
				.filter((_, index) => isCut(graph, index))
				.map(({ from, to }) =>
					[graph.vertices[from].name, graph.vertices[to].name].join(""),
				),
		).toEqual(["ue", "uh", "uv", "vb", "vw", "wf", "wg"]);
	});
});

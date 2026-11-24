import { describe, expect, it } from "vitest";

import {
	createPetersenAroundBlock,
	isCut,
} from "./createPetersenAroundBlock.ts";
import { countSymmetries, getGirth, getNeighbors } from "./measure.ts";

describe(createPetersenAroundBlock, () => {
	it("has u on the right, v at the bottom, and w on the left", () => {
		const { vertices } = createPetersenAroundBlock();
		const by = (key: "x" | "y") =>
			vertices.toSorted((a, b) => a[key] - b[key]).map(({ name }) => name);

		expect([by("x").at(-1), by("y").at(-1), by("x")[0]]).toEqual([
			"u",
			"v",
			"w",
		]);
	});

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

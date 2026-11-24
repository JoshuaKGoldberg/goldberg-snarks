import { describe, expect, it } from "vitest";

import { createBlockChain, getLooseLinks } from "./createBlockChain.ts";

describe(createBlockChain, () => {
	it("places vertices and loose ends when there are two blocks", () => {
		expect(createBlockChain(2).vertices).toMatchInlineSnapshot(`
			[
			  {
			    "name": "a1",
			    "x": 0,
			    "y": 1,
			  },
			  {
			    "name": "b1",
			    "x": 0,
			    "y": 0.26,
			  },
			  {
			    "name": "c1",
			    "x": -0.3,
			    "y": 0,
			  },
			  {
			    "name": "d1",
			    "x": 0.3,
			    "y": 0,
			  },
			  {
			    "name": "e1",
			    "x": 0.42,
			    "y": -0.8,
			  },
			  {
			    "name": "f1",
			    "x": -0.42,
			    "y": -0.8,
			  },
			  {
			    "name": "g1",
			    "x": -0.42,
			    "y": 0.55,
			  },
			  {
			    "name": "h1",
			    "x": 0.42,
			    "y": 0.55,
			  },
			  {
			    "name": "a2",
			    "x": 1.6,
			    "y": 1,
			  },
			  {
			    "name": "b2",
			    "x": 1.6,
			    "y": 0.26,
			  },
			  {
			    "name": "c2",
			    "x": 1.3,
			    "y": 0,
			  },
			  {
			    "name": "d2",
			    "x": 1.9000000000000001,
			    "y": 0,
			  },
			  {
			    "name": "e2",
			    "x": 2.02,
			    "y": -0.8,
			  },
			  {
			    "name": "f2",
			    "x": 1.1800000000000002,
			    "y": -0.8,
			  },
			  {
			    "name": "g2",
			    "x": 1.1800000000000002,
			    "y": 0.55,
			  },
			  {
			    "name": "h2",
			    "x": 2.02,
			    "y": 0.55,
			  },
			  {
			    "name": "",
			    "x": -0.8,
			    "y": 1,
			  },
			  {
			    "name": "",
			    "x": -0.8,
			    "y": -0.8,
			  },
			  {
			    "name": "",
			    "x": -0.8,
			    "y": 0.55,
			  },
			  {
			    "name": "",
			    "x": 2.4000000000000004,
			    "y": 1,
			  },
			  {
			    "name": "",
			    "x": 2.4000000000000004,
			    "y": -0.8,
			  },
			  {
			    "name": "",
			    "x": 2.4000000000000004,
			    "y": 0.55,
			  },
			]
		`);
	});
});

describe(getLooseLinks, () => {
	it("finds the three on each side when there are three blocks", () => {
		const chain = createBlockChain(3);

		expect(
			getLooseLinks(chain).map((index) => {
				const { from, ring, to } = chain.edges[index];

				return [chain.vertices[from].name, ring, chain.vertices[to].name];
			}),
		).toEqual([
			["", "inner", "a1"],
			["", "outer", "f1"],
			["", "middle", "g1"],
			["a3", "inner", ""],
			["e3", "outer", ""],
			["h3", "middle", ""],
		]);
	});
});

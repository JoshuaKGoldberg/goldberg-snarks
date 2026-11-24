import { describe, expect, it } from "vitest";

import { createPetersenGraph } from "./createPetersenGraph.ts";
import { toEdgeList } from "./serialize.ts";

describe(createPetersenGraph, () => {
	it("joins a pentagon to a pentagram", () => {
		const graph = createPetersenGraph();

		expect(toEdgeList(graph).trim().split("\n")).toMatchInlineSnapshot(`
			[
			  "outer 1 outer 2",
			  "outer 1 inner 1",
			  "inner 1 inner 3",
			  "outer 2 outer 3",
			  "outer 2 inner 2",
			  "inner 2 inner 4",
			  "outer 3 outer 4",
			  "outer 3 inner 3",
			  "inner 3 inner 5",
			  "outer 4 outer 5",
			  "outer 4 inner 4",
			  "inner 4 inner 1",
			  "outer 5 outer 1",
			  "outer 5 inner 5",
			  "inner 5 inner 2",
			]
		`);
		expect(graph.vertices).toMatchInlineSnapshot(`
			[
			  {
			    "name": "outer 1",
			    "x": 0,
			    "y": -1,
			  },
			  {
			    "name": "outer 2",
			    "x": 0.9510565162951535,
			    "y": -0.30901699437494745,
			  },
			  {
			    "name": "outer 3",
			    "x": 0.5877852522924732,
			    "y": 0.8090169943749473,
			  },
			  {
			    "name": "outer 4",
			    "x": -0.587785252292473,
			    "y": 0.8090169943749475,
			  },
			  {
			    "name": "outer 5",
			    "x": -0.9510565162951536,
			    "y": -0.30901699437494723,
			  },
			  {
			    "name": "inner 1",
			    "x": 0,
			    "y": -0.5,
			  },
			  {
			    "name": "inner 2",
			    "x": 0.47552825814757677,
			    "y": -0.15450849718747373,
			  },
			  {
			    "name": "inner 3",
			    "x": 0.2938926261462366,
			    "y": 0.40450849718747367,
			  },
			  {
			    "name": "inner 4",
			    "x": -0.2938926261462365,
			    "y": 0.4045084971874737,
			  },
			  {
			    "name": "inner 5",
			    "x": -0.4755282581475768,
			    "y": -0.15450849718747361,
			  },
			]
		`);
	});
});

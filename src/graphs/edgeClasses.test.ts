import { describe, expect, it } from "vitest";

import { createBlockChain } from "./createBlockChain.ts";
import { getColorClass, getPartClass } from "./edgeClasses.ts";

describe(getColorClass, () => {
	it.each([
		[0, "green"],
		[1, "blue"],
		[2, "gold"],
		[undefined, "spare"],
	])("names an edge whose color is %s as %s", (color, expected) => {
		expect(getColorClass(color)).toBe(expected);
	});
});

describe(getPartClass, () => {
	it("is each edge's ring, or a spoke when it isn't in one", () => {
		const block = createBlockChain(1);

		expect(block.edges.map((_, index) => getPartClass(block, index))).toEqual([
			...["spoke", "spoke", "spoke", "spoke", "spoke", "spoke", "spoke"],
			...["outer", "middle"],
			...["inner", "outer", "middle"],
			...["inner", "outer", "middle"],
		]);
	});
});

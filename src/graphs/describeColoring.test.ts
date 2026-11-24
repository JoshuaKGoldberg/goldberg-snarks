import { describe, expect, it } from "vitest";

import { describeColoring } from "./describeColoring.ts";

describe(describeColoring, () => {
	it("says how many at most when some are uncolored", () => {
		expect(describeColoring([0, 1, undefined])).toBe(
			"At most 2 of the 3 edges can be colored.",
		);
	});

	it("says that all are when none are uncolored", () => {
		expect(describeColoring([0, 1, 2])).toBe("All 3 edges can be colored.");
	});
});

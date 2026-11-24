import { describe, expect, it } from "vitest";

import { rotate, unrotate } from "./rotate.ts";

describe(rotate, () => {
	it("turns what's on the right away from the viewer when yaw is positive", () => {
		expect(
			rotate({ x: 1, y: 2, z: 0 }, { pitch: 0, yaw: Math.PI / 2 }),
		).toEqual({
			x: expect.closeTo(0),
			y: expect.closeTo(2),
			z: expect.closeTo(-1),
		});
	});

	it("turns what's at the bottom toward the viewer when pitch is positive", () => {
		expect(
			rotate({ x: 1, y: 2, z: 0 }, { pitch: Math.PI / 2, yaw: 0 }),
		).toEqual({
			x: expect.closeTo(1),
			y: expect.closeTo(0),
			z: expect.closeTo(2),
		});
	});
});

describe(unrotate, () => {
	it("undoes a rotation when given the same angles", () => {
		const angles = { pitch: 0.7, yaw: -1.9 };

		expect(unrotate(rotate({ x: 3, y: -5, z: 7 }, angles), angles)).toEqual({
			x: expect.closeTo(3),
			y: expect.closeTo(-5),
			z: expect.closeTo(7),
		});
	});
});

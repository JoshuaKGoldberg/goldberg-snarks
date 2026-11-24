import { describe, expect, it } from "vitest";

import { palette } from "../palette.ts";
import { toSvg } from "./toSvg.ts";

describe(toSvg, () => {
	it("draws each ring in its color when given a number of blocks", () => {
		expect(toSvg(3)).toMatchInlineSnapshot(`
			"<svg xmlns="http://www.w3.org/2000/svg" viewBox="-110 -110 220 220" width="1100" height="1100"><title>Goldberg graph G3</title><g fill="none" stroke-linecap="round" stroke-width="0.9"><path d="M2.1 -30.9L4.6 -54.8M4.6 -54.8L15.7 -77.4M4.6 -54.8L-6.2 -74.7M15.7 -77.4L46.5 -88.5M15.7 -77.4L-31.6 -60.2M-6.2 -74.7L-45.6 -71.7M-6.2 -74.7L39.3 -55.5M25.8 17.3L45.2 31.4M45.2 31.4L59.2 52.3M45.2 31.4L67.8 32M59.2 52.3L53.4 84.5M59.2 52.3L67.9 2.7M67.8 32L84.9 -3.7M67.8 32L28.4 61.8M-27.8 13.7L-49.8 23.4M-49.8 23.4L-74.9 25.1M-49.8 23.4L-61.6 42.8M-74.9 25.1L-99.9 4M-74.9 25.1L-36.3 57.5M-61.6 42.8L-39.3 75.4M-61.6 42.8L-67.7 -6.3" stroke="#1d1a16"/><path d="M46.5 -88.5L-45.6 -71.7M46.5 -88.5L84.9 -3.7M53.4 84.5L84.9 -3.7M53.4 84.5L-39.3 75.4M-99.9 4L-39.3 75.4M-99.9 4L-45.6 -71.7" stroke="#1c4f91"/><path d="M-31.6 -60.2L39.3 -55.5M39.3 -55.5L67.9 2.7M67.9 2.7L28.4 61.8M28.4 61.8L-36.3 57.5M-36.3 57.5L-67.7 -6.3M-67.7 -6.3L-31.6 -60.2" stroke="#a8720a"/><path d="M2.1 -30.9L25.8 17.3M25.8 17.3L-27.8 13.7M-27.8 13.7L2.1 -30.9" stroke="#9c1c2b"/></g><g fill="#1d1a16"><circle cx="2.1" cy="-30.9" r="2.60"/><circle cx="4.6" cy="-54.8" r="2.60"/><circle cx="15.7" cy="-77.4" r="2.60"/><circle cx="-6.2" cy="-74.7" r="2.60"/><circle cx="46.5" cy="-88.5" r="2.60"/><circle cx="-45.6" cy="-71.7" r="2.60"/><circle cx="-31.6" cy="-60.2" r="2.60"/><circle cx="39.3" cy="-55.5" r="2.60"/><circle cx="25.8" cy="17.3" r="2.60"/><circle cx="45.2" cy="31.4" r="2.60"/><circle cx="59.2" cy="52.3" r="2.60"/><circle cx="67.8" cy="32" r="2.60"/><circle cx="53.4" cy="84.5" r="2.60"/><circle cx="84.9" cy="-3.7" r="2.60"/><circle cx="67.9" cy="2.7" r="2.60"/><circle cx="28.4" cy="61.8" r="2.60"/><circle cx="-27.8" cy="13.7" r="2.60"/><circle cx="-49.8" cy="23.4" r="2.60"/><circle cx="-74.9" cy="25.1" r="2.60"/><circle cx="-61.6" cy="42.8" r="2.60"/><circle cx="-99.9" cy="4" r="2.60"/><circle cx="-39.3" cy="75.4" r="2.60"/><circle cx="-36.3" cy="57.5" r="2.60"/><circle cx="-67.7" cy="-6.3" r="2.60"/></g></svg>
			"
		`);
	});

	it.each([5, 7, 9, 11, 13, 15])(
		"matches the README's drawing when there are %i blocks",
		async (blocks) => {
			const [paper] = palette.Paper;

			await expect(toSvg(blocks, paper)).toMatchFileSnapshot(
				`../../.github/images/g${blocks.toString()}.svg`,
			);
		},
	);
});

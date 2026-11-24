import type { Graph } from "~/graphs/types.ts";

type Offsets = Record<string, readonly [x: number, y: number]>;

/** Where names are drawn from vertices that are laid out flat, so as to not cover any edges. */
const flatOffsets: Offsets = {
	a: [7, -5],
	b: [0, -7],
	c: [-8, 2],
	d: [8, 2],
	e: [0, -6],
	f: [0, -6],
	g: [-4, 13],
	h: [4, 13],
	u: [10, 4],
	v: [0, 15],
	w: [-11, 4],
};

/** Where names are drawn from vertices at the top of a ring. */
const ringOffsets: Offsets = {
	a: [0, 10],
	b: [8, 2],
	c: [-1, -4],
	d: [-8, -3.5],
	e: [0, -5],
	f: [-5, -4],
	g: [-9, -1],
	h: [9, -2],
};

/** Gets names of a flat graph's vertices, and where to draw them. */
export function nameFlatVertices({ vertices }: Graph) {
	return (index: number) => {
		const { role } = vertices[index];

		return role in flatOffsets
			? ([role, ...flatOffsets[role]] as const)
			: undefined;
	};
}

/** Gets names of the vertices of a ring's first block, and where to draw them. */
export function nameRingVertices({ vertices }: Graph) {
	return (index: number) => {
		const { block, role } = vertices[index];

		return block === 0
			? ([`${role}1`, ...ringOffsets[role]] as const)
			: undefined;
	};
}

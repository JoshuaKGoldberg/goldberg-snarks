import type { Edge, Point, Ring, Vertex } from "./types.ts";

export const roles = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export type Role = (typeof roles)[number];

interface RoleEdge {
	from: Role;
	ring?: Ring;
	to: Role;
}

/** Edges within a block, named as in Mohar & Vodopivec (2006). */
export const edgesWithinBlock: readonly RoleEdge[] = [
	{ from: "a", to: "b" },
	{ from: "b", to: "c" },
	{ from: "b", to: "d" },
	{ from: "c", to: "e" },
	{ from: "c", to: "g" },
	{ from: "d", to: "f" },
	{ from: "d", to: "h" },
	{ from: "e", ring: "outer", to: "f" },
	{ from: "g", ring: "middle", to: "h" },
];

/** Edges from a block to the next. */
export const edgesToNextBlock: readonly RoleEdge[] = [
	{ from: "a", ring: "inner", to: "a" },
	{ from: "e", ring: "outer", to: "f" },
	{ from: "h", ring: "middle", to: "g" },
];

export const edgesPerBlock = edgesWithinBlock.length + edgesToNextBlock.length;

interface PolarPosition {
	angle: number;

	/** How far it is toward the viewer, as in joshuakgoldberg.com's snarks. */
	depth: number;

	radius: number;
}

/** Where a block's vertices are around a ring of five, if it pointed upward. */
export const polarPositions: Readonly<Record<Role, PolarPosition>> = {
	a: { angle: 0.04, depth: 0.8, radius: 0.31 },
	b: { angle: 0.05, depth: 0.7, radius: 0.55 },
	c: { angle: 0.12, depth: 0.54, radius: 0.79 },
	d: { angle: -0.05, depth: 0.57, radius: 0.75 },
	e: { angle: 0.29, depth: 0.36, radius: 1 },
	f: { angle: -0.34, depth: 0.5, radius: 0.85 },
	g: { angle: -0.29, depth: 0.63, radius: 0.68 },
	h: { angle: 0.37, depth: 0.63, radius: 0.68 },
};

/** Where a block's vertices are when it's laid out flat, as by Campos et al. (2011). */
export const flatPositions: Readonly<Record<Role, Point>> = {
	a: { x: 0, y: 1 },
	b: { x: 0, y: 0.26 },
	c: { x: -0.3, y: 0 },
	d: { x: 0.3, y: 0 },
	e: { x: 0.42, y: -0.8 },
	f: { x: -0.42, y: -0.8 },
	g: { x: -0.42, y: 0.55 },
	h: { x: 0.42, y: 0.55 },
};

/** Creates a block's vertices, and the edges between them. */
export function createBlock(
	block: number,
	locate: (role: Role) => Omit<Vertex, "name">,
): { edges: Edge[]; vertices: Vertex[] } {
	return {
		edges: edgesWithinBlock.map(({ from, to, ...edge }) => ({
			...edge,
			from: getVertexIndex(block, from),
			to: getVertexIndex(block, to),
		})),
		vertices: roles.map((role) => ({
			...locate(role),
			name: `${role}${(block + 1).toString()}`,
		})),
	};
}

/** Gets the index of one of the edges within a Goldberg graph's first block. */
export function getFirstBlockEdge(from: Role, to: Role) {
	return edgesWithinBlock.findIndex(
		(edge) => edge.from === from && edge.to === to,
	);
}

export function getVertexIndex(block: number, role: Role) {
	return block * roles.length + roles.indexOf(role);
}

export function getVerticesIn(block: number, ...path: Role[]) {
	return path.map((role) => getVertexIndex(block, role));
}

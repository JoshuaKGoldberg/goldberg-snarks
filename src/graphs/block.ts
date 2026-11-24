import type { Point } from "./types.ts";

export const roles = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export type Role = (typeof roles)[number];

/** Edges within a block, named as in Mohar & Vodopivec (2006). */
export const edgesWithinBlock = [
	["a", "b"],
	["b", "c"],
	["b", "d"],
	["c", "e"],
	["c", "g"],
	["d", "f"],
	["d", "h"],
	["e", "f"],
	["g", "h"],
] as const satisfies (readonly [Role, Role])[];

/** Edges from a block to the next: the inner, outer, and middle rings' links. */
export const edgesToNextBlock = [
	["a", "a"],
	["e", "f"],
	["h", "g"],
] as const satisfies (readonly [Role, Role])[];

interface PolarPosition {
	angle: number;

	/** How far it is toward the viewer, as in joshuakgoldberg.com's snarks. */
	depth: number;

	radius: number;
}

/** Where a block's vertices are around a ring of five, if it pointed upward. */
export const polarPositions: Record<Role, PolarPosition> = {
	a: { angle: 0.04, depth: 0.8, radius: 0.31 },
	b: { angle: 0.05, depth: 0.7, radius: 0.55 },
	c: { angle: 0.12, depth: 0.54, radius: 0.79 },
	d: { angle: -0.05, depth: 0.57, radius: 0.75 },
	e: { angle: 0.29, depth: 0.36, radius: 1 },
	f: { angle: -0.34, depth: 0.5, radius: 0.85 },
	g: { angle: -0.29, depth: 0.63, radius: 0.68 },
	h: { angle: 0.37, depth: 0.63, radius: 0.68 },
};

/** Where a block's vertices are when it's laid out flat, as by Campos et al. (2010). */
export const flatPositions: Record<Role, Point> = {
	a: { x: 0, y: 1 },
	b: { x: 0, y: 0.26 },
	c: { x: -0.3, y: 0 },
	d: { x: 0.3, y: 0 },
	e: { x: 0.42, y: -0.8 },
	f: { x: -0.42, y: -0.8 },
	g: { x: -0.42, y: 0.55 },
	h: { x: 0.42, y: 0.55 },
};

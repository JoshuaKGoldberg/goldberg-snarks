export interface Edge {
	from: number;

	/** Which of a Goldberg graph's rings this is part of, if any. */
	ring?: Ring;

	to: number;
}

export interface Graph {
	readonly edges: readonly Edge[];
	readonly vertices: readonly Vertex[];
}

export interface Point {
	x: number;
	y: number;
}

export type Ring = "inner" | "middle" | "outer";

export interface Vertex extends Point {
	/** How far it is toward the viewer, if it isn't flat with the rest. */
	depth?: number;

	/** What it's called, or empty if it's only where a loose link ends. */
	name: string;
}

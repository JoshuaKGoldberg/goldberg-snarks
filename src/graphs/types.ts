export interface Edge {
	from: number;

	/** Whether this is between blocks, rather than within one. */
	isLink: boolean;

	to: number;
}

export interface Graph {
	edges: Edge[];
	vertices: Vertex[];
}

export interface Point {
	x: number;
	y: number;
}

export interface Vertex extends Point {
	block: number;

	/** How far it is toward the viewer, if it isn't flat with the rest. */
	depth?: number;

	role: string;
}

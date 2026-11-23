import type { Edge, Graph, Vertex } from "./types.ts";

const points = 5;

/** Creates the Petersen graph: a pentagon joined to a pentagram. */
export function createPetersenGraph(): Graph {
	const edges: Edge[] = [];
	const vertices: Vertex[] = [];

	for (const [role, radius] of [
		["outer", 1],
		["inner", 0.5],
	] as const) {
		for (let i = 0; i < points; i += 1) {
			const angle = (i / points) * Math.PI * 2;

			vertices.push({
				block: i,
				role,
				x: Math.sin(angle) * radius,
				y: -Math.cos(angle) * radius,
			});
		}
	}

	for (let i = 0; i < points; i += 1) {
		edges.push(
			{ from: i, isLink: false, to: (i + 1) % points },
			{ from: i, isLink: false, to: i + points },
			{ from: i + points, isLink: false, to: ((i + 2) % points) + points },
		);
	}

	return { edges, vertices };
}

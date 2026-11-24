import type { Edge, Graph, Vertex } from "./types.ts";

const points = 5;

export function createPetersenGraph(): Graph {
	const edges: Edge[] = [];
	const vertices: Vertex[] = [];

	for (const [part, radius] of [
		["outer", 1],
		["inner", 0.5],
	] as const) {
		for (let i = 0; i < points; i += 1) {
			const angle = (i / points) * Math.PI * 2;

			vertices.push({
				name: `${part} ${(i + 1).toString()}`,
				x: Math.sin(angle) * radius,
				y: -Math.cos(angle) * radius,
			});
		}
	}

	for (let i = 0; i < points; i += 1) {
		edges.push(
			{ from: i, to: (i + 1) % points },
			{ from: i, to: i + points },
			{ from: i + points, to: ((i + 2) % points) + points },
		);
	}

	return { edges, vertices };
}

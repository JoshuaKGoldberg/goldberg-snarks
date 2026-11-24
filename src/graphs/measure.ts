import type { Graph } from "./types.ts";

/** How many steps it can take to get from a vertex to any other. */
export interface Eccentricities {
	diameter: number;
	radius: number;
}

export function countCycles(graph: Graph, length: number) {
	const neighbors = getNeighbors(graph);
	const visited = new Set<number>();
	let count = 0;

	/** Counts cycles from their lowest vertex, in both of their directions. */
	function visit(start: number, current: number) {
		if (visited.size === length) {
			count += Number(neighbors[current].includes(start));

			return;
		}

		for (const next of neighbors[current]) {
			if (next > start && !visited.has(next)) {
				visited.add(next);
				visit(start, next);
				visited.delete(next);
			}
		}
	}

	for (const start of neighbors.keys()) {
		visited.clear();
		visited.add(start);
		visit(start, start);
	}

	return count / 2;
}

/** Counts ways to map a connected graph onto itself that preserve its edges. */
export function countSymmetries(graph: Graph) {
	const neighbors = getNeighbors(graph);
	const order = getSearchOrder(neighbors);
	const mapped = new Map<number, number>();
	const used = new Set<number>();

	function extend(position: number): number {
		if (position === order.length) {
			return 1;
		}

		const { parent, vertex } = order[position];
		const image = parent === undefined ? undefined : mapped.get(parent);
		const candidates =
			image === undefined ? neighbors.keys() : neighbors[image];
		let count = 0;

		for (const candidate of candidates) {
			if (
				!used.has(candidate) &&
				neighbors[vertex].every((neighbor) => {
					const neighborImage = mapped.get(neighbor);

					return (
						neighborImage === undefined ||
						neighbors[candidate].includes(neighborImage)
					);
				})
			) {
				mapped.set(vertex, candidate);
				used.add(candidate);
				count += extend(position + 1);
				mapped.delete(vertex);
				used.delete(candidate);
			}
		}

		return count;
	}

	return extend(0);
}

/** Finds the vertices along a shortest path between two vertices, inclusive. */
export function findShortestPath(graph: Graph, from: number, to: number) {
	const neighbors = getNeighbors(graph);
	const distances = getDistances(neighbors, to);
	const path = [from];

	for (let current = from; current !== to; path.push(current)) {
		[current] = neighbors[current].toSorted(
			(a, b) => distances[a] - distances[b],
		);
	}

	return path;
}

/** Gets how far each vertex is from a starting one. */
export function getDistances(neighbors: number[][], start: number) {
	const distances = neighbors.map(() => Infinity);
	const queue = [start];

	distances[start] = 0;

	for (const current of queue) {
		for (const next of neighbors[current]) {
			if (distances[next] === Infinity) {
				distances[next] = distances[current] + 1;
				queue.push(next);
			}
		}
	}

	return distances;
}

/** Gets the most and fewest steps that any vertex's farthest vertex is away. */
export function getEccentricities(graph: Graph): Eccentricities {
	const neighbors = getNeighbors(graph);
	const farthest = neighbors.map((_, vertex) =>
		Math.max(...getDistances(neighbors, vertex)),
	);

	return { diameter: Math.max(...farthest), radius: Math.min(...farthest) };
}

/** Gets the length of a graph's shortest cycle. */
export function getGirth(graph: Graph) {
	for (let length = 3; length <= graph.vertices.length; length += 1) {
		if (countCycles(graph, length)) {
			return length;
		}
	}

	return Infinity;
}

/** Gets the indices of vertices that each vertex shares an edge with. */
export function getNeighbors({ edges, vertices }: Graph) {
	const neighbors = vertices.map((): number[] => []);

	for (const { from, to } of edges) {
		neighbors[from].push(to);
		neighbors[to].push(from);
	}

	return neighbors;
}

function getSearchOrder(neighbors: number[][]) {
	const order: { parent?: number; vertex: number }[] = [{ vertex: 0 }];
	const seen = new Set([0]);

	for (const { vertex } of order) {
		for (const neighbor of neighbors[vertex]) {
			if (!seen.has(neighbor)) {
				seen.add(neighbor);
				order.push({ parent: vertex, vertex: neighbor });
			}
		}
	}

	return order;
}

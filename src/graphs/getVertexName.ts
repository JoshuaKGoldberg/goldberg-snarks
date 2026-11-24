import type { Vertex } from "./types.ts";

/** Names a vertex, like "a1", with blocks counted from one. */
export function getVertexName({ block, role }: Vertex) {
	return `${role}${(block + 1).toString()}`;
}

/** Definitions and results on the main page, in the order that they're numbered. */
const ordered = [
	["snark", "Definition"],
	["petersen", "Lemma"],
	["goldberg-snark", "Definition"],
	["matching", "Lemma"],
	["theorem", "Theorem"],
	["short-cycles", "Proposition"],
	["connectivity", "Proposition"],
	["hamiltonian", "Corollary"],
] as const;

export type StatementId = (typeof ordered)[number][0];

export function getStatement(id: StatementId) {
	const index = ordered.findIndex(([other]) => other === id);
	const [, kind] = ordered[index];

	return { kind, label: `${kind} ${(index + 1).toString()}` };
}

/**
 * Cycles through every vertex but c1 of the Goldberg graphs of some numbers of blocks.
 * They were found by a SAT solver, as it'd take a while to search for them in each build.
 */
export const longestCycles: Record<number, string> = {
	3: "a1 b1 d1 f1 e1 f2 d2 b2 c2 e2 f3 e3 c3 g3 h2 g2 h1 g1 h3 d3 b3 a3 a2",
	5: "a1 b1 d1 h1 g1 h5 g5 c5 b5 d5 f5 e5 f1 e1 f2 e2 c2 g2 h2 d2 b2 a2 a3 b3 d3 f3 e3 c3 g3 h3 g4 h4 d4 f4 e4 c4 b4 a4 a5",
	7: "a1 b1 d1 h1 g1 h7 g7 c7 b7 d7 f7 e7 f1 e1 f2 e2 c2 g2 h2 d2 b2 a2 a3 b3 d3 f3 e3 c3 g3 h3 g4 h4 d4 f4 e4 c4 b4 a4 a5 b5 d5 f5 e5 c5 g5 h5 g6 h6 d6 f6 e6 c6 b6 a6 a7",
	9: "a1 b1 d1 h1 g1 h9 g9 c9 b9 d9 f9 e9 f1 e1 f2 e2 c2 g2 h2 d2 b2 a2 a3 b3 d3 f3 e3 c3 g3 h3 g4 h4 d4 f4 e4 c4 b4 a4 a5 b5 d5 f5 e5 c5 g5 h5 g6 h6 d6 f6 e6 c6 b6 a6 a7 b7 d7 f7 e7 c7 g7 h7 g8 h8 d8 f8 e8 c8 b8 a8 a9",
	11: "a1 b1 d1 h1 g1 h11 g11 c11 b11 d11 f11 e11 f1 e1 f2 e2 c2 g2 h2 d2 b2 a2 a3 b3 d3 f3 e3 c3 g3 h3 g4 h4 d4 f4 e4 c4 b4 a4 a5 b5 d5 f5 e5 c5 g5 h5 g6 h6 d6 f6 e6 c6 b6 a6 a7 b7 d7 f7 e7 c7 g7 h7 g8 h8 d8 f8 e8 c8 b8 a8 a9 b9 d9 f9 e9 c9 g9 h9 g10 h10 d10 f10 e10 c10 b10 a10 a11",
	13: "a1 b1 d1 h1 g1 h13 g13 c13 b13 d13 f13 e13 f1 e1 f2 e2 c2 g2 h2 d2 b2 a2 a3 b3 d3 f3 e3 c3 g3 h3 g4 h4 d4 f4 e4 c4 b4 a4 a5 b5 d5 f5 e5 c5 g5 h5 g6 h6 d6 f6 e6 c6 b6 a6 a7 b7 d7 f7 e7 c7 g7 h7 g8 h8 d8 f8 e8 c8 b8 a8 a9 b9 d9 f9 e9 c9 g9 h9 g10 h10 d10 f10 e10 c10 b10 a10 a11 b11 d11 f11 e11 c11 g11 h11 g12 h12 d12 f12 e12 c12 b12 a12 a13",
	15: "a1 b1 d1 h1 g1 h15 g15 c15 b15 d15 f15 e15 f1 e1 f2 e2 c2 g2 h2 d2 b2 a2 a3 b3 d3 f3 e3 c3 g3 h3 g4 h4 d4 f4 e4 c4 b4 a4 a5 b5 d5 f5 e5 c5 g5 h5 g6 h6 d6 f6 e6 c6 b6 a6 a7 b7 d7 f7 e7 c7 g7 h7 g8 h8 d8 f8 e8 c8 b8 a8 a9 b9 d9 f9 e9 c9 g9 h9 g10 h10 d10 f10 e10 c10 b10 a10 a11 b11 d11 f11 e11 c11 g11 h11 g12 h12 d12 f12 e12 c12 b12 a12 a13 b13 d13 f13 e13 c13 g13 h13 g14 h14 d14 f14 e14 c14 b14 a14 a15",
};

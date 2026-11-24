export interface Reference {
	authors: string;
	details: string;

	/** Where it's available online, if it is. */
	href?: string;

	/** Language of the title, if it isn't English. */
	lang?: string;

	/** How it's mentioned within text. */
	short: string;
	title: string;
	year?: number;
}

export const references = {
	berman2017: {
		authors: "L. W. Berman, D. Oliveros, and G. I. Williams",
		details:
			"arXiv:1707.05294. Published in 2024 as “Rotationally symmetric snarks from voltage graphs”, Discrete Mathematics 347(4), 113874.",
		href: "https://arxiv.org/abs/1707.05294",
		short: "Berman et al. 2017",
		title: "Cyclic pseudo-Loupekine snarks",
		year: 2017,
	},
	blanusa1946: {
		authors: "D. Blanuša",
		details:
			"Glasnik Matematičko-Fizički i Astronomski, Series II 1, 31–42 (in Croatian).",
		lang: "hr",
		short: "Blanuša 1946",
		title: "Problem četiriju boja",
		year: 1946,
	},
	brinkmann2026: {
		authors: "G. Brinkmann and S. Van Overberghe",
		details: "arXiv:2603.17789.",
		href: "https://arxiv.org/abs/2603.17789",
		short: "Brinkmann & Van Overberghe 2026",
		title: "Algorithms for the generation of snarks",
		year: 2026,
	},
	campos2011: {
		authors: "C. N. Campos, S. Dantas, and C. P. de Mello",
		details: "Discrete Mathematics 311(12), 984–988.",
		href: "https://doi.org/10.1016/j.disc.2011.02.013",
		short: "Campos et al. 2011",
		title: "The total-chromatic number of some families of snarks",
		year: 2011,
	},
	chen2025: {
		authors: "G. Chen, G. Jing, and W. Zang",
		details:
			"Journal of Combinatorial Optimization 50(3), article 23. Correction in 51(1), article 1 (2026).",
		href: "https://doi.org/10.1007/s10878-025-01348-6",
		short: "Chen et al. 2025",
		title:
			"Proof of the Goldberg–Seymour conjecture on edge-colorings of multigraphs",
		year: 2025,
	},
	gardner1976: {
		authors: "M. Gardner",
		details: "Scientific American 234(4), 126–130.",
		href: "https://doi.org/10.1038/scientificamerican0476-126",
		short: "Gardner 1976",
		title:
			"Mathematical Games: Snarks, boojums and other conjectures related to the four-color-map theorem",
		year: 1976,
	},
	ghebleh2007: {
		authors: "M. Ghebleh",
		details: "Discrete Mathematics 307(24), 3220–3225.",
		href: "https://doi.org/10.1016/j.disc.2007.03.047",
		short: "Ghebleh 2007",
		title: "The circular chromatic index of Goldberg snarks",
		year: 2007,
	},
	goldberg1981: {
		authors: "M. K. Goldberg",
		details: "Journal of Combinatorial Theory, Series B 31(3), 282–291.",
		href: "https://doi.org/10.1016/0095-8956(81)90030-7",
		short: "Goldberg 1981",
		title: "Construction of class 2 graphs with maximum vertex degree 3",
		year: 1981,
	},
	isaacs1975: {
		authors: "R. Isaacs",
		details: "The American Mathematical Monthly 82(3), 221–239.",
		href: "https://doi.org/10.1080/00029890.1975.11993805",
		short: "Isaacs 1975",
		title:
			"Infinite families of nontrivial trivalent graphs which are not Tait colorable",
		year: 1975,
	},
	lukotka2024: {
		authors: "R. Lukoťka",
		details: "Discrete Mathematics 347(3), 113792.",
		href: "https://doi.org/10.1016/j.disc.2023.113792",
		short: "Lukoťka 2024",
		title: "Circular flow number of Goldberg snarks",
		year: 2024,
	},
	mohar2006: {
		authors: "B. Mohar and A. Vodopivec",
		details: "Combinatorics, Probability and Computing 15(6), 877–893.",
		href: "https://doi.org/10.1017/S0963548306007607",
		short: "Mohar & Vodopivec 2006",
		title: "On polyhedral embeddings of cubic graphs",
		year: 2006,
	},
	petersen1898: {
		authors: "J. Petersen",
		details: "L’Intermédiaire des Mathématiciens 5, 225–227.",
		lang: "fr",
		short: "Petersen 1898",
		title: "Sur le théorème de Tait",
		year: 1898,
	},
	tait1880: {
		authors: "P. G. Tait",
		details: "Proceedings of the Royal Society of Edinburgh 10, 729.",
		href: "https://doi.org/10.1017/S0370164600044643",
		short: "Tait 1880",
		title: "Remarks on the previous communication",
		year: 1880,
	},
	vizing1964: {
		authors: "V. G. Vizing",
		details: "Diskretnyi Analiz 3, 25–30 (in Russian).",
		short: "Vizing 1964",
		title: "On an estimate of the chromatic class of a p-graph",
		year: 1964,
	},
	weisstein: {
		authors: "E. W. Weisstein",
		details: "MathWorld, a Wolfram resource. Accessed November 2026.",
		href: "https://mathworld.wolfram.com/GoldbergGraph.html",
		short: "MathWorld",
		title: "Goldberg graph",
	},
} satisfies Record<string, Reference>;

export type ReferenceId = keyof typeof references;

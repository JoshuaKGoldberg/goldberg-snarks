/** Each color's values in the light and dark themes. */
export const palette = {
	Blue: ["#1c4f91", "#86b4ee"],
	Gold: ["#a8720a", "#dcab4c"],
	GoldText: ["#80560a", "#dcab4c"],
	Green: ["#2c6b45", "#85c596"],
	Ink: ["#1d1a16", "#eae3d5"],
	InkFaint: ["#8d8576", "#7f7666"],
	InkMuted: ["#5c554a", "#b3a996"],
	Paper: ["#fffdf8", "#191613"],
	PaperShaded: ["#f8f3e8", "#221e19"],
	Red: ["#9c1c2b", "#f0838a"],
	Rule: ["#d8cfbd", "#453d33"],
} satisfies Record<string, readonly [light: string, dark: string]>;

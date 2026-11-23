import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

import { site } from "./src/constants.ts";

// https://astro.build/config
export default defineConfig({
	build: { inlineStylesheets: "always" },

	// The default also removes spaces that separate text from elements after it
	compressHTML: true,
	fonts: [
		{
			cssVariable: "--fontDisplay",
			fallbacks: ["serif"],
			name: "Redaction",
			provider: fontProviders.google(),
			styles: ["normal"],
			subsets: ["latin"],
			weights: [400],
		},
		{
			cssVariable: "--fontText",
			fallbacks: ["serif"],
			name: "Newsreader",
			provider: fontProviders.google(),
			styles: ["normal", "italic"],
			subsets: ["latin"],
			weights: ["300 600"],
		},
		{
			cssVariable: "--fontLabel",
			fallbacks: ["sans-serif"],
			name: "Hedvig Letters Sans",
			provider: fontProviders.google(),
			styles: ["normal"],
			subsets: ["latin"],
			weights: [400],
		},
	],
	integrations: [mdx(), sitemap()],
	prefetch: true,
	site,
	trailingSlash: "ignore",
});

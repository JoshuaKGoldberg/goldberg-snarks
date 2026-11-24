import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

import { site } from "./src/constants.ts";

// https://astro.build/config
export default defineConfig({
	build: { format: "file", inlineStylesheets: "always" },

	fonts: [
		{
			cssVariable: "--fontText",
			fallbacks: ["serif"],
			name: "Libertinus Serif",
			provider: fontProviders.google(),
			styles: ["normal", "italic"],
			subsets: ["latin"],
			weights: [400, 700],
		},
	],
	integrations: [mdx(), sitemap()],
	prefetch: true,
	site,
	trailingSlash: "never",
});

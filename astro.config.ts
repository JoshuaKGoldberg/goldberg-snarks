import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

import { site } from "./src/constants.ts";

const fontFiles = "@fontsource/libertinus-serif/files/libertinus-serif";

// https://astro.build/config
export default defineConfig({
	build: { format: "file", inlineStylesheets: "always" },
	fonts: [
		{
			cssVariable: "--fontText",
			display: "optional",
			fallbacks: ["serif"],
			name: "Libertinus Serif",
			optimizedFallbacks: false,
			options: {
				variants: [
					{
						src: [`${fontFiles}-latin-400-normal.woff2`],
						style: "normal",
						weight: 400,
					},
					{
						src: [`${fontFiles}-latin-400-italic.woff2`],
						style: "italic",
						weight: 400,
					},
					{
						src: [`${fontFiles}-latin-700-normal.woff2`],
						style: "normal",
						weight: 700,
					},
				],
			},
			provider: fontProviders.local(),
		},
	],
	integrations: [mdx(), sitemap()],
	prefetch: { prefetchAll: true },
	site,
	trailingSlash: "never",
});

import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

export const collections = {
	snarks: defineCollection({
		loader: glob({ base: "./src/content/snarks", pattern: "*.mdx" }),
		schema: z.object({
			blocks: z.number().int().min(3),

			/** What sets this snark apart, as a short phrase. */
			nickname: z.string(),

			/** One or two sentences, for its page's lead and metadata. */
			summary: z.string(),

			/** A few words, for its picture in the gallery. */
			teaser: z.string(),
		}),
	}),
};

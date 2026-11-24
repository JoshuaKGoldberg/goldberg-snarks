import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

export const collections = {
	snarks: defineCollection({
		loader: glob({ base: "./src/content/snarks", pattern: "*.mdx" }),
		schema: z.object({
			blocks: z.number().int().min(3),

			/** One or two sentences, for its page's lead and metadata. */
			summary: z.string(),
		}),
	}),
};

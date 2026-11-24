import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

export const collections = {
	graphs: defineCollection({
		loader: glob({ base: "./src/content/graphs", pattern: "*.mdx" }),
		schema: z.object({
			/** One or two sentences, for its page's lead and metadata. */
			summary: z.string(),
		}),
	}),
};

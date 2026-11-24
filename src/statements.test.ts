import fs from "node:fs/promises";
import { expect, it } from "vitest";

import { statementIds } from "./statements.ts";

it("numbers statements in the order that they're on the homepage", async () => {
	const content = await fs.readFile("src/content/home.mdx", "utf8");
	const ids = content.matchAll(/<Statement id="([^"]+)"/g);

	expect([...ids].map(([, id]) => id)).toEqual(statementIds);
});

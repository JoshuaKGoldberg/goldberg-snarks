/** Finds an element that's always in another. */
export function query<T extends Element>(
	parent: Element,
	selector: string,
	type: abstract new () => T,
): T {
	const element = parent.querySelector(selector);

	if (!(element instanceof type)) {
		throw new Error(`Couldn't find ${selector}.`);
	}

	return element;
}

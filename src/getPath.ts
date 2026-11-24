/** Gets the path that a page is linked to at, as its file's name may be in its URL. */
export function getPath({ pathname }: URL) {
	return pathname.replace(/\.html$/, "").replace(/\/index$/, "/");
}

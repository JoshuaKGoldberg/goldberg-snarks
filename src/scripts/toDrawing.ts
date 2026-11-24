export type ClientPoint = Pick<MouseEvent, "clientX" | "clientY">;

/** Converts a point on the page to one in an SVG, along with how big the SVG is drawn. */
export function toDrawing(
	svg: SVGSVGElement,
	{ clientX, clientY }: ClientPoint,
) {
	const matrix = svg.getScreenCTM() ?? new DOMMatrix();
	const { x, y } = new DOMPoint(clientX, clientY).matrixTransform(
		matrix.inverse(),
	);

	return { scale: matrix.a, x, y };
}

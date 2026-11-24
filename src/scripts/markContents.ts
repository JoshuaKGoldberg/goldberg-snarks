/** Marks the links to whichever heading was most recently scrolled past. */
export function markContents() {
	const links = [
		...document.querySelectorAll<HTMLAnchorElement>("[data-contents] a"),
	];
	const headings = [...new Set(links.map(({ hash }) => hash.slice(1)))]
		.map((id) => document.getElementById(id))
		.filter((heading) => heading !== null);
	let isQueued = false;

	function update() {
		const { clientHeight, scrollHeight } = document.documentElement;
		const isAtEnd = scrollY + clientHeight >= scrollHeight - 2;
		const threshold = isAtEnd ? clientHeight : clientHeight * 0.3;
		const current = headings.findLast(
			(heading) => heading.getBoundingClientRect().top <= threshold,
		);

		isQueued = false;

		for (const link of links) {
			if (current && link.hash === `#${current.id}`) {
				link.setAttribute("aria-current", "location");
			} else {
				link.removeAttribute("aria-current");
			}
		}
	}

	function queue() {
		if (!isQueued) {
			isQueued = true;
			requestAnimationFrame(update);
		}
	}

	document.addEventListener("scroll", queue, { passive: true });
	addEventListener("resize", queue);
	queue();
}

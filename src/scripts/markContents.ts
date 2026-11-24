/** Marks the links to whichever heading was most recently scrolled past. */
export function markContents() {
	const contents = document.querySelector("[data-contents]");

	if (!contents) {
		return;
	}

	const sections = [...contents.querySelectorAll("a")].flatMap((link) => {
		const heading = document.getElementById(link.hash.slice(1));

		return heading ? [{ heading, link }] : [];
	});
	let isQueued = false;

	function findCurrent() {
		const { clientHeight, scrollHeight } = document.documentElement;

		// Headings near the end can't be scrolled to the top
		if (scrollY + clientHeight >= scrollHeight - 2) {
			const target = sections.find(
				({ heading }) =>
					location.hash === `#${heading.id}` &&
					heading.getBoundingClientRect().top >= 0,
			);

			return target ?? sections.at(-1);
		}

		return sections.findLast(
			({ heading }) =>
				heading.getBoundingClientRect().top <=
				parseFloat(getComputedStyle(heading).scrollMarginTop) + 1,
		);
	}

	function update() {
		const current = findCurrent();

		isQueued = false;

		for (const section of sections) {
			if (section === current) {
				section.link.setAttribute("aria-current", "location");
			} else {
				section.link.removeAttribute("aria-current");
			}
		}
	}

	function queue() {
		if (!isQueued && contents?.checkVisibility()) {
			isQueued = true;
			requestAnimationFrame(update);
		}
	}

	document.addEventListener("scroll", queue, { passive: true });
	addEventListener("hashchange", queue);
	addEventListener("resize", queue);
	queue();
}

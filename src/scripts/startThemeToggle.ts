/** Makes a button toggle between dark text on light paper and the other way around. */
export function startThemeToggle(button: HTMLElement) {
	const root = document.documentElement;

	function update() {
		button.setAttribute(
			"aria-pressed",
			(root.dataset.theme === "dark").toString(),
		);
		document
			.querySelector("meta[name=theme-color]")
			?.setAttribute("content", getComputedStyle(root).backgroundColor);
	}

	function restore() {
		try {
			if (localStorage.getItem("theme") === "dark") {
				root.dataset.theme = "dark";
			} else {
				delete root.dataset.theme;
			}
		} catch {
			// Browsers may block storage
		}

		update();
	}

	button.addEventListener("click", () => {
		const isDark = root.dataset.theme !== "dark";

		if (isDark) {
			root.dataset.theme = "dark";
		} else {
			delete root.dataset.theme;
		}

		try {
			localStorage.setItem("theme", isDark ? "dark" : "light");
		} catch {
			// The choice still applies to this page
		}

		update();
	});

	// It may have been changed on another page, or in another tab
	addEventListener("pageshow", restore);
	addEventListener("storage", restore);
	update();
}

/** Makes a button toggle the theme, starting from the system's preference. */
export function startThemeToggle(button: HTMLElement) {
	const colors = document.querySelectorAll("meta[name=theme-color]");
	const prefersDark = matchMedia("(prefers-color-scheme: dark)");
	const root = document.documentElement;

	function read() {
		try {
			return localStorage.getItem("theme");
		} catch {
			// Browsers may block storage
			return undefined;
		}
	}

	function update() {
		const { theme } = root.dataset;
		const isDark = theme ? theme === "dark" : prefersDark.matches;

		button.setAttribute("aria-pressed", isDark.toString());

		// Otherwise, they're already for whichever the system prefers
		if (theme) {
			for (const color of colors) {
				color.setAttribute("content", getComputedStyle(root).backgroundColor);
			}
		}
	}

	function restore() {
		const theme = read();

		if (theme === "dark" || theme === "light") {
			root.dataset.theme = theme;
		}

		update();
	}

	button.addEventListener("click", () => {
		const theme =
			button.getAttribute("aria-pressed") === "true" ? "light" : "dark";

		root.dataset.theme = theme;

		try {
			localStorage.setItem("theme", theme);
		} catch {
			// The choice still applies to this page
		}

		update();
	});

	// It may have been changed on another page, or in another tab
	addEventListener("pageshow", restore);
	addEventListener("storage", restore);
	prefersDark.addEventListener("change", update);
	update();
}

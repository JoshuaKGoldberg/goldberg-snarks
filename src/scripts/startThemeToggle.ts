import { query } from "./query.ts";

type Theme = "dark" | "light";

const key = "theme";

/**
 * Toggles between themes, starting from the system's preference.
 * Once one's been chosen, it can be cleared to go back to the system's.
 */
export function startThemeToggle(host: HTMLElement) {
	const clear = query(host, "[data-clear]", HTMLElement);
	const preference = matchMedia("(prefers-color-scheme: dark)");
	const root = document.documentElement;
	const toggle = query(host, "[data-toggle]", HTMLElement);

	function choose(theme: Theme | undefined) {
		// Storage throws when the browser is set to block site data
		try {
			if (theme) {
				localStorage.setItem(key, theme);
			} else {
				localStorage.removeItem(key);
			}
		} catch {
			// The choice still applies until the next page
		}

		update(theme);
	}

	function isDark() {
		return root.dataset.theme
			? root.dataset.theme === "dark"
			: preference.matches;
	}

	function restore() {
		try {
			const theme = localStorage.getItem(key);

			update(theme === "dark" || theme === "light" ? theme : undefined);
		} catch {
			update(undefined);
		}
	}

	function update(theme: Theme | undefined) {
		if (theme) {
			root.dataset.theme = theme;
		} else {
			delete root.dataset.theme;
		}

		clear.toggleAttribute("data-active", !!theme);
		toggle.setAttribute("aria-pressed", isDark().toString());
		document
			.querySelector("meta[name=theme-color]")
			?.setAttribute("content", getComputedStyle(root).backgroundColor);
	}

	toggle.addEventListener("click", () => {
		choose(isDark() ? "light" : "dark");
	});

	clear.addEventListener("click", () => {
		// It's about to be hidden, which would otherwise lose the focus it has
		toggle.focus({ focusVisible: clear.matches(":focus-visible") });
		choose(undefined);
	});

	// It may have been changed on another page, in another tab, or by the system
	addEventListener("pageshow", restore);
	addEventListener("storage", restore);
	preference.addEventListener("change", restore);
	restore();
}

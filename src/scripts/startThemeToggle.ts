import { query } from "./query.ts";

const themes = ["dark", "light"] as const;

type Theme = (typeof themes)[number];

const key = "theme";

/** Toggles between themes, starting from the system's preference until one's chosen. */
export function startThemeToggle(host: HTMLElement) {
	const clear = query(host, "[data-clear]", HTMLElement);
	const preference = matchMedia("(prefers-color-scheme: dark)");
	const root = document.documentElement;
	const toggle = query(host, "[data-toggle]", HTMLElement);

	function choose(theme: Theme | undefined) {
		update(theme);
		store(theme);
	}

	function isDark() {
		return root.dataset.theme
			? root.dataset.theme === "dark"
			: preference.matches;
	}

	function restore() {
		update(getStored());
	}

	function update(theme: Theme | undefined) {
		if (theme) {
			root.dataset.theme = theme;
		} else {
			delete root.dataset.theme;
		}

		toggle.setAttribute("aria-pressed", isDark().toString());

		for (const name of themes) {
			const meta = query(
				document,
				`meta[name=theme-color][data-scheme=${name}]`,
				HTMLMetaElement,
			);

			meta.media = theme
				? theme === name
					? "all"
					: "not all"
				: `(prefers-color-scheme: ${name})`;
		}
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

function getStored() {
	// Storage throws when the browser is set to block site data
	try {
		const stored = localStorage.getItem(key);

		return themes.find((theme) => theme === stored);
	} catch {
		return undefined;
	}
}

function store(theme: Theme | undefined) {
	try {
		if (theme) {
			localStorage.setItem(key, theme);
		} else {
			localStorage.removeItem(key);
		}
	} catch {
		return;
	}
}

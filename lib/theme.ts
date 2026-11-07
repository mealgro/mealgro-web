import { ref } from "vue";

/** Day mode, night mode, or follow the device (the default), for the signed-in
 *  portal and affiliate areas. Same model as the admin console: the sun/moon
 *  toggle sets `data-theme` on `<html>` and remembers the choice in this
 *  browser (`mg.theme`); until someone picks, `data-theme` is left off so
 *  `prefers-color-scheme` decides, live. */
export type ThemePreference = "system" | "light" | "dark";
export type ThemeName = "light" | "dark";

export const THEME_KEY = "mg.theme";

/** Runs in the page `<head>` before the first paint, so a page never flashes
 *  the wrong theme. Keep it dependency-free. */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

function stored(): ThemePreference {
	try {
		const v = localStorage.getItem(THEME_KEY);
		return v === "light" || v === "dark" ? v : "system";
	} catch {
		return "system";
	}
}

const mq = () =>
	typeof window !== "undefined" ? window.matchMedia?.("(prefers-color-scheme: dark)") : undefined;

/** What was picked. */
export const themePreference = ref<ThemePreference>("system");
/** The theme in effect right now. */
export const theme = ref<ThemeName>("light");

function apply(pref: ThemePreference) {
	if (typeof document === "undefined") return;
	themePreference.value = pref;
	if (pref === "system") document.documentElement.removeAttribute("data-theme");
	else document.documentElement.setAttribute("data-theme", pref);
	theme.value = pref === "system" ? (mq()?.matches ? "dark" : "light") : pref;
}

let listening = false;
/** Call once in the browser, before the shell renders. */
export function initTheme() {
	apply(stored());
	if (listening) return;
	listening = true;
	mq()?.addEventListener("change", () => {
		if (themePreference.value === "system") apply("system");
	});
}

export function setThemePreference(pref: ThemePreference) {
	try {
		if (pref === "system") localStorage.removeItem(THEME_KEY);
		else localStorage.setItem(THEME_KEY, pref);
	} catch {
		// Storage can be blocked; the choice then lasts until reload.
	}
	apply(pref);
}

export const toggleTheme = () => setThemePreference(theme.value === "dark" ? "light" : "dark");

// Applied as soon as anything imports this, before the first paint of the app.
if (typeof document !== "undefined") apply(stored());

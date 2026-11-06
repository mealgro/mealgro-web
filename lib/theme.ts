import { ref } from "vue";

/** Day mode, night mode, or follow the device (the default), for the signed-in
 *  portal and affiliate areas. Remembered in this browser; applied as
 *  `data-theme` on `<html>`, left off for "system" so `prefers-color-scheme`
 *  decides, live. */
export type ThemePreference = "system" | "light" | "dark";

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

export const themePreference = ref<ThemePreference>("system");

function apply(pref: ThemePreference) {
	if (typeof document === "undefined") return;
	if (pref === "system") document.documentElement.removeAttribute("data-theme");
	else document.documentElement.setAttribute("data-theme", pref);
}

export function initTheme() {
	themePreference.value = stored();
	apply(themePreference.value);
}

// Applied as soon as anything imports this, before the first paint of the app.
if (typeof document !== "undefined") apply(stored());

export function setThemePreference(pref: ThemePreference) {
	themePreference.value = pref;
	try {
		if (pref === "system") localStorage.removeItem(THEME_KEY);
		else localStorage.setItem(THEME_KEY, pref);
	} catch {
		// Storage can be blocked; the choice then lasts until reload.
	}
	apply(pref);
}

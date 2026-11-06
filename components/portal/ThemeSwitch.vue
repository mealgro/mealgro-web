<script setup lang="ts">
// Day / Night / System, in the sidebar of the portal and the affiliate area.
import { onMounted } from "vue";
import { initTheme, setThemePreference, themePreference, type ThemePreference } from "../../lib/theme";

const OPTIONS: { value: ThemePreference; label: string; path: string }[] = [
	{ value: "light", label: "Day", path: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" },
	{ value: "dark", label: "Night", path: "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" },
	{ value: "system", label: "Auto", path: "M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" },
];
onMounted(initTheme);
</script>

<template>
	<div class="theme-switch" role="group" aria-label="Theme">
		<button
			v-for="o in OPTIONS"
			:key="o.value"
			type="button"
			:aria-pressed="themePreference === o.value"
			:title="o.value === 'system' ? 'Follow this device' : `${o.label} mode`"
			@click="setThemePreference(o.value)"
		>
			<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="o.path" /></svg>
			{{ o.label }}
		</button>
	</div>
</template>

<style scoped>
.theme-switch {
	display: flex;
	gap: 2px;
	padding: 3px;
	border-radius: 999px;
	background: rgb(255 255 255 / 0.1);
}
.theme-switch button {
	flex: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 5px;
	height: 30px;
	padding: 0 6px;
	border: 0;
	border-radius: 999px;
	background: transparent;
	color: rgb(255 255 255 / 0.75);
	font: inherit;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
}
.theme-switch button[aria-pressed="true"] {
	background: rgb(255 255 255 / 0.2);
	color: #ffffff;
}
.theme-switch button:focus-visible {
	outline: 2px solid #ffe100;
	outline-offset: 2px;
}
</style>

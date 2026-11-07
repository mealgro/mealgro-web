<script setup lang="ts">
// The sun/moon toggle, as in the admin console's top bar. Follows the device
// until someone picks (lib/theme.ts); the pick is remembered in this browser.
import { onMounted } from "vue";
import { initTheme, theme, toggleTheme } from "../../lib/theme";

onMounted(initTheme);
</script>

<template>
	<button
		class="theme-toggle"
		type="button"
		:aria-label="theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'"
		:title="theme === 'dark' ? 'Day mode' : 'Night mode'"
		@click="toggleTheme"
	>
		<svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
		<svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
	</button>
</template>

<style scoped>
.theme-toggle {
	display: inline-grid;
	place-items: center;
	width: 44px;
	height: 44px;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: inherit;
	cursor: pointer;
	transition:
		transform 0.12s var(--ease),
		background 0.12s;
}
.theme-toggle:hover {
	background: color-mix(in srgb, currentColor 10%, transparent);
}
.theme-toggle:active {
	transform: scale(0.94);
}
</style>

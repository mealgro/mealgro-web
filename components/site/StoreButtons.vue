<script setup lang="ts">
// Download buttons for an app. A store with no listing yet (null in
// lib/site/links.ts) is left out rather than linked somewhere wrong.
import type { StoreLinks } from "../../lib/site/links";

defineProps<{ links: StoreLinks; appName: string }>();
</script>

<template>
	<div class="s-actions">
		<a v-if="links.android" class="s-btn s-btn--primary" :href="links.android" rel="noopener" target="_blank">
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" /></svg>
			Get {{ appName }} for Android
			<span class="sr-only">(opens Google Play in a new tab)</span>
		</a>
		<a v-if="links.ios" class="s-btn s-btn--outline" :href="links.ios" rel="noopener" target="_blank">
			<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" /></svg>
			Get {{ appName }} for iPhone
			<span class="sr-only">(opens the App Store in a new tab)</span>
		</a>
	</div>
</template>

<style scoped>
.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	overflow: hidden;
	clip: rect(0 0 0 0);
	white-space: nowrap;
}
</style>

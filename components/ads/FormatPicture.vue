<script setup lang="ts">
// A little phone showing where each format appears: the feed ad fills the
// screen; the banner is the strip at the top of Explore.
import type { AdFormat } from "../../lib/ads/types";

defineProps<{ format: AdFormat }>();
</script>

<template>
	<svg class="pic" viewBox="0 0 80 140" aria-hidden="true">
		<rect x="2" y="2" width="76" height="136" rx="14" class="bezel" />
		<rect x="7" y="7" width="66" height="126" rx="10" class="screen" />
		<template v-if="format === 'feed'">
			<rect x="7" y="7" width="66" height="126" rx="10" class="ad" />
			<rect x="13" y="104" width="30" height="4" rx="2" class="text" />
			<rect x="13" y="112" width="50" height="5" rx="2.5" class="text" />
			<rect x="13" y="120" width="40" height="5" rx="2.5" class="text" />
		</template>
		<template v-else>
			<rect x="13" y="16" width="34" height="5" rx="2.5" class="line" />
			<rect x="7" y="28" width="66" height="19" rx="3" class="ad" />
			<rect x="13" y="56" width="26" height="26" rx="5" class="tile" />
			<rect x="41" y="56" width="26" height="26" rx="5" class="tile" />
			<rect x="13" y="86" width="26" height="26" rx="5" class="tile" />
			<rect x="41" y="86" width="26" height="26" rx="5" class="tile" />
		</template>
	</svg>
</template>

<style scoped>
.pic {
	width: 64px;
	height: auto;
	flex: none;
}
.bezel {
	fill: var(--night);
}
.screen {
	fill: var(--surface);
}
.ad {
	fill: var(--cat-1);
}
.text {
	fill: var(--on-1);
	opacity: 0.85;
}
.line,
.tile {
	fill: color-mix(in srgb, var(--ink) 14%, var(--surface));
}
</style>

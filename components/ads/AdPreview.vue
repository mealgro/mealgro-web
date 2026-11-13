<script setup lang="ts">
// The ad as a customer sees it. Feed: a full-screen 9:16 page with
// "Sponsored · {business}" and the description, and no side buttons (the app
// draws none on an ad). Banner: the 120 pt strip at three phone widths, cut
// to the width from the centre like the app does, so cropping problems show.
import type { AdFormat, MediaKind } from "../../lib/ads/types";

withDefaults(
	defineProps<{
		format: AdFormat;
		/** An image or video address (the CDN, or a local file being uploaded). */
		mediaUrl?: string | null;
		mediaKind?: MediaKind;
		poster?: string | null;
		description?: string;
		businessName: string;
	}>(),
	{ mediaUrl: null, mediaKind: "image", poster: null, description: "" },
);

const WIDTHS = [360, 390, 430];
</script>

<template>
	<div v-if="format === 'feed'" class="feed" role="img" :aria-label="`Preview of the feed ad: Sponsored · ${businessName}. ${description}`">
		<div class="screen">
			<video
				v-if="mediaUrl && mediaKind === 'video'"
				class="media"
				:src="mediaUrl"
				:poster="poster ?? undefined"
				muted
				autoplay
				loop
				playsinline
			/>
			<img v-else-if="mediaUrl" class="media" :src="mediaUrl" alt="" />
			<div v-else class="empty">
				<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 16l5-5 4 4 3-3 6 6M3 5h18v14H3zM15 9h.01" /></svg>
				<span>Your image or video</span>
			</div>
			<div class="shade" aria-hidden="true" />
			<div class="copy">
				<p class="sponsor">Sponsored · {{ businessName || "Your business" }}</p>
				<p class="desc">{{ description || "Your description shows here." }}</p>
			</div>
			<span v-if="mediaKind === 'video'" class="sound" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6" /></svg>
			</span>
		</div>
	</div>

	<div v-else class="banners">
		<figure v-for="w in WIDTHS" :key="w" class="banner-fig">
			<div class="banner" :style="{ width: `${w}px`, aspectRatio: `${w} / 120` }">
				<img v-if="mediaUrl" :src="mediaUrl" alt="" />
				<div v-else class="empty empty--row">
					<span>Your 1290×360 image</span>
				</div>
				<span class="tag">Ad</span>
			</div>
			<figcaption>On a phone {{ w }} pt wide</figcaption>
		</figure>
	</div>
</template>

<style scoped>
/* ── Feed: a phone showing the full-screen page ── */
.feed {
	width: min(270px, 100%);
	margin: 0 auto;
	padding: 10px;
	border-radius: 2.25rem;
	background: var(--night);
}
.screen {
	position: relative;
	overflow: hidden;
	aspect-ratio: 9 / 16;
	border-radius: 1.6rem;
	background: color-mix(in srgb, var(--on-night) 10%, var(--night));
	color: var(--on-night);
}
.media {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.empty {
	position: absolute;
	inset: 0;
	display: grid;
	place-content: center;
	justify-items: center;
	gap: 8px;
	font-size: 13px;
	color: color-mix(in srgb, var(--on-night) 70%, transparent);
}
.empty--row {
	grid-auto-flow: column;
}
.shade {
	position: absolute;
	inset: 45% 0 0;
	background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--night) 82%, transparent));
}
.copy {
	position: absolute;
	left: 14px;
	right: 14px;
	bottom: 18px;
	display: flex;
	flex-direction: column;
	gap: 4px;
}
.sponsor {
	font-size: 12px;
	font-weight: 700;
	opacity: 0.9;
}
.desc {
	font-size: 14px;
	font-weight: 600;
	line-height: 1.35;
	overflow-wrap: anywhere;
}
.sound {
	position: absolute;
	top: 14px;
	right: 14px;
	display: grid;
	place-items: center;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background: color-mix(in srgb, var(--night) 55%, transparent);
}

/* ── Banners: the strip at three widths ── */
.banners {
	display: flex;
	flex-direction: column;
	gap: 16px;
	min-width: 0;
}
.banner-fig {
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 6px;
	min-width: 0;
}
.banner {
	position: relative;
	max-width: 100%;
	overflow: hidden;
	border-radius: 12px;
	background: color-mix(in srgb, var(--on-night) 10%, var(--night));
	color: var(--on-night);
}
.banner img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
}
.tag {
	position: absolute;
	top: 6px;
	right: 6px;
	padding: 1px 6px;
	border-radius: 4px;
	font-size: 10px;
	font-weight: 700;
	background: color-mix(in srgb, var(--night) 60%, transparent);
	color: var(--on-night);
}
figcaption {
	font-size: 12px;
	color: var(--muted);
}
</style>

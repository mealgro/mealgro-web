<script setup lang="ts">
// The home page's opening: the app's feed, told one dish at a time. Each slide
// is a screen tall and snaps into place, like swiping in the app.
//
// From 900px: a phone stays fixed beside the copy while the page scrolls, and
// each slide's screen slides up inside it. The trick is a layer between the
// screens and the copy: a phone-shaped window whose huge box-shadow paints the
// stage colour everywhere else, so a screen only shows through the phone.
// Under 900px: every slide is a full-screen clip with the copy over it, as in
// the app itself.
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import FeedScreen from "./FeedScreen.vue";
import { CLIPS, videosPaused, type Clip } from "../../lib/site/media";

export type Slide = {
	clip: Clip;
	/** The first slide is the page's h1; the rest are h2s. */
	title: string;
	text: string;
	/** Glow around the phone: a category colour, 1–4. */
	tone: 1 | 2 | 3 | 4;
};

const slides: Slide[] = [
	{
		clip: CLIPS.jollof,
		title: "Order what you just watched.",
		text: "Mealgro is a feed of short food videos from kitchens near you. Swipe up for the next dish, and tap Add to cart when one looks right.",
		tone: 1,
	},
	{
		clip: CLIPS.suya,
		title: "Swipe up for the next dish",
		text: "Every video is a plate from a kitchen that delivers to you, filmed by the people who cook it. You see the food before you pay for it.",
		tone: 3,
	},
	{
		clip: CLIPS.seafood,
		title: "Tap the store for the whole menu",
		text: "Open the store from its video to see everything else it makes, when it's open and how long delivery takes to you.",
		tone: 2,
	},
	{
		clip: CLIPS.spaghetti,
		title: "Add to cart without leaving the video",
		text: "The price is on the button. Add a dish, keep scrolling, and check out when you're ready.",
		tone: 4,
	},
	{
		clip: CLIPS.beans,
		title: "Then follow it to your door",
		text: "The kitchen starts cooking, a Mealgro rider picks it up, and you watch them come to you on the map.",
		tone: 1,
	},
];

const active = ref(0);
const els = ref<HTMLElement[]>([]);
let io: IntersectionObserver | null = null;

onMounted(() => {
	io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) active.value = Number((e.target as HTMLElement).dataset.i);
			}
		},
		{ threshold: 0.5 },
	);
	for (const el of els.value) io.observe(el);
});
onBeforeUnmount(() => io?.disconnect());

const glow = computed(() => `var(--cat-${slides[active.value].tone})`);
</script>

<template>
	<section class="feed s-stage" aria-label="How the Mealgro feed works" :style="{ '--glow': glow }">
		<!-- The fixed phone (desktop) and the pause control (all sizes). -->
		<div class="frame">
			<div class="s-wrap grid">
				<div />
				<div class="window" aria-hidden="true">
					<div class="bars">
						<span v-for="(s, i) in slides" :key="i" :class="{ on: i === active, done: i < active }" />
					</div>
				</div>
			</div>
			<button
				class="pause"
				type="button"
				:aria-pressed="videosPaused"
				@click="videosPaused = !videosPaused"
			>
				<svg v-if="videosPaused" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5L7 4.5Z" /></svg>
				<svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" /></svg>
				{{ videosPaused ? "Play videos" : "Pause videos" }}
			</button>
		</div>

		<article
			v-for="(s, i) in slides"
			:key="s.clip.id"
			ref="els"
			class="slide"
			:class="{ first: i === 0 }"
			:data-i="i"
		>
			<div class="s-wrap grid">
				<div class="copy">
					<h1 v-if="i === 0" class="s-h1 rise" style="--i: 0">{{ s.title }}</h1>
					<h2 v-else class="s-h2">{{ s.title }}</h2>
					<p class="s-lead s-muted" :class="{ rise: i === 0 }" style="--i: 1">{{ s.text }}</p>
					<div v-if="i === 0" class="s-actions rise" style="--i: 2">
						<a class="s-btn s-btn--ink" href="#get-app">Get the app</a>
						<a class="s-btn s-btn--outline" href="#how">How ordering works</a>
					</div>
					<p v-if="i === 0" class="hint" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
						Scroll to swipe
					</p>
				</div>
				<div class="pane">
					<FeedScreen :clip="s.clip" :eager="i === 0" />
				</div>
			</div>
		</article>
	</section>
</template>

<style scoped>
.feed {
	--ph: min(78svh, 760px);
	--bz: 11px;
	--pw: calc(var(--ph) * 0.4615);
	--radius: calc(var(--pw) * 0.15);
	position: relative;
	isolation: isolate;
	overflow: clip;
}
.grid {
	display: grid;
	grid-template-columns: minmax(0, 1fr) var(--pw);
	gap: clamp(40px, 7vw, 120px);
	align-items: center;
	height: 100%;
}

/* ── The fixed phone ── */
.frame {
	position: sticky;
	top: 0;
	height: 100svh;
	margin-bottom: -100svh;
	z-index: 2;
	pointer-events: none;
}
.window {
	justify-self: center;
	position: relative;
	width: var(--pw);
	height: var(--ph);
	border: var(--bz) solid color-mix(in srgb, var(--stage) 84%, var(--on-stage));
	border-radius: var(--radius);
	box-shadow:
		0 0 140px 10px color-mix(in srgb, var(--glow) 38%, transparent),
		0 0 0 max(200vw, 200vh) var(--stage);
	transition: box-shadow 0.8s var(--ease);
	animation: phone-in 0.9s var(--ease) both;
}
.window::before {
	/* The camera notch */
	content: "";
	position: absolute;
	top: 10px;
	left: 50%;
	width: 30%;
	height: 22px;
	border-radius: 999px;
	background: var(--stage);
	transform: translateX(-50%);
}
.bars {
	position: absolute;
	top: 40px;
	left: 14px;
	right: 14px;
	display: flex;
	gap: 4px;
}
.bars span {
	flex: 1;
	height: 3px;
	border-radius: 999px;
	background: color-mix(in srgb, var(--on-stage) 30%, transparent);
	overflow: hidden;
	position: relative;
}
.bars span::after {
	content: "";
	position: absolute;
	inset: 0;
	background: var(--on-stage);
	transform: scaleX(0);
	transform-origin: left;
	transition: transform 0.5s var(--ease);
}
.bars span.done::after,
.bars span.on::after {
	transform: scaleX(1);
}
.pause {
	pointer-events: auto;
	position: absolute;
	right: var(--gutter);
	bottom: 24px;
	display: inline-flex;
	align-items: center;
	gap: 8px;
	min-height: 44px;
	padding: 0 16px;
	border-radius: 999px;
	border: 1px solid color-mix(in srgb, var(--on-stage) 26%, transparent);
	background: color-mix(in srgb, var(--stage) 60%, transparent);
	backdrop-filter: blur(10px);
	color: var(--on-stage);
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
}

/* ── Slides ── */
.slide {
	position: relative;
	height: 100svh;
	scroll-snap-align: start;
}
.copy {
	position: relative;
	z-index: 3;
	display: grid;
	gap: 22px;
	justify-items: start;
	max-width: 640px;
}
.copy .s-h2 {
	max-width: 13ch;
}
/* As tall as the slide, so one dish's screen meets the next with no gap as
   they pass through the phone; the overlay is inset to the phone's part. */
.pane {
	justify-self: center;
	align-self: stretch;
	position: relative;
	z-index: 1;
	width: calc(var(--pw) - 2 * var(--bz));
	overflow: hidden;
}
.pane :deep(.screen) {
	--screen-top: calc((100svh - var(--ph)) / 2 + var(--bz) + 46px);
	--screen-bottom: calc((100svh - var(--ph)) / 2 + var(--bz) + 14px);
}
.pane :deep(.scrim) {
	top: calc((100svh - var(--ph)) / 2);
	bottom: calc((100svh - var(--ph)) / 2);
}
.hint {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	margin-top: 12px !important;
	font-size: 14px;
	font-weight: 600;
	color: color-mix(in srgb, var(--on-stage) 70%, var(--stage));
	animation: nudge 2.4s var(--ease) 1.6s 2 both;
}

/* The one orchestrated moment: the opening copy rises in, the phone settles. */
.rise {
	animation: rise 0.8s var(--ease) both;
	animation-delay: calc(0.12s + var(--i, 0) * 0.1s);
}
@keyframes rise {
	from {
		opacity: 0;
		transform: translateY(28px);
	}
}
@keyframes phone-in {
	from {
		opacity: 0;
		transform: translateY(40px) scale(0.96);
	}
}
@keyframes nudge {
	50% {
		transform: translateY(-6px);
	}
}

/* ── Phones and small tablets: full-screen clips, like the app ── */
@media (max-width: 899px) {
	.window {
		display: none;
	}
	.frame .grid {
		display: none;
	}
	.pause {
		top: 92px;
		bottom: auto;
		right: 16px;
		min-height: 40px;
		padding: 0 14px;
		font-size: 13px;
	}
	.slide .grid {
		display: block;
		padding: 0;
		max-width: none;
	}
	.pane {
		position: absolute;
		inset: 0;
		width: auto;
		height: auto;
		justify-self: stretch;
	}
	.pane :deep(.screen) {
		--screen-bottom: 22px;
	}
	.pane :deep(.top) {
		display: none;
	}
	.pane :deep(.scrim) {
		top: 0;
		bottom: 0;
		background:
			linear-gradient(to bottom, color-mix(in srgb, var(--stage) 88%, transparent), color-mix(in srgb, var(--stage) 50%, transparent) 38%, transparent 56%),
			linear-gradient(to top, rgb(0 0 0 / 0.8), rgb(0 0 0 / 0.3) 30%, transparent 46%);
	}
	.copy {
		position: absolute;
		z-index: 3;
		top: 0;
		left: 0;
		right: 0;
		padding: 148px var(--gutter) 0;
		gap: 14px;
		max-width: none;
	}
	.copy .s-h1 {
		font-size: clamp(38px, 11vw, 64px);
	}
	.copy .s-h2 {
		font-size: clamp(30px, 8.6vw, 48px);
		max-width: 14ch;
	}
	.copy .s-lead {
		font-size: 16px;
		max-width: 36ch;
		color: color-mix(in srgb, var(--on-stage) 86%, var(--stage));
	}
	.copy .s-actions .s-btn {
		min-height: 46px;
		padding: 0 18px;
		font-size: 15px;
	}
	.hint {
		display: none;
	}
}
@media (max-width: 899px) and (max-height: 700px) {
	.copy {
		padding-top: 96px;
	}
	.copy .s-lead {
		display: none;
	}
	.first .copy .s-lead {
		display: block;
		font-size: 15px;
	}
}
</style>

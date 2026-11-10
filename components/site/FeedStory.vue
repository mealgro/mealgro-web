<script setup lang="ts">
// The home page's opening: the real customer app, recorded on a phone, told
// one step at a time. Each slide is a screen tall and snaps into place.
//
// From 900px: one phone stays fixed beside the copy while the page scrolls;
// when a new slide takes over, its recording slides up into the phone like the
// next video in the feed. Under 900px: each slide holds its own phone under the
// copy. Recordings come from mealgro/marketing/films/capture (see brand.md).
import { onBeforeUnmount, onMounted, ref } from "vue";
import FeedClip from "./FeedClip.vue";
import { videosPaused } from "../../lib/site/media";

type Slide = {
	/** A recording in public/media/feed. */
	video: string;
	/** The first slide is the page's h1; the rest are h2s. */
	title: string;
	text: string;
	/** Glow around the phone: a category colour, 1–4. */
	tone: 1 | 2 | 3 | 4;
};

const slides: Slide[] = [
	{
		video: "app-feed",
		title: "Order what you just watched.",
		text: "Mealgro is a feed of short food videos from kitchens near you. Swipe up for the next dish, and tap Add to cart when one looks right.",
		tone: 1,
	},
	{
		video: "app-swipe",
		title: "Swipe up for the next dish",
		text: "Every video is a plate from a kitchen that delivers to you, filmed by the people who cook it. You see the food before you pay for it.",
		tone: 3,
	},
	{
		video: "app-store",
		title: "Tap the store for the whole menu",
		text: "Open the store from its video to see everything else it makes, its delivery fee and how long it takes to reach you.",
		tone: 2,
	},
	{
		video: "app-item",
		title: "Add to cart in a tap",
		text: "The price is on the button. Pick how many, add it, and keep scrolling for the rest of your order.",
		tone: 4,
	},
	{
		video: "app-checkout",
		title: "Check out, and it's on its way",
		text: "Confirm your address and pay. The kitchen starts cooking and a Mealgro rider brings it to your door.",
		tone: 1,
	},
];

const active = ref(0);
/** Which way the phone swipes: up when scrolling down the page. */
const dir = ref<"up" | "down">("up");
const els = ref<HTMLElement[]>([]);
let io: IntersectionObserver | null = null;

onMounted(() => {
	io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				const i = Number((e.target as HTMLElement).dataset.i);
				if (i === active.value) continue;
				dir.value = i > active.value ? "up" : "down";
				active.value = i;
			}
		},
		{ threshold: 0.5 },
	);
	for (const el of els.value) io.observe(el);
});
onBeforeUnmount(() => io?.disconnect());
</script>

<template>
	<section class="feed s-stage" aria-label="How ordering on Mealgro works" :style="{ '--glow': `var(--cat-${slides[active].tone})` }">
		<!-- The fixed phone (from 900px) and the pause control (all sizes). -->
		<div class="frame">
			<div class="s-wrap grid">
				<div />
				<div class="phone" aria-hidden="true">
					<div class="screen">
						<Transition :name="`swipe-${dir}`">
							<div :key="active" class="layer">
								<FeedClip :id="slides[active].video" :eager="active === 0" />
							</div>
						</Transition>
					</div>
					<div class="bars">
						<span v-for="(s, i) in slides" :key="i" :class="{ on: i <= active }" />
					</div>
				</div>
			</div>
			<button class="pause" type="button" :aria-pressed="videosPaused" @click="videosPaused = !videosPaused">
				<svg v-if="videosPaused" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5L7 4.5Z" /></svg>
				<svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" /></svg>
				{{ videosPaused ? "Play videos" : "Pause videos" }}
			</button>
		</div>

		<article
			v-for="(s, i) in slides"
			:key="s.video"
			ref="els"
			class="slide"
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
				<!-- Phones under 900px only (hidden, so never loaded, on desktop). -->
				<div class="m-phone s-phone s-phone--rec" aria-hidden="true">
					<div class="s-phone-screen">
						<FeedClip :id="s.video" :eager="i === 0" />
					</div>
				</div>
			</div>
		</article>
	</section>
</template>

<style scoped>
.feed {
	--ph: min(80svh, 780px);
	--bz: 11px;
	--pw: calc(var(--ph) * 0.4615);
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
.phone {
	justify-self: center;
	position: relative;
	width: var(--pw);
	height: var(--ph);
	padding: var(--bz);
	border-radius: calc(var(--pw) * 0.15);
	background: color-mix(in srgb, var(--stage) 84%, var(--on-stage));
	box-shadow:
		inset 0 0 0 1px color-mix(in srgb, var(--on-stage) 20%, transparent),
		0 0 140px 10px color-mix(in srgb, var(--glow) 36%, transparent);
	transition: box-shadow 0.8s var(--ease);
	animation: phone-in 0.9s var(--ease) both;
}
.screen {
	position: relative;
	width: 100%;
	height: 100%;
	border-radius: calc(var(--pw) * 0.15 - var(--bz));
	overflow: hidden;
	background: var(--stage);
	isolation: isolate;
}
.layer {
	position: absolute;
	inset: 0;
}
/* The next recording slides in like the next video in the feed. */
.swipe-up-enter-active,
.swipe-up-leave-active,
.swipe-down-enter-active,
.swipe-down-leave-active {
	transition: transform 0.6s var(--ease);
}
.swipe-up-enter-from,
.swipe-down-leave-to {
	transform: translateY(100%);
}
.swipe-up-leave-to,
.swipe-down-enter-from {
	transform: translateY(-100%);
}
.bars {
	position: absolute;
	left: 50%;
	bottom: -26px;
	display: flex;
	gap: 6px;
	transform: translateX(-50%);
}
.bars span {
	width: 22px;
	height: 4px;
	border-radius: 999px;
	background: color-mix(in srgb, var(--on-stage) 22%, transparent);
	transition: background 0.4s var(--ease);
}
.bars span.on {
	background: var(--on-stage);
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
.m-phone {
	display: none;
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

/* ── Phones and small tablets: copy, then the phone, one slide per screen ── */
@media (max-width: 899px) {
	.frame .grid {
		display: none;
	}
	.pause {
		top: 88px;
		bottom: auto;
		right: 16px;
		min-height: 40px;
		padding: 0 14px;
		font-size: 13px;
	}
	.slide {
		height: auto;
		min-height: 100svh;
	}
	.slide .grid {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 24px;
		padding-top: 136px;
		padding-bottom: 28px;
		min-height: 100svh;
	}
	.copy {
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
		max-width: 38ch;
	}
	.copy .s-actions .s-btn {
		min-height: 46px;
		padding: 0 18px;
		font-size: 15px;
	}
	.hint {
		display: none;
	}
	.m-phone {
		display: block;
		align-self: center;
		/* Fits under the copy on most phones; never tinier than 180px. */
		--pw: clamp(180px, min(66vw, calc((100svh - 380px) * 0.4615)), 250px);
		margin-top: auto;
		box-shadow:
			inset 0 0 0 1px color-mix(in srgb, var(--on-stage) 20%, transparent),
			0 0 90px 0 color-mix(in srgb, var(--cat-1) 30%, transparent);
	}
}
</style>

<script setup lang="ts">
// The home page's opening: the Mealgro app, rebuilt in the page
// (components/site/phone/AppPhone.vue) and playing real dish clips, told one
// step at a time. Each slide is a screen tall and snaps into place; the phone
// stays put while the slides change its scene. Desktop: phone beside the copy.
// Under 900px: the phone sits in the lower part of the screen, copy above it.
import { onBeforeUnmount, onMounted, ref } from "vue";
import AppPhone, { type Scene } from "./phone/AppPhone.vue";
import { videosPaused } from "../../lib/site/media";

type Slide = {
	scene: Scene;
	/** The first slide is the page's h1; the rest are h2s. */
	title: string;
	text: string;
	/** Glow around the phone: a category colour, 1–4. */
	tone: 1 | 2 | 3 | 4;
};

const slides: Slide[] = [
	{
		scene: "feed",
		title: "Order what you just watched.",
		text: "Think TikTok for Food: short videos from kitchens near you. Swipe up for the next one, and tap Add to cart when a dish looks right.",
		tone: 1,
	},
	{
		scene: "swipe",
		title: "Up for the next kitchen, sideways for more",
		text: "Swipe left and right through everything the same kitchen has filmed. Every video is a dish you can order, cooked by the people who filmed it.",
		tone: 3,
	},
	{
		scene: "save",
		title: "Save it, or see what people said",
		text: "Tap the bookmark to keep a dish for later. Tap the comments to read reviews from people who ordered it.",
		tone: 2,
	},
	{
		scene: "dish",
		title: "Pick your protein, size and extras",
		text: "Every dish opens with its options: what's required, what's extra, and the price on the button as you choose.",
		tone: 4,
	},
	{
		scene: "cart",
		title: "Check out, and it's on its way",
		text: "Check your cart and pay. The kitchen starts cooking and a Mealgro rider brings it to your door.",
		tone: 1,
	},
];

const active = ref(0);
const els = ref<HTMLElement[]>([]);
let io: IntersectionObserver | null = null;

onMounted(() => {
	io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) if (e.isIntersecting) active.value = Number((e.target as HTMLElement).dataset.i);
		},
		{ threshold: 0.5 },
	);
	for (const el of els.value) io.observe(el);
});
onBeforeUnmount(() => io?.disconnect());
</script>

<template>
	<section class="feed s-stage" aria-label="How ordering on Mealgro works" :style="{ '--glow': `var(--cat-${slides[active].tone})` }">
		<!-- The phone and the pause control stay put while the slides scroll. -->
		<div class="frame">
			<div class="s-wrap grid">
				<div />
				<div class="phone-col">
					<div class="phone" aria-hidden="true">
						<div class="screen">
							<AppPhone :scene="slides[active].scene" />
						</div>
					</div>
					<div class="bars" aria-hidden="true">
						<span v-for="(s, i) in slides" :key="i" :class="{ on: i <= active }" />
					</div>
					<p class="try" aria-hidden="true">Swipe or tap the phone to try it</p>
				</div>
			</div>
			<button class="pause" type="button" :aria-pressed="videosPaused" @click="videosPaused = !videosPaused">
				<svg v-if="videosPaused" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5L7 4.5Z" /></svg>
				<svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" /></svg>
				{{ videosPaused ? "Play videos" : "Pause videos" }}
			</button>
		</div>

		<article v-for="(s, i) in slides" :key="s.scene" ref="els" class="slide" :data-i="i">
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
						Scroll to see how it works
					</p>
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

/* ── The phone ── */
.frame {
	position: sticky;
	top: 0;
	height: 100svh;
	margin-bottom: -100svh;
	z-index: 2;
	pointer-events: none;
}
.phone-col {
	justify-self: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 14px;
	padding-top: 40px;
}
.phone {
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
	pointer-events: auto;
}
.screen {
	position: relative;
	width: 100%;
	height: 100%;
	border-radius: calc(var(--pw) * 0.15 - var(--bz));
	overflow: hidden;
	background: #000;
	isolation: isolate;
}
.bars {
	display: flex;
	gap: 6px;
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
.try {
	margin: 0;
	font-size: 13px;
	font-weight: 600;
	color: color-mix(in srgb, var(--on-stage) 62%, var(--stage));
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
	max-width: 14ch;
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

/* ── Phones and small tablets: copy at the top, the phone below it ── */
@media (max-width: 899px) {
	.feed {
		--ph: min(50svh, 540px);
		--bz: 8px;
	}
	.frame .grid {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 18px;
	}
	.frame .grid > div:first-child {
		display: none;
	}
	.phone-col {
		padding-top: 0;
		gap: 10px;
	}
	.try {
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
	.slide .grid {
		display: block;
		padding-top: 136px;
	}
	.copy {
		z-index: 1;
		gap: 12px;
		max-width: none;
	}
	.copy .s-h1 {
		font-size: clamp(34px, 9.6vw, 56px);
	}
	.copy .s-h2 {
		font-size: clamp(26px, 7.4vw, 44px);
		max-width: 16ch;
	}
	.copy .s-lead {
		font-size: 15px;
		line-height: 1.45;
		max-width: 40ch;
	}
	.copy .s-actions .s-btn {
		min-height: 44px;
		padding: 0 18px;
		font-size: 15px;
	}
	.hint {
		display: none;
	}
}
@media (max-width: 899px) and (max-height: 740px) {
	.feed {
		--ph: 48svh;
	}
	.slide .grid {
		padding-top: 100px;
	}
	.copy .s-lead {
		font-size: 14px;
	}
}
</style>

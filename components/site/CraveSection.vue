<script setup lang="ts">
// "Find what you crave", from the old home page: three category cards with
// the food standing out of the card, each with Explore. In the v2 palette
// (sun, rose, mint, each with its shape). On phones they scroll sideways.
const cards = [
	{ light: "Quick", bold: "Takeouts", img: "crave-burger", tone: 3, shape: "sh-cd", w: 640, h: 640 },
	{ light: "Easy", bold: "Meals", img: "crave-noodles", tone: 2, shape: "sh-ci", w: 680, h: 527 },
	{ light: "Heavy", bold: "Loaders", img: "crave-swallow", tone: 4, shape: "sh-di", w: 600, h: 600 },
];
</script>

<template>
	<section class="s-section crave s-stage" aria-labelledby="crave-h">
		<div class="s-wrap">
			<h2 id="crave-h" class="s-h2 title">
				<span class="light">Find what you</span> crave
			</h2>
			<ul class="cards">
				<li v-for="c in cards" :key="c.bold" class="card">
					<div class="face" :class="`tone-${c.tone}`">
						<span class="sh" :class="c.shape" aria-hidden="true" />
						<p class="name">
							<span class="light">{{ c.light }}</span>
							<span>{{ c.bold }}</span>
						</p>
						<img :src="`/media/home/${c.img}.webp`" alt="" loading="lazy" decoding="async" :width="c.w" :height="c.h" />
					</div>
					<a class="explore" href="#get-app">
						Explore<span class="sr-only">&nbsp;{{ c.light }} {{ c.bold }}</span>
						<span class="chev" aria-hidden="true">
							<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12l4-4-4-4" /></svg>
						</span>
					</a>
				</li>
			</ul>
		</div>
	</section>
</template>

<style scoped>
.title {
	text-align: center;
	margin-bottom: clamp(32px, 5vw, 56px) !important;
	max-width: none !important;
}
.light {
	font-weight: 400;
}
.cards {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 20px;
}
.card {
	display: grid;
	gap: 14px;
}
.face {
	position: relative;
	aspect-ratio: 389 / 470;
	border-radius: 2rem;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: clamp(28px, 4vw, 44px);
	isolation: isolate;
}
.face .sh {
	position: absolute;
	top: 20px;
	left: 20px;
	--c: currentColor;
	opacity: 0.8;
}
.name {
	display: grid;
	text-align: center;
	font-family: var(--font-display);
	font-weight: 800;
	font-size: clamp(28px, 3vw, 40px);
	line-height: 1;
	letter-spacing: -0.03em;
}
.face img {
	position: absolute;
	left: 50%;
	bottom: -4%;
	width: 92%;
	height: auto;
	transform: translateX(-50%);
	filter: drop-shadow(0 18px 24px color-mix(in srgb, var(--ink) 28%, transparent));
	transition: transform 0.5s var(--ease);
}
.card:hover .face img {
	transform: translateX(-50%) scale(1.04);
}
.explore {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 60px;
	border-radius: 999px;
	background: var(--surface);
	border: 1px solid var(--line);
	font-size: 18px;
	font-weight: 600;
	text-decoration: none;
	transition: background 0.15s;
}
.explore:hover {
	background: var(--bg);
}
.chev {
	position: absolute;
	right: 10px;
	display: grid;
	place-items: center;
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: var(--brand);
	color: var(--on-brand);
}
.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	overflow: hidden;
	clip: rect(0 0 0 0);
	white-space: nowrap;
}
@media (max-width: 860px) {
	.cards {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		gap: 14px;
		margin-inline: calc(-1 * var(--gutter));
		padding-inline: var(--gutter);
		padding-bottom: 6px;
		scrollbar-width: none;
	}
	.cards::-webkit-scrollbar {
		display: none;
	}
	.card {
		flex: 0 0 78%;
		scroll-snap-align: center;
	}
}
</style>

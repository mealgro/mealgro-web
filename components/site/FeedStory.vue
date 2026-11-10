<script setup lang="ts">
// The home page's opening, one screen: the copy, and the Mealgro app rebuilt
// in the page (components/site/phone/AppPhone.vue) playing real dish clips,
// swiping up and sideways and saving dishes on its own. Visitors can swipe and
// tap it too. Desktop: copy left, phone right. Under 900px: phone under copy.
import AppPhone from "./phone/AppPhone.vue";
import { videosPaused } from "../../lib/site/media";
</script>

<template>
	<section class="feed s-stage" :class="{ still: videosPaused }" aria-labelledby="feed-h">
		<div class="s-wrap grid">
			<div class="copy">
				<h1 id="feed-h" class="s-h1 rise" style="--i: 0">Order what you just watched.</h1>
				<p class="s-lead s-muted rise" style="--i: 1">
					Think TikTok for Food: short videos from kitchens near you. Swipe up for the next
					kitchen, sideways for more of its dishes, and save the ones you want to come back to.
				</p>
				<div class="s-actions rise" style="--i: 2">
					<a class="s-btn s-btn--primary" href="#get-app">Get the app</a>
					<a class="s-btn s-btn--outline" href="#how">How ordering works</a>
				</div>
			</div>
			<div class="phone-col">
				<!-- The old home page's floating food, around the phone now -->
				<img class="float f-pizza" src="/media/home/float-pizza.webp" alt="" width="520" height="520" />
				<img class="float f-burger" src="/media/home/float-burger.webp" alt="" width="560" height="560" />
				<img class="float f-small" src="/media/home/float-burger-small.webp" alt="" width="320" height="320" />
				<div class="phone" aria-hidden="true">
					<div class="screen">
						<AppPhone />
					</div>
				</div>
				<div class="under">
					<p class="try" aria-hidden="true">Swipe or tap the phone to try it</p>
					<button class="pause" type="button" :aria-pressed="videosPaused" @click="videosPaused = !videosPaused">
						<svg v-if="videosPaused" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5L7 4.5Z" /></svg>
						<svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" /></svg>
						{{ videosPaused ? "Play videos" : "Pause videos" }}
					</button>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped>
.feed {
	--ph: min(78svh, 760px);
	--bz: 11px;
	--pw: calc(var(--ph) * 0.4615);
	position: relative;
	overflow: clip;
	min-height: 100svh;
	display: flex;
	align-items: center;
	padding-top: 96px;
	padding-bottom: 32px;
}
.grid {
	display: grid;
	grid-template-columns: minmax(0, 1fr) var(--pw);
	gap: clamp(40px, 7vw, 120px);
	align-items: center;
}
.copy {
	display: grid;
	gap: 24px;
	justify-items: start;
	max-width: 640px;
}
.phone-col {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
}
.float {
	position: absolute;
	z-index: 0;
	height: auto;
	pointer-events: none;
	filter: drop-shadow(0 24px 30px color-mix(in srgb, var(--ink) 22%, transparent));
	/* Arrives once (transform), then bobs as on the old home page
	   (translate, so the two don't fight): 20px over 4s, offset per item. */
	animation:
		float-in 1s var(--ease) var(--in) both,
		bob 4s linear var(--bob) infinite;
}
.feed.still .float {
	animation-play-state: running, paused;
}
.f-pizza {
	--in: 0.25s;
	--bob: 0s;
	width: calc(var(--pw) * 0.62);
	top: 2%;
	left: calc(var(--pw) * -0.62);
}
.f-small {
	--in: 0.4s;
	--bob: 1.3s;
	width: calc(var(--pw) * 0.36);
	bottom: 16%;
	left: calc(var(--pw) * -0.42);
}
.f-burger {
	--in: 0.35s;
	--bob: 0.7s;
	width: calc(var(--pw) * 0.66);
	top: 40%;
	right: calc(var(--pw) * -0.56);
}
@keyframes float-in {
	from {
		opacity: 0;
		transform: translateY(30px) scale(0.9);
	}
}
@keyframes bob {
	0%,
	100% {
		translate: 0 0;
	}
	50% {
		translate: 0 -20px;
	}
}
@media (prefers-reduced-motion: reduce) {
	.float {
		animation: float-in 1s var(--ease) var(--in) both;
	}
}
.phone {
	position: relative;
	width: var(--pw);
	height: var(--ph);
	padding: var(--bz);
	border-radius: calc(var(--pw) * 0.15);
	z-index: 1;
	background: color-mix(in srgb, var(--night) 88%, var(--on-night));
	box-shadow:
		inset 0 0 0 1px color-mix(in srgb, var(--on-night) 18%, transparent),
		0 40px 90px -30px color-mix(in srgb, var(--night) 55%, transparent);
	animation: phone-in 0.9s var(--ease) both;
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
.under {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	gap: 14px;
	flex-wrap: wrap;
	justify-content: center;
}
.try {
	margin: 0;
	font-size: 13px;
	font-weight: 600;
	color: color-mix(in srgb, var(--on-stage) 62%, var(--stage));
}
.pause {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	min-height: 44px;
	padding: 0 16px;
	border-radius: 999px;
	border: 1px solid color-mix(in srgb, var(--on-stage) 26%, transparent);
	background: transparent;
	color: var(--on-stage);
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
}

/* The one orchestrated moment: the copy rises in, the phone settles. */
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

/* ── Phones and small tablets: the phone under the copy ── */
@media (max-width: 899px) {
	.feed {
		--ph: min(72svh, 600px);
		--bz: 9px;
		padding-top: 120px;
		padding-bottom: 40px;
	}
	.grid {
		grid-template-columns: minmax(0, 1fr);
		gap: 32px;
	}
	.copy {
		gap: 16px;
	}
	.copy .s-h1 {
		font-size: clamp(38px, 11vw, 64px);
	}
	.copy .s-lead {
		font-size: 16px;
	}
	/* Phones: little room beside the phone, so the food peeks out from
	   behind its edges instead of sitting off screen. */
	.f-pizza {
		width: calc(var(--pw) * 0.4);
		left: calc(50% - var(--pw) * 0.5 - var(--pw) * 0.2);
		top: 4%;
	}
	.f-small {
		width: calc(var(--pw) * 0.26);
		left: calc(50% - var(--pw) * 0.5 - var(--pw) * 0.14);
		bottom: 22%;
	}
	.f-burger {
		width: calc(var(--pw) * 0.42);
		right: calc(50% - var(--pw) * 0.5 - var(--pw) * 0.22);
		top: 46%;
	}
}
</style>

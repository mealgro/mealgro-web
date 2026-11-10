<script setup lang="ts">
// The home page's opening, one screen: the copy, and the Mealgro app rebuilt
// in the page (components/site/phone/AppPhone.vue) playing real dish clips,
// swiping up and sideways and saving dishes on its own. Visitors can swipe and
// tap it too. Desktop: copy left, phone right. Under 900px: phone under copy.
import AppPhone from "./phone/AppPhone.vue";
import { videosPaused } from "../../lib/site/media";
</script>

<template>
	<section class="feed s-stage" aria-labelledby="feed-h">
		<div class="s-wrap grid">
			<div class="copy">
				<h1 id="feed-h" class="s-h1 rise" style="--i: 0">Order what you just watched.</h1>
				<p class="s-lead s-muted rise" style="--i: 1">
					Think TikTok for Food: short videos from kitchens near you. Swipe up for the next
					kitchen, sideways for more of its dishes, and save the ones you want to come back to.
				</p>
				<div class="s-actions rise" style="--i: 2">
					<a class="s-btn s-btn--ink" href="#get-app">Get the app</a>
					<a class="s-btn s-btn--outline" href="#how">How ordering works</a>
				</div>
			</div>
			<div class="phone-col">
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
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
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
		0 0 140px 10px color-mix(in srgb, var(--cat-1) 36%, transparent);
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
}
</style>

<script setup lang="ts">
// "Satisfy your immediate cravings", from the old home page: food photos that
// cross-fade every few seconds, a segment per photo (tap one to jump), and the
// download button. Stops turning with Pause or "reduce motion".
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { reducedMotion, videosPaused } from "../../lib/site/media";

const photos = [1, 2, 3, 4, 5].map((n) => `/media/home/cravings-${n}.webp`);
const current = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function stop() {
	if (timer) clearInterval(timer);
	timer = null;
}
function start() {
	stop();
	if (reducedMotion.value || videosPaused.value) return;
	timer = setInterval(() => (current.value = (current.value + 1) % photos.length), 4000);
}
function go(i: number) {
	current.value = i;
	start();
}
onMounted(start);
watch([reducedMotion, videosPaused], start);
onBeforeUnmount(stop);
</script>

<template>
	<section class="s-section cravings" aria-labelledby="cravings-h">
		<div class="s-wrap grid">
			<div class="media">
				<div class="frame">
					<img
						v-for="(src, i) in photos"
						:key="src"
						:src="src"
						alt=""
						class="photo"
						:class="{ on: i === current }"
						:loading="i === 0 ? 'eager' : 'lazy'"
						decoding="async"
						width="800"
						height="1000"
					/>
				</div>
				<div class="bars" role="group" aria-label="Photos">
					<button
						v-for="(src, i) in photos"
						:key="src"
						type="button"
						:aria-label="`Photo ${i + 1} of ${photos.length}`"
						:aria-current="i === current ? 'true' : undefined"
						@click="go(i)"
					>
						<span :class="{ on: i === current }" />
					</button>
				</div>
			</div>
			<div class="copy">
				<h2 id="cravings-h" class="s-h2">Satisfy your immediate cravings</h2>
				<p class="s-lead s-muted">Mealgro has all the food you can eat</p>
				<a class="s-btn s-btn--primary" href="#get-app">
					Download now
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" /></svg>
				</a>
			</div>
		</div>
	</section>
</template>

<style scoped>
.grid {
	display: grid;
	grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
	gap: clamp(40px, 7vw, 112px);
	align-items: center;
}
.frame {
	position: relative;
	aspect-ratio: 608 / 501;
	border-radius: 2rem;
	overflow: hidden;
	background: var(--bg);
}
.photo {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	opacity: 0;
	transition: opacity 0.6s ease;
}
.photo.on {
	opacity: 1;
}
.bars {
	display: flex;
	gap: 4px;
	max-width: 400px;
	margin: 20px auto 0;
}
.bars button {
	flex: 1;
	padding: 10px 0;
	border: 0;
	background: none;
	cursor: pointer;
}
.bars span {
	display: block;
	height: 4px;
	border-radius: 999px;
	background: var(--brand-soft);
	transition: background 0.3s;
}
.bars span.on {
	background: var(--brand);
}
.copy {
	display: grid;
	gap: 20px;
	justify-items: start;
}
.copy .s-h2 {
	max-width: 11ch;
}
@media (max-width: 860px) {
	.grid {
		grid-template-columns: minmax(0, 1fr);
		gap: 32px;
	}
	.frame {
		border-radius: 1.5rem;
	}
}
</style>

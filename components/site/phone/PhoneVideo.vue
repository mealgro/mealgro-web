<script setup lang="ts">
// One dish clip inside the phone. Downloads once `load` turns on (the dish is
// on screen or next to it), plays only while `play`, and starts over each time
// it becomes the visible dish, as the app does.
import { onMounted, ref, watch } from "vue";
import { videoUrl } from "../../../lib/site/media";

const props = defineProps<{ id: string; load: boolean; play: boolean }>();
const el = ref<HTMLVideoElement | null>(null);
const src = ref<string | undefined>(props.load ? videoUrl(`/media/dish/${props.id}.mp4`) : undefined);

watch(
	() => props.load,
	(v) => {
		if (v && !src.value) src.value = videoUrl(`/media/dish/${props.id}.mp4`);
	},
);

function sync(restart = false) {
	const v = el.value;
	if (!v || !src.value) return;
	if (props.play) {
		if (restart) v.currentTime = 0;
		v.play().catch(() => {
			// Autoplay refused: the poster stays.
		});
	} else {
		v.pause();
	}
}

watch(
	() => props.play,
	(now, before) => requestAnimationFrame(() => sync(now && !before)),
);
watch(src, () => requestAnimationFrame(() => sync()));
onMounted(() => {
	if (el.value) el.value.muted = true;
	sync();
});
</script>

<template>
	<video
		ref="el"
		class="pv"
		:src="src"
		:poster="`/media/dish/${id}.webp`"
		muted
		loop
		playsinline
		disablepictureinpicture
		preload="none"
		tabindex="-1"
	/>
</template>

<style scoped>
.pv {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
	background: #000;
}
</style>

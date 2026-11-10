<script setup lang="ts">
// One muted food clip. Nothing is downloaded until it is about a screen away;
// it plays only while most of it is in view, and never while videos are
// paused (the Pause button, or "reduce motion" on the device). The poster is
// what shows until then, and what stays when it can't play.
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { clipPoster, clipSrc, videosPaused } from "../../lib/site/media";

const props = withDefaults(defineProps<{ id: string; eager?: boolean }>(), { eager: false });

const el = ref<HTMLVideoElement | null>(null);
const src = ref<string | undefined>(undefined);
let visible = false;
let near: IntersectionObserver | null = null;
let seen: IntersectionObserver | null = null;

function sync() {
	const v = el.value;
	if (!v || !src.value) return;
	if (visible && !videosPaused.value) {
		v.play().catch(() => {
			// Autoplay refused (data saver, low power): the poster stays.
		});
	} else {
		v.pause();
	}
}

onMounted(() => {
	const v = el.value;
	if (!v) return;
	// Vue doesn't carry `muted` through server rendering; browsers only
	// autoplay muted video, so set it here.
	v.muted = true;
	if (props.eager) src.value = clipSrc(props.id);
	near = new IntersectionObserver(
		(entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				src.value = clipSrc(props.id);
				near?.disconnect();
				near = null;
			}
		},
		{ rootMargin: "100% 0px" },
	);
	near.observe(v);
	seen = new IntersectionObserver(
		(entries) => {
			for (const e of entries) visible = e.intersectionRatio >= 0.55;
			sync();
		},
		{ threshold: [0, 0.55, 1] },
	);
	seen.observe(v);
});

watch([src, videosPaused], () => requestAnimationFrame(sync));

onBeforeUnmount(() => {
	near?.disconnect();
	seen?.disconnect();
});
</script>

<template>
	<video
		ref="el"
		class="feed-clip"
		:src="src"
		:poster="clipPoster(id)"
		muted
		loop
		playsinline
		disablepictureinpicture
		preload="none"
		aria-hidden="true"
		tabindex="-1"
	/>
</template>

<style scoped>
.feed-clip {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	background: var(--stage);
	display: block;
}
</style>

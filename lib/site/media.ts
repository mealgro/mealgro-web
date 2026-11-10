import { ref } from "vue";

// FeedClip's clips, in public/media/feed (muted H.264, 480 px, WebP poster):
// - rider-app.mp4: a screen recording of the rider app (rider page, footer).
// - noodles.mp4: a seed food clip (mealgro/data) for the home "Watch" tile.
// The home page's phone plays its own dish clips; see lib/site/phone.ts.

const src = (id: string) => `/media/feed/${id}.mp4`;
const poster = (id: string) => `/media/feed/${id}.webp`;
export const clipSrc = src;
export const clipPoster = poster;

/** Off when someone asks for less motion, and when they press Pause. */
export const videosPaused = ref(false);
export const reducedMotion = ref(false);

let started = false;
/** Call from onMounted (not at import, so server and first client render agree). */
export function initMotion() {
	if (started || typeof window === "undefined") return;
	started = true;
	const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
	reducedMotion.value = !!mq?.matches;
	if (reducedMotion.value) videosPaused.value = true;
	mq?.addEventListener("change", () => {
		reducedMotion.value = mq.matches;
		if (mq.matches) videosPaused.value = true;
	});
}

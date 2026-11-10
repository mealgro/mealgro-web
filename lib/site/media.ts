import { ref } from "vue";

// Clips in public/media/feed, all muted H.264, 480 px wide, with a WebP poster:
// - app-*.mp4 and rider-app.mp4: screen recordings of the real customer and
//   rider apps (mealgro/marketing/films/capture), shown in the phone frames.
// - spaghetti, noodles: Mealgro's own seed food clips (mealgro/data), 6 s.

export type Clip = {
	id: string;
	dish: string;
	line: string;
	store: string;
	area: string;
	minutes: string;
	rating: string;
	price: string;
};

const src = (id: string) => `/media/feed/${id}.mp4`;
const poster = (id: string) => `/media/feed/${id}.webp`;
export const clipSrc = src;
export const clipPoster = poster;

/** Illustrative dish and store for the vendor page's phone mock-up. */
export const CLIPS: Record<string, Clip> = {
	spaghetti: {
		id: "spaghetti",
		dish: "Seafood pasta",
		line: "Regulars keep it a secret",
		store: "Stew Pot",
		area: "Warri",
		minutes: "25–30 min",
		rating: "4.8",
		price: "₦3,900",
	},
};

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

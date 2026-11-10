import { ref } from "vue";

// The food clips on the marketing pages: Mealgro's own seed videos
// (mealgro/data), cut to 6 s, 480 px wide, muted H.264 with a WebP poster.
// Shown in public/media/feed.

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

/** Illustrative dishes and stores for the phone mock-ups. */
export const CLIPS: Record<string, Clip> = {
	jollof: {
		id: "jollof",
		dish: "Jollof rice and chicken",
		line: "Crispy outside, tender inside",
		store: "Green Bowl",
		area: "Wuse",
		minutes: "25–35 min",
		rating: "4.8",
		price: "₦4,300",
	},
	suya: {
		id: "suya",
		dish: "Beef suya",
		line: "Off the grill, extra yaji",
		store: "Mai Suya Spot",
		area: "Garki",
		minutes: "20–30 min",
		rating: "4.7",
		price: "₦3,500",
	},
	seafood: {
		id: "seafood",
		dish: "Seafood boil",
		line: "Prawns, corn and pepper sauce",
		store: "Bayside Grill",
		area: "Lekki",
		minutes: "35–45 min",
		rating: "4.9",
		price: "₦12,800",
	},
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
	beans: {
		id: "beans",
		dish: "Beans and dodo",
		line: "Palm oil stew, sweet plantain",
		store: "Mama T's Kitchen",
		area: "Yaba",
		minutes: "20–30 min",
		rating: "4.6",
		price: "₦2,600",
	},
	noodles: {
		id: "noodles",
		dish: "Wok noodles",
		line: "Straight from the wok",
		store: "Wok & Co",
		area: "Ikeja",
		minutes: "25–35 min",
		rating: "4.7",
		price: "₦4,100",
	},
	pasta: {
		id: "pasta",
		dish: "Creamy chicken pasta",
		line: "Made when you order",
		store: "The Pasta Room",
		area: "Victoria Island",
		minutes: "30–40 min",
		rating: "4.8",
		price: "₦5,200",
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

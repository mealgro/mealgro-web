// Which store buttons to show, for the visitor's device. The pages are
// prerendered, so the device is unknown until mount: until then every store
// shows, in a fixed order.
import { computed, onMounted, ref } from "vue";
import type { StoreLinks } from "./links";

export type Platform = "ios" | "android" | "mac" | "other";
export type Store = { key: "ios" | "android"; href: string };

export function detectPlatform(): Platform {
	const ua = navigator.userAgent;
	if (/android/i.test(ua)) return "android";
	// iPadOS asks for the desktop site and says "Macintosh"; touch gives it away.
	if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
	if (/Macintosh|Mac OS X/.test(ua)) return "mac";
	return "other";
}

/**
 * `stores`: on a phone, its own store when there is one; on a computer, every
 * store, the Mac's first on a Mac. `direct`: a phone's own store, for links
 * that should go straight there (otherwise they scroll to the buttons).
 */
export function useStores(links: StoreLinks) {
	const platform = ref<Platform>("other");
	onMounted(() => {
		platform.value = detectPlatform();
	});
	const all = (): Store[] => [
		...(links.ios ? [{ key: "ios" as const, href: links.ios }] : []),
		...(links.android ? [{ key: "android" as const, href: links.android }] : []),
	];
	const stores = computed<Store[]>(() => {
		const list = all();
		const p = platform.value;
		if (p === "ios" || p === "android") {
			const own = list.filter((s) => s.key === p);
			if (own.length) return own;
		}
		const first = p === "ios" || p === "mac" ? "ios" : "android";
		return [...list].sort((a, b) => Number(b.key === first) - Number(a.key === first));
	});
	const direct = computed(() => {
		const p = platform.value;
		if (p !== "ios" && p !== "android") return null;
		return all().find((s) => s.key === p)?.href ?? null;
	});
	return { platform, stores, direct };
}

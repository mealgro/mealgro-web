// Safari and every iOS browser (all WebKit) play a video only from a server
// that answers byte-range requests properly. mealgro.com can't: Cloudflare asks
// Firebase Hosting for gzip, Firebase gzips even an .mp4 (no firebase.json
// header turns that off), and Cloudflare then answers a range request with the
// whole file, chunked, under a weak ETag. Chrome and Firefox take that; WebKit
// fails the video (MEDIA_ERR_SRC_NOT_SUPPORTED) and shows only the poster.
// Serving the clips from Firebase directly works but is slow: it skips
// Cloudflare's cache.
//
// So on WebKit only, each /media clip is downloaded whole (through Cloudflare,
// once per page however many players use it) and played from a blob: URL,
// which needs no ranges. It covers every <video>, whoever made it: templates,
// innerHTML, components that set `src` later. A clip is fetched when it comes
// near the screen or when code calls play() on it, so a page doesn't download
// clips nobody gets to. Everywhere else nothing changes.

const CLIP = /^\/media\/.+\.mp4$/;
/** The same-origin path of a /media clip, or null for anything else. */
function clipPath(src: string): string | null {
	try {
		const u = new URL(src, location.href);
		return u.origin === location.origin && CLIP.test(u.pathname) ? u.pathname + u.search : null;
	} catch {
		return null;
	}
}

const blobs = new Map<string, Promise<string | null>>();
function blobFor(path: string): Promise<string | null> {
	let url = blobs.get(path);
	if (!url) {
		url = fetch(path)
			.then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
			.then((b) => URL.createObjectURL(b))
			.catch(() => {
				blobs.delete(path);
				return null;
			});
		blobs.set(path, url);
	}
	return url;
}

/** Players still on a /media src, by that src. */
const pending = new WeakMap<HTMLVideoElement, string>();
/** Players whose blob is on its way. */
const inflight = new WeakMap<HTMLVideoElement, Promise<void>>();
/** Players that code asked to play (and not to pause since). */
const wants = new WeakSet<HTMLVideoElement>();
let near: IntersectionObserver | null = null;
let nativePlay: HTMLMediaElement["play"];

/** Moves a player onto its blob. Undefined when it has nothing to move. */
function swap(v: HTMLVideoElement): Promise<void> | undefined {
	const src = pending.get(v);
	if (!src) return inflight.get(v);
	pending.delete(v);
	near?.unobserve(v);
	const done = blobFor(clipPath(src)!).then((url) => {
		inflight.delete(v);
		// Something pointed the player elsewhere meanwhile: leave it be.
		if (!url || v.getAttribute("src") !== src) return;
		const t = v.currentTime;
		v.src = url;
		if (t) v.currentTime = t;
		if (v.autoplay || wants.has(v)) return nativePlay.call(v);
	});
	inflight.set(v, done);
	return done;
}

function track(v: HTMLVideoElement) {
	const src = v.getAttribute("src");
	if (!src || !clipPath(src) || pending.get(v) === src) return;
	pending.set(v, src);
	near?.observe(v);
}

let started = false;
/** Call once on the client (the root layout does). */
export function initWebkitVideo() {
	if (started || typeof window === "undefined") return;
	started = true;
	// Safari, and every browser on iOS (they are all WebKit there).
	if (!/Apple/.test(navigator.vendor)) return;

	// play() on a clip still on its /media src fetches the blob first. Safari
	// rejects play() on a failed source without firing "play", so this has to
	// be the method itself, not an event.
	nativePlay = HTMLMediaElement.prototype.play;
	const nativePause = HTMLMediaElement.prototype.pause;
	HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
		if (this instanceof HTMLVideoElement) {
			const moving = swap(this);
			if (moving) {
				wants.add(this);
				return moving.then(() => (this.paused ? nativePlay.call(this) : undefined));
			}
		}
		return nativePlay.call(this);
	};
	HTMLMediaElement.prototype.pause = function (this: HTMLMediaElement) {
		if (this instanceof HTMLVideoElement) wants.delete(this);
		return nativePause.call(this);
	};

	near = new IntersectionObserver(
		(entries) => {
			for (const e of entries) if (e.isIntersecting) void swap(e.target as HTMLVideoElement);
		},
		{ rootMargin: "100%" },
	);
	document.querySelectorAll("video").forEach(track);
	new MutationObserver((records) => {
		for (const r of records) {
			if (r.type === "attributes") {
				if (r.target instanceof HTMLVideoElement) track(r.target);
				continue;
			}
			r.addedNodes.forEach((n) => {
				if (n instanceof HTMLVideoElement) track(n);
				else if (n instanceof Element) n.querySelectorAll("video").forEach(track);
			});
		}
	}).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
}

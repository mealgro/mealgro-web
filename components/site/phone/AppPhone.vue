<script setup lang="ts">
// The customer app's feed, rebuilt in HTML so the home page can show it with
// real dish clips: swipe up for the next store, left and right through a
// store's dishes, and save a dish with the bookmark. Layout, strings and
// colours follow mealgro-app (feeds/highlight_surface, feed_highlight_widget).
//
// Drawn 390 px wide and scaled to the screen's width; the drawing's height
// follows the screen's own shape, so it fills the screen edge to edge with
// nothing cropped and no bands (everything is laid out from the top or the
// bottom, as in the app). It matches the app at any size.
// size. A short scripted demo loops: sideways through a store's dishes, a save
// now and then, up to the next store. Anyone can take over by swiping or
// tapping, and the demo resumes after a pause. No demo runs with "reduce
// motion" or while videos are paused.
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import PhoneVideo from "./PhoneVideo.vue";
import { DELIVERY_ADDRESS, STORES, naira } from "../../../lib/site/phone";
import { reducedMotion, videosPaused } from "../../../lib/site/media";

const W = 390;
/** The drawing's height: the screen's height at the drawing's scale. */
const H = ref(844);
const N = STORES.length;
const mod = (n: number) => ((n % N) + N) % N;

// ── Layout: scale the canvas to the box it's in ─────────────────────────────
const root = ref<HTMLElement | null>(null);
const canvas = ref<HTMLElement | null>(null);
const k = ref(0.8);
const visible = ref(false);
let ro: ResizeObserver | null = null;
let io: IntersectionObserver | null = null;

// ── Feed state ──────────────────────────────────────────────────────────────
/** Vertical position, unbounded: store = vi mod N, so swiping up never ends. */
const vi = ref(0);
const hl = reactive<number[]>(STORES.map(() => 0));
const saved = reactive<Record<string, boolean>>({});
const pressed = ref<string | null>(null);

const storeIdx = computed(() => mod(vi.value));
const store = computed(() => STORES[storeIdx.value]);
const pages = computed(() => [vi.value - 1, vi.value, vi.value + 1]);

// ── Moves ───────────────────────────────────────────────────────────────────
function goStore(d: number) {
	vi.value += d;
	hl[storeIdx.value] = 0;
}
function goDish(d: number) {
	const s = storeIdx.value;
	const n = hl[s] + d;
	if (n >= 0 && n < STORES[s].dishes.length) hl[s] = n;
}
const savedKey = computed(() => `${storeIdx.value}:${hl[storeIdx.value]}`);
function toggleSave() {
	saved[savedKey.value] = !saved[savedKey.value];
}

// ── The finger that shows what the demo is doing ────────────────────────────
type Touch = { x: number; y: number; dx: number; dy: number; key: number };
const touch = ref<Touch | null>(null);
let touchKey = 0;
function pointAt(el: Element | null | undefined) {
	if (!el || !canvas.value) return { x: W / 2, y: H.value / 2 };
	const c = canvas.value.getBoundingClientRect();
	const r = el.getBoundingClientRect();
	return { x: (r.left + r.width / 2 - c.left) / k.value, y: (r.top + r.height / 2 - c.top) / k.value };
}

// ── The demo ────────────────────────────────────────────────────────────────
let run = 0;
const sleep = (ms: number, my: number) =>
	new Promise<void>((resolve, reject) => setTimeout(() => (my === run ? resolve() : reject(new Error("stop"))), ms));

/** Feed controls live on every rendered page; aim at the one on screen. */
async function tap(sel: string, my: number, action: () => void) {
	const el = canvas.value?.querySelector(`.spage.cur ${sel}`);
	touch.value = { ...pointAt(el), dx: 0, dy: 0, key: ++touchKey };
	await sleep(260, my);
	pressed.value = sel;
	action();
	await sleep(240, my);
	pressed.value = null;
	touch.value = null;
}
async function swipe(dir: "up" | "left", my: number) {
	const from = dir === "up" ? { x: 250, y: 600 } : { x: 300, y: 420 };
	const d = dir === "up" ? { dx: 0, dy: -260 } : { dx: -200, dy: 0 };
	touch.value = { ...from, ...d, key: ++touchKey };
	await sleep(160, my);
	if (dir === "up") goStore(1);
	else goDish(1);
	await sleep(420, my);
	touch.value = null;
}

function setUp() {
	pressed.value = null;
	touch.value = null;
	hl.fill(0);
	for (const key of Object.keys(saved)) delete saved[key];
	vi.value = 0;
}

/** Each store: its first dish, sideways through the rest, then up to the
 *  next. Every other store, the dish on screen gets saved before moving on. */
async function script(my: number) {
	for (let round = 0; ; round++) {
		// Each lap round the stores starts with nothing saved.
		if (round % N === 0) for (const key of Object.keys(saved)) delete saved[key];
		const n = store.value.dishes.length;
		for (let i = 1; i < n; i++) {
			await sleep(2300, my);
			await swipe("left", my);
		}
		if (round % 2 === 0 && !saved[savedKey.value]) {
			await sleep(1300, my);
			await tap(".rail .save", my, () => (saved[savedKey.value] = true));
		}
		await sleep(2000, my);
		await swipe("up", my);
	}
}

const still = computed(() => reducedMotion.value || videosPaused.value);
function start() {
	const my = ++run;
	setUp();
	if (!still.value) script(my).catch(() => {});
}
function stop() {
	run++;
	touch.value = null;
	pressed.value = null;
}

// ── Someone takes over ──────────────────────────────────────────────────────
let resume: ReturnType<typeof setTimeout> | null = null;
function takeOver() {
	stop();
	if (resume) clearTimeout(resume);
	resume = setTimeout(() => {
		if (visible.value && !still.value) script(++run).catch(() => {});
	}, 9000);
}
let down: { x: number; y: number } | null = null;
/** A drag also ends in a click; this keeps it from counting as a tap. */
let dragged = false;
function onDown(e: PointerEvent) {
	down = { x: e.clientX, y: e.clientY };
	dragged = false;
	takeOver();
}
function onUp(e: PointerEvent) {
	if (!down) return;
	const dx = (e.clientX - down.x) / k.value;
	const dy = (e.clientY - down.y) / k.value;
	down = null;
	dragged = Math.hypot(dx, dy) > 12;
	if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx)) goStore(dy < 0 ? 1 : -1);
	else if (Math.abs(dx) > 40) goDish(dx < 0 ? 1 : -1);
}
/** Tapping the left or right part of the video steps through the store's dishes. */
function onFeedTap(e: MouseEvent) {
	if (!canvas.value || dragged) return;
	const c = canvas.value.getBoundingClientRect();
	const x = (e.clientX - c.left) / k.value;
	if (x < W * 0.33) goDish(-1);
	else if (x > W * 0.67) goDish(1);
}

watch(still, () => visible.value && start());

onMounted(() => {
	// Layout size, not the on-screen box: a tilted phone (the footer's) has a
	// bigger bounding box than its screen.
	const fit = () => {
		const el = root.value;
		if (!el || !el.offsetWidth) return;
		k.value = el.offsetWidth / W;
		H.value = Math.max(640, el.offsetHeight / k.value);
	};
	fit();
	ro = new ResizeObserver(fit);
	if (root.value) ro.observe(root.value);
	io = new IntersectionObserver(
		([e]) => {
			const was = visible.value;
			visible.value = e.isIntersecting;
			if (visible.value && !was) start();
			if (!visible.value && was) stop();
		},
		{ threshold: 0.25 },
	);
	if (root.value) io.observe(root.value);
	setUp();
});
onBeforeUnmount(() => {
	stop();
	ro?.disconnect();
	io?.disconnect();
	if (resume) clearTimeout(resume);
});

const playing = computed(() => visible.value && !videosPaused.value);
const near = (page: number, di: number) => Math.abs(page - vi.value) <= 1 && Math.abs(di - hl[mod(page)]) <= 1;
</script>

<template>
	<div ref="root" class="ap" @pointerdown="onDown" @pointerup="onUp" @pointercancel="down = null">
		<div ref="canvas" class="cv" :style="{ height: `${H}px`, transform: `translate(-50%, -50%) scale(${k})` }">
			<!-- Stores, one screen each; up for the next -->
			<section
				v-for="p in pages"
				:key="p"
				class="spage"
				:class="{ cur: p === vi }"
				:style="{ transform: `translateY(${(p - vi) * H}px)` }"
			>
				<div class="htrack" :style="{ transform: `translateX(${-hl[mod(p)] * W}px)` }" @click="onFeedTap">
					<div v-for="(d, di) in STORES[mod(p)].dishes" :key="d.video" class="hpage" :style="{ left: `${di * W}px` }">
						<PhoneVideo
							:id="d.video"
							:load="near(p, di)"
							:play="playing && p === vi && di === hl[mod(p)]"
						/>
					</div>
				</div>
				<div class="shade-top" />
				<div class="shade-bottom" />

				<!-- One bar per dish in the store; lit up to the current one -->
				<div class="progress">
					<span v-for="(d, di) in STORES[mod(p)].dishes" :key="di" :class="{ on: di <= hl[mod(p)] }" />
				</div>

				<template v-for="s in [STORES[mod(p)]]" :key="s.name">
					<div class="info">
						<p class="title">{{ s.dishes[hl[mod(p)]].name }}</p>
						<p class="desc">{{ s.dishes[hl[mod(p)]].description }}</p>
						<div class="store-row">
							<img src="/media/app-icons/shop_icon.svg" alt="" class="white-icon" width="16" height="16" />
							<span class="store-name">{{ s.name }}</span>
							<span class="chip-time">
								<img src="/media/app-icons/scooter_icon.svg" alt="" class="white-icon" width="14" height="14" />
								{{ s.minutes }}
							</span>
						</div>
						<div class="city">
							<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" /></svg>
							{{ s.area }}
						</div>
						<div class="badges">
							<span v-if="s.dishes[hl[mod(p)]].badges?.includes('popular')" class="badge red">🔥 POPULAR</span>
							<span v-if="s.dishes[hl[mod(p)]].badges?.includes('bogo')" class="badge green">🥳 BOGO</span>
							<span v-if="s.dishes[hl[mod(p)]].badges?.includes('discount')" class="badge green">{{ s.dishes[hl[mod(p)]].discount }}% off</span>
							<span class="rating">
								<img src="/media/app-icons/mealgro_icon.svg" alt="" width="14" height="14" />
								{{ s.rating }}
								<svg viewBox="0 0 24 24" width="12" height="12" fill="#FEA000"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9Z" /></svg>
								({{ s.ratings }})
							</span>
						</div>
					</div>

					<div class="rail">
						<span class="r">
							<svg viewBox="0 0 28 28" width="30" height="30" fill="currentColor"><path d="M25.67 9.92a7.58 7.58 0 0 0-13.57-4.66c5.92.23 10.65 5.1 10.65 11.07l-.01.39.39.1c1.13.3 2.16-.73 1.86-1.85l-.15-.56c-.12-.45-.05-.92.15-1.35.43-.95.68-2.02.68-3.14Z" /><path fill-rule="evenodd" d="M21 16.33a9.33 9.33 0 0 1-13.36 8.42c-.42-.2-.9-.27-1.34-.15l-1.43.38a1.52 1.52 0 0 1-1.86-1.86l.38-1.43c.12-.45.05-.92-.15-1.34A9.33 9.33 0 1 1 21 16.33ZM7.58 17.5a1.17 1.17 0 1 0 0-2.33 1.17 1.17 0 0 0 0 2.33Zm4.09 0a1.17 1.17 0 1 0 0-2.33 1.17 1.17 0 0 0 0 2.33Zm4.08 0a1.17 1.17 0 1 0 0-2.33 1.17 1.17 0 0 0 0 2.33Z" /></svg>
							<span>{{ s.reviews }}</span>
						</span>
						<button class="r save" type="button" tabindex="-1" :class="{ on: saved[`${mod(p)}:${hl[mod(p)]}`], press: pressed === '.rail .save' }" @click.stop="toggleSave">
							<svg viewBox="0 0 28 28" width="30" height="30" fill="currentColor"><path fill-rule="evenodd" d="M24.5 12.95v5.82c0 3.62 0 5.42-.86 6.21-.4.38-.92.61-1.47.68-1.15.13-2.5-1.06-5.19-3.44-1.19-1.05-1.78-1.58-2.47-1.71a2.6 2.6 0 0 0-1.02 0c-.69.13-1.28.66-2.47 1.71-2.69 2.38-4.04 3.57-5.19 3.44-.55-.07-1.07-.3-1.47-.68-.86-.79-.86-2.59-.86-6.21v-5.82c0-5 0-7.5 1.54-9.06C6.58 2.33 9.05 2.33 14 2.33s7.42 0 8.96 1.56c1.54 1.55 1.54 4.06 1.54 9.06ZM9.63 7c0-.48.39-.88.87-.88h7c.48 0 .88.4.88.88s-.4.88-.88.88h-7A.88.88 0 0 1 9.62 7Z" /></svg>
							<span>{{ s.saves + (saved[`${mod(p)}:${hl[mod(p)]}`] ? 1 : 0) }}</span>
						</button>
						<span class="r">
							<svg viewBox="0 0 28 28" width="30" height="30" fill="currentColor"><path d="m16.28 6.05 5.81 5.16c1.08.96 1.63 1.45 1.83 2.02.17.5.17 1.04 0 1.54-.2.57-.75 1.06-1.83 2.02l-5.81 5.16c-.5.44-.74.66-.95.67a.58.58 0 0 1-.47-.21c-.13-.16-.13-.5-.13-1.15V18c-2.83 0-5.83.91-8.01 2.52-1.14.84-1.71 1.27-1.92 1.25a.63.63 0 0 1-.46-.28c-.11-.19-.01-.77.18-1.93C5.82 12.02 11 10 14.73 10V6.75c0-.66 0-.99.13-1.15.12-.14.29-.22.47-.21.21 0 .46.22.95.66Z" /></svg>
							<span>Share</span>
						</span>
						<span class="r">
							<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M3 9.2v5.6c0 .9.7 1.6 1.6 1.6h2.3l4.4 3.6c.8.6 1.9.1 1.9-.9V4.9c0-1-1.1-1.5-1.9-.9L6.9 7.6H4.6C3.7 7.6 3 8.3 3 9.2Z" /><path d="m16.5 9 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
						</span>
					</div>

					<div class="actions">
						<span class="menu-btn">
							<img src="/media/app-icons/menu_fork_knife.svg" alt="" width="15" height="16" />
							Menu
						</span>
						<span class="cart-btn">
							<span class="cart-l">
								<img src="/media/app-icons/cart_icon.svg" alt="" width="20" height="20" />
								Add to cart
							</span>
							<span class="cart-r">{{ naira(s.dishes[hl[mod(p)]].price) }}</span>
						</span>
					</div>
				</template>
			</section>

			<!-- Fixed over the feed -->
			<div class="topbar">
				<div class="loc">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21.5s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
					<div>
						<small>Delivery To</small>
						<strong>{{ DELIVERY_ADDRESS }}</strong>
					</div>
				</div>
				<div class="tools">
					<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7.5" /><path d="m20.5 20.5-4-4" /></svg>
					<img src="/media/app-icons/filter_icon.svg" alt="" width="30" height="30" />
				</div>
			</div>

			<nav class="tabs">
				<span class="tab"><img src="/media/app-icons/media_icon.svg" alt="" width="24" height="24" />Feed</span>
				<span class="tab"><img src="/media/app-icons/community_icon.svg" alt="" class="white-icon" width="24" height="24" />Community</span>
				<span class="tab"><img src="/media/app-icons/explore_icon.svg" alt="" class="white-icon" width="24" height="24" />Explore</span>
				<span class="tab"><img src="/media/app-icons/outlined_bell.svg" alt="" class="white-icon" width="24" height="24" />Activity</span>
				<span class="tab"><img src="/media/app-icons/user_icons.svg" alt="" class="white-icon" width="24" height="24" />Profile</span>
			</nav>

			<!-- Status bar and home indicator, over everything -->
			<div class="status">
				<span class="time">9:41</span>
				<span class="island" />
				<span class="sys">
					<svg viewBox="0 0 18 12" width="18" height="12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
					<svg viewBox="0 0 16 12" width="16" height="12" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.1-1.2A10.3 10.3 0 0 0 8 .5C5.3.5 2.8 1.5.9 3.4L2 4.6a8.6 8.6 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.1-1.2A6.8 6.8 0 0 0 8 3.9c-1.8 0-3.4.7-4.7 1.9L4.4 7c1-.9 2.2-1.4 3.6-1.4Zm0 3.4c-.6 0-1.2.2-1.6.6L8 11.5l1.6-1.9C9.2 9.2 8.6 9 8 9Z" /></svg>
					<span class="batt"><i /></span>
				</span>
			</div>
			<span class="home" />

			<span v-if="touch" :key="touch.key" class="finger" :style="{ left: `${touch.x}px`, top: `${touch.y}px`, '--dx': `${touch.dx}px`, '--dy': `${touch.dy}px` }" :class="{ drag: touch.dx || touch.dy }" />
		</div>
	</div>
</template>

<style scoped>
/* The app's own palette (mealgro-app root/constants/app_color.dart): only
   inside this phone, so it looks like the app it shows. */
.ap {
	--red: #ff2509;
	--red-dark: #b31400;
	--red-1: #fff6f5;
	--red-2: #ffe4e0;
	--amber: #fea000;
	--g1: #141414;
	--g2: #5f5f5f;
	--g3: #adadad;
	--g4: #b8b8b8;
	--g5: #e5e5e5;
	--g6: #f3f3f3;
	--green: #2e7d32;
	--chip: rgb(51 51 51 / 0.6);
	--tommy: "MADE Tommy Soft", system-ui, sans-serif;
	--lato: "Lato", "Instrument Sans Variable", system-ui, sans-serif;
	position: absolute;
	inset: 0;
	overflow: hidden;
	background: #000;
	touch-action: pan-y;
	user-select: none;
	-webkit-user-select: none;
	cursor: grab;
}
.ap:active {
	cursor: grabbing;
}
.cv {
	position: absolute;
	left: 50%;
	top: 50%;
	width: 390px;
	height: 844px; /* until measured */
	transform-origin: center;
	overflow: hidden;
	font-family: var(--tommy);
	color: #fff;
	-webkit-font-smoothing: antialiased;
}
.cv * {
	box-sizing: border-box;
}
.cv p {
	margin: 0;
}
.cv button {
	font: inherit;
	color: inherit;
	border: 0;
	background: none;
	padding: 0;
	cursor: pointer;
}
.cv img {
	display: block;
	max-width: none;
}
.white-icon {
	filter: brightness(0) invert(1);
}

/* ── Pages ── */
.spage {
	position: absolute;
	inset: 0;
	background: #000;
	transition: transform 0.38s cubic-bezier(0.25, 0.8, 0.3, 1);
}
.htrack {
	position: absolute;
	inset: 0;
	transition: transform 0.25s ease-in-out;
}
.hpage {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 390px;
	overflow: hidden;
}
.shade-top,
.shade-bottom {
	position: absolute;
	left: 0;
	right: 0;
	pointer-events: none;
}
.shade-top {
	top: 0;
	height: 130px;
	background: linear-gradient(rgb(0 0 0 / 0.5), transparent);
}
.shade-bottom {
	bottom: 0;
	height: 420px;
	background: linear-gradient(transparent, rgb(0 0 0 / 0.55) 45%, rgb(0 0 0 / 0.7));
}
.progress {
	position: absolute;
	top: 52px;
	left: 16px;
	right: 16px;
	display: flex;
	pointer-events: none;
}
.progress span {
	flex: 1;
	height: 3px;
	margin: 0 2px;
	border-radius: 2px;
	background: rgb(255 255 255 / 0.24);
	transition: background 0.25s;
}
.progress span.on {
	background: #fff;
}

/* ── Info block ── */
.info {
	position: absolute;
	left: 16px;
	right: 80px;
	bottom: 156px;
	display: flex;
	flex-direction: column;
	gap: 5px;
	pointer-events: none;
}
.title {
	font-size: 24px;
	line-height: 30px;
	font-weight: 700;
	letter-spacing: -0.25px;
}
.desc {
	font-size: 14px;
	line-height: 20px;
	font-weight: 500;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.store-row {
	display: flex;
	align-items: center;
	gap: 4px;
	margin-top: 2px;
}
.store-name {
	font-family: var(--lato);
	font-weight: 700;
	font-size: 14px;
	margin-right: 4px;
}
.chip-time {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 5px 8px;
	border-radius: 32px;
	background: rgb(0 0 0 / 0.5);
	font-family: var(--lato);
	font-size: 10px;
}
.city {
	display: flex;
	align-items: center;
	gap: 5px;
	font-size: 12px;
}
.badges {
	display: flex;
	gap: 8px;
	margin-top: 2px;
}
.badge,
.rating {
	display: inline-flex;
	align-items: center;
	gap: 3px;
	padding: 6px 10px;
	border-radius: 32px;
	font-size: 12px;
	font-weight: 500;
	white-space: nowrap;
}
.badge.red {
	background: var(--red);
}
.badge.green {
	background: var(--green);
}
.rating {
	background: var(--chip);
	padding: 6px 8px;
}

/* ── Right rail ── */
.rail {
	position: absolute;
	right: 14px;
	bottom: 170px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.35));
}
.r {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	font-weight: 500;
	transition: transform 0.15s;
}
.r.save.on {
	color: #f44336;
}
.r.save.on span {
	color: #fff;
}
.r.press {
	transform: scale(0.88);
}
.r.save.on svg {
	animation: pop 0.35s ease-out;
}
@keyframes pop {
	50% {
		transform: scale(1.3);
	}
}

/* ── Action bar ── */
.actions {
	position: absolute;
	left: 10px;
	right: 10px;
	bottom: 92px;
	display: flex;
	gap: 10px;
}
.menu-btn {
	display: inline-flex !important;
	align-items: center;
	gap: 5px;
	padding: 0 15px !important;
	height: 50px;
	border-radius: 32px;
	border: 1px solid #fff !important;
	background: var(--chip) !important;
	font-weight: 700;
	font-size: 14px;
	box-shadow: 0 0 12px 2px rgb(0 0 0 / 0.1);
}
.cart-btn {
	flex: 1;
	display: flex !important;
	height: 50px;
	border-radius: 32px;
	overflow: hidden;
	transition: transform 0.15s;
}
.cart-l {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	background: var(--red);
	font-size: 14px;
	font-weight: 700;
}
.cart-r {
	min-width: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 12px;
	background: var(--red-dark);
	font-size: 14px;
}

/* ── Fixed chrome ── */
.topbar {
	position: absolute;
	top: 68px;
	left: 16px;
	right: 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	pointer-events: none;
}
.loc {
	display: flex;
	align-items: center;
	gap: 8px;
}
.loc div {
	display: flex;
	flex-direction: column;
}
.loc small {
	font-size: 12px;
	line-height: 16px;
	color: rgb(255 255 255 / 0.7);
	font-weight: 500;
}
.loc strong {
	font-family: var(--lato);
	font-size: 14px;
	font-weight: 700;
	max-width: 200px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.tools {
	display: flex;
	align-items: center;
	gap: 10px;
}
.tabs {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 84px;
	display: flex;
	justify-content: space-around;
	padding-top: 8px;
	pointer-events: none;
}
.tab {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	font-weight: 500;
	width: 70px;
}
.status {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 47px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 4px 30px 0 44px;
	font-family: -apple-system, "SF Pro Text", system-ui, sans-serif;
	font-weight: 600;
	font-size: 16px;
	color: #fff;
	pointer-events: none;
	z-index: 30;
	transition: color 0.3s;
}
.island {
	position: absolute;
	left: 50%;
	top: 11px;
	width: 122px;
	height: 35px;
	border-radius: 20px;
	background: #000;
	transform: translateX(-50%);
}
.sys {
	display: flex;
	align-items: center;
	gap: 6px;
}
.batt {
	width: 25px;
	height: 12px;
	border-radius: 4px;
	border: 1px solid currentColor;
	padding: 1.5px;
	opacity: 0.9;
}
.batt i {
	display: block;
	height: 100%;
	width: 80%;
	border-radius: 2px;
	background: currentColor;
}
.home {
	position: absolute;
	left: 50%;
	bottom: 8px;
	width: 134px;
	height: 5px;
	border-radius: 3px;
	background: currentColor;
	color: #fff;
	transform: translateX(-50%);
	z-index: 30;
	pointer-events: none;
}

/* ── The demo's finger ── */
.finger {
	position: absolute;
	z-index: 40;
	width: 46px;
	height: 46px;
	margin: -23px 0 0 -23px;
	border-radius: 50%;
	background: rgb(255 255 255 / 0.45);
	border: 2px solid rgb(255 255 255 / 0.85);
	box-shadow: 0 2px 10px rgb(0 0 0 / 0.25);
	pointer-events: none;
	animation: tap 0.5s ease-out both;
}
.finger.drag {
	animation: drag 0.58s cubic-bezier(0.3, 0.7, 0.3, 1) both;
}
@keyframes tap {
	0% {
		opacity: 0;
		transform: scale(1.4);
	}
	35% {
		opacity: 1;
		transform: scale(0.85);
	}
	100% {
		opacity: 0;
		transform: scale(1);
	}
}
@keyframes drag {
	0% {
		opacity: 0;
		transform: translate(0, 0);
	}
	15% {
		opacity: 1;
		transform: translate(0, 0);
	}
	85% {
		opacity: 1;
	}
	100% {
		opacity: 0;
		transform: translate(var(--dx), var(--dy));
	}
}
@media (prefers-reduced-motion: reduce) {
	.spage,
	.htrack {
		transition: none;
	}
}
</style>

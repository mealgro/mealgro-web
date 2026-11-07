<script setup lang="ts">
// The frame both signed-in areas share (vendor portal, affiliate area): the
// ink rail, a top bar with the page title and the sun/moon toggle, the page
// body, toasts and the confirm dialog. The shells (PortalShell,
// AffiliateShell) only say what goes in the rail and who is signed in; the
// look lives here and in portal.css.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { usePageContext } from "vike-vue/usePageContext";
import "./portal.css";
import logoImage from "../../assets/logo.svg";
import ConfirmHost from "./ConfirmHost.vue";
import ThemeToggle from "./ThemeToggle.vue";
import ToastHost from "./ToastHost.vue";
import { watchAlerts } from "./alertFocus";
import type { Toast } from "../../lib/portal/toast";

export type RailItem = { href: string; label: string; icon: string };

const props = defineProps<{
	/** The page title: the top bar's h1. */
	title: string;
	/** What the area is called under the logo. */
	area: string;
	homeHref: string;
	items: RailItem[];
	/** Does this rail item match the current path? */
	isActive: (href: string, path: string) => boolean;
	userName: string;
	userSub?: string;
	toasts: Toast[];
	/** The session is still being restored. */
	loading?: boolean;
	/** Restoring it failed or took too long: say so, with Retry. */
	bootError?: string;
	/** The signed-in person may not open this page: say so instead of the page. */
	denied?: boolean;
}>();
defineEmits<{ signOut: []; retry: [] }>();

const pageContext = usePageContext();
const path = computed(() => pageContext.urlPathname.replace(/\/$/, "") || props.homeHref);
const menu = ref(false);
// A new page closes the drawer.
watch(path, () => (menu.value = false));

// Below 1024px the rail is a drawer: while it is open the page behind it is
// inert, Escape closes it, and focus goes in and comes back to the button.
const narrow = ref(false);
const side = ref<HTMLElement>();
const burger = ref<HTMLElement>();
const page = ref<HTMLElement>();
let mq: MediaQueryList | undefined;
const onMq = () => {
	narrow.value = !!mq?.matches;
	if (!narrow.value) menu.value = false;
};
let stopAlerts = () => {};
onMounted(() => {
	mq = window.matchMedia("(max-width: 1023px)");
	onMq();
	mq.addEventListener("change", onMq);
});
onBeforeUnmount(() => {
	mq?.removeEventListener("change", onMq);
	stopAlerts();
});
watch(page, (el) => {
	stopAlerts();
	if (el) stopAlerts = watchAlerts(el);
});
watch(menu, async (open) => {
	if (!narrow.value) return;
	await nextTick();
	if (open) side.value?.querySelector<HTMLElement>("a, button, select")?.focus();
	else burger.value?.focus();
});
const onKeydown = (e: KeyboardEvent) => {
	if (e.key === "Escape" && menu.value && narrow.value) menu.value = false;
};
const drawerOpen = computed(() => menu.value && narrow.value);

const initials = computed(
	() =>
		props.userName
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase())
			.join("") || "·",
);
</script>

<template>
	<div class="portal pf" @keydown="onKeydown">
		<div v-if="bootError" class="pf-boot" role="alert">
			<img :src="logoImage" alt="Mealgro" />
			<p>{{ bootError }}</p>
			<button class="p-btn p-btn--primary" type="button" @click="$emit('retry')">Retry</button>
		</div>
		<div v-else-if="loading" class="pf-boot" role="status" aria-label="Loading">
			<img :src="logoImage" alt="Mealgro" />
			<span class="p-skeleton" style="width: 120px" />
		</div>
		<template v-else>
			<a class="pf-skip p-btn p-btn--primary" href="#pf-main">Skip to content</a>

			<aside id="pf-side" ref="side" class="pf-side" :class="{ open: menu }" aria-label="Navigation">
				<button class="pf-close" type="button" aria-label="Close menu" @click="menu = false">
					<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
				</button>
				<a :href="homeHref" class="pf-brand">
					<img :src="logoImage" alt="Mealgro" />
					<span class="pf-area">{{ area }}</span>
				</a>
				<slot name="rail" />
				<nav :aria-label="area">
					<ul>
						<li v-for="i in items" :key="i.href">
							<a :href="i.href" :class="{ on: isActive(i.href, path) }" :aria-current="isActive(i.href, path) ? 'page' : undefined">
								<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path :d="i.icon" />
								</svg>
								{{ i.label }}
							</a>
						</li>
					</ul>
				</nav>
				<slot name="rail-foot" />
				<div class="pf-who">
					<span class="pf-avatar" aria-hidden="true">{{ initials }}</span>
					<div class="pf-who-text">
						<strong>{{ userName }}</strong>
						<span v-if="userSub">{{ userSub }}</span>
					</div>
					<button class="p-btn p-btn--sm" type="button" @click="$emit('signOut')">Sign out</button>
				</div>
			</aside>
			<div v-if="menu" class="pf-scrim" aria-hidden="true" @click="menu = false" />

			<div class="pf-main" :inert="drawerOpen || undefined">
				<header class="pf-top">
					<button
						ref="burger"
						class="pf-burger"
						type="button"
						aria-controls="pf-side"
						:aria-expanded="menu"
						:aria-label="menu ? 'Close menu' : 'Open menu'"
						@click="menu = !menu"
					>
						<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
							<path v-if="menu" d="M6 6l12 12M18 6L6 18" />
							<path v-else d="M4 7h16M4 12h16M4 17h16" />
						</svg>
					</button>
					<h1 class="pf-title">{{ title }}</h1>
					<ThemeToggle />
				</header>
				<main id="pf-main" ref="page" class="pf-page" tabindex="-1">
					<template v-if="denied">
						<section class="card-box p-state" role="alert">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
							<h2>You don't have access to this.</h2>
							<p class="hint">Ask the owner of your store to give you access.</p>
							<a class="p-btn p-btn--sm" :href="homeHref">Go to your start page</a>
						</section>
					</template>
					<template v-else>
						<slot name="banners" />
						<div v-if="$slots.actions" class="p-toolbar"><slot name="actions" /></div>
						<slot />
					</template>
				</main>
			</div>

			<ToastHost :toasts="toasts" />
			<ConfirmHost />
		</template>
	</div>
</template>

<style scoped>
.pf-boot {
	min-height: 100vh;
	display: grid;
	place-content: center;
	justify-items: center;
	gap: 14px;
	color: var(--muted);
}
.pf-boot p {
	max-width: 32ch;
	text-align: center;
}
.pf-boot img {
	width: 88px;
	height: auto;
	filter: grayscale(1) contrast(0.6);
	opacity: 0.6;
}
.pf-skip {
	position: absolute;
	left: 12px;
	top: -80px;
	z-index: 100;
}
.pf-skip:focus {
	top: 12px;
}

/* ── The ink rail: the same in both themes ── */
.pf-side {
	position: fixed;
	inset: 0 auto 0 0;
	width: 240px;
	z-index: 60;
	display: flex;
	flex-direction: column;
	gap: 18px;
	padding: 22px 14px 16px;
	overflow-y: auto;
	background: var(--rail);
	color: var(--on-rail);
}
.pf-side :deep(.p-muted),
.pf-side :deep(.rail-label) {
	color: color-mix(in srgb, var(--on-rail) 66%, transparent);
}
.pf-close {
	display: none;
	position: absolute;
	right: 8px;
	top: 8px;
	width: 44px;
	height: 44px;
	place-items: center;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: inherit;
	cursor: pointer;
}
.pf-brand {
	display: inline-flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 4px;
	padding: 0 10px;
	text-decoration: none;
	color: inherit;
}
.pf-brand img {
	display: block;
	width: 84px;
	height: auto;
	filter: brightness(0) invert(1);
}
.pf-area {
	font-family: var(--font-display);
	font-weight: 800;
	font-size: 15px;
	letter-spacing: -0.02em;
	color: color-mix(in srgb, var(--on-rail) 78%, transparent);
}
.pf-side nav ul {
	display: flex;
	flex-direction: column;
	gap: 2px;
}
.pf-side nav a {
	display: flex;
	align-items: center;
	gap: 12px;
	min-height: 44px;
	padding: 0 16px;
	border-radius: 9999px;
	text-decoration: none;
	color: color-mix(in srgb, var(--on-rail) 84%, transparent);
	font-weight: 600;
	font-size: 14px;
}
.pf-side nav a:hover {
	background: color-mix(in srgb, var(--on-rail) 9%, transparent);
	color: var(--on-rail);
}
.pf-side nav a.on {
	background: color-mix(in srgb, var(--on-rail) 16%, transparent);
	color: var(--on-rail);
}
.pf-side nav a.on svg {
	color: var(--cat-3);
}
.pf-side :focus-visible {
	outline-color: var(--cat-3);
}
.pf-side :deep(select.p-input) {
	background: color-mix(in srgb, var(--on-rail) 10%, transparent);
	border-color: color-mix(in srgb, var(--on-rail) 28%, transparent);
	color: var(--on-rail);
	height: 40px;
	font-size: 14px;
}
.pf-side :deep(select.p-input option) {
	color: var(--ink);
	background: var(--surface);
}
.pf-who {
	margin-top: auto;
	display: grid;
	grid-template-columns: auto minmax(0, 1fr);
	align-items: center;
	gap: 4px 10px;
	padding: 14px 6px 0;
	border-top: 1px solid color-mix(in srgb, var(--on-rail) 14%, transparent);
}
.pf-who .p-btn {
	grid-column: 1 / -1;
	border-color: color-mix(in srgb, var(--on-rail) 50%, transparent);
	color: var(--on-rail);
	margin-top: 8px;
}
.pf-avatar {
	display: grid;
	place-items: center;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: var(--cat-3);
	color: var(--on-3);
	font-weight: 800;
	font-size: 13px;
	font-family: var(--font-display);
}
.pf-who-text {
	min-width: 0;
	display: flex;
	flex-direction: column;
}
.pf-who-text strong,
.pf-who-text span {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 13px;
}
.pf-who-text span {
	color: color-mix(in srgb, var(--on-rail) 66%, transparent);
}

/* ── The top bar and the page ── */
.pf-main {
	margin-left: 240px;
	min-height: 100vh;
}
.pf-top {
	position: sticky;
	top: 0;
	z-index: 40;
	display: flex;
	align-items: center;
	gap: 12px;
	height: 72px;
	padding: 0 24px;
	background: var(--surface);
	border-bottom: 1px solid var(--line);
}
.pf-title {
	flex: 1;
	min-width: 0;
	font-size: 20px;
	line-height: 1.1;
	letter-spacing: -0.03em;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.pf-burger {
	display: none;
	place-items: center;
	width: 44px;
	height: 44px;
	margin-left: -8px;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: inherit;
	cursor: pointer;
}
.pf-page {
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 24px;
	outline: none;
	min-width: 0;
}
.pf-scrim {
	display: none;
}

@media (max-width: 1023px) {
	.pf-main {
		margin-left: 0;
	}
	.pf-burger {
		display: inline-grid;
	}
	.pf-side {
		transform: translateX(-100%);
		visibility: hidden;
		transition:
			transform 0.2s var(--ease),
			visibility 0.2s;
		z-index: 80;
		width: min(280px, 86vw);
		box-shadow: 4px 0 24px color-mix(in srgb, var(--rail) 30%, transparent);
	}
	.pf-side.open {
		transform: none;
		visibility: visible;
	}
	.pf-close {
		display: inline-grid;
	}
	.pf-scrim {
		display: block;
		position: fixed;
		inset: 0;
		background: var(--scrim);
		z-index: 70;
	}
}
@media (max-width: 639px) {
	.pf-top {
		height: 64px;
		padding: 0 16px;
	}
	.pf-page {
		padding: 16px;
	}
}
</style>

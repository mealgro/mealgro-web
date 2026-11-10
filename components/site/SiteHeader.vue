<script setup lang="ts">
// The floating ink bar on the rebuilt marketing pages: logo, the site's links,
// the day/night toggle, and Get the app (which jumps to the footer's download
// band). Under 980px the links fold into a menu.
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { usePageContext } from "vike-vue/usePageContext";
import logoImage from "../../assets/logo.svg";
import ThemeToggle from "../portal/ThemeToggle.vue";
import { SITE_LINKS } from "../../lib/site/links";

const pageContext = usePageContext();
const path = computed(() => pageContext.urlPathname);
const open = ref(false);
const menuBtn = ref<HTMLButtonElement | null>(null);
const panel = ref<HTMLElement | null>(null);

function close(returnFocus = false) {
	open.value = false;
	if (returnFocus) menuBtn.value?.focus();
}
function onKey(e: KeyboardEvent) {
	if (e.key === "Escape" && open.value) close(true);
}
watch(open, (v) => {
	if (v) requestAnimationFrame(() => panel.value?.querySelector("a")?.focus());
});
watch(path, () => close());
onMounted(() => document.addEventListener("keydown", onKey));
onBeforeUnmount(() => document.removeEventListener("keydown", onKey));
</script>

<template>
	<a class="s-skip" href="#main">Skip to content</a>
	<header class="bar-wrap">
		<nav class="bar" aria-label="Main">
			<a href="/" class="logo" aria-label="Mealgro home">
				<img :src="logoImage" alt="" width="66" height="48" />
			</a>
			<ul class="links">
				<li v-for="l in SITE_LINKS" :key="l.href">
					<a :href="l.href" :aria-current="path === l.href ? 'page' : undefined">{{ l.label }}</a>
				</li>
			</ul>
			<div class="end">
				<ThemeToggle />
				<a class="get" href="#get-app">Get the app</a>
				<button
					ref="menuBtn"
					class="menu-btn"
					type="button"
					:aria-expanded="open"
					aria-controls="site-menu"
					:aria-label="open ? 'Close menu' : 'Open menu'"
					@click="open = !open"
				>
					<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
						<path v-if="open" d="m6 6 12 12M18 6 6 18" />
						<path v-else d="M4 8h16M4 16h16" />
					</svg>
				</button>
			</div>
		</nav>
		<div v-show="open" id="site-menu" ref="panel" class="sheet">
			<ul>
				<li v-for="l in SITE_LINKS" :key="l.href">
					<a :href="l.href" :aria-current="path === l.href ? 'page' : undefined" @click="close()">{{ l.label }}</a>
				</li>
				<li><a href="/account" @click="close()">Vendor portal</a></li>
			</ul>
		</div>
	</header>
</template>

<style scoped>
.bar-wrap {
	position: fixed;
	top: 12px;
	left: 0;
	right: 0;
	z-index: 100;
	padding-inline: clamp(10px, 3vw, 32px);
	pointer-events: none;
}
.bar,
.sheet {
	pointer-events: auto;
	max-width: 1240px;
	margin-inline: auto;
	color: var(--on-stage);
	background: color-mix(in srgb, var(--stage) 72%, transparent);
	backdrop-filter: blur(16px) saturate(1.4);
	-webkit-backdrop-filter: blur(16px) saturate(1.4);
	border: 1px solid color-mix(in srgb, var(--on-stage) 14%, transparent);
	--focus: var(--cat-3);
}
.bar {
	display: flex;
	align-items: center;
	gap: 16px;
	height: 64px;
	padding: 0 8px 0 18px;
	border-radius: 999px;
}
.logo {
	display: flex;
	align-items: center;
	flex: none;
}
.logo img {
	height: 34px;
	width: auto;
	filter: brightness(0) invert(1);
}
.links {
	display: flex;
	gap: 4px;
	margin-inline: auto !important;
}
.links a,
.sheet a {
	display: block;
	padding: 10px 16px;
	border-radius: 999px;
	font-size: 15px;
	font-weight: 600;
	text-decoration: none;
	transition: background 0.15s;
}
.links a:hover,
.sheet a:hover {
	background: color-mix(in srgb, var(--on-stage) 12%, transparent);
}
.links a[aria-current="page"],
.sheet a[aria-current="page"] {
	background: color-mix(in srgb, var(--on-stage) 16%, transparent);
	box-shadow: inset 0 -3px 0 var(--cat-3);
}
.end {
	display: flex;
	align-items: center;
	gap: 6px;
	flex: none;
}
.get {
	display: inline-flex;
	align-items: center;
	min-height: 46px;
	padding: 0 20px;
	border-radius: 999px;
	background: var(--cat-3);
	color: var(--on-3) !important;
	font-size: 15px;
	font-weight: 700;
	text-decoration: none;
	white-space: nowrap;
	transition: transform 0.15s var(--ease);
}
.get:active {
	transform: scale(0.97);
}
.menu-btn {
	display: none;
	place-items: center;
	width: 46px;
	height: 46px;
	border: 0;
	border-radius: 50%;
	background: color-mix(in srgb, var(--on-stage) 12%, transparent);
	color: inherit;
	cursor: pointer;
}
.sheet {
	margin-top: 8px;
	padding: 10px;
	border-radius: 1.5rem;
}
.sheet a {
	font-size: 18px;
	padding: 14px 18px;
}
@media (max-width: 979px) {
	.links {
		display: none;
	}
	.end {
		margin-left: auto;
	}
	.menu-btn {
		display: grid;
	}
}
@media (min-width: 980px) {
	.sheet {
		display: none !important;
	}
}
@media (max-width: 400px) {
	.bar {
		gap: 8px;
		padding-left: 14px;
	}
	.get {
		padding: 0 14px;
		font-size: 14px;
	}
	.logo img {
		height: 30px;
	}
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { usePageContext } from "vike-vue/usePageContext";
import "./portal.css";
import logoImage from "../../assets/logo.svg";
import ThemeSwitch from "./ThemeSwitch.vue";
import { session } from "../../lib/portal/session";
import { toasts } from "../../lib/portal/toast";
import type { Capability } from "../../lib/portal/types";

defineProps<{ title: string }>();

const pageContext = usePageContext();
const ready = ref(false);
const menu = ref(false);

type Item = { href: string; label: string; need?: Capability; icon: string };
const items: Item[] = [
	{ href: "/account", label: "Overview", need: "view-store", icon: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
	{ href: "/account/orders", label: "Orders", need: "view-orders", icon: "M6 2h12l2 5v14H4V7zM4 7h16M9 11h6" },
	{ href: "/account/reports", label: "Reports", need: "view-finances", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
	{ href: "/account/subscription", label: "Subscription", need: "manage-store", icon: "M3 8l4 4 5-7 5 7 4-4-2 11H5z" },
	{ href: "/account/branches", label: "Branches", need: "view-store", icon: "M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
	{ href: "/account/store", label: "Store", need: "view-store", icon: "M4 9l1-5h14l1 5M4 9v11h16V9M4 9a3 3 0 006 0 3 3 0 006 0 3 3 0 004 0M10 20v-5h4v5" },
	{ href: "/account/staff", label: "Staff", need: "manage-staff", icon: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21v-1a6 6 0 0112 0v1M17 11a3 3 0 100-6M22 21v-1a5 5 0 00-4-4.9" },
];
const visible = computed(() => items.filter((i) => !i.need || session.can(i.need)));
const path = computed(() => pageContext.urlPathname.replace(/\/$/, "") || "/account");
const active = (href: string) => (href === "/account" ? path.value === href : path.value.startsWith(href));

const user = session.user;
const store = session.store;
const stores = session.stores;

onMounted(async () => {
	if (!(await session.restore())) {
		location.replace("/account/login");
		return;
	}
	ready.value = true;
});
</script>

<template>
	<div class="portal">
		<div v-if="!ready" class="boot" role="status" aria-label="Loading">Loading…</div>
		<template v-else>
			<header class="mobile-bar">
				<button class="p-btn p-btn--sm" type="button" :aria-expanded="menu" @click="menu = !menu">
					Menu
				</button>
				<strong>{{ store?.display_name ?? "Mealgro" }}</strong>
			</header>

			<aside class="side p-nav" :class="{ open: menu }">
				<a href="/account" class="p-brand brand">
					<img :src="logoImage" alt="Mealgro" />
					<small>Vendor portal</small>
				</a>
				<label v-if="stores.length > 1" class="switch">
					<span class="p-muted">Branch</span>
					<select
						class="p-input"
						:value="store?.id"
						aria-label="Branch you're working on"
						@change="session.switchTo(($event.target as HTMLSelectElement).value)"
					>
						<option v-for="s in stores" :key="s.id" :value="s.id">
							{{ s.display_name }}{{ s.is_base ? " · main" : "" }}{{ s.status !== "active" ? ` · ${s.status}` : "" }}
						</option>
					</select>
				</label>
				<div v-else-if="store" class="switch single">
					<span class="p-muted">Store</span>
					<strong>{{ store.display_name }}</strong>
				</div>
				<nav aria-label="Account">
					<ul>
						<li v-for="i in visible" :key="i.href">
							<a :href="i.href" :class="{ on: active(i.href) }" :aria-current="active(i.href) ? 'page' : undefined">
								<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path :d="i.icon" />
								</svg>
								{{ i.label }}
							</a>
						</li>
					</ul>
				</nav>
				<ThemeSwitch />
				<div class="who">
					<div class="who-text">
						<strong>{{ user?.full_name || "You" }}</strong>
						<span class="p-muted">{{ store?.display_name }}</span>
					</div>
					<button class="p-btn p-btn--sm" type="button" @click="session.signOut()">Sign out</button>
				</div>
			</aside>

			<main class="main">
				<div class="main-in">
					<div class="p-page-head">
						<h1>{{ title }}</h1>
						<div class="p-row"><slot name="actions" /></div>
					</div>
					<slot />
				</div>
			</main>

			<div class="toasts" aria-live="polite">
				<div v-for="t in toasts" :key="t.id" class="p-alert" :class="{ 'p-alert--ok': t.tone === 'ok' }">
					{{ t.text }}
				</div>
			</div>
		</template>
	</div>
</template>

<style scoped>
.boot {
	min-height: 100vh;
	display: grid;
	place-items: center;
	color: var(--muted);
}
.side {
	position: fixed;
	inset: 0 auto 0 0;
	width: 232px;
	background: var(--surface);
	border-right: 1px solid var(--line);
	padding: 18px 12px;
	display: flex;
	flex-direction: column;
	gap: 18px;
	z-index: 40;
}
.brand {
	padding: 0 8px;
}
.switch {
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 0 4px;
}
.switch span {
	font-size: 12px;
}
.switch.single strong {
	font-size: 13px;
	padding: 0 4px;
}
nav ul {
	display: flex;
	flex-direction: column;
	gap: 2px;
}
nav a {
	display: flex;
	align-items: center;
	gap: 10px;
	height: 38px;
	padding: 0 10px;
	border-radius: 10px;
	text-decoration: none;
	color: var(--muted);
	font-weight: 600;
}
nav a:hover {
	background: #f4f0ec;
	color: var(--ink);
}
nav a.on {
	background: var(--brand-soft);
	color: var(--brand);
}
.who {
	margin-top: auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding: 10px 8px 0;
	border-top: 1px solid var(--line);
}
.who-text {
	min-width: 0;
	display: flex;
	flex-direction: column;
}
.who-text strong,
.who-text span {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 13px;
}
.main {
	margin-left: 232px;
	padding: 36px 40px 72px;
}
.main-in {
	max-width: 1040px;
	margin: 0 auto;
}
.mobile-bar {
	display: none;
}
.toasts {
	position: fixed;
	right: 16px;
	bottom: 16px;
	display: flex;
	flex-direction: column;
	gap: 8px;
	z-index: 80;
	max-width: 340px;
	box-shadow: none;
}
.toasts .p-alert {
	box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
	background: #fff;
	border: 1px solid var(--line);
}
.toasts .p-alert--ok {
	border-color: var(--ok);
}
@media (max-width: 860px) {
	.mobile-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		height: 52px;
		padding: 0 16px;
		background: var(--surface);
		border-bottom: 1px solid var(--line);
		position: sticky;
		top: 0;
		z-index: 30;
	}
	.side {
		transform: translateX(-100%);
		transition: transform 0.18s ease;
		box-shadow: 0 0 40px rgba(0, 0, 0, 0.2);
	}
	.side.open {
		transform: none;
	}
	.main {
		margin-left: 0;
		padding: 20px 16px 64px;
	}
}

/* v2: an ink rail in both themes, pill items. */
.side {
	--rail: #17130f;
	background: var(--rail);
	border-right: 0;
	color: #ffffff;
	padding: 22px 14px;
}
:root[data-theme="dark"] .side {
	--rail: #0d0a08;
}
@media (prefers-color-scheme: dark) {
	:root:not([data-theme="light"]) .side {
		--rail: #0d0a08;
	}
}
.side .p-muted,
.side .switch span {
	color: rgb(255 255 255 / 0.65);
}
.switch strong {
	color: #ffffff;
}
.side .p-input {
	background: rgb(255 255 255 / 0.1);
	border-color: rgb(255 255 255 / 0.25);
	color: #ffffff;
}
.side .p-input option {
	color: #17130f;
}
nav a {
	height: 42px;
	padding: 0 14px;
	border-radius: 999px;
	color: rgb(255 255 255 / 0.82);
}
nav a:hover {
	background: rgb(255 255 255 / 0.08);
	color: #ffffff;
}
nav a.on {
	background: rgb(255 255 255 / 0.16);
	color: #ffffff;
}
nav a.on svg {
	color: #ffe100;
}
.who {
	border-top-color: rgb(255 255 255 / 0.14);
}
.who-text strong {
	color: #ffffff;
}
.who .p-btn {
	white-space: nowrap;
	background: transparent;
	border-color: rgb(255 255 255 / 0.5);
	color: #ffffff;
}
.side .p-brand small {
	color: rgb(255 255 255 / 0.65);
}
.side .p-brand img {
	width: 80px;
}
.side > :nth-last-child(2) {
	margin-top: auto;
}
.who {
	margin-top: 0;
}
@media (max-width: 860px) {
	.mobile-bar {
		background: var(--rail, #17130f);
		color: #ffffff;
		border-bottom: 0;
	}
	.mobile-bar strong {
		color: #ffffff;
	}
	.mobile-bar .p-btn {
		background: transparent;
		border-color: rgb(255 255 255 / 0.5);
		color: #ffffff;
	}
}
</style>

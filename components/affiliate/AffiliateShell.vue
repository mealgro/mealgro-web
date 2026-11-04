<script setup lang="ts">
// The signed-in affiliate area's frame: sidebar, the pause/suspension
// banners and the terms gate on every page. A sibling of
// components/portal/PortalShell.vue.
import { computed, onMounted, ref } from "vue";
import { usePageContext } from "vike-vue/usePageContext";
import { LOGIN, session } from "../../lib/affiliate/session";
import PauseBanner from "./PauseBanner.vue";
import TermsGate from "./TermsGate.vue";
import logoImage from "../../assets/logo.svg";

defineProps<{ title: string }>();

const pageContext = usePageContext();
const ready = ref(false);
const menu = ref(false);

type Item = { href: string; label: string; icon: string };
const items: Item[] = [
	{ href: "/affiliate/dashboard", label: "Dashboard", icon: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
	{ href: "/affiliate/referrals", label: "Referrals", icon: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21v-1a6 6 0 0112 0v1M19 8v6M16 11h6" },
	{ href: "/affiliate/wallet", label: "Wallet", icon: "M3 7h15a3 3 0 013 3v8a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l12-4v4M17 14h.01" },
	{ href: "/affiliate/bank", label: "Bank account", icon: "M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18" },
	{ href: "/affiliate/profile", label: "Profile", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-1a7 7 0 0114 0v1" },
];
const path = computed(() => pageContext.urlPathname.replace(/\/$/, ""));
const active = (href: string) => path.value.startsWith(href);

const user = session.user;
const overview = session.overview;
const programActive = session.programActive;
const termsCurrent = session.termsCurrent;

onMounted(async () => {
	if (!(await session.restore())) {
		location.replace(LOGIN);
		return;
	}
	ready.value = true;
	// For the pause banner; a page that needs the numbers loads them itself.
	if (!session.overview.value) session.loadOverview().catch(() => {});
});
</script>

<template>
	<div v-if="!ready" class="boot" role="status" aria-label="Loading">Loading…</div>
	<template v-else>
		<a class="skip p-btn" href="#aff-main">Skip to content</a>
		<header class="mobile-bar">
			<button
				class="p-btn p-btn--sm"
				type="button"
				aria-controls="aff-side"
				:aria-expanded="menu"
				@click="menu = !menu"
			>
				{{ menu ? "Close" : "Menu" }}
			</button>
			<strong>Mealgro Affiliate</strong>
		</header>

		<aside id="aff-side" class="side p-nav" :class="{ open: menu }">
			<a href="/affiliate/dashboard" class="p-brand">
				<img :src="logoImage" alt="Mealgro" />
				<small>Affiliate program</small>
			</a>
			<div v-if="user" class="code">
				<span class="p-muted">Your code</span>
				<strong>{{ user.code }}</strong>
			</div>
			<nav aria-label="Affiliate account">
				<ul>
					<li v-for="i in items" :key="i.href">
						<a
							:href="i.href"
							:class="{ on: active(i.href) }"
							:aria-current="active(i.href) ? 'page' : undefined"
						>
							<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path :d="i.icon" />
							</svg>
							{{ i.label }}
						</a>
					</li>
				</ul>
			</nav>
			<a class="more" href="/affiliate?view=public">How the program works</a>
			<div class="who">
				<div class="who-text">
					<strong>{{ user?.full_name || "You" }}</strong>
					<span class="p-muted">{{ user?.email }}</span>
				</div>
				<button class="p-btn p-btn--sm" type="button" @click="session.signOut()">Sign out</button>
			</div>
		</aside>
		<div v-if="menu" class="scrim" aria-hidden="true" @click="menu = false" />

		<main id="aff-main" class="main" tabindex="-1">
			<div class="main-in p-stack">
				<PauseBanner
					v-if="!programActive"
					variant="account"
					:message="overview?.program_message"
				/>
				<div v-if="user?.status === 'suspended'" class="aff-banner aff-banner--bad" role="status">
					<p>
						<strong>Your account is suspended.</strong>
						You can sign in and read your account, but you can't withdraw or make changes.
						<template v-if="user.status_reason"> Reason: {{ user.status_reason }}</template>
					</p>
				</div>
				<TermsGate v-if="!termsCurrent" />
				<div class="p-page-head">
					<h1>{{ title }}</h1>
					<div class="p-row"><slot name="actions" /></div>
				</div>
				<slot />
			</div>
		</main>
	</template>
</template>

<style scoped>
.boot {
	min-height: 100vh;
	display: grid;
	place-items: center;
	color: var(--muted);
}
.skip {
	position: absolute;
	left: 12px;
	top: -60px;
	z-index: 100;
}
.skip:focus {
	top: 12px;
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
	overflow-y: auto;
}
.side > .p-brand {
	padding: 0 8px;
}
.code {
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 10px 12px;
	border-radius: 10px;
	background: var(--brand-soft);
}
.code span {
	font-size: 12px;
}
.code strong {
	font-size: 16px;
	letter-spacing: 0.06em;
	color: var(--brand);
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
	height: 40px;
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
.more {
	font-size: 13px;
	color: var(--muted);
	padding: 0 10px;
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
	padding: 28px 32px 64px;
	outline: none;
}
.main-in {
	max-width: 1040px;
	margin: 0 auto;
	gap: 16px;
}
.main-in > .p-page-head {
	margin-bottom: 4px;
}
.mobile-bar,
.scrim {
	display: none;
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
		visibility: hidden;
		transition:
			transform 0.18s ease,
			visibility 0.18s;
		box-shadow: 0 0 40px rgba(0, 0, 0, 0.2);
	}
	.side.open {
		transform: none;
		visibility: visible;
	}
	.scrim {
		display: block;
		position: fixed;
		inset: 0;
		background: rgba(23, 19, 15, 0.35);
		z-index: 35;
	}
	.main {
		margin-left: 0;
		padding: 20px 16px 64px;
	}
}

/* v2: an ink rail in both themes, pill items. */
.side {
	--rail: #12121c;
	background: var(--rail);
	border-right: 0;
	color: #ffffff;
	padding: 22px 14px;
}
@media (prefers-color-scheme: dark) {
	.side {
		--rail: #0a0a12;
	}
}
.side .p-muted,
.side .more {
	color: rgb(255 255 255 / 0.62);
}
.side .more:hover {
	color: #ffffff;
}
.code {
	background: rgb(255 255 255 / 0.1);
	border-radius: 20px;
	padding: 12px 16px;
}
.code strong {
	color: #ffc52e;
	font-family: "Bricolage Grotesque Variable", system-ui, sans-serif;
	font-weight: 800;
	font-size: 20px;
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
	color: #ffc52e;
}
.who {
	border-top-color: rgb(255 255 255 / 0.14);
}
.who .p-btn {
	white-space: nowrap;
	background: transparent;
	border-color: rgb(255 255 255 / 0.5);
	color: #ffffff;
}
.side .p-brand small {
	color: rgb(255 255 255 / 0.62);
}
.side .p-brand img {
	width: 80px;
}
@media (max-width: 860px) {
	.mobile-bar {
		background: var(--rail, #12121c);
		color: #ffffff;
		border-bottom: 0;
	}
	.mobile-bar .p-btn {
		background: transparent;
		border-color: rgb(255 255 255 / 0.5);
		color: #ffffff;
	}
}
</style>

<script setup lang="ts">
// Sign-in and sign-up for both areas: an ink panel with the brand and a line
// about the area, and the form card beside it (above it on phones). One bold
// panel per page, as everywhere else.
import "./portal.css";
import logoImage from "../../assets/logo.svg";
import ThemeToggle from "./ThemeToggle.vue";

withDefaults(
	defineProps<{
		/** What the area is called under the logo. */
		area: string;
		/** Display headline on the ink panel. */
		headline: string;
		tagline?: string;
		homeHref?: string;
		/** A slightly wider card (sign-up). */
		wide?: boolean;
	}>(),
	{ tagline: undefined, homeHref: "/" },
);
</script>

<template>
	<div class="portal au">
		<aside class="au-hero">
			<a :href="homeHref" class="au-brand">
				<img :src="logoImage" alt="Mealgro" />
				<span>{{ area }}</span>
			</a>
			<div class="au-copy">
				<p class="au-headline disp">{{ headline }}</p>
				<p v-if="tagline" class="au-tag">{{ tagline }}</p>
			</div>
			<div class="au-shapes" aria-hidden="true">
				<span class="sh sh-sq" style="--c: var(--cat-1)" />
				<span class="sh sh-ci" style="--c: var(--cat-2)" />
				<span class="sh sh-cd" style="--c: var(--cat-3)" />
				<span class="sh sh-di" style="--c: var(--cat-4)" />
				<span class="sh sh-tr" style="--c: var(--on-hero)" />
			</div>
		</aside>
		<main class="au-main">
			<div class="au-top">
				<div class="au-top-slot"><slot name="top" /></div>
				<ThemeToggle />
			</div>
			<div class="au-card card-box arrive" :class="{ 'au-card--wide': wide }">
				<slot />
			</div>
		</main>
	</div>
</template>

<style scoped>
.au {
	display: grid;
	grid-template-columns: minmax(320px, 5fr) 7fr;
	min-height: 100vh;
	padding: 16px;
	gap: 16px;
}
.au-hero {
	position: sticky;
	top: 16px;
	align-self: start;
	min-height: calc(100dvh - 32px);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	gap: 32px;
	padding: 32px;
	border-radius: 2rem;
	background: var(--hero);
	color: var(--on-hero);
}
.au-hero::after {
	content: "";
	position: absolute;
	right: -80px;
	bottom: -80px;
	width: 260px;
	height: 260px;
	border-radius: 50%;
	border: 36px solid currentColor;
	opacity: 0.06;
	pointer-events: none;
}
.au-brand {
	display: inline-flex;
	flex-direction: column;
	gap: 4px;
	text-decoration: none;
	color: inherit;
	align-self: flex-start;
}
.au-brand img {
	width: 96px;
	height: auto;
	filter: brightness(0) invert(1);
}
.au-brand span {
	font-family: var(--font-display);
	font-weight: 800;
	font-size: 15px;
	letter-spacing: -0.02em;
	opacity: 0.8;
}
.au-copy {
	margin-top: auto;
	position: relative;
	z-index: 1;
}
.au-headline {
	font-size: clamp(34px, 4.2vw, 56px);
	line-height: 1;
	letter-spacing: -0.04em;
}
.au-tag {
	margin-top: 14px;
	max-width: 34ch;
	opacity: 0.76;
}
.au-shapes {
	display: flex;
	align-items: center;
	gap: 18px;
	position: relative;
	z-index: 1;
}
.au-shapes .sh {
	width: 26px;
	height: 26px;
}
.au-shapes .sh-cd {
	width: 38px;
	height: 24px;
}
.au-main {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 8px 24px;
	min-width: 0;
}
.au-top {
	align-self: stretch;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	min-height: 48px;
}
.au-top-slot {
	display: flex;
	align-items: center;
	gap: 16px;
	font-size: 14px;
}
.au-card {
	margin: auto 0;
	width: 100%;
	max-width: 420px;
	display: flex;
	flex-direction: column;
	gap: 22px;
	padding: 36px 32px;
}
.au-card--wide {
	max-width: 520px;
}
@media (max-width: 900px) {
	.au {
		grid-template-columns: 1fr;
		grid-auto-rows: min-content;
		align-content: start;
		padding: 12px;
	}
	.au-hero {
		position: relative;
		top: auto;
		min-height: 0;
		padding: 22px 22px 24px;
		gap: 20px;
	}
	.au-headline {
		font-size: clamp(28px, 8vw, 38px);
	}
	.au-tag,
	.au-shapes {
		display: none;
	}
	.au-copy {
		margin-top: 0;
	}
	.au-card {
		margin: 8px 0 0;
		padding: 28px 22px;
	}
}
</style>

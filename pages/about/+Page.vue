<template>
	<div class="about-page">
		<!-- Mobile/Tablet Header -->
		<div class="mobile-header">
			<div class="mobile-logo-container">
				<a href="/">
					<img
						:src="logoImage"
						alt="Mealgro Logo"
						class="mobile-logo"
					/>
				</a>
			</div>
			<button
				class="mobile-menu-button"
				type="button"
				:aria-expanded="isMobileMenuOpen"
				aria-controls="mobile-nav-menu"
				@click="toggleMobileMenu"
			>
				<span class="sr-only">Toggle navigation menu</span>
				<svg
					v-if="!isMobileMenuOpen"
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M3 12H21M3 6H21M3 18H21"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
				<svg
					v-else
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M6 6L18 18"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<path
						d="M18 6L6 18"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>

		<transition name="mobile-menu">
			<nav
				v-if="isMobileMenuOpen"
				id="mobile-nav-menu"
				class="mobile-menu-panel"
			>
				<a
					v-for="link in mobileNavLinks"
					:key="link.href"
					:href="link.href"
					class="mobile-menu-link"
					@click="closeMobileMenu"
				>
					<span>{{ link.label }}</span>
					<svg
						v-if="link.hasDropdown"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M4 6L8 10L12 6"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</a>
			</nav>
		</transition>

		<main class="doc">
			<header class="doc-hero">
				<p class="doc-eyebrow">About MealGro</p>
				<h1 class="doc-title">{{ heroTitle }}</h1>
				<p class="doc-subheadline">{{ heroSubheadline }}</p>
			</header>

			<article class="doc-sheet">
				<div class="markdown-content" v-html="renderedContent"></div>
			</article>
		</main>

		<button
			v-show="showBackToTop"
			class="back-to-top"
			type="button"
			aria-label="Back to top"
			@click="scrollToTop"
		>
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12 19V5M12 5L5 12M12 5L19 12"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>

		<div class="footer-spacer"></div>
		<Footer />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { marked } from "marked";
import logoImage from "../../assets/logo.svg";
import Footer from "../../components/shared/Footer.vue";
import { navLinks } from "../../components/shared/navLinks";

const heroTitle = "Food, discovered.";
const heroSubheadline =
	"MealGro is Africa's first video-first food discovery platform — where every meal has a story, and every story leads to a plate at your door.";

const isMobileMenuOpen = ref(false);
const renderedContent = ref("");
const showBackToTop = ref(false);

const mobileNavLinks = computed(() => {
	return navLinks.filter((link) => link.href !== "/");
});

const toggleMobileMenu = () => {
	isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
	isMobileMenuOpen.value = false;
};

const handleEscape = (event: KeyboardEvent) => {
	if (event.key === "Escape") {
		closeMobileMenu();
	}
};

const prefersReducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrollToTop = () => {
	window.scrollTo({
		top: 0,
		behavior: prefersReducedMotion() ? "auto" : "smooth",
	});
};

const handleScroll = () => {
	showBackToTop.value = window.scrollY > 640;
};

const fetchAboutContent = async () => {
	const content = `## Our Story

MealGro didn't start with a delivery problem. It started with a scrolling habit.

Every day, millions of Africans open their phones and lose themselves in short videos — a dance, a joke, a moment. Somewhere in that same scroll, a plate of jollof rice sizzles in a pan, steam rising off suya on an open grill, a chef's hands folding dough into something you suddenly need to taste.

And then the video ends. The craving stays. But the app can't do anything about it.

We built MealGro to close that gap — between wanting and getting, between watching and tasting. Not another food delivery app bolted onto an old idea, but a new way to discover food entirely, built for how people already spend their time.

**We didn't ask how to deliver food faster. We asked why food ordering still feels boring.**

---

## The Problem

Africa's food delivery experience hasn't evolved. It's been copied, not created.

Customers scroll through walls of text and static thumbnails, guessing what a meal actually looks like — or tastes like — before they commit to it. Photos go stale. Menus go generic. One plate looks like the next.

Restaurants that can't afford ads disappear into the noise, no matter how good their food is. Small vendors — the backbone of African food culture — remain invisible in a system built for whoever pays the most, not whoever cooks the best.

Meanwhile, the same customers spend hours a day watching short-form video on other platforms, fully engaged, fully entertained — and then step into a food app that feels like a spreadsheet.

**The food is incredible. The experience isn't.**

---

## Why Traditional Food Delivery Is Broken

Traditional platforms were built around one idea: search and select. That model made sense a decade ago. It doesn't anymore.

It rewards whoever spends the most on ads, not whoever makes the best food. It gives customers no real sense of what they're ordering until it arrives. It turns restaurants into rows in a directory instead of brands with a voice.

Static menus can't capture the sound of a grill, the pull of melted cheese, the color of a fresh sauce. They were never designed to make you feel something. They were designed to be searched — not discovered.

**A menu tells you what's available. A video tells you why you want it.**

---

## Our Solution

MealGro turns food ordering into discovery.

Restaurants and vendors post short, authentic videos of their meals — real food, real preparation, real personality. Customers watch, get pulled in, and order in seconds, without ever leaving the moment of craving.

Every video becomes a storefront. Every restaurant becomes a creator. Every meal becomes content people want to share, not just consume.

Instead of searching for food, people discover it — the same way they discover music, trends, and culture: by watching something they didn't know they needed, until suddenly they did.

**We didn't digitize the menu. We replaced it.**

---

## Why Video Changes Everything

Video doesn't just show food. It sells a feeling.

It captures the crackle of hot oil, the steam off a fresh pot, the pride on a chef's face. It builds trust instantly, because customers see exactly what they're getting before they order — no guesswork, no disappointment.

For restaurants, video is the great equalizer. A small vendor with a phone and real skill can now compete with anyone, purely on the strength of their food. Virality replaces advertising budgets as the great equalizer.

For customers, ordering becomes entertainment instead of a chore — something they look forward to, not something they tolerate.

**On MealGro, the best dish doesn't need the biggest budget. It needs to be real.**

---

## Why Africa Needs MealGro

Africa isn't behind. Africa is different — and it deserves products built for that difference, not products borrowed from somewhere else.

The continent has one of the youngest, fastest-growing digital populations on Earth. Smartphone adoption is climbing. Internet access is expanding into cities and towns that were offline just a few years ago. Food delivery is growing fast across major markets — but the experience powering it hasn't caught up.

MealGro is built from the ground up for African consumers, African restaurants, African vendors, and African logistics — not adapted from a Western template and localized after the fact.

We understand the informal food economy, the power of word-of-mouth, the culture of sharing a good find with everyone you know. We're building for that reality, not around it.

**This isn't a Western app with an African skin. This is an African product, built for how Africa actually eats, shares, and discovers.**

---

## Our Vision

We believe the future of commerce is video.

We believe the future of food discovery is social.

We believe the future of ordering is frictionless — from craving to checkout in seconds, not minutes.

MealGro sits at the intersection of all three. We're building the platform where content becomes commerce, and where every meal — from a five-star kitchen to a roadside grill — has a real chance to go viral.

**We're not building a bigger delivery app. We're building the future format of food itself.**

---

## Our Mission

To become Africa's most engaging food discovery platform — empowering restaurants, creators, vendors, and customers through video-first commerce.

We measure our success not just in orders delivered, but in small vendors discovered, restaurants built into brands, and customers who fall in love with food again.

**Our job isn't to move meals. It's to move culture.**

---

## Our Core Values

**Innovation** — We build what should exist, not what already does.

**Community** — Restaurants, vendors, riders, and customers grow together, not apart.

**Transparency** — What you see is what you get. No stale photos, no false promises.

**Speed** — From craving to delivery, every second counts.

**Creativity** — We give every kitchen a stage, no matter its size.

**Trust** — Real food, real people, real experiences — every time.

**Empowerment** — We hand the mic to the people who've earned it: the ones actually cooking.

---

## Why Restaurants Love MealGro

For the first time, restaurants don't need a marketing budget to be seen — they need great food and a phone.

MealGro gives every restaurant, from established chains to a single-table vendor, a platform to show their food exactly as it is: real, hot, and made with pride. No expensive photoshoots. No paying to be seen. Just great content, discovered by the people who want it most.

A single video can do what months of advertising couldn't — turn an unknown vendor into the most-ordered kitchen in their neighborhood, overnight.

**On MealGro, going viral is the new advertising budget.**

---

## Why Customers Love MealGro

Customers don't want to search anymore. They want to discover.

MealGro turns the moment before ordering — usually the most boring part of the experience — into the most exciting part. Scrolling becomes tasting. Watching becomes wanting. Wanting becomes ordering, all within the same breath.

No more guessing what a dish looks like. No more disappointment when reality doesn't match the photo. Just real food, shown honestly, delivered fast.

**Customers don't come to MealGro to order food. They come because they can't stop watching it.**

---

## Why Delivery Partners Win

Delivery partners are the final, essential link between discovery and satisfaction — and MealGro is built to make that link as fast and fair as possible.

As demand grows through viral discovery, so does opportunity. More engagement means more orders, more consistent routes, and more earning potential for the people making delivery possible every single day.

**When a meal goes viral, delivery partners are the ones who get it there.**

---

## The Future We're Building

We're building toward a future where food discovery in Africa looks nothing like it does today.

A future where every small vendor has the same shot at being seen as the biggest restaurant chain. Where customers open an app expecting to be delighted, not just fed. Where a fifteen-second video can change a family business forever.

A future where content and commerce aren't separate experiences, but one seamless moment — from the first bite you see, to the first bite you take.

We're not just building a delivery platform. We're building the infrastructure for how an entire continent will discover food for the next generation.

**This is bigger than an app. This is a new category — and we're building it first.**

---

## Closing Call to Action

Food deserves better than a static menu. Africa deserves better than a copied experience.

MealGro is where food comes alive — where every dish gets to be seen, every restaurant gets to be discovered, and every craving gets satisfied in seconds, not scrolls.

**Watch. Crave. Order. Repeat.**

**This is MealGro — and this is just the beginning.**`;

	marked.setOptions({
		breaks: true,
		gfm: true,
	});

	const html = await marked.parse(content);

	const container = document.createElement("div");
	container.innerHTML = html;

	// "Our Core Values" is a run of `**Label** — description` paragraphs;
	// present them as a grid instead of a flat stack of lines.
	const valuesHeading = Array.from(container.querySelectorAll("h2")).find(
		(heading) => heading.textContent?.trim() === "Our Core Values",
	);
	if (valuesHeading) {
		const grid = document.createElement("div");
		grid.className = "values-grid";
		let node = valuesHeading.nextElementSibling;
		while (node && node.tagName === "P") {
			const next = node.nextElementSibling;
			const match = node.innerHTML.match(
				/^<strong>(.*?)<\/strong>\s*—\s*(.*)$/,
			);
			if (match) {
				const [, label, description] = match;
				const cardEl = document.createElement("div");
				cardEl.className = "value-card";
				cardEl.innerHTML = `<p class="value-title">${label}</p><p class="value-desc">${description}</p>`;
				grid.appendChild(cardEl);
			}
			node.remove();
			node = next;
		}
		valuesHeading.after(grid);
	}

	// Whole-paragraph bold lines are pull-quotes closing out each section.
	container.querySelectorAll("p").forEach((paragraph) => {
		if (
			paragraph.childNodes.length === 1 &&
			paragraph.firstElementChild?.tagName === "STRONG"
		) {
			paragraph.classList.add("pull-quote");
		}
	});

	renderedContent.value = container.innerHTML;
};

onMounted(() => {
	window.addEventListener("keydown", handleEscape);
	window.addEventListener("scroll", handleScroll, { passive: true });
	fetchAboutContent();
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleEscape);
	window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.about-page {
	--paper: #f6f6f6;
	--paper-line: rgba(23, 19, 15, 0.12);
	--ink: #17130f;
	--ink-soft: rgba(23, 19, 15, 0.64);
	--brand-red: #d62300;
	--brand-red-soft: rgba(214, 35, 0, 0.08);
	--brand-yellow: #ffe100;
	--card: #ffffff;
	--mono: ui-monospace, "SF Mono", "SFMono-Regular", Menlo, Consolas,
		monospace;

	background: var(--paper);
	color: var(--ink);
}

.doc {
	max-width: 900px;
	margin: 0 auto;
	padding: clamp(120px, 14vw, 176px) clamp(20px, 4vw, 40px)
		clamp(64px, 8vw, 96px);
}

/* Hero */
.doc-hero {
	max-width: 720px;
	margin: 0 auto clamp(40px, 6vw, 64px);
	text-align: center;
}

.doc-eyebrow {
	font-family: var(--mono);
	font-size: 12px;
	font-weight: 500;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: var(--brand-red);
	margin: 0 0 16px;
}

.doc-title {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 800;
	font-size: clamp(44px, 7vw, 76px);
	line-height: 1.05;
	letter-spacing: -0.02em;
	margin: 0 0 clamp(20px, 3vw, 28px);
}

.doc-subheadline {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 500;
	font-size: clamp(18px, 2.2vw, 22px);
	line-height: 1.6;
	color: var(--ink-soft);
	margin: 0;
}

.doc-sheet {
	background: var(--card);
	border-radius: 28px;
	padding: clamp(32px, 5vw, 64px);
	box-shadow: 0 24px 60px rgba(23, 19, 15, 0.08);
}

/* Back to top */
.back-to-top {
	position: fixed;
	right: clamp(16px, 3vw, 32px);
	bottom: clamp(16px, 3vw, 32px);
	width: 48px;
	height: 48px;
	border-radius: 50%;
	border: none;
	background: var(--brand-red, #d62300);
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	box-shadow: 0 10px 24px rgba(214, 35, 0, 0.35);
	transition: transform 0.15s ease, opacity 0.15s ease;
	z-index: 50;
}

.back-to-top:hover {
	transform: translateY(-2px);
}

.footer-spacer {
	background: #000000;
	height: clamp(60px, 8vw, 100px);
}

/* Mobile Header */
.mobile-header {
	display: none;
}

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}

:focus-visible {
	outline: 2px solid var(--brand-red, #d62300);
	outline-offset: 2px;
}

@media (max-width: 1024px) {
	.mobile-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		width: 100vw;
		box-sizing: border-box;
		background: rgba(214, 35, 0, 0.95);
		backdrop-filter: blur(10px);
	}

	.mobile-logo-container {
		display: flex;
		align-items: center;
		gap: 12px;
		background: white;
		border-radius: 50px;
		padding: 8px 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.mobile-logo-container a {
		display: flex;
		align-items: center;
		text-decoration: none;
		cursor: pointer;
	}

	.mobile-logo {
		height: 24px;
		width: auto;
		pointer-events: none;
	}

	.mobile-menu-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: white;
		border-radius: 50%;
		border: none;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		color: #0e172b;
	}

	.mobile-menu-panel {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 20px;
		position: fixed;
		top: 72px;
		left: 0;
		right: 0;
		background: #ffffff;
		border-radius: 0 0 24px 24px;
		box-shadow: 0 10px 30px rgba(14, 23, 43, 0.12);
		z-index: 95;
	}

	.mobile-menu-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-decoration: none;
		font-family: "MADE Tommy Soft", sans-serif;
		font-size: 15px;
		line-height: 150%;
		color: #0e172b;
		padding: 10px 0;
		border-bottom: 1px solid rgba(14, 23, 43, 0.07);
	}

	.mobile-menu-link:last-of-type {
		border-bottom: none;
	}

	.mobile-menu-enter-active,
	.mobile-menu-leave-active {
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.mobile-menu-enter-from,
	.mobile-menu-leave-to {
		opacity: 0;
		transform: translateY(-10px);
	}

	.doc {
		padding-top: clamp(100px, 15vw, 180px);
	}
}

@media (prefers-reduced-motion: reduce) {
	.back-to-top,
	.mobile-menu-enter-active,
	.mobile-menu-leave-active {
		transition: none !important;
	}
}
</style>

<!--
	Unscoped on purpose: Vue's scoped-CSS attribute is only applied to nodes the
	compiler sees in this template. Everything below lives inside `v-html`, so a
	scoped selector such as `.markdown-content h2[data-v-xxx]` would silently
	never match. These class names are specific to this document body.
-->
<style>
.about-page .markdown-content {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 400;
	font-size: clamp(16px, 1.6vw, 18px);
	line-height: 1.75;
	color: var(--ink, #17130f);
}

.about-page .markdown-content p {
	margin: 0 0 clamp(18px, 2.5vw, 22px);
	color: var(--ink-soft, rgba(23, 19, 15, 0.64));
}

.about-page .markdown-content h2 {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 800;
	font-size: clamp(26px, 3.4vw, 36px);
	line-height: 1.25;
	letter-spacing: -0.01em;
	color: var(--ink, #17130f);
	margin: clamp(40px, 6vw, 56px) 0 clamp(18px, 2.5vw, 24px);
}

.about-page .markdown-content h2:first-child {
	margin-top: 0;
}

.about-page .markdown-content strong {
	color: var(--ink, #17130f);
	font-weight: 700;
}

.about-page .markdown-content .pull-quote {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 700;
	font-size: clamp(22px, 2.8vw, 30px);
	line-height: 1.35;
	letter-spacing: -0.01em;
	color: var(--brand-red, #d62300);
	border-left: 3px solid var(--brand-red, #d62300);
	padding-left: clamp(16px, 2.5vw, 24px);
	margin: clamp(28px, 4vw, 36px) 0;
}

.about-page .markdown-content .pull-quote strong {
	color: inherit;
	font-weight: inherit;
}

.about-page .markdown-content hr {
	border: none;
	border-top: 2px solid var(--brand-red, #d62300);
	width: 64px;
	margin: clamp(40px, 6vw, 56px) auto;
	opacity: 0.4;
}

.about-page .markdown-content .values-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: clamp(14px, 2vw, 20px);
	margin: 0 0 clamp(18px, 2.5vw, 22px);
}

.about-page .markdown-content .value-card {
	padding: clamp(18px, 2.5vw, 24px);
	background: var(--brand-red-soft, rgba(214, 35, 0, 0.08));
	border-radius: 16px;
}

.about-page .markdown-content .value-title {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 700;
	font-size: clamp(17px, 2vw, 19px);
	color: var(--brand-red, #d62300);
	margin: 0 0 8px;
}

.about-page .markdown-content .value-desc {
	font-size: 0.9em;
	line-height: 1.6;
	color: var(--ink-soft, rgba(23, 19, 15, 0.64));
	margin: 0;
}
</style>

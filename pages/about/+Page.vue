<template>
	<SitePage>
		<DocHero label="About MealGro" :title="heroTitle" :lead="heroSubheadline" />
		<section class="s-section about">
			<div class="s-wrap">
				<article class="s-card sheet">
					<!-- eslint-disable-next-line vue/no-v-html -- our own markdown, written below -->
					<div class="s-prose" v-html="renderedContent" />
				</article>
			</div>
		</section>
		<button v-show="showBackToTop" class="to-top" type="button" aria-label="Back to top" @click="scrollToTop">
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
		</button>
	</SitePage>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { marked } from "marked";
import SitePage from "../../components/site/SitePage.vue";
import DocHero from "../../components/site/DocHero.vue";

const heroTitle = "Food, discovered.";
const heroSubheadline =
	"MealGro is Africa's first video-first food discovery platform — where every meal has a story, and every story leads to a plate at your door.";

const renderedContent = ref("");
const showBackToTop = ref(false);

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
	window.addEventListener("scroll", handleScroll, { passive: true });
	fetchAboutContent();
});

onUnmounted(() => {
	window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.sheet {
	max-width: 880px;
	margin: 0 auto;
	padding: clamp(24px, 5vw, 64px);
}
.sheet .s-prose {
	margin: 0 auto;
}
.to-top {
	position: fixed;
	right: 20px;
	bottom: 20px;
	z-index: 50;
	display: grid;
	place-items: center;
	width: 48px;
	height: 48px;
	border: 0;
	border-radius: 50%;
	background: var(--ink);
	color: var(--surface);
	cursor: pointer;
}
@media (max-width: 560px) {
	.about {
		padding-top: 24px;
	}
	.sheet {
		padding: 22px 18px;
		border-radius: 1.5rem;
	}
}
</style>

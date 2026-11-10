<script setup lang="ts">
import SitePage from "../../components/site/SitePage.vue";
import FeedStory from "../../components/site/FeedStory.vue";
import FeedClip from "../../components/site/FeedClip.vue";

const steps = [
	{
		title: "Watch",
		text: "Scroll short videos from kitchens that deliver to you. Every one is a dish you can order.",
		shape: "sh-sq",
	},
	{
		title: "Add to cart",
		text: "Tap Add to cart on the video, or open the store's menu for the rest of what it makes.",
		shape: "sh-ci",
	},
	{
		title: "Pay",
		text: "Check out in the app. Your order goes straight to the kitchen.",
		shape: "sh-cd",
	},
	{
		title: "Track",
		text: "A Mealgro rider picks it up and you follow them on the map to your door.",
		shape: "sh-di",
	},
];

const faqs = [
	{
		q: "What is Mealgro?",
		a: "A food delivery app built around video. Restaurants and home kitchens post short clips of what they cook; you scroll them, order from the one you want, and a Mealgro rider brings it to you.",
	},
	{
		q: "Where can I order?",
		a: "Mealgro is live in selected cities and adds more over time. Open the app to see the kitchens that deliver to your address.",
	},
	{
		q: "Can I find local meals?",
		a: "Yes. Jollof, suya, swallow and soup, small chops: whatever the kitchens near you cook is on the feed, alongside everything else.",
	},
	{
		q: "Do I order from the video?",
		a: "Yes. Each video has an Add to cart button with the price on it. You can also open the store from the video to order anything else on its menu.",
	},
	{
		q: "Is Mealgro on iPhone and Android?",
		a: "Yes, Mealgro is on both. The same app also lets you run a store if you sell food.",
	},
];
</script>

<template>
	<SitePage>
		<FeedStory />

		<section id="how" class="s-section" aria-labelledby="how-h">
			<div class="s-wrap">
				<div class="s-head">
					<h2 id="how-h" class="s-h2">From scroll to your door</h2>
					<p class="s-lead s-muted">Four steps, all in the app.</p>
				</div>
				<ol class="bento">
					<li v-for="(s, i) in steps" :key="s.title" class="s-step" :class="[`tone-${i + 1}`, `b${i + 1}`]">
						<div class="s-step-n">
							<span>{{ i + 1 }}</span>
							<span class="sh" :class="s.shape" aria-hidden="true" />
						</div>
						<h3 class="s-h3">{{ s.title }}</h3>
						<p>{{ s.text }}</p>
						<div v-if="i === 0" class="b1-clip" aria-hidden="true">
							<FeedClip id="noodles" />
						</div>
					</li>
				</ol>
			</div>
		</section>

		<section class="s-section people" aria-labelledby="people-h">
			<div class="s-wrap">
				<div class="s-head">
					<h2 id="people-h" class="s-h2">Cook, ride, or bring kitchens in</h2>
					<p class="s-lead s-muted">
						Every order on Mealgro is cooked by a vendor and carried by a rider. There's room
						for you on either side, and a reward for bringing new kitchens.
					</p>
				</div>
				<div class="doors">
					<a class="door photo" href="/vendors">
						<img src="/media/photo/vendor_2.webp" alt="" loading="lazy" decoding="async" width="1000" height="1000" />
						<div class="door-body">
							<span class="sh sh-sq" style="--c: var(--cat-1)" aria-hidden="true" />
							<h3 class="s-h3">Sell on Mealgro</h3>
							<p>Post videos of what you cook and take orders from people nearby. We bring the riders.</p>
							<span class="door-cta">Become a vendor</span>
						</div>
					</a>
					<a class="door photo" href="/riders">
						<img src="/media/photo/rider_deliver.webp" alt="" loading="lazy" decoding="async" width="1000" height="1000" />
						<div class="door-body">
							<span class="sh sh-cd" style="--c: var(--cat-3)" aria-hidden="true" />
							<h3 class="s-h3">Ride with Mealgro</h3>
							<p>Deliver on your own hours by motorcycle, bicycle or car, and see every naira you earn in the app.</p>
							<span class="door-cta">Become a rider</span>
						</div>
					</a>
					<a class="door tone-2" href="/affiliate">
						<span class="big-shape" aria-hidden="true" />
						<div class="door-body">
							<span class="sh sh-ci" style="--c: var(--on-2)" aria-hidden="true" />
							<h3 class="s-h3">Bring kitchens, get paid</h3>
							<p>Know restaurants and food sellers? Earn a cash reward for every vendor we approve with your code.</p>
							<span class="door-cta">Become an affiliate</span>
						</div>
					</a>
				</div>
			</div>
		</section>

		<section class="s-section faq-sec" aria-labelledby="faq-h">
			<div class="s-wrap faq-grid">
				<h2 id="faq-h" class="s-h2">Questions</h2>
				<div class="s-faq">
					<details v-for="f in faqs" :key="f.q">
						<summary>{{ f.q }}</summary>
						<p>{{ f.a }}</p>
					</details>
				</div>
			</div>
		</section>
	</SitePage>
</template>

<style scoped>
.bento {
	display: grid;
	gap: 16px;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	grid-template-rows: auto auto;
}
.b1 {
	grid-column: span 2;
	grid-row: span 2;
	min-height: 460px;
	padding-right: 46%;
	overflow: hidden;
}
.b4 {
	grid-column: span 2;
}
.b1-clip {
	position: absolute;
	top: 20px;
	right: 20px;
	bottom: 20px;
	width: calc(46% - 28px);
	border-radius: 1.25rem;
	overflow: hidden;
	background: var(--stage);
}
.doors {
	display: grid;
	gap: 16px;
	grid-template-columns: repeat(3, minmax(0, 1fr));
}
.door {
	position: relative;
	display: flex;
	align-items: flex-end;
	min-height: 520px;
	border-radius: 1.75rem;
	overflow: hidden;
	text-decoration: none;
	isolation: isolate;
}
.door.photo {
	color: var(--on-stage);
	background: var(--stage);
}
.door.photo img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	z-index: -1;
	transition: transform 0.6s var(--ease);
}
.door.photo::after {
	content: "";
	position: absolute;
	inset: 0;
	z-index: -1;
	background: linear-gradient(to top, color-mix(in srgb, var(--stage) 92%, transparent), color-mix(in srgb, var(--stage) 30%, transparent) 55%, transparent 75%);
}
.door:hover img {
	transform: scale(1.04);
}
.door-body {
	display: grid;
	gap: 10px;
	padding: 28px;
	justify-items: start;
}
.door-body p {
	font-size: 16px;
	max-width: 34ch;
}
.door.photo .door-body p {
	color: color-mix(in srgb, var(--on-stage) 84%, var(--stage));
}
.door-cta {
	margin-top: 8px;
	display: inline-flex;
	align-items: center;
	min-height: 46px;
	padding: 0 20px;
	border-radius: 999px;
	font-weight: 600;
	font-size: 15px;
	background: var(--on-stage);
	color: var(--stage);
}
.door.tone-2 .door-cta {
	background: var(--on-2);
	color: var(--cat-2);
}
.big-shape {
	position: absolute;
	top: -18%;
	right: -24%;
	width: 90%;
	aspect-ratio: 1;
	border-radius: 50%;
	background: color-mix(in srgb, var(--on-2) 8%, transparent);
	transition: transform 0.6s var(--ease);
}
.door:hover .big-shape {
	transform: scale(1.06);
}
.faq-sec {
	padding-top: 0;
}
.faq-grid {
	display: grid;
	grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
	gap: 40px;
	align-items: start;
}
@media (max-width: 1023px) {
	.bento {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.b4 {
		grid-column: span 1;
	}
	.doors {
		grid-template-columns: minmax(0, 1fr);
	}
	.door {
		min-height: 440px;
	}
	.faq-grid {
		grid-template-columns: minmax(0, 1fr);
	}
}
@media (max-width: 640px) {
	.bento {
		grid-template-columns: minmax(0, 1fr);
	}
	.b1 {
		grid-column: auto;
		grid-row: auto;
		min-height: 0;
		padding-right: 24px;
		padding-bottom: 300px;
	}
	.b1-clip {
		top: auto;
		left: 20px;
		width: auto;
		height: 260px;
	}
	.s-step {
		min-height: 0;
	}
}
</style>

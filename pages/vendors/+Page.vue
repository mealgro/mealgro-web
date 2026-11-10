<script setup lang="ts">
import SitePage from "../../components/site/SitePage.vue";
import PageHero from "../../components/site/PageHero.vue";
import FeedScreen from "../../components/site/FeedScreen.vue";
import WaitlistForm, { type Field } from "../../components/site/WaitlistForm.vue";
import { CLIPS } from "../../lib/site/media";

const fields: Field[] = [
	{ name: "full_name", label: "Full name", autocomplete: "name" },
	{ name: "business_name", label: "Business name", placeholder: "Your business name", autocomplete: "organization" },
	{ name: "phone", label: "Phone number (WhatsApp)", type: "tel", placeholder: "+234 90X XXX XXXX", autocomplete: "tel" },
	{ name: "email", label: "Email", type: "email", placeholder: "you@business.com", autocomplete: "email" },
	{ name: "address", label: "Business address", autocomplete: "street-address", full: true },
	{ name: "state", label: "State", autocomplete: "address-level1" },
	{ name: "city", label: "City", autocomplete: "address-level2" },
];

const steps = [
	{ title: "Join the waitlist", text: "Leave your details below and we'll reach out when we open in your city." },
	{ title: "Register your store", text: "In the Mealgro app, switch to vendor mode and add your store, menu and opening hours." },
	{ title: "We approve it", text: "We check your details and approve your store. Got an affiliate code? Enter it here." },
	{ title: "Post and sell", text: "Post your first video. When an order comes in, cook it; a rider collects it." },
];

const faqs = [
	{
		q: "Can small vendors join?",
		a: "Yes. Restaurants, cafés, home kitchens, small chops and drinks sellers all sell on Mealgro, whatever their size.",
	},
	{
		q: "Do I need my own riders?",
		a: "No. When an order is ready, a Mealgro rider picks it up from you and delivers it.",
	},
	{
		q: "What do I need to post?",
		a: "Short vertical videos of your dishes, filmed on a phone. Show the food as it really is: that's what makes people order.",
	},
	{
		q: "Where do I manage orders and staff?",
		a: "In the app, and on the web in the vendor portal at mealgro.com/account: orders, reports, staff, branches and your plan.",
	},
	{
		q: "Someone gave me an affiliate code. Where does it go?",
		a: "Enter it when you register your store in the app. It tells us who introduced you.",
	},
];
</script>

<template>
	<SitePage>
		<PageHero>
			<h1 class="s-h1">Your cooking, on their feed.</h1>
			<p class="s-lead s-muted">
				Post short videos of what you cook. People nearby watch them, tap Add to cart, and a
				Mealgro rider brings the order to them.
			</p>
			<div class="s-actions">
				<a class="s-btn s-btn--ink" href="#join">Join the vendor waitlist</a>
				<a class="s-btn s-btn--outline" href="/account">Sign in to the vendor portal</a>
			</div>
			<template #visual>
				<div class="s-hero-visual">
					<img class="s-hero-photo" src="/media/photo/vendor_package.webp" alt="" width="1000" height="1000" fetchpriority="high" />
					<div class="s-phone" aria-hidden="true">
						<div class="s-phone-screen">
							<FeedScreen :clip="CLIPS.spaghetti" eager cart-href="#join" />
						</div>
					</div>
					<div class="s-pop pop-order" aria-hidden="true">
						<span class="sh sh-sq" style="--c: var(--cat-1)" />
						<span><strong>New order</strong>Seafood pasta × 2 · ₦7,800</span>
					</div>
				</div>
			</template>
		</PageHero>

		<section class="s-section" aria-labelledby="get-h">
			<div class="s-wrap">
				<div class="s-head">
					<h2 id="get-h" class="s-h2">What selling on Mealgro looks like</h2>
					<p class="s-lead s-muted">You cook and film. Mealgro brings the customers and the riders.</p>
				</div>
				<ul class="s-tiles">
					<li class="s-tile wide tone-1">
						<p class="big disp">Videos are your shop window.</p>
						<h3 class="s-h3"><span class="sh sh-sq" aria-hidden="true" />Videos that sell</h3>
						<p>Your dishes play in the feed of people who can order from you. A good clip does the selling.</p>
					</li>
					<li class="s-tile wide tone-3">
						<p class="big disp">You cook. We deliver.</p>
						<h3 class="s-h3"><span class="sh sh-cd" aria-hidden="true" />Riders sent for you</h3>
						<p>When an order is ready, a Mealgro rider collects it from you and takes it to the customer.</p>
					</li>
					<li class="s-tile s-card">
						<h3 class="s-h3"><span class="sh sh-tr" style="--c: var(--cat-5)" aria-hidden="true" />A portal for the business side</h3>
						<p>Orders, reports, staff, branches and your plan, on the web. <a class="s-link" href="/account">Open the vendor portal</a></p>
					</li>
					<li class="s-tile tone-4">
						<h3 class="s-h3"><span class="sh sh-di" aria-hidden="true" />Paid to your bank</h3>
						<p>See what every order earned and get your payouts in your bank account.</p>
					</li>
					<li class="s-tile tone-2">
						<h3 class="s-h3"><span class="sh sh-ci" aria-hidden="true" />Any size of kitchen</h3>
						<p>Restaurants, cafés, home cooks and drinks sellers. One branch or many.</p>
					</li>
				</ul>
			</div>
		</section>

		<section class="s-section start" aria-labelledby="start-h">
			<div class="s-wrap">
				<div class="s-head">
					<h2 id="start-h" class="s-h2">Getting started</h2>
				</div>
				<ol class="s-steps">
					<li v-for="(s, i) in steps" :key="s.title" class="s-step s-card">
						<div class="s-step-n">
							<span>{{ i + 1 }}</span>
							<span class="sh sh-sq" :style="{ '--c': `var(--cat-${i + 1})` }" aria-hidden="true" />
						</div>
						<h3 class="s-h3">{{ s.title }}</h3>
						<p class="s-muted">{{ s.text }}</p>
					</li>
				</ol>
				<div class="s-photos photos">
					<figure>
						<img src="/media/photo/vendor_rider_pickup.webp" alt="A vendor handing a packed Mealgro order to a rider at the counter" loading="lazy" decoding="async" width="1000" height="1000" />
						<figcaption>Handover at the counter</figcaption>
					</figure>
					<figure>
						<img src="/media/photo/becomeavendor.webp" alt="A vendor in a Mealgro apron smiling" loading="lazy" decoding="async" width="1000" height="1000" />
						<figcaption>Your store, your menu</figcaption>
					</figure>
				</div>
			</div>
		</section>

		<section id="join" class="s-section join" aria-labelledby="join-h">
			<div class="s-wrap s-join">
				<div class="s-card s-join-form">
					<div>
						<h2 id="join-h" class="s-h2">Join the vendor waitlist</h2>
						<p class="s-lead s-muted" style="margin-top: 14px">
							Tell us about your business and we'll get in touch to set you up.
						</p>
					</div>
					<WaitlistForm
						access-key="5c2ca3f4-fc87-4656-ac60-ba51659f04d3"
						subject="New vendor waitlist sign-up"
						:fields="fields"
						submit-label="Join the waitlist"
						done-title="You're on the list."
						done-text="We'll contact you on WhatsApp or email when we're ready to set up your store."
					/>
				</div>
				<aside class="s-hero-panel s-join-side" aria-label="Already with us">
					<h3 class="s-h3">Already selling on Mealgro?</h3>
					<p>Manage orders, reports, staff and branches in the vendor portal.</p>
					<a class="s-btn portal-btn" href="/account">Sign in to the vendor portal</a>
					<hr />
					<h3 class="s-h3">Know other vendors?</h3>
					<p>Earn a cash reward for every one we approve with your affiliate code.</p>
					<a class="s-link" href="/affiliate">See the affiliate program</a>
				</aside>
			</div>
		</section>

		<section class="s-section faq" aria-labelledby="faq-h">
			<div class="s-wrap s-two">
				<h2 id="faq-h" class="s-h2">Vendor questions</h2>
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
.pop-order {
	left: -4%;
	top: 26%;
}
.big {
	font-size: clamp(28px, 3vw, 40px);
	line-height: 1;
	letter-spacing: -0.035em;
	max-width: 14ch;
}
.start {
	padding-top: 0;
}
.photos {
	margin-top: 16px;
}
.join {
	padding-top: 0;
}
.portal-btn {
	background: var(--on-hero);
	color: var(--hero);
	justify-self: start;
}
.portal-btn:hover {
	color: var(--hero);
}
.s-join-side hr {
	width: 100%;
	border: 0;
	border-top: 1px solid color-mix(in srgb, var(--on-hero) 20%, transparent);
	margin: 8px 0;
}
.faq {
	padding-top: 0;
}
@media (max-width: 899px) {
	.pop-order {
		left: 0;
	}
}
</style>

<script setup lang="ts">
import SitePage from "../../components/site/SitePage.vue";
import PageHero from "../../components/site/PageHero.vue";
import FeedClip from "../../components/site/FeedClip.vue";
import WaitlistForm, { type Field } from "../../components/site/WaitlistForm.vue";

const fields: Field[] = [
	{ name: "full_name", label: "Full name", autocomplete: "name" },
	{ name: "phone", label: "Phone number", type: "tel", placeholder: "+234 90X XXX XXXX", autocomplete: "tel" },
	{ name: "email", label: "Email", type: "email", placeholder: "you@example.com", autocomplete: "email", full: true },
	{ name: "state", label: "State", autocomplete: "address-level1" },
	{ name: "city", label: "City", autocomplete: "address-level2" },
	{ name: "address", label: "Address", autocomplete: "street-address", full: true },
];

const vehicles = [
	{ name: "Motorcycle", text: "The quickest way across town, and the most requests.", tone: 1, shape: "sh-sq", icon: "M5 17.5a2.5 2.5 0 1 0 0-.01M19 17.5a2.5 2.5 0 1 0 0-.01M7.5 17.5h7l3-6h-4l-2-3H9M14.5 11.5 12 8.5M17.5 11.5 19 17.5" },
	{ name: "Bicycle", text: "Short trips in busy areas, with no fuel to buy.", tone: 2, shape: "sh-ci", icon: "M5.5 17.5a3 3 0 1 0 0-.01M18.5 17.5a3 3 0 1 0 0-.01M5.5 17.5l4-7h6l3 7M9.5 10.5 8 7.5H6M15.5 10.5l-3 7h-3M14 6.5h2.5" },
	{ name: "Car", text: "Bigger orders and longer distances, rain or shine.", tone: 3, shape: "sh-cd", icon: "M4 15.5V12l2-5h12l2 5v3.5M4 15.5h16M4 15.5v2h3v-2M17 15.5v2h3v-2M7.5 12.5h.01M16.5 12.5h.01" },
];

const steps = [
	{ title: "Sign up in the rider app", text: "Download Mealgro Rider and create your account with your phone number." },
	{ title: "Verify your ID", text: "Upload your ID and a photo, so kitchens and customers know who's coming." },
	{ title: "Go online", text: "Switch on when you're ready to ride. Requests near you come straight to your phone." },
	{ title: "Deliver and get paid", text: "Every delivery and tip shows in Earnings. Withdraw to your bank account." },
];

const needs = [
	"A smartphone with mobile data (a mid-range Android or iPhone is fine)",
	"A valid government ID",
	"A motorcycle, bicycle or car you can ride legally",
	"A bank account in your name for withdrawals",
];

const faqs = [
	{
		q: "Can I ride with Mealgro if I already deliver elsewhere?",
		a: "Yes. Sign up in the rider app as an independent rider and go online whenever you're free.",
	},
	{
		q: "How do I get paid?",
		a: "You're paid for every completed delivery, plus any tip. Your earnings show in the app and you withdraw them to your bank account.",
	},
	{
		q: "Do I need an expensive phone?",
		a: "No. You need a reliable smartphone with internet access. The rider app runs on most mid-range Android phones and iPhones.",
	},
	{
		q: "Where can I ride?",
		a: "In the cities where Mealgro is live, starting with Abuja, and more as we grow. Join the waitlist and we'll tell you when your city opens.",
	},
	{
		q: "Can I choose when I work?",
		a: "Yes. You're only sent requests while you're online, and you can go offline at any time.",
	},
];
</script>

<template>
	<SitePage app="rider">
		<PageHero>
			<h1 class="s-h1">Deliver on your own hours.</h1>
			<p class="s-lead s-muted">
				Pick up from kitchens near you and drop off to people who ordered from the feed. Go
				online when it suits you; every naira you earn shows in the app.
			</p>
			<div class="s-actions">
				<a class="s-btn s-btn--ink" href="#join">Join the rider waitlist</a>
				<a class="s-btn s-btn--outline" href="#get-app">Get the rider app</a>
			</div>
			<template #visual>
				<div class="s-hero-visual">
					<img class="s-hero-photo right" src="/media/photo/rider_backpack.webp" alt="" width="1000" height="1000" fetchpriority="high" />
					<div class="s-phone s-phone--rec" aria-hidden="true">
						<div class="s-phone-screen">
							<FeedClip id="rider-app" eager />
						</div>
					</div>
					<div class="s-pop pop-tip" aria-hidden="true">
						<span class="sh sh-di" style="--c: var(--cat-4)" />
						<span><strong>Tip from a customer</strong>+₦500 added to Earnings</span>
					</div>
				</div>
			</template>
		</PageHero>

		<section class="s-section" aria-labelledby="ride-h">
			<div class="s-wrap">
				<div class="s-head">
					<h2 id="ride-h" class="s-h2">Ride what you've got</h2>
					<p class="s-lead s-muted">Tell us your vehicle when you sign up; we send requests that fit it.</p>
				</div>
				<ul class="s-tiles">
					<li v-for="v in vehicles" :key="v.name" class="s-tile" :class="`tone-${v.tone}`">
						<svg class="v-icon" viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="v.icon" /></svg>
						<h3 class="s-h3"><span class="sh" :class="v.shape" aria-hidden="true" />{{ v.name }}</h3>
						<p>{{ v.text }}</p>
					</li>
				</ul>
			</div>
		</section>

		<section class="s-section tight" aria-labelledby="how-h">
			<div class="s-wrap">
				<div class="s-head">
					<h2 id="how-h" class="s-h2">How it works</h2>
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
			</div>
		</section>

		<section class="s-section tight" aria-labelledby="need-h">
			<div class="s-wrap need">
				<figure class="need-photo">
					<img src="/media/photo/workingman.webp" alt="A Mealgro rider in a bright jacket, smiling" loading="lazy" decoding="async" width="1000" height="1000" />
				</figure>
				<div class="s-hero-panel need-panel">
					<h2 id="need-h" class="s-h2">What you need</h2>
					<ul>
						<li v-for="n in needs" :key="n">
							<span class="sh sh-ci" style="--c: var(--cat-3)" aria-hidden="true" />
							{{ n }}
						</li>
					</ul>
				</div>
			</div>
		</section>

		<section id="join" class="s-section tight" aria-labelledby="join-h">
			<div class="s-wrap s-join">
				<div class="s-card s-join-form">
					<div>
						<h2 id="join-h" class="s-h2">Join the rider waitlist</h2>
						<p class="s-lead s-muted" style="margin-top: 14px">
							Leave your details and we'll message you when we're taking riders in your city.
						</p>
					</div>
					<WaitlistForm
						access-key="207fc7d7-da00-4dee-adf9-1dc4ca7cf3c4"
						subject="New rider waitlist sign-up"
						:fields="fields"
						submit-label="Join the waitlist"
						done-title="You're on the list."
						done-text="We'll get in touch when we're taking riders in your city. Meanwhile, you can download the rider app."
					/>
				</div>
				<aside class="s-card s-join-side tone-3" aria-label="Already have the app">
					<h3 class="s-h3">Ready to ride now?</h3>
					<p>If Mealgro is live in your city, sign up straight in the rider app and verify your ID there.</p>
					<a class="s-btn s-btn--ink" href="#get-app">Get the rider app</a>
				</aside>
			</div>
		</section>

		<section class="s-section tight" aria-labelledby="faq-h">
			<div class="s-wrap s-two">
				<h2 id="faq-h" class="s-h2">Rider questions</h2>
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
.pop-tip {
	left: -6%;
	top: 30%;
}
.tight {
	padding-top: 0;
}
.v-icon {
	margin-bottom: auto;
}
.need {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	gap: 16px;
}
.need-photo {
	position: relative;
	min-height: 420px;
	border-radius: 1.75rem;
	overflow: hidden;
	background: var(--stage);
}
.need-photo img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.need-panel {
	padding: clamp(28px, 4vw, 48px);
	display: grid;
	gap: 28px;
	align-content: center;
}
.need-panel ul {
	display: grid;
	gap: 16px;
}
.need-panel li {
	display: flex;
	gap: 14px;
	align-items: baseline;
	font-size: 18px;
}
.s-join-side.tone-3 p {
	color: var(--on-3);
}
.s-join-side .s-btn {
	justify-self: start;
}
@media (max-width: 899px) {
	.need {
		grid-template-columns: minmax(0, 1fr);
	}
	.need-photo {
		min-height: 300px;
	}
	.pop-tip {
		left: 0;
	}
}
</style>

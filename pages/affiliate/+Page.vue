<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Footer from "../../components/shared/Footer.vue";
import AreasList from "../../components/affiliate/AreasList.vue";
import PauseBanner from "../../components/affiliate/PauseBanner.vue";
import { publicApi } from "../../lib/affiliate/api";
import { money } from "../../lib/affiliate/format";
import { HOME, session } from "../../lib/affiliate/session";
import type { Program } from "../../lib/affiliate/types";
import logoImage from "../../assets/logo.svg";

const program = ref<Program | null>(null);
const failed = ref(false);
const signedIn = ref(false);

onMounted(async () => {
	signedIn.value = session.hasToken();
	// Signed in, /affiliate is the dashboard. `?view=public` shows this page anyway.
	if (signedIn.value && !new URLSearchParams(location.search).has("view")) {
		location.replace(HOME);
		return;
	}
	try {
		program.value = await publicApi.program();
	} catch {
		failed.value = true;
	}
});

const reward = computed(() => (program.value?.reward ? money(program.value.reward) : null));
const minimum = computed(() => (program.value ? money(program.value.min_withdrawal) : null));

const steps = [
	{
		title: "Sign up free",
		text: "Join with your name, email and phone. You get your own affiliate code straight away.",
	},
	{
		title: "Bring vendors",
		text: "Restaurants and food vendors enter your code when they register their store in the Mealgro Vendor app.",
	},
	{
		title: "Get paid",
		text: "When we approve a store in an active city, the reward lands in your balance. Withdraw it to your bank.",
	},
];
</script>

<template>
	<div class="aff-landing">
		<section class="hero">
			<div class="hero-in">
				<div class="topbar">
					<a href="/" class="topbar-logo"><img :src="logoImage" alt="Mealgro home" /></a>
					<a v-if="signedIn" class="topbar-link" href="/affiliate/dashboard">Dashboard</a>
					<a v-else class="topbar-link" href="/affiliate/login">Sign in</a>
				</div>

				<p class="eyebrow">Mealgro Affiliate Program</p>
				<h1>
					<template v-if="reward">Earn {{ reward }} for every vendor we approve</template>
					<template v-else>Earn a cash reward for every vendor we approve</template>
				</h1>
				<p class="lead">
					Know restaurants, kitchens and food sellers? Bring them to Mealgro with your affiliate
					code and get paid when they're approved. Free to join.
				</p>
				<div class="cta">
					<template v-if="signedIn">
						<a class="btn btn--dark" href="/affiliate/dashboard">Go to your dashboard</a>
					</template>
					<template v-else>
						<a class="btn btn--dark" href="/affiliate/signup">Become an affiliate</a>
						<a class="btn btn--ghost" href="/affiliate/login">Sign in</a>
					</template>
				</div>
				<div v-if="program && !program.active" class="pause">
					<PauseBanner variant="public" :message="program.message" />
				</div>
			</div>
		</section>

		<section class="block" aria-labelledby="how-h">
			<div class="block-in">
				<h2 id="how-h">How it works</h2>
				<ol class="steps">
					<li v-for="(s, i) in steps" :key="s.title" class="step">
						<span class="step-n" aria-hidden="true">{{ i + 1 }}</span>
						<h3>{{ s.title }}</h3>
						<p>{{ s.text }}</p>
					</li>
				</ol>
			</div>
		</section>

		<section class="block block--soft" aria-labelledby="where-h">
			<div class="block-in">
				<h2 id="where-h">Where it's active</h2>
				<p class="sub">
					Rewards are paid for vendors in these areas. We add more cities over time — a vendor who
					registers before their city goes live still counts if it's active when we approve them.
				</p>
				<AreasList v-if="program?.areas.length" :areas="program.areas" />
				<p v-else-if="program" class="empty">
					No cities are active right now. Sign up and we'll let you know when they are.
				</p>
				<p v-else-if="failed" class="empty">
					We couldn't load the list of cities just now. Please refresh to try again.
				</p>
				<p v-else class="empty" role="status">Loading the active cities…</p>
			</div>
		</section>

		<section class="block" aria-labelledby="pay-h">
			<div class="block-in pay">
				<div>
					<h2 id="pay-h">Getting paid</h2>
					<ul class="facts">
						<li>
							<strong>{{ reward ?? "A cash reward" }}</strong>
							<span>for every vendor we approve in an active city</span>
						</li>
						<li>
							<strong>{{ minimum ?? "Low minimum" }}</strong>
							<span>minimum withdrawal, paid straight to your Nigerian bank account</span>
						</li>
						<li>
							<strong>No hold, no clawback</strong>
							<span>once a reward is in your balance, it's yours</span>
						</li>
					</ul>
				</div>
				<div class="join">
					<h3>Ready to start?</h3>
					<p>It takes a minute. We'll email you a code to confirm — no password needed.</p>
					<a v-if="signedIn" class="btn btn--red" href="/affiliate/dashboard">Go to your dashboard</a>
					<template v-else>
						<a class="btn btn--red" href="/affiliate/signup">Sign up</a>
						<p class="small">Already an affiliate? <a href="/affiliate/login">Sign in</a></p>
					</template>
				</div>
			</div>
		</section>

		<Footer />
	</div>
</template>

<style scoped>
.aff-landing {
	font-family: "MADE Tommy Soft", sans-serif;
	color: #121212;
	background: #ffffff;
}
.hero {
	background: #d62300;
	color: #ffffff;
}
.hero-in {
	max-width: 1100px;
	margin: 0 auto;
	padding: 150px clamp(16px, 5vw, 72px) 96px;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.topbar {
	display: none;
}
.eyebrow {
	margin: 0 0 16px;
	font-size: 15px;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	font-weight: 700;
	opacity: 0.85;
}
.hero h1 {
	margin: 0;
	max-width: 820px;
	font-size: clamp(36px, 6vw, 64px);
	line-height: 1.05;
	font-weight: 800;
	letter-spacing: -0.5px;
	color: #ffffff;
}
.lead {
	margin: 24px 0 0;
	max-width: 620px;
	font-size: clamp(17px, 2vw, 20px);
	line-height: 1.5;
	opacity: 0.92;
}
.cta {
	margin-top: 36px;
	display: flex;
	gap: 14px;
	flex-wrap: wrap;
	justify-content: center;
}
.btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 60px;
	padding: 0 32px;
	border-radius: 16px;
	font-size: 20px;
	font-weight: 500;
	text-decoration: none;
	transition: opacity 0.2s, background 0.2s;
}
.btn:hover {
	opacity: 0.9;
}
.btn:focus-visible {
	outline: 3px solid #ffffff;
	outline-offset: 3px;
}
.btn--dark {
	background: #121212;
	color: #ffffff;
}
.btn--ghost {
	border: 2px solid #ffffff;
	color: #ffffff;
}
.btn--red {
	background: #d62300;
	color: #ffffff;
}
.btn--red:focus-visible {
	outline-color: #d62300;
}
.pause {
	margin-top: 32px;
	width: 100%;
	max-width: 620px;
	text-align: left;
}
.pause :deep(.aff-banner) {
	display: flex;
	gap: 12px;
	padding: 14px 16px;
	border-radius: 14px;
	background: #fff7ea;
	color: #7a3d06;
	font-size: 15px;
	line-height: 1.5;
}
.pause :deep(.aff-banner p) {
	margin: 0;
}
.pause :deep(.aff-banner svg) {
	flex: none;
	margin-top: 3px;
}

.block {
	padding: 88px 0;
}
.block--soft {
	background: #f6f6f6;
}
.block-in {
	max-width: 1100px;
	margin: 0 auto;
	padding: 0 clamp(16px, 5vw, 72px);
}
.block h2 {
	margin: 0 0 12px;
	font-size: clamp(30px, 4vw, 44px);
	font-weight: 800;
	letter-spacing: -0.3px;
	color: #121212;
}
.sub {
	margin: 0 0 32px;
	max-width: 680px;
	font-size: 17px;
	line-height: 1.55;
	color: #6b635b;
}
.steps {
	list-style: none;
	margin: 36px 0 0;
	padding: 0;
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 20px;
}
.step {
	padding: 28px;
	border-radius: 22px;
	background: #fdece8;
}
.step-n {
	display: grid;
	place-items: center;
	width: 44px;
	height: 44px;
	border-radius: 12px;
	background: #d62300;
	color: #ffffff;
	font-weight: 800;
	font-size: 20px;
}
.step h3 {
	margin: 18px 0 8px;
	font-size: 22px;
	font-weight: 700;
	color: #121212;
}
.step p {
	margin: 0;
	font-size: 16px;
	line-height: 1.55;
	color: #6b635b;
}
.empty {
	margin: 0;
	padding: 24px;
	border-radius: 18px;
	background: #ffffff;
	border: 1px dashed #d9d9d9;
	color: #6b635b;
	font-size: 16px;
}
.pay {
	display: grid;
	grid-template-columns: 1.3fr 1fr;
	gap: 40px;
	align-items: start;
}
.facts {
	list-style: none;
	margin: 24px 0 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 18px;
}
.facts li {
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding-left: 18px;
	border-left: 4px solid #d62300;
}
.facts strong {
	font-size: 24px;
	font-weight: 700;
}
.facts span {
	font-size: 16px;
	color: #6b635b;
}
.join {
	padding: 32px;
	border-radius: 24px;
	background: #121212;
	color: #ffffff;
	display: flex;
	flex-direction: column;
	gap: 14px;
	align-items: flex-start;
}
.join h3 {
	margin: 0;
	font-size: 28px;
	font-weight: 700;
	color: #ffffff;
}
.join p {
	margin: 0;
	font-size: 16px;
	line-height: 1.5;
	opacity: 0.9;
}
.join .small {
	font-size: 15px;
}
.join a:not(.btn) {
	color: #ffffff;
	text-decoration: underline;
}

@media (max-width: 1024px) {
	.hero-in {
		padding-top: 24px;
	}
	.topbar {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 56px;
	}
	.topbar-logo img {
		width: 96px;
		height: auto;
		display: block;
		filter: brightness(0) invert(1);
	}
	.topbar-link {
		color: #ffffff;
		font-size: 17px;
		text-decoration: none;
		padding: 10px 18px;
		border: 2px solid rgba(255, 255, 255, 0.8);
		border-radius: 12px;
	}
}
@media (max-width: 860px) {
	.steps,
	.pay {
		grid-template-columns: 1fr;
	}
	.block {
		padding: 64px 0;
	}
}
@media (max-width: 480px) {
	.btn {
		width: 100%;
		min-height: 56px;
		font-size: 18px;
	}
	.cta {
		width: 100%;
	}
	.join {
		padding: 24px;
	}
}
</style>

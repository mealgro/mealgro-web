<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import SitePage from "../../components/site/SitePage.vue";
import PageHero from "../../components/site/PageHero.vue";
import AreasList from "../../components/affiliate/AreasList.vue";
import PauseBanner from "../../components/affiliate/PauseBanner.vue";
import { publicApi } from "../../lib/affiliate/api";
import { money } from "../../lib/affiliate/format";
import { HOME, session } from "../../lib/affiliate/session";
import type { Program } from "../../lib/affiliate/types";

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

/** While the program is paused nothing is promised: no reward is quoted. */
const paused = computed(() => !!program.value && !program.value.active);
const reward = computed(() =>
	program.value?.reward && !paused.value ? money(program.value.reward) : null,
);
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
	<SitePage>
		<PageHero>
			<h1 class="s-h1">
				<template v-if="paused">Our affiliate program is paused for now.</template>
				<template v-else>Get paid for every kitchen you bring.</template>
			</h1>
			<p class="s-lead s-muted">
				<template v-if="paused">
					New vendors you bring in won't earn a reward until it's back. Sign up now and we'll tell
					you when it resumes. Free to join.
				</template>
				<template v-else>
					Know restaurants, kitchens and food sellers? Give them your affiliate code and earn
					{{ reward ?? "a cash reward" }} for every one we approve. Free to join.
				</template>
			</p>
			<div class="s-actions">
				<a v-if="signedIn" class="s-btn s-btn--ink" href="/affiliate/dashboard">Go to your dashboard</a>
				<template v-else>
					<a class="s-btn s-btn--ink" href="/affiliate/signup">Become an affiliate</a>
					<a class="s-btn s-btn--outline" href="/affiliate/login">Sign in</a>
				</template>
			</div>
			<div v-if="program && !program.active" class="pause">
				<PauseBanner variant="public" :message="program.message" />
			</div>
			<template #visual>
				<div class="reward tone-2" :aria-busy="!program && !failed">
					<span class="halo" aria-hidden="true" />
					<p class="reward-k">
						<span class="sh sh-ci" style="--c: var(--on-2)" aria-hidden="true" />
						{{ paused ? "Rewards paused" : "Per vendor we approve" }}
					</p>
					<p class="reward-v disp">{{ paused ? "Back soon" : (reward ?? "Cash") }}</p>
					<dl class="reward-facts">
						<div>
							<dt>Minimum withdrawal</dt>
							<dd>{{ minimum ?? "Low" }}</dd>
						</div>
						<div>
							<dt>Paid to</dt>
							<dd>Your bank</dd>
						</div>
					</dl>
				</div>
			</template>
		</PageHero>

		<section class="s-section" aria-labelledby="how-h">
			<div class="s-wrap">
				<div class="s-head">
					<h2 id="how-h" class="s-h2">How it works</h2>
				</div>
				<ol class="s-steps">
					<li v-for="(s, i) in steps" :key="s.title" class="s-step" :class="`tone-${[2, 1, 4][i]}`">
						<div class="s-step-n">
							<span>{{ i + 1 }}</span>
							<span class="sh" :class="['sh-ci', 'sh-sq', 'sh-di'][i]" aria-hidden="true" />
						</div>
						<h3 class="s-h3">{{ s.title }}</h3>
						<p>{{ s.text }}</p>
					</li>
				</ol>
			</div>
		</section>

		<section class="s-section tight" aria-labelledby="where-h">
			<div class="s-wrap">
				<div class="s-head">
					<h2 id="where-h" class="s-h2">Where it's active</h2>
					<p class="s-lead s-muted">
						Rewards are paid for vendors in these areas. We add more cities over time — a vendor
						who registers before their city goes live still counts if it's active when we approve
						them.
					</p>
				</div>
				<AreasList v-if="program?.areas.length" :areas="program.areas" />
				<p v-else-if="program" class="s-card empty">
					No cities are active right now. Sign up and we'll let you know when they are.
				</p>
				<p v-else-if="failed" class="s-card empty">
					We couldn't load the list of cities just now. Please refresh to try again.
				</p>
				<p v-else class="s-card empty" role="status">Loading the active cities…</p>
			</div>
		</section>

		<section class="s-section tight" aria-labelledby="pay-h">
			<div class="s-wrap pay">
				<div class="s-card pay-facts">
					<h2 id="pay-h" class="s-h2">Getting paid</h2>
					<ul class="facts">
						<li>
							<span class="sh sh-ci" style="--c: var(--cat-2)" aria-hidden="true" />
							<div>
								<strong>{{ reward ?? "A cash reward" }}</strong>
								<span>for every vendor we approve in an active city</span>
							</div>
						</li>
						<li>
							<span class="sh sh-sq" style="--c: var(--cat-1)" aria-hidden="true" />
							<div>
								<strong>{{ minimum ?? "Low minimum" }}</strong>
								<span>minimum withdrawal, paid straight to your Nigerian bank account</span>
							</div>
						</li>
						<li>
							<span class="sh sh-di" style="--c: var(--cat-4)" aria-hidden="true" />
							<div>
								<strong>No hold, no clawback</strong>
								<span>once a reward is in your balance, it's yours</span>
							</div>
						</li>
					</ul>
				</div>
				<div class="s-hero-panel join">
					<h3 class="s-h2">Ready to start?</h3>
					<p>It takes a minute. We'll email you a code to confirm — no password needed.</p>
					<a v-if="signedIn" class="s-btn join-btn" href="/affiliate/dashboard">Go to your dashboard</a>
					<template v-else>
						<a class="s-btn join-btn" href="/affiliate/signup">Sign up</a>
						<p class="small">Already an affiliate? <a class="s-link" href="/affiliate/login">Sign in</a></p>
					</template>
				</div>
			</div>
		</section>
	</SitePage>
</template>

<style scoped>
.pause {
	width: 100%;
	max-width: 560px;
}
.pause :deep(.aff-banner) {
	display: flex;
	gap: 12px;
	align-items: flex-start;
	padding: 16px 20px;
	border-radius: 1.5rem;
	background: var(--warn);
	color: var(--on-warn);
	font-size: 15px;
}
.pause :deep(.aff-banner svg) {
	flex: none;
	margin-top: 2px;
}
.reward {
	position: relative;
	overflow: hidden;
	width: min(100%, 440px);
	aspect-ratio: 4 / 5;
	border-radius: 2rem;
	padding: clamp(24px, 4vw, 40px);
	display: flex;
	flex-direction: column;
	gap: 12px;
	isolation: isolate;
	animation: settle 0.9s var(--ease) 0.2s both;
}
.halo {
	position: absolute;
	z-index: -1;
	top: -22%;
	right: -30%;
	width: 95%;
	aspect-ratio: 1;
	border-radius: 50%;
	background: color-mix(in srgb, var(--on-2) 8%, transparent);
}
.reward-k {
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: 600;
}
.reward-v {
	margin-top: auto !important;
	font-size: clamp(56px, 8vw, 104px);
	line-height: 0.9;
	letter-spacing: -0.05em;
	overflow-wrap: anywhere;
}
.reward-facts {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
	margin-top: 16px !important;
	padding-top: 16px;
	border-top: 2px solid color-mix(in srgb, var(--on-2) 22%, transparent);
}
.reward-facts dt {
	font-size: 14px;
}
.reward-facts dd {
	font-family: var(--font-display);
	font-weight: 800;
	font-size: 22px;
	letter-spacing: -0.02em;
}
@keyframes settle {
	from {
		opacity: 0;
		transform: rotate(-4deg) translateY(24px);
	}
}
.tight {
	padding-top: 0;
}
.empty {
	padding: 24px;
	color: var(--muted);
}
.pay {
	display: grid;
	grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
	gap: 16px;
}
.pay-facts {
	padding: clamp(24px, 4vw, 48px);
	display: grid;
	gap: 28px;
}
.facts {
	display: grid;
	gap: 18px;
}
.facts li {
	display: flex;
	gap: 14px;
	align-items: baseline;
}
.facts strong {
	display: block;
	font-family: var(--font-display);
	font-size: 22px;
	letter-spacing: -0.02em;
}
.facts span:not(.sh) {
	color: var(--muted);
}
.join {
	padding: clamp(24px, 4vw, 48px);
	display: grid;
	gap: 18px;
	align-content: center;
	justify-items: start;
}
.join-btn {
	background: var(--on-hero);
	color: var(--hero);
}
.join-btn:hover {
	color: var(--hero);
}
.small {
	font-size: 15px;
}
@media (max-width: 899px) {
	.pay {
		grid-template-columns: minmax(0, 1fr);
	}
	.reward {
		aspect-ratio: auto;
		min-height: 340px;
	}
}
</style>

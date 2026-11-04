<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AffiliateShell from "../../../../components/affiliate/AffiliateShell.vue";
import { me } from "../../../../lib/affiliate/api";
import { dateTime, describe, money } from "../../../../lib/affiliate/format";
import { session } from "../../../../lib/affiliate/session";
import { toast } from "../../../../lib/affiliate/toast";
import type { Notice } from "../../../../lib/affiliate/types";

const user = session.user;
const overview = session.overview;
const notices = ref<Notice[] | null>(null);
const error = ref("");

onMounted(async () => {
	if (!(await session.restore())) return; // the shell sends them to sign in
	const [o, n] = await Promise.allSettled([session.loadOverview(), me.notices()]);
	if (o.status === "rejected") error.value = describe(o.reason);
	notices.value = n.status === "fulfilled" ? n.value : [];
});

const shareText = computed(() =>
	user.value
		? `Sell your food on Mealgro. When you register your store in the Mealgro Vendor app, enter my affiliate code ${user.value.code}. https://mealgro.com/vendors`
		: "",
);
const canShare = typeof navigator !== "undefined" && "share" in navigator;

async function copy(text: string, what: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast(`${what} copied.`);
	} catch {
		toast("Couldn't copy. Select it and copy it yourself.", "bad");
	}
}

async function share() {
	try {
		await navigator.share({ title: "Mealgro affiliate code", text: shareText.value });
	} catch {
		// Cancelled, or not allowed: nothing to do.
	}
}

/** Each count owns a colour and a shape, so none depends on colour alone. */
const stats = computed(() => {
	const o = overview.value;
	if (!o) return [];
	return [
		{ label: "Vendors referred", value: o.referred, shape: "sh-sq", color: "var(--cat-1)" },
		{ label: "Pending approval", value: o.pending, shape: "sh-ci", color: "var(--cat-2)" },
		{ label: "Paid", value: o.paid, shape: "sh-cd", color: "var(--cat-4)" },
		{ label: "Voided", value: o.void, shape: "sh-di", color: "var(--bad)" },
	];
});
</script>

<template>
	<AffiliateShell title="Dashboard">
		<div v-if="error" class="p-alert" role="alert">{{ error }}</div>

		<section v-if="user" class="hero arrive" aria-labelledby="aff-code-h">
			<div class="ring" aria-hidden="true" />
			<div class="p-stack code-left">
				<h2 id="aff-code-h">Your affiliate code</h2>
				<p>
					Vendors enter it when they register their store in the Mealgro Vendor app. You earn
					a reward when we approve them.
				</p>
			</div>
			<div class="code-right">
				<output class="big-code disp" aria-label="Your affiliate code">{{ user.code }}</output>
				<div class="p-row actions">
					<button class="hb" type="button" @click="copy(user.code, 'Code')">Copy code</button>
					<button v-if="canShare" class="hb hb--fill" type="button" @click="share">Share</button>
					<button v-else class="hb hb--fill" type="button" @click="copy(shareText, 'Invite message')">
						Copy invite message
					</button>
				</div>
			</div>
		</section>

		<section v-if="overview" class="money" aria-label="Your balance">
			<a class="tile tone-1 balance arrive" style="--i: 1" href="/affiliate/wallet">
				<span class="tile-h"><span class="sh sh-sq" />Available to withdraw</span>
				<strong class="disp">{{ money(overview.balance_available) }}</strong>
				<span v-if="overview.balance_reserved.amount > 0" class="sub">
					{{ money(overview.balance_reserved) }} in a withdrawal
				</span>
				<span class="go">Go to wallet →</span>
			</a>
			<div class="tile tone-3 arrive" style="--i: 2">
				<span class="tile-h"><span class="sh sh-cd" />Earned so far</span>
				<strong class="disp">{{ money(overview.earned_total) }}</strong>
				<span v-if="overview.awaiting_budget > 0" class="sub">
					{{ overview.awaiting_budget }} approved, waiting on budget
				</span>
			</div>
		</section>

		<section class="p-grid stats" aria-label="Your numbers">
			<template v-if="overview">
				<div v-for="(s, i) in stats" :key="s.label" class="p-card p-stat stat arrive" :style="{ '--i': i + 3 }">
					<span class="stat-h"><span class="sh" :class="s.shape" :style="{ '--c': s.color }" />{{ s.label }}</span>
					<strong>{{ s.value }}</strong>
				</div>
			</template>
			<template v-else-if="!error">
				<div v-for="i in 4" :key="i" class="p-card p-stat skeleton" aria-hidden="true">
					<strong>—</strong><span>&nbsp;</span>
				</div>
			</template>
		</section>

		<section class="p-card p-stack arrive" style="--i: 7" aria-labelledby="aff-notices-h">
			<div class="p-row p-between">
				<h2 id="aff-notices-h">Notices</h2>
				<a class="link small" href="/affiliate/referrals">See referrals</a>
			</div>
			<p v-if="notices === null" class="p-muted" role="status">Loading…</p>
			<p v-else-if="!notices.length" class="aff-empty">
				Nothing yet. When a vendor you referred is approved or a payout moves, you'll see it here.
			</p>
			<ul v-else class="aff-list">
				<li v-for="n in notices" :key="n.id">
					<div>
						<strong>{{ n.title }}</strong>
						<p class="p-muted">{{ n.body }}</p>
					</div>
					<time class="sub" :datetime="n.at">{{ dateTime(n.at) }}</time>
				</li>
			</ul>
		</section>
	</AffiliateShell>
</template>

<style scoped>
.hero {
	position: relative;
	overflow: hidden;
	display: flex;
	justify-content: space-between;
	gap: 24px;
	flex-wrap: wrap;
	align-items: center;
	padding: 32px 34px;
	border-radius: 32px;
	background: #12121c;
	color: #ffffff;
}
@media (prefers-color-scheme: dark) {
	.hero {
		background: var(--surface);
	}
}
.hero h2,
.hero p {
	color: inherit;
}
.hero p {
	opacity: 0.78;
	max-width: 46ch;
}
.ring {
	position: absolute;
	right: -70px;
	top: -80px;
	width: 220px;
	height: 220px;
	border-radius: 50%;
	border: 30px solid rgb(255 255 255 / 0.06);
}
.code-left {
	flex: 1 1 280px;
	gap: 8px;
	position: relative;
}
.code-right {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 14px;
}
.big-code {
	font-size: clamp(40px, 6vw, 64px);
	line-height: 0.9;
	letter-spacing: 0.06em;
	color: #ffc52e;
}
.actions {
	gap: 10px;
	flex-wrap: wrap;
}
.hb {
	height: 44px;
	padding: 0 22px;
	border-radius: 999px;
	border: 2px solid rgb(255 255 255 / 0.7);
	background: transparent;
	color: #ffffff;
	font: inherit;
	font-weight: 700;
	cursor: pointer;
	transition: transform 0.12s;
}
.hb:active {
	transform: scale(0.97);
}
.hb--fill {
	background: #ffc52e;
	border-color: #ffc52e;
	color: #12121c;
}
.hb:focus-visible {
	outline: 3px solid #ffc52e;
	outline-offset: 3px;
}
.money {
	display: grid;
	grid-template-columns: 1.3fr 1fr;
	gap: 16px;
}
.tile {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 26px 28px;
	border-radius: 32px;
	text-decoration: none;
	color: inherit;
	transition: transform 0.3s var(--ease);
}
.tile:hover {
	transform: translateY(-3px);
}
.tile-h {
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: 700;
	font-size: 16px;
}
.tile strong {
	font-size: clamp(36px, 5vw, 56px);
	line-height: 0.95;
	color: inherit;
	font-weight: 800;
}
.tile .sub {
	opacity: 0.82;
}
.balance .go {
	font-weight: 700;
	margin-top: 4px;
	text-decoration: underline;
	text-underline-offset: 3px;
}
.stats {
	grid-template-columns: repeat(4, minmax(0, 1fr));
}
.stat {
	display: flex;
	flex-direction: column;
	gap: 14px;
}
.stat-h {
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: 600;
	color: var(--muted);
	font-size: 14px;
}
.stat strong {
	font-size: 44px;
	line-height: 0.95;
}
.skeleton {
	opacity: 0.5;
}
.small {
	font-size: 14px;
	font-weight: 600;
}
@media (max-width: 720px) {
	.stats {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.money {
		grid-template-columns: 1fr;
	}
	.code-right {
		align-items: flex-start;
	}
	.hero {
		padding: 24px;
	}
}
</style>

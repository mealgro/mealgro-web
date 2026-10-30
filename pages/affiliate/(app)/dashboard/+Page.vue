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

const stats = computed(() => {
	const o = overview.value;
	if (!o) return [];
	return [
		{ label: "Vendors referred", value: o.referred },
		{ label: "Pending approval", value: o.pending },
		{ label: "Paid", value: o.paid },
		{ label: "Voided", value: o.void },
	];
});
</script>

<template>
	<AffiliateShell title="Dashboard">
		<div v-if="error" class="p-alert" role="alert">{{ error }}</div>

		<section v-if="user" class="p-card code-card" aria-labelledby="aff-code-h">
			<div class="p-stack code-left">
				<h2 id="aff-code-h">Your affiliate code</h2>
				<p class="p-muted">
					Vendors enter it when they register their store in the Mealgro Vendor app. You earn
					a reward when we approve them.
				</p>
			</div>
			<div class="code-right">
				<output class="big-code" aria-label="Your affiliate code">{{ user.code }}</output>
				<div class="p-row actions">
					<button class="p-btn p-btn--sm" type="button" @click="copy(user.code, 'Code')">
						Copy code
					</button>
					<button v-if="canShare" class="p-btn p-btn--sm p-btn--primary" type="button" @click="share">
						Share
					</button>
					<button v-else class="p-btn p-btn--sm p-btn--primary" type="button" @click="copy(shareText, 'Invite message')">
						Copy invite message
					</button>
				</div>
			</div>
		</section>

		<section class="p-grid stats" aria-label="Your numbers">
			<template v-if="overview">
				<div v-for="s in stats" :key="s.label" class="p-card p-stat">
					<strong>{{ s.value }}</strong>
					<span>{{ s.label }}</span>
				</div>
			</template>
			<template v-else-if="!error">
				<div v-for="i in 4" :key="i" class="p-card p-stat skeleton" aria-hidden="true">
					<strong>—</strong><span>&nbsp;</span>
				</div>
			</template>
		</section>

		<section v-if="overview" class="p-grid money" aria-label="Your balance">
			<a class="p-card p-stat balance" href="/affiliate/wallet">
				<span>Available to withdraw</span>
				<strong>{{ money(overview.balance_available) }}</strong>
				<span v-if="overview.balance_reserved.amount > 0">
					{{ money(overview.balance_reserved) }} in a withdrawal
				</span>
				<span class="go">Go to wallet →</span>
			</a>
			<div class="p-card p-stat">
				<span>Earned so far</span>
				<strong>{{ money(overview.earned_total) }}</strong>
				<span v-if="overview.awaiting_budget > 0">
					{{ overview.awaiting_budget }} approved, waiting on budget
				</span>
			</div>
		</section>

		<section class="p-card p-stack" aria-labelledby="aff-notices-h">
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
.code-card {
	display: flex;
	justify-content: space-between;
	gap: 20px;
	flex-wrap: wrap;
	align-items: center;
}
.code-left {
	flex: 1 1 280px;
	gap: 6px;
}
.code-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 10px;
}
.big-code {
	font-size: 30px;
	font-weight: 800;
	letter-spacing: 0.12em;
	color: var(--brand);
	font-variant-numeric: tabular-nums;
}
.actions {
	gap: 8px;
	flex-wrap: wrap;
}
.stats {
	grid-template-columns: repeat(4, minmax(0, 1fr));
}
.money {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}
.money .p-stat {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
.balance {
	text-decoration: none;
}
.balance:hover {
	border-color: var(--brand);
}
.go {
	color: var(--brand) !important;
	font-weight: 600;
	margin-top: 4px;
}
.skeleton {
	opacity: 0.5;
}
.small {
	font-size: 13px;
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
}
</style>

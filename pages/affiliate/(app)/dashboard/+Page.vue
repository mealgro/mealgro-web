<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AffiliateShell from "../../../../components/affiliate/AffiliateShell.vue";
import HeroPanel from "../../../../components/portal/HeroPanel.vue";
import StatTile from "../../../../components/portal/StatTile.vue";
import StateBlock from "../../../../components/portal/StateBlock.vue";
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

/** Each count owns a colour, a shape and a tone, so none depends on colour alone. */
const stats = computed(() => {
	const o = overview.value;
	if (!o) return [];
	return [
		{ label: "Vendors referred", value: o.referred, shape: "sq", tone: 0, color: "var(--cat-1)" },
		{ label: "Pending approval", value: o.pending, shape: "ci", tone: 2, color: "" },
		{ label: "Paid", value: o.paid, shape: "di", tone: 4, color: "" },
		{ label: "Voided", value: o.void, shape: "tr", tone: 0, color: "var(--bad)" },
	] as const;
});
</script>

<template>
	<AffiliateShell title="Dashboard">
		<div v-if="error" class="p-alert" role="alert">{{ error }}</div>

		<div class="top">
			<HeroPanel
				v-if="user"
				class="top-hero"
				eyebrow="Refer and earn"
				shape="cd"
				color="var(--cat-3)"
				title="Your affiliate code"
				lead="Vendors enter it when they register their store in the Mealgro Vendor app. You earn a reward when we approve them."
			>
				<output class="big-code disp" aria-label="Your affiliate code">{{ user.code }}</output>
				<div class="p-row p-wrap actions">
					<button class="p-btn" type="button" @click="copy(user.code, 'Code')">Copy code</button>
					<button v-if="canShare" class="p-btn p-btn--primary" type="button" @click="share">Share</button>
					<button v-else class="p-btn p-btn--primary" type="button" @click="copy(shareText, 'Invite message')">
						Copy invite message
					</button>
				</div>
			</HeroPanel>

			<div v-if="overview" class="top-tiles">
				<StatTile
					class="balance"
					:order="1"
					:tone="1"
					shape="sq"
					label="Available to withdraw"
					:value="money(overview.balance_available)"
					:sub="overview.balance_reserved.amount > 0 ? `${money(overview.balance_reserved)} in a withdrawal` : undefined"
					href="/affiliate/wallet"
				>
					<span class="go">Go to wallet →</span>
				</StatTile>
				<StatTile
					:order="2"
					:tone="3"
					shape="cd"
					label="Earned so far"
					:value="money(overview.earned_total)"
					:sub="overview.awaiting_budget > 0 ? `${overview.awaiting_budget} approved, waiting on budget` : undefined"
				/>
			</div>
			<div v-else-if="!error" class="top-tiles" aria-hidden="true">
				<div class="p-skeleton p-skeleton--block" />
				<div class="p-skeleton p-skeleton--block" />
			</div>
		</div>

		<section class="stats" aria-label="Your numbers">
			<template v-if="overview">
				<StatTile
					v-for="(s, i) in stats"
					:key="s.label"
					:order="i + 3"
					:tone="s.tone"
					:shape="s.shape"
					:color="s.color || undefined"
					:label="s.label"
					:value="s.value"
				/>
			</template>
			<template v-else-if="!error">
				<div v-for="i in 4" :key="i" class="p-skeleton p-skeleton--block" aria-hidden="true" />
			</template>
		</section>

		<section class="card-box arrive" style="--i: 7" aria-labelledby="aff-notices-h">
			<div class="card-h">
				<div>
					<h2 id="aff-notices-h">Notices</h2>
					<p>Approvals and payouts, newest first</p>
				</div>
				<a class="link p-tap" href="/affiliate/referrals">See referrals</a>
			</div>
			<StateBlock
				:loading="notices === null"
				:empty="notices !== null && !notices.length"
				empty-text="Nothing yet."
				empty-hint="When a vendor you referred is approved or a payout moves, you'll see it here."
			>
				<ul class="p-list notices">
					<li v-for="n in notices ?? []" :key="n.id">
						<div>
							<strong>{{ n.title }}</strong>
							<p class="p-muted">{{ n.body }}</p>
						</div>
						<time class="sub" :datetime="n.at">{{ dateTime(n.at) }}</time>
					</li>
				</ul>
			</StateBlock>
		</section>
	</AffiliateShell>
</template>

<style scoped>
.top {
	display: grid;
	gap: 20px;
	grid-template-columns: minmax(0, 1fr);
}
.top-tiles {
	display: grid;
	gap: 20px;
	grid-template-columns: repeat(2, minmax(0, 1fr));
}
.stats {
	display: grid;
	gap: 20px;
	grid-template-columns: repeat(4, minmax(0, 1fr));
}
.top-hero {
	align-items: stretch;
}
.big-code {
	display: block;
	margin: 18px 0 16px;
	font-size: clamp(44px, 7vw, 72px);
	line-height: 0.9;
	letter-spacing: 0.06em;
	color: var(--cat-3);
	overflow-wrap: anywhere;
}
.actions {
	gap: 10px;
}
.go {
	font-weight: 700;
	margin-top: 4px;
	text-decoration: underline;
	text-underline-offset: 3px;
}
.card-h {
	margin-bottom: 8px;
}
.notices .sub {
	white-space: nowrap;
}
@media (min-width: 1280px) {
	.top {
		grid-template-columns: repeat(5, minmax(0, 1fr));
	}
	.top-hero {
		grid-column: span 3;
	}
	.top-tiles {
		grid-column: span 2;
		grid-template-columns: minmax(0, 1fr);
	}
}
@media (max-width: 1023px) {
	.stats {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
@media (max-width: 559px) {
	/* The tiles stay side by side, so the form or the numbers below are not pushed off the screen. */
	.top-tiles {
		gap: 12px;
	}
	.top-tiles :deep(.p-tile) {
		padding: 16px;
	}
}
</style>

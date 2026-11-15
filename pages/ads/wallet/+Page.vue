<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import AdsShell from "../../../components/ads/AdsShell.vue";
import TopUpForm from "../../../components/ads/TopUpForm.vue";
import TopUpReturn from "../../../components/ads/TopUpReturn.vue";
import HeroPanel from "../../../components/portal/HeroPanel.vue";
import StatTile from "../../../components/portal/StatTile.vue";
import StateBlock from "../../../components/portal/StateBlock.vue";
import { wallet as walletApi } from "../../../lib/ads/api";
import { bonusOfferText, dateTime, describe, money } from "../../../lib/ads/format";
import { session } from "../../../lib/ads/session";
import { checkTopUp } from "../../../lib/ads/topup";
import { toast } from "../../../lib/ads/toast";
import type { Wallet, WalletLine } from "../../../lib/ads/types";

const wallet = ref<Wallet | null>(null);
const error = ref("");
const pricing = session.pricing;
const suspended = session.suspended;

async function load() {
	error.value = "";
	try {
		wallet.value = await walletApi.get();
	} catch (e) {
		error.value = describe(e);
	}
}

onMounted(async () => {
	if (!(await session.restore())) return;
	await Promise.all([load(), session.loadPricing().catch(() => {})]);
	// "Top up" elsewhere links to #top-up; the page draws after the browser looked for it.
	if (location.hash === "#top-up") {
		await nextTick();
		const el = document.getElementById("top-up");
		el?.scrollIntoView({ block: "start" });
		el?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
	}
});

const blocked = computed(() => {
	if (suspended.value) return "Your account is suspended, so you can't top up right now.";
	if (wallet.value?.frozen) return "Your balance is frozen, so you can't top up.";
	return null;
});

const TOP_UP_LABEL: Record<string, string> = { pending: "Pending", paid: "Paid", failed: "Failed" };
const TOP_UP_TONE: Record<string, string> = { pending: "warn", paid: "ok", failed: "bad" };

/** A pending top-up can be asked about again by its reference. */
const checking = ref<string | null>(null);
async function checkLine(line: WalletLine) {
	if (!line.reference || checking.value) return;
	checking.value = line.reference;
	const out = await checkTopUp(line.reference);
	checking.value = null;
	if (out.state === "paid")
		toast(
			`Payment received. ${money(out.topUp.amount)} is in your ad wallet.${out.topUp.bonus_paid?.amount > 0 ? ` Your ${money(out.topUp.bonus_paid)} bonus landed too.` : ""}`,
		);
	else if (out.state === "failed") toast("That payment didn't go through.", "bad");
	else if (out.state === "pending") toast("Paystack hasn't confirmed that payment yet.", "bad");
	else toast(describe(out.error), "bad");
	await load();
}
</script>

<template>
	<AdsShell title="Wallet">
		<TopUpReturn @paid="load" />

		<div v-if="error" class="p-alert" role="alert">
			{{ error }}
			<button class="p-btn p-btn--sm" type="button" @click="load">Retry</button>
		</div>

		<div v-if="wallet?.frozen" class="p-alert" role="alert">
			<p>
				<strong>Your balance is frozen.</strong>
				Frozen credit can't be spent or paid out. Contact Mealgro support if you think this is a mistake.
			</p>
		</div>

		<div v-if="wallet?.bonus_offer?.eligible" class="p-alert p-alert--ok" role="status">
			<p><strong>Top-up bonus.</strong> {{ bonusOfferText(wallet.bonus_offer) }} <a href="#top-up">Top up</a></p>
		</div>

		<div v-if="wallet" class="top" aria-label="Balances">
			<HeroPanel class="top-hero" numeric eyebrow="Ad credit you can spend" shape="sq" color="var(--cat-1)" :title="money(wallet.available)" />
			<div class="top-tiles">
				<StatTile :order="1" :tone="3" shape="cd" label="Held for your ads" :value="money(wallet.reserved)" sub="Budgets of ads you've sent. What an ad doesn't spend comes back." />
			</div>
		</div>
		<div v-else-if="!error" class="top" aria-hidden="true">
			<div class="p-skeleton p-skeleton--block top-hero" />
			<div class="p-skeleton p-skeleton--block" />
		</div>

		<section id="top-up" class="card-box p-stack-sm arrive" style="--i: 3" aria-labelledby="ads-topup-h">
			<div>
				<h2 id="ads-topup-h">Top up</h2>
				<p class="p-muted">Add credit, then spend it on your ads.</p>
			</div>
			<TopUpForm v-if="wallet" :pricing="pricing" :notice="wallet.notice" :offer="wallet.bonus_offer" return-path="/ads/wallet" :blocked="blocked" />
			<StateBlock v-else :loading="!error" :error="error || null" @retry="load" />
		</section>

		<section class="card-box arrive" style="--i: 4" aria-labelledby="ads-hist-h">
			<div class="card-h">
				<div>
					<h2 id="ads-hist-h">History</h2>
					<p>Top-ups, ad spend by day, and changes by Mealgro. Newest first.</p>
				</div>
			</div>
			<StateBlock :loading="!wallet && !error" :empty="!!wallet && !wallet.history.length" empty-text="Nothing yet." empty-hint="Top-ups and ad spend show up here.">
				<ul class="p-list">
					<li v-for="(h, i) in wallet?.history ?? []" :key="`${h.kind}-${h.reference ?? i}-${h.at}`">
						<div class="p-stack-sm tight">
							<strong>{{ h.title }}</strong>
							<span class="sub">
								{{ dateTime(h.at) }}<template v-if="h.reference"> · Ref {{ h.reference }}</template>
							</span>
						</div>
						<div class="p-row p-wrap end">
							<span v-if="h.kind === 'top-up' && h.status" class="p-badge" :class="`p-badge--${TOP_UP_TONE[h.status] ?? ''}`">
								{{ TOP_UP_LABEL[h.status] ?? h.status }}
							</span>
							<button
								v-if="h.kind === 'top-up' && h.status === 'pending' && h.reference"
								class="p-btn p-btn--sm"
								type="button"
								:disabled="!!checking"
								@click="checkLine(h)"
							>
								{{ checking === h.reference ? "Checking…" : "Check status" }}
							</button>
							<strong class="amt" :class="{ plus: h.incoming && h.status !== 'pending' && h.status !== 'failed', muted: h.status === 'pending', struck: h.status === 'failed' }">
								{{ h.incoming ? "+" : "−" }}{{ money(h.amount) }}
							</strong>
						</div>
					</li>
				</ul>
			</StateBlock>
		</section>
	</AdsShell>
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
	grid-template-columns: minmax(0, 1fr);
}
.card-h {
	margin-bottom: 8px;
}
.tight {
	gap: 2px;
}
.sub {
	color: var(--muted);
	font-size: 12px;
	overflow-wrap: anywhere;
}
.end {
	gap: 8px;
	justify-content: flex-end;
}
.amt {
	font-variant-numeric: tabular-nums;
	white-space: nowrap;
}
.plus {
	color: var(--ok);
}
.muted,
.struck {
	color: var(--muted);
}
.struck {
	text-decoration: line-through;
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
	}
}
</style>

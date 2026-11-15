<script setup lang="ts">
// One campaign: where it stands (with the reviewer's reasons when it was
// turned down), its numbers by day, and what can be done with it now.
import { computed, onMounted, ref } from "vue";
import AdPreview from "../../../../components/ads/AdPreview.vue";
import AdsShell from "../../../../components/ads/AdsShell.vue";
import DailyChart from "../../../../components/ads/DailyChart.vue";
import TopUpForm from "../../../../components/ads/TopUpForm.vue";
import TopUpReturn from "../../../../components/ads/TopUpReturn.vue";
import Modal from "../../../../components/portal/Modal.vue";
import StatTile from "../../../../components/portal/StatTile.vue";
import StateBlock from "../../../../components/portal/StateBlock.vue";
import { campaigns as campaignsApi, wallet as walletApi } from "../../../../lib/ads/api";
import { areasText, loadMarket } from "../../../../lib/ads/areas";
import {
	amountLike,
	count,
	dateTime,
	describe,
	editable,
	errorCode,
	formatLabel,
	holdsBudget,
	money,
	parseMajor,
	statusHint,
	statusLabel,
	statusTone,
	toMinor,
} from "../../../../lib/ads/format";
import { endDay, showDay, startDay } from "../../../../lib/ads/market";
import { session } from "../../../../lib/ads/session";
import { toast } from "../../../../lib/ads/toast";
import type { Campaign, CampaignStats, Wallet } from "../../../../lib/ads/types";
import { confirmAction } from "../../../../lib/portal/confirm";

const id = ref("");
const campaign = ref<Campaign | null>(null);
const stats = ref<CampaignStats | null>(null);
const error = ref("");
const statsError = ref("");
const busy = ref(false);
const user = session.user;
const suspended = session.suspended;
const pricing = session.pricing;

async function loadStats() {
	statsError.value = "";
	try {
		stats.value = await campaignsApi.stats(id.value);
	} catch (e) {
		statsError.value = describe(e);
	}
}

async function load() {
	error.value = "";
	if (!id.value) {
		error.value = "No campaign was chosen.";
		return;
	}
	try {
		campaign.value = await campaignsApi.get(id.value);
	} catch (e) {
		error.value = errorCode(e) === "AdsErrorNotFound" ? "We couldn't find that campaign." : describe(e);
		return;
	}
	if (campaign.value.status !== "draft") void loadStats();
}

onMounted(async () => {
	id.value = new URLSearchParams(location.search).get("id") ?? "";
	if (!(await session.restore())) return;
	if (user.value) void loadMarket(user.value.currency);
	await load();
});

const c = computed(() => campaign.value);
const runs = computed(() => {
	if (!c.value) return "";
	const cur = c.value.currency;
	const to = endDay(c.value.ends_at, cur);
	return `${showDay(startDay(c.value.starts_at, cur))} – ${to ? showDay(to) : "until the budget is spent"}`;
});
const ctr = computed(() => {
	const s = stats.value;
	if (!s || !s.impressions) return "—";
	return `${s.ctr.toFixed(2)}%`;
});
const editLabel = computed(() => (c.value?.status === "rejected" ? "Edit and resubmit" : c.value?.status === "draft" ? "Continue editing" : "Edit"));
const canPause = computed(() => c.value && (c.value.status === "live" || c.value.status === "scheduled"));
const canResume = computed(() => c.value?.status === "paused" && c.value.pause_reason === "advertiser");
const canDelete = computed(() => c.value && (c.value.status === "draft" || c.value.status === "rejected"));

async function act(run: () => Promise<Campaign>, done: string) {
	if (busy.value) return;
	busy.value = true;
	try {
		campaign.value = await run();
		toast(done);
		void loadStats();
	} catch (e) {
		toast(describe(e), "bad");
		void load();
	} finally {
		busy.value = false;
	}
}

const pause = () => act(() => campaignsApi.pause(id.value), "Paused. It's stopped showing.");
const resume = () => act(() => campaignsApi.resume(id.value), "Resumed.");

async function endIt() {
	if (!c.value) return;
	const ok = await confirmAction({
		title: `End “${c.value.name}” now?`,
		message: `It stops showing for good. What it hasn't spent (about ${money(c.value.remaining)}) goes back to your ad wallet. This can't be undone.`,
		confirmText: "End campaign",
		cancelText: "Keep it",
		destructive: true,
	});
	if (ok) await act(() => campaignsApi.end(id.value), "Ended. The unspent budget is back in your wallet.");
}

async function remove() {
	if (!c.value || busy.value) return;
	const ok = await confirmAction({
		title: `Delete “${c.value.name}”?`,
		message: "The draft and its image or video are deleted. This can't be undone.",
		confirmText: "Delete",
		destructive: true,
	});
	if (!ok) return;
	busy.value = true;
	try {
		await campaignsApi.remove(id.value);
		toast("Deleted.");
		location.assign("/ads/campaigns");
	} catch (e) {
		toast(describe(e), "bad");
		busy.value = false;
	}
}

// ── Add budget ───────────────────────────────────────────────────────────────
const adding = ref(false);
const addText = ref("");
const addError = ref("");
const wallet = ref<Wallet | null>(null);
const short = ref(false);

async function openAdd() {
	adding.value = true;
	addText.value = "";
	addError.value = "";
	short.value = false;
	void session.loadPricing().catch(() => {});
	try {
		wallet.value = await walletApi.get();
	} catch {
		wallet.value = null;
	}
}

const addMajor = computed(() => parseMajor(addText.value));
const after = computed(() =>
	wallet.value && addMajor.value !== null ? wallet.value.available.amount - addMajor.value : null,
);

async function addBudget() {
	if (busy.value || !c.value) return;
	if (addMajor.value === null || addMajor.value <= 0) {
		addError.value = "Enter an amount, like 10000.";
		return;
	}
	busy.value = true;
	addError.value = "";
	try {
		campaign.value = await campaignsApi.addBudget(id.value, toMinor(addMajor.value));
		adding.value = false;
		toast(`Added ${money(amountLike(c.value.budget, addMajor.value))} to the budget.`);
	} catch (e) {
		addError.value = describe(e);
		short.value = errorCode(e) === "AdsErrorInsufficientBalance";
	} finally {
		busy.value = false;
	}
}
const shortBy = computed(() => {
	if (!wallet.value || addMajor.value === null) return null;
	return Math.max(Math.ceil(addMajor.value - wallet.value.available.amount), pricing.value?.top_up_min.amount ?? 0);
});
</script>

<template>
	<AdsShell :title="c?.name ?? 'Campaign'">
		<template v-if="c" #actions>
			<a v-if="editable(c.status)" class="p-btn" :class="{ 'p-btn--primary': c.status === 'rejected' || c.status === 'draft' }" :href="`/ads/campaigns/edit?id=${c.id}`">{{ editLabel }}</a>
			<button v-if="canPause" class="p-btn" type="button" :disabled="busy || suspended" @click="pause">Pause</button>
			<button v-if="canResume" class="p-btn p-btn--primary" type="button" :disabled="busy || suspended" @click="resume">Resume</button>
			<button v-if="holdsBudget(c.status)" class="p-btn" type="button" :disabled="busy || suspended" @click="openAdd">Add budget</button>
			<button v-if="holdsBudget(c.status)" class="p-btn p-btn--danger" type="button" :disabled="busy" @click="endIt">End campaign</button>
			<button v-if="canDelete" class="p-btn p-btn--danger" type="button" :disabled="busy" @click="remove">Delete</button>
		</template>

		<p><a class="link" href="/ads/campaigns">← All campaigns</a></p>
		<TopUpReturn @paid="toast('Your credit is in. You can add the budget now.')" />

		<StateBlock v-if="!c" class="card-box" :loading="!error" :error="error || null" @retry="load" />

		<template v-else>
			<section class="card-box p-stack-sm arrive" aria-labelledby="ads-status-h">
				<div class="card-h">
					<div>
						<h2 id="ads-status-h">
							<span class="p-badge" :class="statusTone[c.status] && `p-badge--${statusTone[c.status]}`">{{ statusLabel[c.status] ?? c.status }}</span>
						</h2>
						<p class="hint">{{ statusHint(c) }}</p>
					</div>
					<span class="p-muted p-small">{{ formatLabel[c.format] }} · version {{ c.version }}</span>
				</div>
				<div v-if="(c.status === 'rejected' || c.status === 'removed') && (c.reject_reasons.length || c.status_note)" class="p-alert" role="status">
					<p><strong>{{ c.status === "rejected" ? "Why it was turned down" : "Why it was taken down" }}</strong></p>
					<ul class="reasons">
						<li v-for="r in c.reject_reasons" :key="r.reason">{{ r.label }}</li>
					</ul>
					<p v-if="c.status_note" class="note">Reviewer's note: {{ c.status_note }}</p>
					<p v-if="c.status === 'rejected'">
						<a :href="`/ads/campaigns/edit?id=${c.id}`">Edit and resubmit</a>
					</p>
				</div>
			</section>

			<section v-if="c.status !== 'draft'" class="tiles" aria-label="Totals">
				<StatTile :order="1" :tone="1" shape="sq" label="Impressions" :value="count(stats?.impressions ?? c.impressions)" :sub="c.estimated_impressions ? `of about ${count(c.estimated_impressions)} the budget buys` : undefined" />
				<StatTile :order="2" shape="ci" color="var(--cat-2)" label="Clicks" :value="count(stats?.clicks ?? c.clicks)" :sub="`Click rate ${ctr}`" />
				<StatTile :order="3" :tone="3" shape="cd" label="Spent" :value="money(stats?.spent ?? c.spent)" :sub="`of ${money(c.budget)}`" />
				<StatTile :order="4" shape="di" color="var(--cat-4)" label="Budget left" :value="money(c.remaining)" />
			</section>

			<section v-if="c.status !== 'draft'" class="card-box arrive" style="--i: 5" aria-labelledby="ads-days-h">
				<div class="card-h">
					<div>
						<h2 id="ads-days-h">By day</h2>
						<p>Days in your market's time. Spend is counted every minute.</p>
					</div>
				</div>
				<StateBlock :loading="!stats && !statsError" :error="statsError || null" :empty="!!stats && !stats.days.length" empty-text="No numbers yet." empty-hint="They start once the ad is live." @retry="loadStats">
					<DailyChart v-if="stats" :days="stats.days" :currency="c.budget" />
				</StateBlock>
			</section>

			<div class="cols">
				<section class="card-box p-stack-sm arrive" style="--i: 6" aria-labelledby="ads-ad-h">
					<h2 id="ads-ad-h">The ad</h2>
					<AdPreview
						:format="c.format"
						:media-url="c.creative.media_url || null"
						:media-kind="c.creative.media_kind"
						:poster="c.creative.thumbnail_url"
						:description="c.creative.description"
						:business-name="c.business_name || user?.business_name || ''"
					/>
				</section>
				<section class="card-box p-stack-sm arrive" style="--i: 7" aria-labelledby="ads-details-h">
					<h2 id="ads-details-h">Details</h2>
					<dl class="kv">
						<div><dt>Link</dt><dd><a v-if="c.creative.destination_url" class="link" :href="c.creative.destination_url" target="_blank" rel="noopener noreferrer">{{ c.creative.destination_url }}</a><template v-else>—</template></dd></div>
						<div><dt>Where it shows</dt><dd>{{ areasText(c.areas) }}</dd></div>
						<div><dt>Runs</dt><dd>{{ runs }}</dd></div>
						<div><dt>Budget</dt><dd>{{ money(c.budget) }}</dd></div>
						<div><dt>Daily budget</dt><dd>{{ c.daily_budget ? money(c.daily_budget) : "Spread over the days it runs" }}</dd></div>
						<div><dt>Price per 1,000 impressions</dt><dd>{{ c.cpm.amount ? money(c.cpm) : "Set when you send it" }}</dd></div>
						<div v-if="c.submitted_at"><dt>Sent for review</dt><dd>{{ dateTime(c.submitted_at) }}</dd></div>
						<div v-if="c.approved_at"><dt>Approved</dt><dd>{{ dateTime(c.approved_at) }}</dd></div>
					</dl>
				</section>
			</div>
		</template>

		<Modal v-if="adding && c" title="Add budget" @close="adding = false">
			<form id="ads-add-form" class="p-stack-sm" novalidate @submit.prevent="addBudget">
				<p class="p-muted">
					The amount is held from your ad wallet at once.
					<template v-if="c.status === 'exhausted'"> The ad starts showing again, with no new review.</template>
				</p>
				<div v-if="addError" class="p-alert" role="alert">{{ addError }}</div>
				<label class="p-field">
					<span>Amount ({{ c.budget.symbol }})</span>
					<input v-model="addText" class="p-input" inputmode="decimal" maxlength="14" autocomplete="off" data-autofocus :aria-invalid="!!addError" @input="addError = ''; short = false" />
					<small v-if="wallet">
						You have {{ money(wallet.available) }}.
						<template v-if="after !== null">After this: {{ money(amountLike(wallet.available, after)) }}.</template>
						<template v-if="c.cpm.amount && addMajor"> About {{ count(Math.floor((addMajor * 1000) / c.cpm.amount)) }} more impressions.</template>
					</small>
				</label>
			</form>
			<div v-if="wallet && (short || (after !== null && after < 0))" class="p-stack-sm topup">
				<p><strong>Not enough credit.</strong> Top up first, then add the budget.</p>
				<TopUpForm :pricing="pricing" :notice="wallet.notice" :offer="wallet.bonus_offer" :return-path="`/ads/campaigns/view?id=${c.id}`" :suggested="shortBy" id-prefix="ads-add-topup" />
			</div>
			<template #footer>
				<button class="p-btn p-btn--ghost" type="button" @click="adding = false">Cancel</button>
				<button class="p-btn p-btn--primary" type="submit" form="ads-add-form" :disabled="busy || !addText.trim()">
					{{ busy ? "Adding…" : "Add budget" }}
				</button>
			</template>
		</Modal>
	</AdsShell>
</template>

<style scoped>
.hint {
	margin-top: 8px;
}
.reasons {
	list-style: disc;
	padding-left: 20px;
	margin: 6px 0;
}
.note {
	font-style: italic;
}
.tiles {
	display: grid;
	gap: 20px;
	grid-template-columns: repeat(4, minmax(0, 1fr));
}
.cols {
	display: grid;
	gap: 20px;
	grid-template-columns: minmax(0, 1fr);
	align-items: start;
}
.topup {
	margin-top: 16px;
	padding-top: 16px;
	border-top: 1px solid var(--line);
}
@media (min-width: 1024px) {
	.cols {
		grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
	}
}
@media (max-width: 1023px) {
	.tiles {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
</style>

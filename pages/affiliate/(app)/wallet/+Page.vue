<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AffiliateShell from "../../../../components/affiliate/AffiliateShell.vue";
import HeroPanel from "../../../../components/portal/HeroPanel.vue";
import StatTile from "../../../../components/portal/StatTile.vue";
import StateBlock from "../../../../components/portal/StateBlock.vue";
import { bank, wallet as walletApi } from "../../../../lib/affiliate/api";
import { confirmAction } from "../../../../lib/portal/confirm";
import {
	dateTime,
	describe,
	errorCode,
	money,
	withdrawalLabel,
	withdrawalTone,
} from "../../../../lib/affiliate/format";
import { session } from "../../../../lib/affiliate/session";
import { toast } from "../../../../lib/affiliate/toast";
import type { BankAccount, Wallet, Withdrawal } from "../../../../lib/affiliate/types";

const wallet = ref<Wallet | null>(null);
const withdrawals = ref<Withdrawal[] | null>(null);
const account = ref<BankAccount | null>(null);
const error = ref("");

async function load() {
	error.value = "";
	const [w, list, acct] = await Promise.allSettled([
		walletApi.get(),
		walletApi.withdrawals(),
		bank.get(),
	]);
	if (w.status === "fulfilled") wallet.value = w.value;
	else error.value = describe(w.reason);
	withdrawals.value = list.status === "fulfilled" ? list.value : [];
	if (acct.status === "fulfilled") account.value = acct.value;
}

onMounted(async () => {
	if (await session.restore()) await load();
});

// ---- Withdraw ----
const amountText = ref("");
const formError = ref("");
const busy = ref(false);

// Amounts from the API (AmountDto) are in naira; the withdrawal is sent in kobo.
/** What was typed, in naira; null when it isn't a number. */
const naira = computed(() => {
	const t = amountText.value.replace(/[,\s₦]/g, "");
	if (!/^\d+(\.\d{0,2})?$/.test(t)) return null;
	return Number(t);
});
const symbol = computed(() => wallet.value?.available.symbol ?? "₦");
const asAmount = (amount: number) => ({
	symbol: symbol.value,
	amount,
	currency: wallet.value?.available.currency ?? "NGN",
});
const minimum = computed(() => wallet.value?.min_withdrawal.amount ?? 0);
const available = computed(() => wallet.value?.available.amount ?? 0);
const enough = computed(() => available.value >= minimum.value && available.value > 0);

function check(): string {
	if (naira.value === null || naira.value <= 0) return "Enter an amount, like 5000.";
	if (naira.value < minimum.value)
		return `The minimum withdrawal is ${money(wallet.value!.min_withdrawal)}.`;
	if (naira.value > available.value)
		return `You have ${money(wallet.value!.available)} available.`;
	return "";
}

function all() {
	amountText.value = String(available.value);
	formError.value = "";
}

async function review() {
	if (busy.value) return;
	formError.value = check();
	if (formError.value || naira.value === null) return;
	const to = account.value
		? ` to ${account.value.account_name}, ${account.value.bank_name} ${account.value.account_number}`
		: "";
	const ok = await confirmAction({
		title: `Withdraw ${money(asAmount(naira.value))}${to}?`,
		message: "We review each withdrawal before paying it. You can cancel it while it's pending.",
		confirmText: "Withdraw",
	});
	if (ok) await withdraw();
}

async function withdraw() {
	if (busy.value || naira.value === null) return;
	busy.value = true;
	try {
		await walletApi.withdraw(Math.round(naira.value * 100));
		amountText.value = "";
		toast("Withdrawal requested. We'll email you when it's paid.");
		await Promise.all([load(), session.loadOverview().catch(() => {})]);
	} catch (e) {
		formError.value =
			errorCode(e) === "AffiliateErrorBelowMinimum" && wallet.value
				? `The minimum withdrawal is ${money(wallet.value.min_withdrawal)}.`
				: describe(e);
		if (
			["AffiliateErrorBankAccountCoolingOff", "AffiliateErrorSuspended", "AffiliateErrorInsufficientBalance"].includes(errorCode(e))
		)
			void load();
	} finally {
		busy.value = false;
	}
}

// ---- Cancel ----
async function cancel(w: Withdrawal) {
	if (busy.value) return;
	const ok = await confirmAction({
		title: "Cancel this withdrawal?",
		message: `${money(w.amount)} goes back to your available balance. You can ask again later.`,
		confirmText: "Cancel withdrawal",
		cancelText: "Keep it",
		destructive: true,
	});
	if (!ok || busy.value) return;
	busy.value = true;
	try {
		await walletApi.cancel(w.id);
		toast("Withdrawal cancelled. The money is back in your balance.");
		await load();
	} catch (e) {
		toast(describe(e), "bad");
		await load();
	} finally {
		busy.value = false;
	}
}

const coolOff = computed(() => {
	const until = wallet.value?.bank_cool_off_until;
	return until && new Date(until).getTime() > Date.now() ? until : null;
});
</script>

<template>
	<AffiliateShell title="Wallet">
		<div v-if="error" class="p-alert" role="alert">
			{{ error }}
			<button class="p-btn p-btn--sm" type="button" @click="load">Retry</button>
		</div>

		<div v-if="wallet" class="top" aria-label="Balances">
			<HeroPanel
				class="top-hero"
				numeric
				eyebrow="Available to withdraw"
				shape="sq"
				color="var(--cat-1)"
				:title="money(wallet.available)"
			/>
			<div class="top-tiles">
				<StatTile :order="1" :tone="3" shape="cd" label="In a withdrawal" :value="money(wallet.reserved)" />
				<StatTile :order="2" :tone="0" shape="ci" color="var(--cat-2)" label="Minimum withdrawal" :value="money(wallet.min_withdrawal)" />
			</div>
		</div>
		<div v-else-if="!error" class="top" aria-hidden="true">
			<div class="p-skeleton p-skeleton--block top-hero" />
			<div class="p-skeleton p-skeleton--block" />
		</div>

		<section v-if="wallet" class="card-box p-stack-sm arrive" style="--i: 3" aria-labelledby="aff-withdraw-h">
			<h2 id="aff-withdraw-h">Withdraw</h2>
			<div v-if="!wallet.can_withdraw" class="p-alert p-alert--warn" role="status">
				{{ wallet.blocked_reason || "Withdrawals aren't available right now." }}
				<template v-if="coolOff"> Withdrawals open {{ dateTime(coolOff) }}.</template>
				<template v-if="!account"> <a href="/affiliate/bank">Add your bank account</a></template>
			</div>
			<form class="p-stack-sm" novalidate @submit.prevent="review">
				<div v-if="formError" class="p-alert" role="alert">{{ formError }}</div>
				<div class="withdraw-row">
					<label class="p-field grow">
						<span>Amount ({{ symbol }})</span>
						<input
							v-model="amountText"
							class="p-input"
							inputmode="decimal"
							maxlength="14"
							autocomplete="off"
							:placeholder="String(minimum)"
							:disabled="!wallet.can_withdraw"
							:aria-invalid="!!formError"
							aria-describedby="aff-withdraw-hint"
							@input="formError = ''"
						/>
					</label>
					<button
						class="p-btn"
						type="button"
						:disabled="!wallet.can_withdraw || !enough"
						@click="all"
					>
						Withdraw all
					</button>
					<button class="p-btn p-btn--primary" :disabled="!wallet.can_withdraw || !amountText.trim()">
						Continue
					</button>
				</div>
				<small id="aff-withdraw-hint" class="p-hint">
					Minimum {{ money(wallet.min_withdrawal) }}.
					<template v-if="account">
						Paid to {{ account.bank_name }} {{ account.account_number }} ({{ account.account_name }}).
						<a class="link" href="/affiliate/bank">Change</a>
					</template>
					One withdrawal at a time; we review each one before paying it.
				</small>
			</form>
		</section>

		<section class="card-box arrive" style="--i: 4" aria-labelledby="aff-wd-h">
			<div class="card-h">
				<h2 id="aff-wd-h">Withdrawals</h2>
			</div>
			<StateBlock
				:loading="withdrawals === null"
				:empty="withdrawals !== null && !withdrawals.length"
				empty-text="No withdrawals yet."
			>
				<ul class="p-list">
					<li v-for="w in withdrawals ?? []" :key="w.id">
						<div class="p-stack-sm tight">
							<strong>{{ money(w.amount) }}</strong>
							<span class="sub">Requested {{ dateTime(w.created_at) }}<template v-if="w.updated_at !== w.created_at"> · updated {{ dateTime(w.updated_at) }}</template></span>
							<span v-if="w.failure_reason && ['failed', 'reversed', 'rejected'].includes(w.status)" class="reason">
								{{ w.failure_reason }}
							</span>
						</div>
						<div class="p-row p-wrap end">
							<span class="p-badge" :class="withdrawalTone(w.status) && `p-badge--${withdrawalTone(w.status)}`">
								{{ withdrawalLabel[w.status] ?? w.status }}
							</span>
							<button
								v-if="w.status === 'pending'"
								class="p-btn p-btn--sm p-btn--danger"
								type="button"
								@click="cancel(w)"
							>
								Cancel
							</button>
						</div>
					</li>
				</ul>
			</StateBlock>
		</section>

		<section v-if="wallet" class="card-box arrive" style="--i: 5" aria-labelledby="aff-hist-h">
			<div class="card-h">
				<h2 id="aff-hist-h">History</h2>
			</div>
			<StateBlock :empty="!wallet.history.length" empty-text="Rewards and withdrawals will show up here.">
				<ul class="p-list">
					<li v-for="(h, i) in wallet.history" :key="i">
						<div class="p-stack-sm tight">
							<strong>{{ h.title }}</strong>
							<span class="sub">{{ dateTime(h.at) }}</span>
						</div>
						<div class="p-row p-wrap end">
							<span v-if="h.status" class="p-badge" :class="withdrawalTone(h.status) && `p-badge--${withdrawalTone(h.status)}`">
								{{ withdrawalLabel[h.status as keyof typeof withdrawalLabel] ?? h.status }}
							</span>
							<strong class="amt" :class="h.kind === 'reward' ? 'plus' : ''">
								{{ h.kind === "reward" ? "+" : "−" }}{{ money(h.amount) }}
							</strong>
						</div>
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
.card-h {
	margin-bottom: 8px;
}
.withdraw-row {
	display: flex;
	align-items: flex-end;
	flex-wrap: wrap;
	gap: 12px;
}
.grow {
	flex: 1 1 200px;
}
.tight {
	gap: 2px;
}
.sub {
	color: var(--muted);
	font-size: 12px;
}
.reason {
	color: var(--bad);
	font-size: 13px;
	font-weight: 600;
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

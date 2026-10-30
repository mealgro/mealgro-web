<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AffiliateShell from "../../../../components/affiliate/AffiliateShell.vue";
import Modal from "../../../../components/portal/Modal.vue";
import { bank, wallet as walletApi } from "../../../../lib/affiliate/api";
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
const confirming = ref(false);
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

function review() {
	formError.value = check();
	if (!formError.value) confirming.value = true;
}

async function withdraw() {
	if (busy.value || naira.value === null) return;
	busy.value = true;
	try {
		await walletApi.withdraw(Math.round(naira.value * 100));
		confirming.value = false;
		amountText.value = "";
		toast("Withdrawal requested. We'll email you when it's paid.");
		await Promise.all([load(), session.loadOverview().catch(() => {})]);
	} catch (e) {
		confirming.value = false;
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
const cancelling = ref<Withdrawal | null>(null);
async function cancel() {
	const w = cancelling.value;
	if (!w || busy.value) return;
	busy.value = true;
	try {
		await walletApi.cancel(w.id);
		toast("Withdrawal cancelled. The money is back in your balance.");
		cancelling.value = null;
		await load();
	} catch (e) {
		cancelling.value = null;
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
		<div v-if="error" class="p-alert" role="alert">{{ error }}</div>

		<section v-if="wallet" class="p-grid tiles" aria-label="Balances">
			<div class="p-card p-stat">
				<strong>{{ money(wallet.available) }}</strong>
				<span>Available to withdraw</span>
			</div>
			<div class="p-card p-stat">
				<strong>{{ money(wallet.reserved) }}</strong>
				<span>In a withdrawal</span>
			</div>
			<div class="p-card p-stat">
				<strong>{{ money(wallet.min_withdrawal) }}</strong>
				<span>Minimum withdrawal</span>
			</div>
		</section>
		<p v-else-if="!error" class="p-muted" role="status">Loading…</p>

		<section v-if="wallet" class="p-card p-stack" aria-labelledby="aff-withdraw-h">
			<h2 id="aff-withdraw-h">Withdraw</h2>
			<div v-if="!wallet.can_withdraw" class="p-alert p-alert--warn" role="status">
				{{ wallet.blocked_reason || "Withdrawals aren't available right now." }}
				<template v-if="coolOff"> Withdrawals open {{ dateTime(coolOff) }}.</template>
				<template v-if="!account"> <a href="/affiliate/bank">Add your bank account</a></template>
			</div>
			<form class="p-stack" novalidate @submit.prevent="review">
				<div v-if="formError" class="p-alert" role="alert">{{ formError }}</div>
				<div class="p-row withdraw-row">
					<label class="p-field grow">
						<span>Amount ({{ symbol }})</span>
						<input
							v-model="amountText"
							class="p-input"
							inputmode="decimal"
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
					<button class="p-btn p-btn--primary" :disabled="!wallet.can_withdraw || !amountText">
						Continue
					</button>
				</div>
				<small id="aff-withdraw-hint" class="p-muted">
					Minimum {{ money(wallet.min_withdrawal) }}.
					<template v-if="account">
						Paid to {{ account.bank_name }} {{ account.account_number }} ({{ account.account_name }}).
						<a class="link" href="/affiliate/bank">Change</a>
					</template>
					One withdrawal at a time; we review each one before paying it.
				</small>
			</form>
		</section>

		<section class="p-card p-stack" aria-labelledby="aff-wd-h">
			<h2 id="aff-wd-h">Withdrawals</h2>
			<p v-if="withdrawals === null" class="p-muted" role="status">Loading…</p>
			<p v-else-if="!withdrawals.length" class="aff-empty">No withdrawals yet.</p>
			<ul v-else class="aff-list">
				<li v-for="w in withdrawals" :key="w.id">
					<div class="p-stack tight">
						<strong>{{ money(w.amount) }}</strong>
						<span class="sub">Requested {{ dateTime(w.created_at) }}<template v-if="w.updated_at !== w.created_at"> · updated {{ dateTime(w.updated_at) }}</template></span>
						<span v-if="w.failure_reason && ['failed', 'reversed', 'rejected'].includes(w.status)" class="reason">
							{{ w.failure_reason }}
						</span>
					</div>
					<div class="p-row end">
						<span class="p-badge" :class="withdrawalTone(w.status) && `p-badge--${withdrawalTone(w.status)}`">
							{{ withdrawalLabel[w.status] ?? w.status }}
						</span>
						<button
							v-if="w.status === 'pending'"
							class="p-btn p-btn--sm p-btn--danger"
							type="button"
							@click="cancelling = w"
						>
							Cancel
						</button>
					</div>
				</li>
			</ul>
		</section>

		<section v-if="wallet" class="p-card p-stack" aria-labelledby="aff-hist-h">
			<h2 id="aff-hist-h">History</h2>
			<p v-if="!wallet.history.length" class="aff-empty">
				Rewards and withdrawals will show up here.
			</p>
			<ul v-else class="aff-list">
				<li v-for="(h, i) in wallet.history" :key="i">
					<div class="p-stack tight">
						<strong>{{ h.title }}</strong>
						<span class="sub">{{ dateTime(h.at) }}</span>
					</div>
					<div class="p-row end">
						<span v-if="h.status" class="p-badge" :class="withdrawalTone(h.status) && `p-badge--${withdrawalTone(h.status)}`">
							{{ withdrawalLabel[h.status as keyof typeof withdrawalLabel] ?? h.status }}
						</span>
						<strong :class="h.kind === 'reward' ? 'plus' : ''">
							{{ h.kind === "reward" ? "+" : "−" }}{{ money(h.amount) }}
						</strong>
					</div>
				</li>
			</ul>
		</section>

		<Modal v-if="confirming && wallet && naira !== null" title="Confirm withdrawal" @close="confirming = false">
			<div class="p-stack">
				<p>
					Withdraw <strong>{{ money(asAmount(naira)) }}</strong>
					<template v-if="account">
						to <strong>{{ account.account_name }}</strong>, {{ account.bank_name }}
						{{ account.account_number }}</template
					>?
				</p>
				<p class="p-muted">
					We review each withdrawal before paying it. You can cancel it while it's pending.
				</p>
			</div>
			<template #footer>
				<button class="p-btn" type="button" @click="confirming = false">Back</button>
				<button class="p-btn p-btn--primary" type="button" :disabled="busy" @click="withdraw">
					{{ busy ? "Requesting…" : "Withdraw" }}
				</button>
			</template>
		</Modal>

		<Modal v-if="cancelling" title="Cancel this withdrawal?" @close="cancelling = null">
			<p>
				{{ money(cancelling.amount) }} goes back to your available balance. You can ask again
				later.
			</p>
			<template #footer>
				<button class="p-btn" type="button" @click="cancelling = null">Keep it</button>
				<button class="p-btn p-btn--primary" type="button" :disabled="busy" @click="cancel">
					{{ busy ? "Cancelling…" : "Cancel withdrawal" }}
				</button>
			</template>
		</Modal>
	</AffiliateShell>
</template>

<style scoped>
.tiles {
	grid-template-columns: repeat(3, minmax(0, 1fr));
}
.withdraw-row {
	align-items: flex-end;
	flex-wrap: wrap;
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
}
.end {
	gap: 8px;
	flex-wrap: wrap;
	justify-content: flex-end;
}
.plus {
	color: var(--ok);
}
@media (max-width: 720px) {
	.tiles {
		grid-template-columns: 1fr;
	}
}
</style>

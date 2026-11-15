<script setup lang="ts">
// Back from Paystack with `?reference=…`: asks for that top-up's status a few
// times (it never starts a charge), then says how it went.
import { onMounted, ref } from "vue";
import { describe, money } from "../../lib/ads/format";
import { checkTopUp, forgetReference, returnedReference } from "../../lib/ads/topup";
import type { Amount } from "../../lib/ads/types";

const emit = defineEmits<{ paid: [amount: Amount] }>();

const reference = ref<string | null>(null);
const state = ref<"idle" | "checking" | "paid" | "pending" | "failed" | "error">("idle");
const paidAmount = ref<Amount | null>(null);
const bonusPaid = ref<Amount | null>(null);
const error = ref("");

async function check() {
	if (!reference.value || state.value === "checking") return;
	state.value = "checking";
	const out = await checkTopUp(reference.value);
	state.value = out.state;
	if (out.state === "paid") {
		paidAmount.value = out.topUp.amount;
		bonusPaid.value = out.topUp.bonus_paid?.amount > 0 ? out.topUp.bonus_paid : null;
		emit("paid", out.topUp.amount);
	}
	if (out.state === "error") error.value = describe(out.error);
}

onMounted(() => {
	reference.value = returnedReference();
	if (!reference.value) return;
	forgetReference();
	void check();
});
</script>

<template>
	<template v-if="reference">
		<div v-if="state === 'checking'" class="p-alert p-alert--info" role="status">Checking your payment…</div>
		<div v-else-if="state === 'paid'" class="p-alert p-alert--ok" role="status">
			Payment received. {{ money(paidAmount) }} is in your ad wallet.
			<template v-if="bonusPaid"> Your {{ money(bonusPaid) }} bonus landed too.</template>
		</div>
		<div v-else-if="state === 'pending'" class="p-alert p-alert--warn" role="status">
			<p>
				Paystack hasn't confirmed your payment yet. It'll show in your balance as soon as it's confirmed.
				You don't need to pay again.
			</p>
			<button class="p-btn p-btn--sm" type="button" @click="check">Check again</button>
		</div>
		<div v-else-if="state === 'failed'" class="p-alert" role="alert">
			The payment didn't go through, so nothing was added. You can try again with another card or a bank transfer.
		</div>
		<div v-else-if="state === 'error'" class="p-alert" role="alert">
			<p>We couldn't check your payment. {{ error }}</p>
			<button class="p-btn p-btn--sm" type="button" @click="check">Retry</button>
		</div>
	</template>
</template>

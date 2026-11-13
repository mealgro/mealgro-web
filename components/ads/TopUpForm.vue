<script setup lang="ts">
// Adds ad credit through Paystack. The non-refundable notice is shown above
// the button and again in the confirm step, before every top-up.
import { computed, ref, watch } from "vue";
import { amountLike, describe, money, parseMajor, toMinor } from "../../lib/ads/format";
import { startTopUp } from "../../lib/ads/topup";
import type { Pricing } from "../../lib/ads/types";
import { confirmAction } from "../../lib/portal/confirm";

const props = withDefaults(
	defineProps<{
		pricing: Pricing | null;
		/** WalletDto.notice: credit can only be spent on ads. */
		notice: string;
		/** Where Paystack sends the payer back (a page under /ads/). */
		returnPath: string;
		/** An amount to start with, in major units. */
		suggested?: number | null;
		/** Why topping up isn't possible now, if it isn't. */
		blocked?: string | null;
		idPrefix?: string;
	}>(),
	{ suggested: null, blocked: null, idPrefix: "ads-topup" },
);

const text = ref(props.suggested ? String(props.suggested) : "");
watch(
	() => props.suggested,
	(v) => {
		if (v) text.value = String(v);
	},
);
const error = ref("");
const busy = ref(false);

const min = computed(() => props.pricing?.top_up_min ?? null);
const max = computed(() => props.pricing?.top_up_max ?? null);
const symbol = computed(() => min.value?.symbol ?? "₦");
const major = computed(() => parseMajor(text.value));

function check(): string {
	if (major.value === null || major.value <= 0) return "Enter an amount, like 20000.";
	if (min.value && min.value.amount > 0 && major.value < min.value.amount) return `The smallest top-up is ${money(min.value)}.`;
	if (max.value && max.value.amount > 0 && major.value > max.value.amount) return `The largest top-up is ${money(max.value)}.`;
	return "";
}

async function go() {
	if (busy.value || props.blocked) return;
	error.value = check();
	if (error.value || major.value === null) return;
	const amount = amountLike(min.value, major.value);
	const ok = await confirmAction({
		title: `Top up ${money(amount)}?`,
		message: `${props.notice} You'll pay on Paystack's page, then come back here.`,
		confirmText: "Continue to payment",
	});
	if (!ok) return;
	busy.value = true;
	try {
		await startTopUp(toMinor(major.value), props.returnPath);
		// The page is leaving for Paystack; stay busy until it does.
	} catch (e) {
		error.value = describe(e);
		busy.value = false;
	}
}
</script>

<template>
	<form class="p-stack-sm" novalidate @submit.prevent="go">
		<div v-if="blocked" class="p-alert p-alert--warn" role="status">{{ blocked }}</div>
		<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
		<div class="row">
			<label class="p-field grow">
				<span>Amount ({{ symbol }})</span>
				<input
					v-model="text"
					class="p-input"
					inputmode="decimal"
					maxlength="14"
					autocomplete="off"
					:placeholder="min ? String(min.amount) : ''"
					:disabled="!!blocked || busy"
					:aria-invalid="!!error"
					:aria-describedby="`${idPrefix}-hint ${idPrefix}-notice`"
					@input="error = ''"
				/>
			</label>
			<button class="p-btn p-btn--primary" :disabled="!!blocked || busy || !text.trim()">
				{{ busy ? "Opening Paystack…" : "Top up" }}
			</button>
		</div>
		<small :id="`${idPrefix}-hint`" class="p-hint">
			<template v-if="min && max">From {{ money(min) }} to {{ money(max) }}. </template>
			Pay by card or bank transfer on Paystack.
		</small>
		<p :id="`${idPrefix}-notice`" class="p-alert p-alert--info notice">{{ notice }}</p>
	</form>
</template>

<style scoped>
.row {
	display: flex;
	align-items: flex-end;
	flex-wrap: wrap;
	gap: 12px;
}
.grow {
	flex: 1 1 200px;
}
.notice {
	font-weight: 600;
}
</style>

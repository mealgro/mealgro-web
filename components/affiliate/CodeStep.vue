<script setup lang="ts">
// The emailed 6-digit code: entry, a resend with a 60 s cooldown, and the
// expired/burned case (5 wrong tries burn a code).
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { describe, errorCode } from "../../lib/affiliate/format";

const props = defineProps<{
	email: string;
	/** Checks the code; throws an API error when it's refused. */
	verify: (otp: string) => Promise<unknown>;
	/** Sends a new code. */
	resend: () => Promise<unknown>;
	submitLabel?: string;
	backLabel?: string;
	/** Replaces the "we emailed a code" line. */
	lead?: string;
}>();
const emit = defineEmits<{ back: []; done: [] }>();

const COOLDOWN = 60;
const code = ref("");
const busy = ref(false);
const error = ref("");
const info = ref("");
/** The code can't be used any more: only a new one helps. */
const burned = ref(false);
const wait = ref(COOLDOWN);
const input = ref<HTMLInputElement>();
let timer: ReturnType<typeof setInterval> | undefined;

function startCooldown() {
	wait.value = COOLDOWN;
	clearInterval(timer);
	timer = setInterval(() => {
		wait.value = Math.max(0, wait.value - 1);
		if (wait.value === 0) clearInterval(timer);
	}, 1000);
}

onMounted(() => {
	startCooldown();
	input.value?.focus();
});
onBeforeUnmount(() => clearInterval(timer));

const valid = computed(() => /^\d{6}$/.test(code.value));

function onInput(e: Event) {
	code.value = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 6);
	error.value = "";
	if (valid.value) void submit();
}

async function submit() {
	if (busy.value || !valid.value || burned.value) return;
	busy.value = true;
	error.value = "";
	info.value = "";
	try {
		await props.verify(code.value);
		emit("done");
	} catch (e) {
		error.value = describe(e);
		if (errorCode(e) === "OTPErrorTokenExpired") burned.value = true;
		code.value = "";
		await nextTick();
		input.value?.focus();
	} finally {
		busy.value = false;
	}
}

async function again() {
	if (busy.value || wait.value > 0) return;
	busy.value = true;
	error.value = "";
	info.value = "";
	try {
		await props.resend();
		burned.value = false;
		code.value = "";
		info.value = `We sent a new code to ${props.email}.`;
		startCooldown();
		await nextTick();
		input.value?.focus();
	} catch (e) {
		error.value = describe(e);
		if (errorCode(e) === "AffiliateErrorCodeRecentlySent") startCooldown();
	} finally {
		busy.value = false;
	}
}
</script>

<template>
	<form class="p-stack" novalidate @submit.prevent="submit">
		<p v-if="lead" class="p-muted">{{ lead }}</p>
		<p v-else class="p-muted">
			We emailed a 6-digit code to <strong>{{ email }}</strong>. It works for 5 minutes.
		</p>
		<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
		<div v-else-if="info" class="p-alert p-alert--ok" role="status">{{ info }}</div>
		<label class="p-field">
			<span>Code</span>
			<input
				ref="input"
				class="p-input aff-otp"
				:value="code"
				type="text"
				inputmode="numeric"
				autocomplete="one-time-code"
				pattern="[0-9]{6}"
				maxlength="6"
				aria-describedby="aff-code-hint"
				:aria-invalid="!!error && !burned"
				:disabled="burned"
				required
				@input="onInput"
			/>
			<small id="aff-code-hint">Didn't get it? Check spam, or ask for a new one below.</small>
		</label>
		<button v-if="!burned" class="p-btn p-btn--primary p-btn--block" :disabled="busy || !valid">
			{{ busy ? "Checking…" : (submitLabel ?? "Continue") }}
		</button>
		<div class="p-row p-between resend">
			<button class="link" type="button" @click="emit('back')">
				{{ backLabel ?? "Use a different email" }}
			</button>
			<button
				class="p-btn p-btn--sm"
				:class="{ 'p-btn--primary': burned }"
				type="button"
				:disabled="busy || wait > 0"
				@click="again"
			>
				{{ wait > 0 ? `Send a new code in ${wait}s` : "Send a new code" }}
			</button>
		</div>
	</form>
</template>

<style scoped>
.resend {
	flex-wrap: wrap;
	gap: 10px;
}
</style>

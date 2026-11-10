<script setup lang="ts">
// A waitlist sign-up, sent to Web3Forms (the same service, keys and field
// names the vendor and rider forms always used, so submissions keep arriving
// where they did). With JavaScript it posts in place and says it's done;
// without, the form posts the normal way.
import { ref } from "vue";

export type Field = {
	name: string;
	label: string;
	type?: string;
	placeholder?: string;
	autocomplete?: string;
	full?: boolean;
};

const props = defineProps<{
	accessKey: string;
	subject: string;
	fields: Field[];
	submitLabel: string;
	doneTitle: string;
	doneText: string;
}>();

const ENDPOINT = "https://api.web3forms.com/submit";
const state = ref<"idle" | "sending" | "done" | "failed">("idle");
const errorText = ref("");

async function submit(e: Event) {
	const form = e.target as HTMLFormElement;
	state.value = "sending";
	errorText.value = "";
	const body = Object.fromEntries(new FormData(form).entries());
	try {
		const res = await fetch(ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json", Accept: "application/json" },
			body: JSON.stringify(body),
		});
		const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
		if (!res.ok || json.success === false) throw new Error(json.message || "");
		state.value = "done";
		form.reset();
	} catch (err) {
		state.value = "failed";
		errorText.value =
			(err as Error).message ||
			"We couldn't send your details just now. Check your connection and try again.";
	}
}
</script>

<template>
	<div v-if="state === 'done'" class="s-alert s-alert--ok" role="status">
		<span class="sh sh-ci" style="--c: var(--ok); margin-top: 6px" aria-hidden="true" />
		<div>
			<p><strong>{{ doneTitle }}</strong></p>
			<p>{{ doneText }}</p>
		</div>
	</div>
	<form v-else class="s-form" :action="ENDPOINT" method="POST" @submit.prevent="submit">
		<input type="hidden" name="access_key" :value="props.accessKey" />
		<input type="hidden" name="subject" :value="props.subject" />
		<label v-for="f in fields" :key="f.name" class="s-field" :class="{ full: f.full }">
			{{ f.label }}
			<input
				class="s-input"
				:type="f.type ?? 'text'"
				:name="f.name"
				:placeholder="f.placeholder"
				:autocomplete="f.autocomplete"
				required
			/>
		</label>
		<div v-if="state === 'failed'" class="s-alert s-alert--bad full" role="alert">
			<span class="sh sh-di" style="--c: var(--bad); margin-top: 6px" aria-hidden="true" />
			<p>{{ errorText }}</p>
		</div>
		<div class="full">
			<button class="s-btn s-btn--primary" type="submit" :disabled="state === 'sending'">
				{{ state === "sending" ? "Sending…" : submitLabel }}
			</button>
		</div>
	</form>
</template>

<style scoped>
button:disabled {
	opacity: 0.7;
	cursor: progress;
}
</style>

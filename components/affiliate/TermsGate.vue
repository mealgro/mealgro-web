<script setup lang="ts">
// Shown when the terms changed since the affiliate last accepted them. Until
// they accept, the account is read-only apart from withdrawals.
import { onMounted, ref } from "vue";
import { me, publicApi } from "../../lib/affiliate/api";
import { describe } from "../../lib/affiliate/format";
import { session } from "../../lib/affiliate/session";
import { toast } from "../../lib/affiliate/toast";
import type { Terms } from "../../lib/affiliate/types";
import TermsText from "./TermsText.vue";

const terms = ref<Terms | null>(null);
const agreed = ref(false);
const busy = ref(false);
const error = ref("");

async function load() {
	error.value = "";
	try {
		terms.value = await publicApi.terms();
	} catch (e) {
		error.value = describe(e);
	}
}
onMounted(load);

async function accept() {
	if (!terms.value || !agreed.value || busy.value) return;
	busy.value = true;
	error.value = "";
	try {
		session.setUser(await me.acceptTerms(terms.value.version));
		toast("Thanks — you've accepted the updated terms.");
	} catch (e) {
		error.value = describe(e);
		// A newer version may have just been published.
		agreed.value = false;
		await load();
	} finally {
		busy.value = false;
	}
}
</script>

<template>
	<section class="card-box p-stack-sm gate" aria-labelledby="aff-terms-gate">
		<div>
			<h2 id="aff-terms-gate">We've updated the affiliate terms</h2>
			<p class="p-muted">
				Please read and accept them to keep using your account. Until then you can still read
				your account and withdraw your balance.
			</p>
		</div>
		<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
		<TermsText v-if="terms" :content="terms.content" label="Updated affiliate terms" />
		<p v-else-if="!error" class="p-muted" role="status">Loading the terms…</p>
		<form v-if="terms" class="p-row p-wrap p-between" @submit.prevent="accept">
			<label class="p-check">
				<input v-model="agreed" type="checkbox" required />
				<span>I've read and accept the updated affiliate terms</span>
			</label>
			<button class="p-btn p-btn--primary" :disabled="!agreed || busy">
				{{ busy ? "Saving…" : "Accept" }}
			</button>
		</form>
	</section>
</template>

<style scoped>
.gate {
	border: 2px solid var(--brand);
}
</style>

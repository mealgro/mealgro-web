<script setup lang="ts">
import { onMounted, ref } from "vue";
import { auth } from "../../../../lib/affiliate/api";
import { describe, errorCode } from "../../../../lib/affiliate/format";
import { HOME, session } from "../../../../lib/affiliate/session";
import AuthLayout from "../../../../components/portal/AuthLayout.vue";
import CodeStep from "../../../../components/affiliate/CodeStep.vue";

const step = ref<"email" | "code">("email");
const email = ref("");
const busy = ref(false);
const error = ref("");
const closed = ref(false);

onMounted(async () => {
	closed.value = new URLSearchParams(location.search).has("closed");
	if (await session.restore()) location.replace(HOME);
});

async function send() {
	if (busy.value) return;
	busy.value = true;
	error.value = "";
	try {
		await auth.login(email.value.trim());
		step.value = "code";
	} catch (e) {
		// A code sent a moment ago is still good: go and enter it.
		if (errorCode(e) === "AffiliateErrorCodeRecentlySent") step.value = "code";
		else error.value = describe(e);
	} finally {
		busy.value = false;
	}
}

const verify = (otp: string) => session.verify(email.value.trim(), otp);
const resend = () => auth.login(email.value.trim());
const done = () => location.assign(HOME);
</script>

<template>
	<AuthLayout area="Affiliate program" home-href="/affiliate" headline="Bring vendors. Get paid." tagline="Share your code with restaurants and food vendors. You earn a reward for every one we approve.">
		<template #top><a class="link" href="/affiliate/signup">Become an affiliate</a></template>
		<div class="p-stack">
			<div>
				<h1>Sign in</h1>
				<p class="p-muted">
					{{ step === "email" ? "We'll email you a 6-digit code. No password needed." : "Enter the code from your email." }}
				</p>
			</div>
			<div v-if="closed && step === 'email'" class="p-alert" role="alert">
				This affiliate account has been closed. Contact Mealgro support if you think this is a
				mistake.
			</div>

			<form v-if="step === 'email'" class="p-stack-sm" @submit.prevent="send">
				<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
				<label class="p-field">
					<span>Email</span>
					<input
						v-model="email"
						class="p-input"
						type="email"
						inputmode="email"
						autocomplete="email"
						placeholder="you@example.com"
						required
					/>
				</label>
				<button class="p-btn p-btn--primary p-btn--block" :disabled="busy || !email.trim()">
					{{ busy ? "Sending…" : "Email me a code" }}
				</button>
			</form>

			<CodeStep
				v-else
				:email="email.trim()"
				:verify="verify"
				:resend="resend"
				submit-label="Sign in"
				:lead="`If ${email.trim()} has an affiliate account, we've emailed it a 6-digit code. It works for 5 minutes.`"
				@back="step = 'email'"
				@done="done"
			/>

			<p class="p-muted p-small">
				New here? <a class="link" href="/affiliate/signup">Become an affiliate</a>
			</p>
		</div>
	</AuthLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { auth, publicApi } from "../../../../lib/affiliate/api";
import { describe, errorCode, money } from "../../../../lib/affiliate/format";
import { HOME, session } from "../../../../lib/affiliate/session";
import AuthLayout from "../../../../components/portal/AuthLayout.vue";
import type { Program, Terms } from "../../../../lib/affiliate/types";
import CodeStep from "../../../../components/affiliate/CodeStep.vue";
import PauseBanner from "../../../../components/affiliate/PauseBanner.vue";
import TermsText from "../../../../components/affiliate/TermsText.vue";

const step = ref<"form" | "code">("form");
const form = reactive({ full_name: "", email: "", phone: "" });
const agreed = ref(false);
const terms = ref<Terms | null>(null);
const termsError = ref("");
const program = ref<Program | null>(null);
const busy = ref(false);
const error = ref("");
/** The email already has an account: offer sign-in. */
const exists = ref(false);
/** Which field the API refused, to point at it. */
const bad = ref<"full_name" | "email" | "phone" | "terms" | null>(null);

async function loadTerms() {
	termsError.value = "";
	try {
		terms.value = await publicApi.terms();
	} catch (e) {
		termsError.value = describe(e);
	}
}

onMounted(async () => {
	if (await session.restore()) {
		location.replace(HOME);
		return;
	}
	void loadTerms();
	publicApi
		.program()
		.then((p) => (program.value = p))
		.catch(() => {});
});

const body = computed(() => ({
	full_name: form.full_name.trim(),
	email: form.email.trim(),
	phone: form.phone.trim(),
	terms_version: terms.value?.version ?? "",
}));

const FIELD: Record<string, typeof bad.value> = {
	AffiliateErrorFullNameRequired: "full_name",
	EmailIsInvalid: "email",
	AffiliateErrorAlreadyRegistered: "email",
	AffiliateErrorPhoneInvalid: "phone",
	AffiliateErrorTermsRequired: "terms",
};

async function submit() {
	if (busy.value || !terms.value) return;
	if (!agreed.value) {
		bad.value = "terms";
		error.value = "Please read and accept the affiliate terms.";
		return;
	}
	busy.value = true;
	error.value = "";
	bad.value = null;
	exists.value = false;
	try {
		await auth.register(body.value);
		step.value = "code";
	} catch (e) {
		const code = errorCode(e);
		if (code === "AffiliateErrorCodeRecentlySent") {
			// The code from a moment ago is still good.
			step.value = "code";
			return;
		}
		error.value = describe(e);
		bad.value = FIELD[code] ?? null;
		exists.value = code === "AffiliateErrorAlreadyRegistered";
		if (code === "AffiliateErrorTermsRequired") {
			// The terms may have just changed: show the current ones again.
			agreed.value = false;
			error.value = "The terms have been updated. Please read them and accept again.";
			await loadTerms();
		}
	} finally {
		busy.value = false;
	}
}

const verify = (otp: string) => session.verify(body.value.email, otp);
const resend = () => auth.register(body.value);
const done = () => location.assign(HOME);
</script>

<template>
	<AuthLayout area="Affiliate program" home-href="/affiliate" headline="Earn for every vendor you bring." tagline="Restaurants and food vendors join Mealgro with your code. We pay you when we approve them." wide>
		<template #top><a class="link" href="/affiliate/login">Sign in</a></template>
		<div class="p-stack">
			<PauseBanner v-if="program && !program.active" look="portal" variant="public" :message="program.message" />

			<div>
				<h1>{{ step === "form" ? "Become a Mealgro affiliate" : "Check your email" }}</h1>
				<p v-if="step === 'form'" class="p-muted">
					Bring restaurants and food vendors to Mealgro<template v-if="program?.reward"> and earn {{ money(program.reward) }} for every vendor we approve</template>.
				</p>
			</div>

			<form v-if="step === 'form'" class="p-stack-sm" novalidate @submit.prevent="submit">
				<div v-if="error" class="p-alert" role="alert">
					{{ error }}
					<template v-if="exists"> <a href="/affiliate/login">Sign in</a></template>
				</div>
				<label class="p-field">
					<span>Full name</span>
					<input
						v-model="form.full_name"
						class="p-input"
						autocomplete="name"
						maxlength="80"
						:aria-invalid="bad === 'full_name'"
						required
					/>
				</label>
				<label class="p-field">
					<span>Email</span>
					<input
						v-model="form.email"
						class="p-input"
						type="email"
						inputmode="email"
						autocomplete="email"
						maxlength="254"
						placeholder="you@example.com"
						:aria-invalid="bad === 'email'"
						aria-describedby="aff-email-hint"
						required
					/>
					<small id="aff-email-hint">We'll send a code here to confirm it's yours.</small>
				</label>
				<label class="p-field">
					<span>Phone number</span>
					<input
						v-model="form.phone"
						class="p-input"
						type="tel"
						inputmode="tel"
						autocomplete="tel"
						maxlength="20"
						placeholder="0803 123 4567"
						:aria-invalid="bad === 'phone'"
						required
					/>
				</label>

				<div class="p-field">
					<span id="aff-terms-label">Affiliate terms</span>
					<div v-if="termsError" class="p-alert" role="alert">
						Couldn't load the terms. {{ termsError }}
						<button class="link" type="button" @click="loadTerms">Try again</button>
					</div>
					<TermsText v-else-if="terms" :content="terms.content" />
					<div v-else class="p-skeleton p-skeleton--block" role="status" aria-label="Loading the terms" />
				</div>
				<label class="p-check">
					<input
						v-model="agreed"
						type="checkbox"
						:disabled="!terms"
						:aria-invalid="bad === 'terms'"
						required
					/>
					<span>I've read and accept the affiliate terms</span>
				</label>

				<button
					class="p-btn p-btn--primary p-btn--block"
					:disabled="busy || !terms || !form.full_name.trim() || !form.email.trim() || !form.phone.trim()"
				>
					{{ busy ? "Sending code…" : "Sign up" }}
				</button>
				<p class="p-muted p-small">
					Already an affiliate? <a class="link" href="/affiliate/login">Sign in</a>
				</p>
			</form>

			<CodeStep
				v-else
				:email="body.email"
				:verify="verify"
				:resend="resend"
				submit-label="Create my account"
				back-label="Change my details"
				@back="step = 'form'"
				@done="done"
			/>
		</div>
	</AuthLayout>
</template>

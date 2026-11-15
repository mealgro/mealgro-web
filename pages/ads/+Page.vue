<script setup lang="ts">
// /ads: a short pitch, then sign in or sign up with an emailed code.
// Unlisted: nothing on the site links here (pages/ads/+config.ts).
import { computed, onMounted, reactive, ref } from "vue";
import { auth, publicApi } from "../../lib/ads/api";
import { describe, errorCode } from "../../lib/ads/format";
import { HOME, session } from "../../lib/ads/session";
import type { Terms } from "../../lib/ads/types";
import AuthLayout from "../../components/portal/AuthLayout.vue";
import HomeLink from "../../components/portal/HomeLink.vue";
import CodeStep from "../../components/affiliate/CodeStep.vue";
import TermsText from "../../components/affiliate/TermsText.vue";

type Mode = "signin" | "signup";
const mode = ref<Mode>("signup");
const step = ref<"form" | "code">("form");
const busy = ref(false);
const error = ref("");
const closed = ref(false);
const ended = ref(false);
/** The API said sign-ups are closed. */
const signupClosed = ref(false);

onMounted(async () => {
	try {
		ended.value = sessionStorage.getItem("mg.ads.ended") === "1";
		sessionStorage.removeItem("mg.ads.ended");
	} catch {
		// Storage blocked: the message is simply not shown.
	}
	const q = new URLSearchParams(location.search);
	closed.value = q.has("closed");
	if (ended.value || closed.value || q.has("signin")) mode.value = "signin";
	if (await session.restore()) {
		location.replace(HOME);
		return;
	}
	// The terms say whether sign-ups are open: asked up front, so nobody
	// fills in the form only to hear they're closed.
	await loadTerms();
	if (signupClosed.value && step.value === "form") mode.value = "signin";
});

function switchTo(m: Mode) {
	mode.value = m;
	step.value = "form";
	error.value = "";
	bad.value = null;
	exists.value = false;
	if (m === "signup" && !terms.value) void loadTerms();
}

// ── Sign in ──────────────────────────────────────────────────────────────────
const email = ref("");

async function sendLogin() {
	if (busy.value) return;
	busy.value = true;
	error.value = "";
	try {
		await auth.login(email.value.trim());
		step.value = "code";
	} catch (e) {
		// A code sent a moment ago is still good: go and enter it.
		if (errorCode(e) === "AdsErrorCodeRecentlySent") step.value = "code";
		else error.value = describe(e);
	} finally {
		busy.value = false;
	}
}

// ── Sign up ──────────────────────────────────────────────────────────────────
const form = reactive({ full_name: "", business_name: "", email: "", phone: "", website: "" });
const agreed = ref(false);
const terms = ref<Terms | null>(null);
const termsError = ref("");
const exists = ref(false);
type Field = "full_name" | "business_name" | "email" | "phone" | "website" | "terms";
const bad = ref<Field | null>(null);

async function loadTerms() {
	termsError.value = "";
	try {
		terms.value = await publicApi.terms();
		signupClosed.value = terms.value.signup_open === false;
	} catch (e) {
		termsError.value = describe(e);
	}
}

const body = computed(() => ({
	full_name: form.full_name.trim(),
	business_name: form.business_name.trim(),
	email: form.email.trim(),
	phone: form.phone.trim(),
	website: form.website.trim() || undefined,
	terms_version: terms.value?.version ?? "",
}));

const FIELD: Record<string, Field> = {
	AdsErrorFullNameRequired: "full_name",
	AdsErrorFullNameTooLong: "full_name",
	AdsErrorBusinessNameRequired: "business_name",
	AdsErrorBusinessNameTooLong: "business_name",
	EmailIsInvalid: "email",
	AdsErrorAlreadyRegistered: "email",
	AdsErrorPhoneInvalid: "phone",
	AdsErrorWebsiteInvalid: "website",
	AdsErrorTermsRequired: "terms",
};

const canSignUp = computed(
	() => !!terms.value && !!body.value.full_name && !!body.value.business_name && !!body.value.email && !!body.value.phone,
);

async function sendSignup() {
	if (busy.value || !terms.value) return;
	if (!agreed.value) {
		bad.value = "terms";
		error.value = "Please read and accept the Mealgro Ads terms.";
		return;
	}
	if (body.value.website && !/^https:\/\//i.test(body.value.website)) {
		bad.value = "website";
		error.value = "Enter a website starting with https://, or leave it empty.";
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
		if (code === "AdsErrorCodeRecentlySent") {
			step.value = "code";
			return;
		}
		if (code === "AdsErrorSignupClosed") {
			signupClosed.value = true;
			return;
		}
		error.value = describe(e);
		bad.value = FIELD[code] ?? null;
		exists.value = code === "AdsErrorAlreadyRegistered";
		if (code === "AdsErrorTermsRequired") {
			// The terms may have just changed: show the current ones again.
			agreed.value = false;
			error.value = "The terms have been updated. Please read them and accept again.";
			await loadTerms();
		}
	} finally {
		busy.value = false;
	}
}

function signInInstead() {
	email.value = form.email.trim() || email.value;
	switchTo("signin");
}

// ── The code ─────────────────────────────────────────────────────────────────
const codeEmail = computed(() => (mode.value === "signin" ? email.value.trim() : body.value.email));
const verify = (otp: string) => session.verify(codeEmail.value, otp);
const resend = () => (mode.value === "signin" ? auth.login(codeEmail.value) : auth.register(body.value));
const done = () => location.assign(HOME);
</script>

<template>
	<AuthLayout
		area="Mealgro Ads"
		home-href="/"
		headline="Put your business in front of hungry customers."
		tagline="Full-screen video ads in the Mealgro feed and banners on Explore, for non-food businesses. Pay only for what's shown."
		:wide="mode === 'signup'"
	>
		<template #top><HomeLink /></template>
		<div class="p-stack">
			<div>
				<h1>{{ step === "code" ? "Check your email" : mode === "signin" ? "Sign in to Mealgro Ads" : "Advertise on Mealgro" }}</h1>
				<p v-if="step === 'form' && mode === 'signup'" class="p-muted">
					Reach people choosing what to eat, where they live.
				</p>
				<p v-else-if="step === 'form'" class="p-muted">We'll email you a 6-digit code. No password needed.</p>
			</div>

			<ul v-if="step === 'form' && mode === 'signup'" class="pitch">
				<li><span class="sh sh-sq" style="--c: var(--cat-1)" aria-hidden="true" /><span><strong>Feed ads.</strong> A full-screen portrait video between the dishes people swipe through.</span></li>
				<li><span class="sh sh-ci" style="--c: var(--cat-2)" aria-hidden="true" /><span><strong>Banners.</strong> A wide image at the top of Explore.</span></li>
				<li><span class="sh sh-di" style="--c: var(--cat-4)" aria-hidden="true" /><span><strong>Prepaid, per 1,000 views.</strong> Top up, set a budget, and choose the states or cities you want. Every ad is reviewed before it shows.</span></li>
			</ul>

			<p v-if="step === 'form' && mode === 'signup'" class="p-alert p-alert--info" role="note">
				<strong>Mealgro Ads is for non-food businesses. Restaurants, food vendors and delivery apps can't advertise.</strong>
			</p>

			<div v-if="step === 'form'" class="p-tabs" role="group" aria-label="Sign in or sign up">
				<button type="button" :aria-pressed="mode === 'signup'" @click="switchTo('signup')">Sign up</button>
				<button type="button" :aria-pressed="mode === 'signin'" @click="switchTo('signin')">Sign in</button>
			</div>

			<div v-if="ended && mode === 'signin' && step === 'form' && !closed" class="p-alert p-alert--info" role="status">
				Your session ended. Sign in again.
			</div>
			<div v-if="closed && mode === 'signin' && step === 'form'" class="p-alert" role="alert">
				This Mealgro Ads account has been closed. Contact Mealgro support if you think this is a mistake.
			</div>

			<!-- Sign in -->
			<form v-if="mode === 'signin' && step === 'form'" class="p-stack-sm" @submit.prevent="sendLogin">
				<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
				<label class="p-field">
					<span>Email</span>
					<input v-model="email" class="p-input" type="email" inputmode="email" autocomplete="email" maxlength="254" placeholder="you@business.com" required />
				</label>
				<button class="p-btn p-btn--primary p-btn--block" :disabled="busy || !email.trim()">
					{{ busy ? "Sending…" : "Email me a code" }}
				</button>
			</form>

			<!-- Sign up, closed -->
			<div v-else-if="mode === 'signup' && step === 'form' && signupClosed" class="p-stack-sm">
				<div class="p-alert p-alert--info" role="status">
					Sign-ups for Mealgro Ads are closed right now. Please check back later. If you already have an
					account, you can still sign in.
				</div>
				<button class="p-btn p-btn--primary p-btn--block" type="button" @click="signInInstead">Sign in</button>
			</div>

			<!-- Sign up -->
			<form v-else-if="mode === 'signup' && step === 'form'" class="p-stack-sm" novalidate @submit.prevent="sendSignup">
				<div v-if="error" class="p-alert" role="alert">
					{{ error }}
					<template v-if="exists"> <button class="link" type="button" @click="signInInstead">Sign in</button></template>
				</div>
				<label class="p-field">
					<span>Full name</span>
					<input v-model="form.full_name" class="p-input" autocomplete="name" maxlength="50" :aria-invalid="bad === 'full_name'" required />
				</label>
				<p class="p-hint nonfood">Mealgro Ads is for non-food businesses. Restaurants, food vendors and delivery apps can't advertise.</p>
				<label class="p-field">
					<span>Business name</span>
					<input v-model="form.business_name" class="p-input" autocomplete="organization" maxlength="60" :aria-invalid="bad === 'business_name'" aria-describedby="ads-biz-hint" required />
					<small id="ads-biz-hint">Every ad shows “Sponsored · {{ form.business_name.trim() || "your business name" }}”.</small>
				</label>
				<label class="p-field">
					<span>Email</span>
					<input v-model="form.email" class="p-input" type="email" inputmode="email" autocomplete="email" maxlength="254" placeholder="you@business.com" :aria-invalid="bad === 'email'" aria-describedby="ads-email-hint" required />
					<small id="ads-email-hint">We'll send a code here to confirm it's yours.</small>
				</label>
				<label class="p-field">
					<span>Phone number</span>
					<input v-model="form.phone" class="p-input" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="0803 123 4567" :aria-invalid="bad === 'phone'" aria-describedby="ads-phone-hint" required />
					<small id="ads-phone-hint">Your phone's country sets your market and currency. It can't be changed later.</small>
				</label>
				<label class="p-field">
					<span>Website (optional)</span>
					<input v-model="form.website" class="p-input" type="url" inputmode="url" autocomplete="url" maxlength="2048" placeholder="https://" :aria-invalid="bad === 'website'" />
				</label>

				<div class="p-field">
					<span>Mealgro Ads terms</span>
					<div v-if="termsError" class="p-alert" role="alert">
						Couldn't load the terms. {{ termsError }}
						<button class="link" type="button" @click="loadTerms">Try again</button>
					</div>
					<TermsText v-else-if="terms" :content="terms.content" label="Mealgro Ads terms" />
					<div v-else class="p-skeleton p-skeleton--block" role="status" aria-label="Loading the terms" />
				</div>
				<label class="p-check">
					<input v-model="agreed" type="checkbox" :disabled="!terms" :aria-invalid="bad === 'terms'" required />
					<span>I've read and accept the Mealgro Ads terms. I understand ad credit can only be spent on ads and can't be refunded or withdrawn.</span>
				</label>

				<button class="p-btn p-btn--primary p-btn--block" :disabled="busy || !canSignUp">
					{{ busy ? "Sending code…" : "Sign up" }}
				</button>
			</form>

			<CodeStep
				v-else
				:email="codeEmail"
				:verify="verify"
				:resend="resend"
				:describe-error="describe"
				:error-name="errorCode"
				:submit-label="mode === 'signin' ? 'Sign in' : 'Create my account'"
				:back-label="mode === 'signin' ? 'Use a different email' : 'Change my details'"
				:lead="mode === 'signin' ? `If ${codeEmail} has a Mealgro Ads account, we've emailed it a 6-digit code. It works for 5 minutes.` : undefined"
				@back="step = 'form'"
				@done="done"
			/>
		</div>
	</AuthLayout>
</template>

<style scoped>
.pitch {
	display: flex;
	flex-direction: column;
	gap: 12px;
	font-size: 14px;
	line-height: 1.45;
}
.pitch li {
	display: flex;
	gap: 12px;
	align-items: flex-start;
}
.nonfood {
	font-weight: 600;
	color: var(--ink);
}
.pitch .sh {
	flex: none;
	width: 14px;
	height: 14px;
	margin-top: 3px;
}
</style>

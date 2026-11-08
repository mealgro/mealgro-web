<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AuthLayout from "../../../components/portal/AuthLayout.vue";
import HomeLink from "../../../components/portal/HomeLink.vue";
import SocialSignIn from "../../../components/portal/SocialSignIn.vue";
import { describe } from "../../../lib/portal/format";
import { session } from "../../../lib/portal/session";
import {
	appleClientId,
	googleClientId,
	providerLabel,
	signInWithProvider,
	socialFailure,
	type Provider,
} from "../../../lib/portal/social";
import type { AuthResponse } from "../../../lib/portal/types";

const phone = ref("");
const password = ref("");
const busy = ref(false);
const error = ref("");
/** The error is about an account that can't be used: point to support. */
const blocked = ref(false);
/** Said plainly and not an error: a cancelled popup. */
const notice = ref("");
/** Sent here because the session ended (see lib/portal/session.ts): said once. */
const ended = ref(false);

onMounted(async () => {
	try {
		ended.value = sessionStorage.getItem("mg.portal.ended") === "1";
		sessionStorage.removeItem("mg.portal.ended");
	} catch {
		// Storage blocked: the message is simply not shown.
	}
	if (await session.restore()) location.replace("/account");
});

// ── Google and Apple ────────────────────────────────────────────────────────

/** Which provider's sign-in the API is checking. */
const social = ref<Provider | null>(null);
/** Signed in; the browser is on its way to the portal. */
const leaving = ref(false);
const working = computed(() => busy.value || !!social.value || leaving.value);

const via =
	googleClientId && appleClientId ? "Google or Apple" : googleClientId ? "Google" : "Apple";

function clearMessages() {
	error.value = "";
	blocked.value = false;
	notice.value = "";
}

function fail(e: unknown, provider: Provider) {
	const f = socialFailure(e, provider);
	error.value = f.text;
	blocked.value = f.support;
}

/** Into the portal. The API already answers "not found" for an account that
 *  works at no store; this is only for one that got through anyway. */
async function enter(res: AuthResponse) {
	const user = session.adopt(res);
	if (!user.stores?.length) {
		await session.discard();
		error.value = "Account not found.";
		return;
	}
	leaving.value = true;
	location.assign("/account");
}

async function onCredential(
	p:
		| { provider: "google"; token: string }
		| { provider: "apple"; token: string; nonce: string; code?: string; firstName?: string; lastName?: string },
) {
	if (working.value) return;
	social.value = p.provider;
	clearMessages();
	try {
		const out = await signInWithProvider(
			p.provider,
			p.provider === "google"
				? { token: p.token }
				: {
						token: p.token,
						nonce: p.nonce,
						authorization_code: p.code,
						first_name: p.firstName,
						last_name: p.lastName,
					},
		);
		await enter(out);
	} catch (e) {
		fail(e, p.provider);
	} finally {
		social.value = null;
	}
}

function onProblem(text: string, tone: "error" | "info") {
	clearMessages();
	if (tone === "info") notice.value = text;
	else error.value = text;
}

async function submit() {
	if (working.value) return;
	busy.value = true;
	clearMessages();
	try {
		const user = await session.signIn(phone.value.trim(), password.value);
		if (!user.stores?.length) {
			error.value = "This account doesn't belong to a Mealgro store.";
			await session.signOut();
			return;
		}
		location.assign("/account");
	} catch (e) {
		error.value = describe(e);
	} finally {
		busy.value = false;
	}
}
</script>

<template>
	<AuthLayout area="Vendor portal" headline="Your store, at a glance." tagline="Orders, branches, staff and reports in one place, on your phone or your desk.">
		<template #top><HomeLink /></template>
		<form class="p-stack" @submit.prevent="submit">
			<div>
				<h1>Sign in to your store</h1>
				<p v-if="googleClientId || appleClientId" class="p-muted">Use the phone number and password you use in the Mealgro app, or continue with {{ via }}.</p>
				<p v-else class="p-muted">Use the phone number and password you use in the Mealgro app.</p>
			</div>
			<div v-if="ended && !error && !notice" class="p-alert p-alert--info" role="status">Your session ended. Sign in again.</div>
			<div v-if="notice" class="p-alert p-alert--info" role="status">{{ notice }}</div>
			<div v-if="error" class="p-alert" role="alert">
				{{ error }}
				<template v-if="blocked"> Contact support at <a href="/contact">mealgro.com/contact</a>.</template>
			</div>
			<label class="p-field">
				<span>Phone number</span>
				<input v-model="phone" class="p-input" type="tel" inputmode="tel" autocomplete="username" maxlength="20" placeholder="+234 901 234 5678" required />
			</label>
			<label class="p-field">
				<span>Password</span>
				<input v-model="password" class="p-input" type="password" autocomplete="current-password" maxlength="128" required />
			</label>
			<button class="p-btn p-btn--primary p-btn--block" :disabled="working || !phone || !password">
				{{ busy ? "Signing in…" : "Sign in" }}
			</button>
			<div v-if="social || leaving" class="p-alert p-alert--info" role="status">
				{{ leaving ? "Opening your store…" : `Signing in with ${providerLabel[social!]}…` }}
			</div>
			<SocialSignIn :busy="working" @credential="onCredential" @problem="onProblem" />
			<p class="p-muted p-small">
				New to Mealgro? Create your account in the Mealgro app. Signing in here doesn't sign you out of the app. Forgot your password? Reset it in the app.
			</p>
		</form>
	</AuthLayout>
</template>

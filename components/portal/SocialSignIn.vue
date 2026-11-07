<script setup lang="ts">
// "Continue with Google" and "Continue with Apple" on a sign-in page. Renders
// nothing unless a client id is configured; each button appears only for the
// provider that is. Google's button is drawn by Google (it is the only way an
// identity token reaches a page); Apple's is the portal's pill in ink with
// Apple's mark. What the provider returns goes
// up in `credential`; the page makes the API call and tells the person.
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
	AppleProblem,
	appleArmed,
	appleClientId,
	armApple,
	googleClientId,
	renderGoogleButton,
	signInWithApple,
	type AppleResult,
} from "../../lib/portal/social";

defineProps<{
	/** A sign-in is in flight (this one or the password form's). */
	busy: boolean;
}>();
const emit = defineEmits<{
	credential: [
		payload:
			| { provider: "google"; token: string }
			| ({ provider: "apple" } & AppleResult),
	];
	/** Said once and plainly: a cancelled popup, a blocked one. */
	problem: [text: string, tone: "error" | "info"];
}>();

const google = !!googleClientId;
const apple = !!appleClientId;

const googleEl = ref<HTMLElement | null>(null);
const googleState = ref<"loading" | "ready" | "failed">("loading");
const appleState = ref<"loading" | "ready" | "failed">("loading");
const appleReady = computed(() => appleState.value === "ready");

let width = 0;
let observer: ResizeObserver | null = null;
let gone = false;

async function drawGoogle() {
	const el = googleEl.value;
	if (!google || !el || width <= 0) return;
	try {
		await renderGoogleButton(el, {
			width,
			onCredential: (token) => emit("credential", { provider: "google", token }),
		});
		if (!gone) googleState.value = "ready";
	} catch {
		if (!gone) googleState.value = "failed";
	}
}

async function arm() {
	if (!apple) return;
	appleState.value = "loading";
	try {
		await armApple();
		if (!gone) appleState.value = "ready";
	} catch {
		if (!gone) appleState.value = "failed";
	}
}

function retryGoogle() {
	googleState.value = "loading";
	void drawGoogle();
}

onMounted(() => {
	if (google && googleEl.value) {
		observer = new ResizeObserver(([entry]) => {
			const next = Math.round(entry.contentRect.width);
			// Google's button has a fixed pixel width: draw it again when the
			// card changes size (the phone turned, the window moved).
			if (next > 0 && next !== width) {
				width = next;
				void drawGoogle();
			}
		});
		observer.observe(googleEl.value);
	}
	void arm();
});
onBeforeUnmount(() => {
	gone = true;
	observer?.disconnect();
});

function continueWithApple() {
	if (!appleArmed()) return;
	// Straight from the click: the popup would be blocked after an await.
	signInWithApple().then(
		(result) => emit("credential", { provider: "apple", ...result }),
		(e: unknown) => {
			const kind = e instanceof AppleProblem ? e.kind : "failed";
			if (kind === "cancelled") emit("problem", "Sign in with Apple was cancelled.", "info");
			else if (kind === "blocked")
				emit(
					"problem",
					"Your browser blocked the Sign in with Apple window. Allow pop-ups for this site and try again.",
					"error",
				);
			else emit("problem", "Sign in with Apple didn't work. Please try again.", "error");
		},
	).finally(() => void arm());
}
</script>

<template>
	<div v-if="google || apple" class="p-social-wrap">
		<div class="p-or" aria-hidden="true"><span>or</span></div>
		<div class="p-social" :inert="busy ? '' : undefined" :aria-busy="busy">
			<div v-if="google" class="p-social-google" :class="{ 'is-hidden': googleState === 'failed' }">
				<div ref="googleEl" class="p-social-google-slot" />
			</div>
			<div v-if="google && googleState === 'failed'" class="p-alert p-alert--warn" role="status">
				Google sign-in couldn't load. Check your connection.
				<button type="button" class="p-btn p-btn--sm" @click="retryGoogle">Try again</button>
			</div>
			<button
				v-if="apple && appleState !== 'failed'"
				type="button"
				class="p-btn p-btn--apple p-btn--block"
				:disabled="!appleReady"
				@click="continueWithApple"
			>
				<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
				Continue with Apple
			</button>
			<div v-if="apple && appleState === 'failed'" class="p-alert p-alert--warn" role="status">
				Sign in with Apple couldn't load. Check your connection.
				<button type="button" class="p-btn p-btn--sm" @click="arm">Try again</button>
			</div>
		</div>
	</div>
</template>

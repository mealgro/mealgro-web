<script setup lang="ts">
import { onMounted, ref } from "vue";
import AuthLayout from "../../../components/portal/AuthLayout.vue";
import { describe } from "../../../lib/portal/format";
import { session } from "../../../lib/portal/session";

const phone = ref("");
const password = ref("");
const busy = ref(false);
const error = ref("");

onMounted(async () => {
	if (await session.restore()) location.replace("/account");
});

async function submit() {
	if (busy.value) return;
	busy.value = true;
	error.value = "";
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
		<template #top><a class="link" href="/">mealgro.com</a></template>
		<form class="p-stack" @submit.prevent="submit">
			<div>
				<h1>Sign in to your store</h1>
				<p class="p-muted">Use the phone number and password you use in the Mealgro app.</p>
			</div>
			<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
			<label class="p-field">
				<span>Phone number</span>
				<input v-model="phone" class="p-input" type="tel" inputmode="tel" autocomplete="username" placeholder="+234 901 234 5678" required />
			</label>
			<label class="p-field">
				<span>Password</span>
				<input v-model="password" class="p-input" type="password" autocomplete="current-password" required />
			</label>
			<button class="p-btn p-btn--primary p-btn--block" :disabled="busy || !phone || !password">
				{{ busy ? "Signing in…" : "Sign in" }}
			</button>
			<p class="p-muted p-small">
				Signing in here doesn't sign you out of the app. Forgot your password? Reset it in the app.
			</p>
		</form>
	</AuthLayout>
</template>

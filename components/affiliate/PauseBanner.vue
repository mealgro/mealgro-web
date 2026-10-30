<script setup lang="ts">
// Shown while the affiliate program is switched off.
defineProps<{
	/** The admin's note, if any. */
	message?: string | null;
	/** `public`: the landing and sign-up pages; `account`: signed-in pages. */
	variant?: "public" | "account";
}>();
</script>

<template>
	<div class="aff-banner" role="status">
		<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
			<circle cx="12" cy="12" r="10" />
			<path d="M10 9v6M14 9v6" />
		</svg>
		<div>
			<p v-if="variant === 'account'">
				<strong>The affiliate program is paused.</strong>
				New vendors you bring in won't earn a reward until it's back. You can still use your
				account and withdraw your balance. We'll email you when it resumes.
			</p>
			<p v-else>
				<strong>The affiliate program is paused.</strong>
				Sign up to be told when it's back.
			</p>
			<p v-if="message" class="note">{{ message }}</p>
		</div>
	</div>
</template>

<style scoped>
.note {
	margin-top: 6px;
	font-style: italic;
}
</style>

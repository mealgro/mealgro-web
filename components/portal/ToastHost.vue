<script setup lang="ts">
// Toasts for either area: a short pill with a shape (dot for done, square for
// a problem), bottom right, above the phone's bottom edge.
defineProps<{ toasts: { id: number; text: string; tone: "ok" | "bad" }[] }>();
</script>

<template>
	<div class="p-toasts" aria-live="polite" role="status">
		<div v-for="t in toasts" :key="t.id" class="p-alert p-toast" :class="{ 'p-alert--ok': t.tone === 'ok' }">
			{{ t.text }}
		</div>
	</div>
</template>

<style scoped>
.p-toasts {
	position: fixed;
	right: 16px;
	bottom: 16px;
	display: flex;
	flex-direction: column;
	gap: 8px;
	z-index: 95;
	max-width: min(380px, calc(100vw - 32px));
}
.portal .p-toast {
	box-shadow: 0 12px 32px color-mix(in srgb, var(--rail) 25%, transparent);
	border: 1px solid var(--line);
	background: var(--surface);
	color: var(--ink);
	animation: p-arrive 0.3s var(--ease) both;
}
.portal .p-toast::before {
	color: var(--bad);
}
.portal .p-toast.p-alert--ok::before {
	color: var(--ok);
}
</style>

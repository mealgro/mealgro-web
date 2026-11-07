<script setup lang="ts">
// Toasts for either area: a short card with a shape (dot for done, square for
// a problem), bottom right. A problem stays 5 seconds, a result 3; hovering or
// focusing a toast holds it so it can be read, and a failed action can offer
// Retry. See lib/portal/toast.ts.
import { dismiss, hold, release, type Toast } from "../../lib/portal/toast";

defineProps<{ toasts: Toast[] }>();
</script>

<template>
	<div class="p-toasts" aria-live="polite" role="status">
		<div
			v-for="t in toasts"
			:key="t.id"
			class="p-alert p-toast"
			:class="{ 'p-alert--ok': t.tone === 'ok' }"
			@mouseenter="hold(t.id)"
			@mouseleave="release(t.id)"
			@focusin="hold(t.id)"
			@focusout="release(t.id)"
		>
			<span>{{ t.text }}</span>
			<button
				v-if="t.retry"
				class="p-btn p-btn--sm"
				type="button"
				@click="
					dismiss(t.id);
					t.retry();
				"
			>
				Retry
			</button>
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
@media (max-width: 639px) {
	.p-toasts {
		left: 16px;
		right: 16px;
		max-width: none;
	}
}
</style>

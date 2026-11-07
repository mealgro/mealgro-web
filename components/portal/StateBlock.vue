<script setup lang="ts">
// What a card shows instead of its content: skeleton lines while loading, the
// error with Retry, or an empty state. Never a blank card. (Tables use
// TableState, which does the same in rows.)
withDefaults(
	defineProps<{
		loading?: boolean;
		error?: string | null;
		empty?: boolean;
		emptyText?: string;
		emptyHint?: string;
		lines?: number;
		/** Leave out the retry button (nothing to load again). */
		noRetry?: boolean;
	}>(),
	{ error: undefined, emptyHint: undefined, emptyText: "Nothing here yet.", lines: 3 },
);
defineEmits<{ retry: [] }>();
</script>

<template>
	<div v-if="loading" class="p-stack-sm" role="status" aria-label="Loading">
		<span v-for="i in lines" :key="i" class="p-skeleton" :style="{ width: i === 1 ? '60%' : i === lines ? '35%' : '90%' }" />
	</div>
	<div v-else-if="error" class="p-state p-state--error" role="alert">
		<p>{{ error }}</p>
		<button v-if="!noRetry" class="p-btn p-btn--sm" type="button" @click="$emit('retry')">Retry</button>
	</div>
	<div v-else-if="empty" class="p-state">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
		<p>{{ emptyText }}</p>
		<p v-if="emptyHint" class="hint">{{ emptyHint }}</p>
		<slot name="empty" />
	</div>
	<slot v-else />
</template>

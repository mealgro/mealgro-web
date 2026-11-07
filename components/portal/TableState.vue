<script setup lang="ts">
// The rows a table shows instead of data: skeleton rows while loading, the
// error with Retry, or an empty state. Never a blank table.
withDefaults(
	defineProps<{
		loading?: boolean;
		error?: string | null;
		colspan: number;
		emptyText?: string;
		emptyHint?: string;
		skeletonRows?: number;
	}>(),
	{ error: undefined, emptyHint: undefined, emptyText: "Nothing here yet.", skeletonRows: 4 },
);
defineEmits<{ retry: [] }>();
</script>

<template>
	<template v-if="loading">
		<tr v-for="i in skeletonRows" :key="i" class="p-table-state" aria-hidden="true">
			<td v-for="c in colspan" :key="c" :data-full="colspan === 1 || undefined">
				<span class="p-skeleton" :style="{ width: c === 1 ? '8rem' : '4rem' }" />
			</td>
		</tr>
	</template>
	<tr v-else-if="error" class="p-table-state">
		<td :colspan="colspan" data-full>
			<div class="p-state p-state--error" role="alert">
				<p>{{ error }}</p>
				<button class="p-btn p-btn--sm" type="button" @click="$emit('retry')">Retry</button>
			</div>
		</td>
	</tr>
	<tr v-else class="p-table-state">
		<td :colspan="colspan" data-full>
			<div class="p-state">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
				<p>{{ emptyText }}</p>
				<p v-if="emptyHint" class="hint">{{ emptyHint }}</p>
			</div>
		</td>
	</tr>
</template>

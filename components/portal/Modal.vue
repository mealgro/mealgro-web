<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

defineProps<{ title: string; wide?: boolean }>();
const emit = defineEmits<{ close: [] }>();
const panel = ref<HTMLElement>();

const onKey = (e: KeyboardEvent) => e.key === "Escape" && emit("close");
onMounted(() => {
	document.addEventListener("keydown", onKey);
	panel.value?.focus();
});
onBeforeUnmount(() => document.removeEventListener("keydown", onKey));
</script>

<template>
	<Teleport to="body">
		<div class="portal p-modal-back" @mousedown.self="emit('close')">
			<div
				ref="panel"
				class="p-modal"
				:class="{ 'p-modal--wide': wide }"
				role="dialog"
				aria-modal="true"
				:aria-label="title"
				tabindex="-1"
			>
				<div class="p-modal-head">
					<h2>{{ title }}</h2>
					<button class="p-btn p-btn--sm p-btn--ghost p-btn--icon" type="button" aria-label="Close" @click="emit('close')">
						<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
					</button>
				</div>
				<div class="p-modal-body"><slot /></div>
				<div v-if="$slots.footer" class="p-modal-foot"><slot name="footer" /></div>
			</div>
		</div>
	</Teleport>
</template>

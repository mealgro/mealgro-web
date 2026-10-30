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
		<div class="portal modal-back" @mousedown.self="emit('close')">
			<div
				ref="panel"
				class="modal"
				:class="{ 'modal--wide': wide }"
				role="dialog"
				aria-modal="true"
				:aria-label="title"
				tabindex="-1"
			>
				<div class="p-row p-between modal-head">
					<h2>{{ title }}</h2>
					<button class="p-btn p-btn--sm" type="button" aria-label="Close" @click="emit('close')">
						✕
					</button>
				</div>
				<div class="modal-body"><slot /></div>
				<div v-if="$slots.footer" class="modal-foot"><slot name="footer" /></div>
			</div>
		</div>
	</Teleport>
</template>

<style scoped>
.modal-back {
	position: fixed;
	inset: 0;
	z-index: 60;
	min-height: 0 !important;
	background: rgba(23, 19, 15, 0.45);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
}
.modal {
	background: #fff;
	border-radius: 16px;
	width: 100%;
	max-width: 460px;
	max-height: calc(100vh - 32px);
	display: flex;
	flex-direction: column;
	outline: none;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.modal--wide {
	max-width: 640px;
}
.modal-head {
	padding: 16px 18px;
	border-bottom: 1px solid var(--line);
}
.modal-body {
	padding: 18px;
	overflow-y: auto;
}
.modal-foot {
	padding: 14px 18px;
	border-top: 1px solid var(--line);
	display: flex;
	justify-content: flex-end;
	gap: 10px;
}
</style>

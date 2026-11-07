<script setup lang="ts">
// The one confirm / ask dialog (lib/portal/confirm.ts), mounted once by the
// frame. Escape from anywhere in it and the scrim cancel; Tab stays inside;
// focus goes back to what asked; the confirm button waits for required text.
import { computed, ref, toRef } from "vue";
import { confirmState, settleConfirm } from "../../lib/portal/confirm";
import { useDialog } from "./useDialog";

const state = confirmState();
const panel = ref<HTMLElement>();
const blocked = computed(() => !!state.input?.required && state.value.trim().length === 0);
useDialog(panel, () => settleConfirm(false), toRef(state, "open"));
</script>

<template>
	<Teleport to="body">
		<div v-if="state.open" class="portal p-modal-back p-modal-back--top" @mousedown.self="settleConfirm(false)">
			<form
				ref="panel"
				class="p-modal p-modal--sm"
				role="alertdialog"
				aria-modal="true"
				:aria-label="state.title"
				tabindex="-1"
				@submit.prevent="!blocked && settleConfirm(true)"
			>
				<div class="p-modal-head"><h2>{{ state.title }}</h2></div>
				<div class="p-modal-body p-stack-sm">
					<p v-if="state.message" class="p-muted">{{ state.message }}</p>
					<label v-if="state.input" class="p-field">
						<span>{{ state.input.label }}</span>
						<input
							v-model="state.value"
							class="p-input"
							data-autofocus
							:maxlength="state.input.maxLength"
							:required="state.input.required"
						/>
					</label>
				</div>
				<div class="p-modal-foot">
					<button class="p-btn p-btn--ghost" type="button" @click="settleConfirm(false)">{{ state.cancelText ?? "Cancel" }}</button>
					<button
						class="p-btn"
						:class="state.destructive ? 'p-btn--danger p-btn--fill' : 'p-btn--primary'"
						:disabled="blocked"
					>
						{{ state.confirmText ?? "Confirm" }}
					</button>
				</div>
			</form>
		</div>
	</Teleport>
</template>

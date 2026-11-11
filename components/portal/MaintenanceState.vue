<script setup lang="ts">
// What both portals show while Mealgro is down for maintenance: the whole page
// in the frame (PortalFrame), the form card on sign-in and sign-up
// (AuthLayout). The asking-again and the reload when it ends are
// useMaintenancePoll's, in the view that holds this.
import { computed, ref } from "vue";
import logoImage from "../../assets/logo.svg";
import { MAINTENANCE_LINE, localTime, maintenance } from "../../lib/maintenance";

defineProps<{
	/** The whole page (with the logo), not a card's content. */
	page?: boolean;
}>();

const status = computed(() => maintenance.state.status);
const back = computed(() => {
	const at = maintenance.expectedBack.value;
	return at ? localTime(at) : "";
});
/** The expected end has passed and it isn't over. */
const overdue = computed(() => !!status.value?.ends_at && !back.value);
const checking = computed(() => maintenance.state.checking);
/** What the last Retry found, when it isn't over. */
const retried = ref("");

async function retry() {
	retried.value = "";
	const s = await maintenance.check();
	// Over: the poll reloads the page.
	if (!s) retried.value = "Couldn't reach Mealgro. ";
	else if (s.active) retried.value = "Still down. ";
}
</script>

<template>
	<section class="p-maint" :class="{ 'p-maint--page': page }" role="alert">
		<img v-if="page" class="p-maint-logo" :src="logoImage" alt="Mealgro" />
		<span class="p-badge p-badge--warn">Maintenance</span>
		<h1 class="p-maint-title">Down for maintenance</h1>
		<p>{{ MAINTENANCE_LINE }}</p>
		<p v-if="status?.message" class="p-maint-note">{{ status.message }}</p>
		<p v-if="back"><strong>Expected back around {{ back }}.</strong></p>
		<p v-else-if="overdue">It's taking a little longer than planned.</p>
		<button class="p-btn p-btn--primary" type="button" :disabled="checking" @click="retry">
			{{ checking ? "Checking…" : "Retry" }}
		</button>
		<p class="p-maint-hint" role="status">
			{{ retried }}This page checks every 30 seconds and opens by itself when Mealgro is back.
		</p>
	</section>
</template>

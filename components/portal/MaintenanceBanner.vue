<script setup lang="ts">
// Planned maintenance, ahead of time, at the top of every page of both
// portals (the shells put it in PortalFrame's #banners). Times are the
// viewer's own.
import { computed } from "vue";
import { maintenance, plannedWhen } from "../../lib/maintenance";

const planned = maintenance.planned;
const when = computed(() =>
	planned.value?.starts_at ? plannedWhen(planned.value.starts_at, planned.value.ends_at) : "",
);
</script>

<template>
	<div v-if="planned" class="p-alert p-alert--warn" role="status">
		<p>
			<strong>Planned maintenance {{ when }}.</strong>
			Mealgro, this portal included, will be closed then.
		</p>
		<p v-if="planned.message" class="p-maint-note">{{ planned.message }}</p>
	</div>
</template>

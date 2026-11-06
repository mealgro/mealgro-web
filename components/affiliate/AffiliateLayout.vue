<script setup lang="ts">
// The signed-in affiliate area's only layout (see
// pages/affiliate/(app)/+config.ts): no marketing navigation, the browser's
// zoom kept, the portal's look.
import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "../portal/portal.css";
import "./affiliate.css";
import { toasts } from "../../lib/affiliate/toast";
import "../../lib/theme";
</script>

<template>
	<div class="portal aff">
		<slot />
		<div class="aff-toasts" aria-live="polite" role="status">
			<div
				v-for="t in toasts"
				:key="t.id"
				class="p-alert"
				:class="{ 'p-alert--ok': t.tone === 'ok' }"
			>
				{{ t.text }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
// The Mealgro Ads area's only layout (see pages/ads/+config.ts): no marketing
// navigation, the browser's zoom kept. The frame (rail, top bar, toasts) is
// AdsShell's; the sign-in page sits on AuthLayout. Both bring their own `.portal`.
import "../portal/portal.css";
import "./ads-brand.css";
import "../../lib/theme";
</script>

<template>
	<!-- Takes no box: only scopes the Mealgro red in ads-brand.css. -->
	<div class="ads-area">
		<slot />
	</div>
</template>

<style scoped>
.ads-area {
	display: contents;
}
</style>

<script setup lang="ts">
// The Mealgro Ads area's only layout (see pages/ads/+config.ts): no marketing
// navigation, the browser's zoom kept. The frame (rail, top bar, toasts) is
// AdsShell's; the sign-in page sits on AuthLayout. Both bring their own `.portal`.
import "../portal/portal.css";
import "../../lib/theme";
</script>

<template>
	<slot />
</template>

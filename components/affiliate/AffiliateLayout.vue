<script setup lang="ts">
// The signed-in affiliate area's only layout (see
// pages/affiliate/(app)/+config.ts): no marketing navigation, the browser's
// zoom kept. The frame (rail, top bar, toasts) is AffiliateShell's, the
// sign-in and sign-up pages sit on AuthLayout; both bring their own `.portal`.
import "../portal/portal.css";
import "../../lib/theme";
</script>

<template>
	<slot />
</template>

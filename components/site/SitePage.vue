<script setup lang="ts">
// The frame of a rebuilt marketing page: header, main, footer, and the v2
// stylesheet. pages/+Layout.vue leaves these pages bare (see SITE_PAGES there).
import { onMounted } from "vue";
import "./site.css";
import SiteHeader from "./SiteHeader.vue";
import SiteFooter from "./SiteFooter.vue";
import { initMotion } from "../../lib/site/media";

withDefaults(defineProps<{ app?: "customer" | "rider" }>(), { app: "customer" });
onMounted(initMotion);
</script>

<template>
	<div class="site">
		<SiteHeader />
		<main id="main" tabindex="-1">
			<slot />
		</main>
		<SiteFooter :app="app" />
	</div>
</template>

<style scoped>
main:focus {
	outline: none;
}
</style>

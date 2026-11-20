<script setup lang="ts">
// The frame of every public page but the landing page: the landing's nav,
// the page, its download section and footer (components/brand), on the
// shared stylesheet. pages/+Layout.vue leaves these pages bare.
import { onMounted } from "vue";
import "../brand/brand.css";
import "./site.css";
import BrandNav from "../brand/BrandNav.vue";
import BrandCta from "../brand/BrandCta.vue";
import BrandFooter from "../brand/BrandFooter.vue";
import { initMotion } from "../../lib/site/media";

// `cta`: the download section above the footer; the error page leaves it out.
withDefaults(defineProps<{ app?: "customer" | "rider"; cta?: boolean }>(), { app: "customer", cta: true });
onMounted(initMotion);
</script>

<template>
	<div class="site brand">
		<a class="s-skip" href="#main">Skip to content</a>
		<BrandNav :app="app" />
		<main id="main" tabindex="-1">
			<slot />
		</main>
		<BrandCta v-if="cta" :app="app" />
		<BrandFooter />
	</div>
</template>

<style scoped>
main:focus {
	outline: none;
}
</style>

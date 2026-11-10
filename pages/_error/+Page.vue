<script lang="ts" setup>
import { usePageContext } from "vike-vue/usePageContext";
import SitePage from "../../components/site/SitePage.vue";
import DocHero from "../../components/site/DocHero.vue";

const pageContext = usePageContext();
let { is404, abortReason } = pageContext;
if (!abortReason) {
	abortReason = is404 ? "This page could not be found." : "Something went wrong.";
}
const heading = is404 ? "Page Not Found" : "Internal Error";
</script>

<template>
	<SitePage>
		<DocHero :label="is404 ? '404' : '500'" :title="heading" :lead="String(abortReason)">
			<a class="s-btn s-btn--ink" href="/">Go Home</a>
		</DocHero>
	</SitePage>
</template>

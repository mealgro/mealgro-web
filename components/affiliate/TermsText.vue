<script setup lang="ts">
import { computed } from "vue";
import { markdown } from "../../lib/affiliate/format";

const props = defineProps<{ content: string; label?: string }>();
const html = computed(() => markdown(props.content));
</script>

<template>
	<!-- Scrollable, so it's focusable for keyboard users. Raw HTML in the
	     Markdown is escaped and links are limited to safe schemes (format.ts). -->
	<!-- eslint-disable vue/no-v-html -->
	<div
		class="p-md"
		tabindex="0"
		role="region"
		:aria-label="label ?? 'Affiliate terms'"
		v-html="html"
	/>
</template>

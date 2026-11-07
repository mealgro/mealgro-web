<script setup lang="ts">
// The one bold panel on a page: ink in the day, a card at night. A small
// title with a shape, a display headline, a lead-in, and room on the right for
// the number or the actions that matter.
import { useId } from "vue";

withDefaults(
	defineProps<{
		/** Small title above the headline. */
		eyebrow?: string;
		/** Its shape: sq, ci, cd, di or tr. */
		shape?: "sq" | "ci" | "cd" | "di" | "tr";
		/** A CSS colour (a token) for the shape. */
		color?: string;
		title: string;
		lead?: string;
		/** The title is a big number: sized to fit its width. */
		numeric?: boolean;
		/** Arrival order, for the stagger. */
		order?: number;
	}>(),
	{ eyebrow: undefined, lead: undefined, shape: "ci", color: "var(--cat-3)", numeric: false, order: 0 },
);
const id = useId();
</script>

<template>
	<section class="p-hero arrive" :style="{ '--i': order }" :aria-labelledby="id">
		<div class="hero-main" :class="{ num: numeric }" :style="numeric ? { '--n': Math.max(6, title.length) } : undefined">
			<span v-if="eyebrow" class="p-hero-h"><span class="sh" :class="`sh-${shape}`" :style="{ '--c': color }" />{{ eyebrow }}</span>
			<h2 :id="id">{{ title }}</h2>
			<p v-if="lead">{{ lead }}</p>
			<slot />
		</div>
		<div v-if="$slots.aside" class="hero-aside"><slot name="aside" /></div>
	</section>
</template>

<style scoped>
.hero-main {
	flex: 1 1 260px;
	min-width: 0;
	container-type: inline-size;
}
.hero-main.num h2 {
	font-size: clamp(34px, calc(100cqw / (var(--n) * 0.62)), 80px);
	line-height: 0.95;
}
.hero-aside {
	flex: none;
	max-width: 100%;
}
</style>

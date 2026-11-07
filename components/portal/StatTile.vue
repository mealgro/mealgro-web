<script setup lang="ts">
// A headline number on a tile. Each kind of thing owns a colour and a shape
// (tone 1..5, or 0 for a plain card), so none rests on colour alone.
withDefaults(
	defineProps<{
		label: string;
		value: string | number;
		/** 0 plain card; 1 cobalt, 2 rose, 3 sun, 4 mint, 5 ink. */
		tone?: 0 | 1 | 2 | 3 | 4 | 5;
		shape?: "sq" | "ci" | "cd" | "di" | "tr";
		/** Shape colour on a plain tile (a token); tones use their own text colour. */
		color?: string;
		/** A line under the number. */
		sub?: string;
		/** Makes the whole tile a link. */
		href?: string;
		order?: number;
	}>(),
	{ tone: 0, shape: "sq", color: undefined, sub: undefined, href: undefined, order: 0 },
);
</script>

<template>
	<component
		:is="href ? 'a' : 'section'"
		class="p-tile arrive"
		:class="`tone-${tone}`"
		:style="{ '--i': order, '--n': Math.max(5, String(value).length) }"
		:href="href"
		:aria-label="href ? undefined : label"
	>
		<span class="p-tile-h"><span class="sh" :class="`sh-${shape}`" :style="color ? { '--c': color } : undefined" />{{ label }}</span>
		<strong>{{ value }}</strong>
		<small v-if="sub">{{ sub }}</small>
		<slot />
	</component>
</template>

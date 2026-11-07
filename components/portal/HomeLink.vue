<script setup lang="ts">
// The way back to the marketing site from a sign-in page: an icon, the same
// size and shape as the theme toggle beside it.
withDefaults(defineProps<{ href?: string }>(), { href: "/" });
</script>

<template>
	<a class="home-link" :href="href" aria-label="Mealgro home" title="Mealgro home">
		<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
	</a>
</template>

<style scoped>
/* Doubled: the auth layout's own rule for links in this slot (inline-flex, no
   centring) would otherwise win and push the icon to one side of its circle. */
.home-link.home-link {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	min-height: 0;
	padding: 0;
	border-radius: 50%;
	color: inherit;
	text-decoration: none;
	transition:
		transform 0.12s var(--ease),
		background 0.12s;
}
.home-link.home-link:hover {
	background: color-mix(in srgb, currentColor 10%, transparent);
}
.home-link.home-link:active {
	transform: scale(0.94);
}
</style>

<script setup lang="ts">
// The opening of the vendor, rider and affiliate pages: ink stage, copy on the
// left, a phone or other visual on the right (below the copy on phones). The
// copy rises in once on arrival; nothing else moves.
</script>

<template>
	<section class="s-stage hero">
		<div class="s-wrap grid">
			<div class="copy">
				<slot />
			</div>
			<div class="visual">
				<slot name="visual" />
			</div>
		</div>
	</section>
</template>

<style scoped>
.hero {
	position: relative;
	overflow: clip;
	padding-top: clamp(120px, 14vw, 168px);
	padding-bottom: clamp(64px, 8vw, 112px);
}
.grid {
	display: grid;
	grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
	gap: clamp(40px, 6vw, 96px);
	align-items: center;
}
.copy {
	display: grid;
	gap: 24px;
	justify-items: start;
}
.copy > :deep(*) {
	animation: rise 0.8s var(--ease) both;
}
.copy > :deep(:nth-child(2)) {
	animation-delay: 0.1s;
}
.copy > :deep(:nth-child(n + 3)) {
	animation-delay: 0.2s;
}
.visual {
	position: relative;
	display: flex;
	justify-content: center;
	min-height: 0;
}
@keyframes rise {
	from {
		opacity: 0;
		transform: translateY(24px);
	}
}
@media (max-width: 899px) {
	.grid {
		grid-template-columns: minmax(0, 1fr);
	}
}
</style>

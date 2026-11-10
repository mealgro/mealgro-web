<script setup lang="ts">
// The opening band of the text pages (about, contact, legal, account
// deletion, status): ink stage, a small label, the title, an optional lead
// and optional key/value facts. Quieter than PageHero: no visual beside it.
defineProps<{
	label?: string;
	title: string;
	lead?: string;
	meta?: { label: string; value: string | number }[];
}>();
</script>

<template>
	<section class="s-stage dh">
		<div class="s-wrap dh-in">
			<p v-if="label" class="dh-label">
				<span class="sh sh-sq" style="--c: var(--cat-3)" aria-hidden="true" />
				{{ label }}
			</p>
			<h1 class="s-h1 dh-title">{{ title }}</h1>
			<p v-if="lead" class="s-lead s-muted dh-lead">{{ lead }}</p>
			<dl v-if="meta?.length" class="dh-meta">
				<div v-for="m in meta" :key="m.label">
					<dt>{{ m.label }}</dt>
					<dd>{{ m.value }}</dd>
				</div>
			</dl>
			<slot />
		</div>
	</section>
</template>

<style scoped>
.dh {
	padding-top: clamp(124px, 14vw, 168px);
	padding-bottom: clamp(48px, 7vw, 88px);
}
.dh-in {
	display: grid;
	gap: 20px;
	justify-items: start;
}
.dh-label {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	font-size: 15px;
	font-weight: 600;
	color: color-mix(in srgb, var(--on-stage) 80%, var(--stage));
}
.dh-title {
	font-size: clamp(40px, 6.4vw, 88px);
	max-width: 16ch;
	animation: rise 0.8s var(--ease) both;
}
.dh-lead {
	max-width: 58ch;
}
.dh-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	margin-top: 8px !important;
}
.dh-meta div {
	padding: 12px 18px;
	border-radius: 1.25rem;
	border: 1px solid color-mix(in srgb, var(--on-stage) 18%, transparent);
}
.dh-meta dt {
	font-size: 13px;
	color: color-mix(in srgb, var(--on-stage) 70%, var(--stage));
}
.dh-meta dd {
	font-family: var(--font-display);
	font-weight: 700;
	font-size: 17px;
	letter-spacing: -0.01em;
}
@keyframes rise {
	from {
		opacity: 0;
		transform: translateY(24px);
	}
}
</style>

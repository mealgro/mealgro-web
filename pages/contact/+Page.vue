<template>
	<SitePage>
		<DocHero
			label="Get in Touch"
			title="Contact Us"
			lead="We'd love to hear from you! Whether you have a question, feedback, or need support, our team is here to help."
		/>
		<section class="s-section contact">
			<div class="s-wrap">
				<ul class="cards">
					<li v-for="(channel, i) in channels" :key="channel.email" class="card" :class="i === 0 ? 'tone-1' : 's-card'">
						<span class="sh" :class="i === 0 ? 'sh-sq' : 'sh-ci'" :style="{ '--c': i === 0 ? 'currentColor' : 'var(--cat-2)' }" aria-hidden="true" />
						<h2 class="s-h3">{{ channel.label }}</h2>
						<p class="text">{{ channel.description }}</p>
						<div class="action">
							<a :href="`mailto:${channel.email}`" class="email">{{ channel.email }}</a>
							<button
								type="button"
								class="copy"
								:aria-label="`Copy ${channel.email} to clipboard`"
								@click="copyEmail(channel.email)"
							>
								<svg v-if="copiedEmail !== channel.email" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></svg>
								<svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4.5 4.5L19 7" /></svg>
								<span aria-live="polite">{{ copiedEmail === channel.email ? "Copied" : "Copy" }}</span>
							</button>
						</div>
					</li>
				</ul>
				<p class="note s-muted">
					You can also reach us through our social media channels for quick updates and
					announcements.
				</p>
			</div>
		</section>
	</SitePage>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import SitePage from "../../components/site/SitePage.vue";
import DocHero from "../../components/site/DocHero.vue";

interface ContactChannel {
	label: string;
	description: string;
	email: string;
}

const channels: ContactChannel[] = [
	{
		label: "Customer Support",
		description:
			"For order inquiries, delivery issues, or general questions about our service.",
		email: "support@mealgro.com",
	},
	{
		label: "General Inquiries",
		description:
			"For business inquiries, partnerships, or any other questions.",
		email: "info@mealgro.com",
	},
];

const copiedEmail = ref<string | null>(null);
let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

const copyEmail = async (email: string) => {
	try {
		await navigator.clipboard.writeText(email);
	} catch {
		return;
	}
	copiedEmail.value = email;
	if (copyResetTimer) clearTimeout(copyResetTimer);
	copyResetTimer = setTimeout(() => {
		copiedEmail.value = null;
	}, 1800);
};

onUnmounted(() => {
	if (copyResetTimer) clearTimeout(copyResetTimer);
});
</script>

<style scoped>
.cards {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;
}
.card {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: clamp(24px, 4vw, 40px);
	border-radius: 1.75rem;
	min-height: 280px;
}
.card .sh {
	width: 18px;
	height: 18px;
	margin-bottom: auto;
}
.card .s-h3 {
	margin-top: 32px;
}
.text {
	font-size: 16px;
	max-width: 40ch;
}
.s-card .text {
	color: var(--muted);
}
.action {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 10px;
	margin-top: 8px;
}
.email {
	font-family: var(--font-display);
	font-weight: 800;
	font-size: clamp(20px, 2.4vw, 26px);
	letter-spacing: -0.02em;
	text-decoration: underline;
	text-decoration-thickness: 2px;
	text-underline-offset: 5px;
	overflow-wrap: anywhere;
}
.copy {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	min-height: 40px;
	padding: 0 14px;
	border-radius: 999px;
	border: 1.5px solid currentColor;
	background: transparent;
	color: inherit;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
}
.note {
	margin-top: 24px !important;
	font-size: 16px;
}
@media (max-width: 760px) {
	.cards {
		grid-template-columns: minmax(0, 1fr);
	}
	.card {
		min-height: 0;
	}
}
</style>

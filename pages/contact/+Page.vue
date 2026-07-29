<template>
	<div class="contact-page">
		<!-- Mobile/Tablet Header -->
		<div class="mobile-header">
			<div class="mobile-logo-container">
				<a href="/">
					<img
						:src="logoImage"
						alt="Mealgro Logo"
						class="mobile-logo"
					/>
				</a>
			</div>
			<button
				class="mobile-menu-button"
				type="button"
				:aria-expanded="isMobileMenuOpen"
				aria-controls="mobile-nav-menu"
				@click="toggleMobileMenu"
			>
				<span class="sr-only">Toggle navigation menu</span>
				<svg
					v-if="!isMobileMenuOpen"
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M3 12H21M3 6H21M3 18H21"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
				<svg
					v-else
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M6 6L18 18"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<path
						d="M18 6L6 18"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>

		<transition name="mobile-menu">
			<nav
				v-if="isMobileMenuOpen"
				id="mobile-nav-menu"
				class="mobile-menu-panel"
			>
				<a
					v-for="link in mobileNavLinks"
					:key="link.href"
					:href="link.href"
					class="mobile-menu-link"
					@click="closeMobileMenu"
				>
					<span>{{ link.label }}</span>
					<svg
						v-if="link.hasDropdown"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M4 6L8 10L12 6"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</a>
			</nav>
		</transition>

		<main class="doc">
			<header class="doc-hero">
				<p class="doc-eyebrow">Get in Touch</p>
				<h1 class="doc-title">Contact Us</h1>
				<p class="doc-subheadline">
					We'd love to hear from you! Whether you have a question,
					feedback, or need support, our team is here to help.
				</p>
			</header>

			<div class="contact-grid">
				<div v-for="channel in channels" :key="channel.email" class="contact-card">
					<div class="contact-icon" aria-hidden="true">
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect
								x="3"
								y="5"
								width="18"
								height="14"
								rx="2"
								stroke="currentColor"
								stroke-width="1.6"
							/>
							<path
								d="M3.5 6.5L12 13L20.5 6.5"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<h2 class="contact-card-title">{{ channel.label }}</h2>
					<p class="contact-card-text">{{ channel.description }}</p>
					<div class="contact-action">
						<a :href="`mailto:${channel.email}`" class="contact-email">{{
							channel.email
						}}</a>
						<button
							type="button"
							class="copy-button"
							:class="{ 'is-copied': copiedEmail === channel.email }"
							:aria-label="`Copy ${channel.email} to clipboard`"
							@click="copyEmail(channel.email)"
						>
							<svg
								v-if="copiedEmail !== channel.email"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<rect
									x="8"
									y="8"
									width="12"
									height="12"
									rx="2"
									stroke="currentColor"
									stroke-width="1.8"
								/>
								<path
									d="M5 15V5a1 1 0 011-1h10"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
								/>
							</svg>
							<svg
								v-else
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M5 13L9.5 17.5L19 7"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
							<span aria-live="polite">{{
								copiedEmail === channel.email ? "Copied" : "Copy"
							}}</span>
						</button>
					</div>
				</div>
			</div>

			<p class="contact-note">
				You can also reach us through our social media channels for
				quick updates and announcements.
			</p>
		</main>

		<div class="footer-spacer"></div>
		<Footer />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import Footer from "../../components/shared/Footer.vue";
import { navLinks } from "../../components/shared/navLinks";
import logoImage from "../../assets/logo.svg";

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

const isMobileMenuOpen = ref(false);
const copiedEmail = ref<string | null>(null);
let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

const mobileNavLinks = computed(() => {
	return navLinks.filter((link) => link.href !== "/");
});

const toggleMobileMenu = () => {
	isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
	isMobileMenuOpen.value = false;
};

const handleEscape = (event: KeyboardEvent) => {
	if (event.key === "Escape") {
		closeMobileMenu();
	}
};

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

onMounted(() => {
	window.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleEscape);
	if (copyResetTimer) clearTimeout(copyResetTimer);
});
</script>

<style scoped>
.contact-page {
	--paper: #f6f6f6;
	--paper-line: rgba(23, 19, 15, 0.12);
	--ink: #17130f;
	--ink-soft: rgba(23, 19, 15, 0.64);
	--brand-red: #d62300;
	--brand-red-soft: rgba(214, 35, 0, 0.08);
	--brand-yellow: #ffe100;
	--card: #ffffff;
	--mono: ui-monospace, "SF Mono", "SFMono-Regular", Menlo, Consolas,
		monospace;

	background: var(--paper);
	color: var(--ink);
}

.doc {
	max-width: 900px;
	margin: 0 auto;
	padding: clamp(120px, 14vw, 176px) clamp(20px, 4vw, 40px)
		clamp(64px, 8vw, 96px);
}

.doc-hero {
	max-width: 640px;
	margin: 0 auto clamp(48px, 6vw, 64px);
	text-align: center;
}

.doc-eyebrow {
	font-family: var(--mono);
	font-size: 12px;
	font-weight: 500;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: var(--brand-red);
	margin: 0 0 16px;
}

.doc-title {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 800;
	font-size: clamp(44px, 7vw, 72px);
	line-height: 1.05;
	letter-spacing: -0.02em;
	margin: 0 0 clamp(20px, 3vw, 28px);
}

.doc-subheadline {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 500;
	font-size: clamp(18px, 2.2vw, 22px);
	line-height: 1.6;
	color: var(--ink-soft);
	margin: 0;
}

.contact-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: clamp(20px, 3vw, 28px);
	margin-bottom: clamp(40px, 6vw, 56px);
}

.contact-card {
	background: var(--card);
	border-radius: 24px;
	padding: clamp(28px, 4vw, 36px);
	box-shadow: 0 20px 50px rgba(23, 19, 15, 0.07);
}

.contact-icon {
	width: 44px;
	height: 44px;
	border-radius: 12px;
	background: var(--brand-red-soft);
	color: var(--brand-red);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: clamp(16px, 2.5vw, 20px);
}

.contact-card-title {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 700;
	font-size: clamp(20px, 2.4vw, 24px);
	line-height: 1.3;
	letter-spacing: -0.01em;
	color: var(--ink);
	margin: 0 0 clamp(8px, 1.5vw, 12px);
}

.contact-card-text {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 400;
	font-size: clamp(15px, 1.8vw, 16px);
	line-height: 1.6;
	color: var(--ink-soft);
	margin: 0 0 clamp(20px, 3vw, 24px);
}

.contact-action {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding-top: clamp(16px, 2.5vw, 20px);
	border-top: 1px solid var(--paper-line);
	flex-wrap: wrap;
}

.contact-email {
	font-family: var(--mono);
	font-size: clamp(14px, 1.6vw, 15px);
	font-weight: 500;
	color: var(--ink);
	text-decoration: none;
	word-break: break-all;
}

.contact-email:hover {
	color: var(--brand-red);
}

.copy-button {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	flex-shrink: 0;
	padding: 6px 12px;
	border-radius: 999px;
	border: 1px solid var(--brand-red);
	background: transparent;
	color: var(--brand-red);
	font-family: "MADE Tommy Soft", sans-serif;
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 0.02em;
	cursor: pointer;
	transition: background 0.15s ease, color 0.15s ease;
}

.copy-button:hover {
	background: var(--brand-red-soft);
}

.copy-button.is-copied {
	background: var(--brand-red);
	color: #ffffff;
}

.contact-note {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 400;
	font-size: clamp(15px, 1.8vw, 16px);
	line-height: 1.6;
	color: var(--ink-soft);
	text-align: center;
	max-width: 560px;
	margin: 0 auto;
}

.footer-spacer {
	background: #000000;
	height: clamp(60px, 8vw, 100px);
}

/* Mobile Header */
.mobile-header {
	display: none;
}

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}

:focus-visible {
	outline: 2px solid var(--brand-red, #d62300);
	outline-offset: 2px;
}

@media (max-width: 1024px) {
	.mobile-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		width: 100vw;
		box-sizing: border-box;
		background: rgba(214, 35, 0, 0.95);
		backdrop-filter: blur(10px);
	}

	.mobile-logo-container {
		display: flex;
		align-items: center;
		gap: 12px;
		background: white;
		border-radius: 50px;
		padding: 8px 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.mobile-logo-container a {
		display: flex;
		align-items: center;
		text-decoration: none;
		cursor: pointer;
	}

	.mobile-logo {
		height: 24px;
		width: auto;
		pointer-events: none;
	}

	.mobile-menu-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: white;
		border-radius: 50%;
		border: none;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		color: #0e172b;
	}

	.mobile-menu-panel {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 20px;
		position: fixed;
		top: 72px;
		left: 0;
		right: 0;
		background: #ffffff;
		border-radius: 0 0 24px 24px;
		box-shadow: 0 10px 30px rgba(14, 23, 43, 0.12);
		z-index: 95;
	}

	.mobile-menu-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-decoration: none;
		font-family: "MADE Tommy Soft", sans-serif;
		font-size: 15px;
		line-height: 150%;
		color: #0e172b;
		padding: 10px 0;
		border-bottom: 1px solid rgba(14, 23, 43, 0.07);
	}

	.mobile-menu-link:last-of-type {
		border-bottom: none;
	}

	.mobile-menu-enter-active,
	.mobile-menu-leave-active {
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.mobile-menu-enter-from,
	.mobile-menu-leave-to {
		opacity: 0;
		transform: translateY(-10px);
	}

	.doc {
		padding-top: clamp(100px, 15vw, 180px);
	}

	.contact-grid {
		grid-template-columns: 1fr;
	}
}

@media (prefers-reduced-motion: reduce) {
	.copy-button,
	.mobile-menu-enter-active,
	.mobile-menu-leave-active {
		transition: none !important;
	}
}
</style>

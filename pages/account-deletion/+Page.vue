<template>
	<div class="contact-page deletion-page">
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
				<p class="doc-eyebrow">Your data</p>
				<h1 class="doc-title">Delete your Mealgro account</h1>
				<p class="doc-subheadline">
					How to delete your account in the Mealgro app or the
					Mealgro Rider app, by Mealgro Logistics Ltd, what we delete,
					and what we have to keep.
				</p>
			</header>

			<section class="del-section" aria-labelledby="in-app">
				<h2 id="in-app" class="del-heading">Delete it in the app</h2>
				<div class="del-grid">
					<div class="del-card">
						<p class="del-card-eyebrow">Mealgro (customers and vendors)</p>
						<ol class="del-steps">
							<li>Open Mealgro and sign in.</li>
							<li>Go to <strong>Profile</strong> and tap <strong>Edit Profile</strong>.</li>
							<li>Tap <strong>Delete Account</strong>.</li>
							<li>Confirm with <strong>Yes, delete my account</strong>.</li>
						</ol>
						<p class="del-card-note">
							Your account is deleted after 24 hours. Signing back in
							within those 24 hours cancels the deletion.
						</p>
					</div>
					<div class="del-card">
						<p class="del-card-eyebrow">Mealgro Rider</p>
						<ol class="del-steps">
							<li>Open Mealgro Rider and sign in.</li>
							<li>Go to <strong>Profile</strong>, then <strong>Account settings</strong>.</li>
							<li>Tap <strong>Delete your account</strong>.</li>
							<li>Confirm with <strong>Delete account</strong>.</li>
						</ol>
						<p class="del-card-note">
							Your rider account closes straight away. Withdraw any
							earnings first: a closed account can't be paid out.
						</p>
					</div>
				</div>
			</section>

			<section class="del-section" aria-labelledby="by-email">
				<h2 id="by-email" class="del-heading">No app? Ask us by email</h2>
				<div class="del-card">
					<p class="del-text">
						Email
						<a class="del-link" :href="mailtoLink">{{ supportEmail }}</a>
						from the email address on your account, with the subject
						<strong>Delete my account</strong>. Tell us the phone number
						on the account and whether it is a customer, vendor or rider
						account.
					</p>
					<p class="del-text">
						We confirm the request is yours before deleting anything,
						and reply within 7 days. Deletion is complete within 30
						days of confirming.
					</p>
					<a class="del-button" :href="mailtoLink">Email a deletion request</a>
				</div>
			</section>

			<section class="del-section" aria-labelledby="deleted">
				<h2 id="deleted" class="del-heading">What we delete</h2>
				<ul class="del-list">
					<li>Your profile: name, username, photo and bio.</li>
					<li>Your phone number, email address and sign-in details, including the link to Google or Apple sign-in.</li>
					<li>Your saved delivery addresses.</li>
					<li>Who you follow, who follows you, and saved items.</li>
					<li>Posts, stories, highlights and reviews you published.</li>
					<li>Notification tokens for your devices.</li>
					<li>For vendors: your store, its menu and its media, once its orders are settled.</li>
				</ul>
			</section>

			<section class="del-section" aria-labelledby="kept">
				<h2 id="kept" class="del-heading">What we keep, and for how long</h2>
				<p class="del-text">
					Some records we have to keep by law, or to settle disputes and
					prevent fraud. They are no longer linked to a profile you can
					use, and we delete them once the period ends.
				</p>
				<div class="del-table" role="table" aria-label="Data we keep after deletion">
					<div class="del-row del-row-head" role="row">
						<span role="columnheader">Data</span>
						<span role="columnheader">Why</span>
						<span role="columnheader">How long</span>
					</div>
					<div v-for="row in kept" :key="row.data" class="del-row" role="row">
						<span role="cell" class="del-cell-data">{{ row.data }}</span>
						<span role="cell">{{ row.why }}</span>
						<span role="cell" class="del-cell-period">{{ row.period }}</span>
					</div>
				</div>
			</section>

			<section class="del-section" aria-labelledby="before">
				<h2 id="before" class="del-heading">Before you delete</h2>
				<ul class="del-list">
					<li>Finish or cancel any open order. An account with an order in progress can't be deleted until it ends.</li>
					<li>Vendors and riders: withdraw your balance first. Money left in a deleted account can't be paid out.</li>
					<li>Deletion can't be undone after it completes. To use Mealgro again, you'd sign up for a new account.</li>
				</ul>
			</section>

			<p class="contact-note">
				Questions about your data? Email
				<a class="del-link" :href="`mailto:${supportEmail}`">{{ supportEmail }}</a>
				or read our <a class="del-link" href="/privacy">Privacy Policy</a>.
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

interface KeptRecord {
	data: string;
	why: string;
	period: string;
}

const supportEmail = "support@mealgro.com";

const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(
	"Delete my account",
)}&body=${encodeURIComponent(
	"Phone number on the account:\nAccount type (customer, vendor or rider):\n",
)}`;

// Matches the Privacy Policy's retention section (§18): kept as long as the
// law requires, generally up to 7 years after the account's last use.
const kept: KeptRecord[] = [
	{
		data: "Orders and payments: amounts, dates, store, and payment references",
		why: "Tax and accounting law, refunds and chargebacks",
		period: "Up to 7 years",
	},
	{
		data: "Wallet, payout and earnings records",
		why: "Financial record-keeping and fraud prevention",
		period: "Up to 7 years",
	},
	{
		data: "Riders' identity (KYC) documents",
		why: "Legal checks on who delivered for us, and fraud prevention",
		period: "Up to 7 years",
	},
	{
		data: "Records tied to an open dispute, investigation or legal claim",
		why: "Until the matter is resolved",
		period: "As long as it lasts",
	},
];

const isMobileMenuOpen = ref(false);

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

onMounted(() => {
	window.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleEscape);
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

.del-section {
	margin-bottom: clamp(40px, 6vw, 56px);
}

.del-heading {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 800;
	font-size: clamp(24px, 3vw, 32px);
	line-height: 1.2;
	letter-spacing: -0.01em;
	margin: 0 0 clamp(16px, 2.5vw, 20px);
}

.del-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: clamp(20px, 3vw, 28px);
}

.del-card {
	background: var(--card);
	border-radius: 24px;
	padding: clamp(24px, 4vw, 32px);
	box-shadow: 0 20px 50px rgba(23, 19, 15, 0.07);
}

.del-card-eyebrow {
	font-family: var(--mono);
	font-size: 12px;
	font-weight: 500;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--brand-red);
	margin: 0 0 14px;
}

.del-steps,
.del-list {
	font-family: "MADE Tommy Soft", sans-serif;
	font-size: clamp(15px, 1.8vw, 17px);
	line-height: 1.6;
	margin: 0;
	padding-left: 1.3em;
}

.del-steps li,
.del-list li {
	margin-bottom: 8px;
}

.del-list {
	background: var(--card);
	border-radius: 24px;
	padding: clamp(24px, 4vw, 32px) clamp(24px, 4vw, 32px)
		clamp(24px, 4vw, 32px) calc(clamp(24px, 4vw, 32px) + 1.3em);
	box-shadow: 0 20px 50px rgba(23, 19, 15, 0.07);
}

.del-card-note,
.del-text {
	font-family: "MADE Tommy Soft", sans-serif;
	font-size: clamp(15px, 1.8vw, 16px);
	line-height: 1.6;
	color: var(--ink-soft);
	margin: 16px 0 0;
}

.del-text:first-child {
	margin-top: 0;
}

.del-section > .del-text {
	margin: 0 0 clamp(16px, 2.5vw, 20px);
}

.del-link {
	color: var(--brand-red);
	font-weight: 600;
	text-decoration: underline;
	text-underline-offset: 3px;
	word-break: break-all;
}

.del-button {
	display: inline-block;
	margin-top: clamp(20px, 3vw, 24px);
	padding: 14px 24px;
	border-radius: 999px;
	background: var(--brand-red);
	color: #fff;
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 700;
	text-decoration: none;
}

.del-button:hover {
	background: #b81e00;
}

.del-button:focus-visible,
.del-link:focus-visible {
	outline: 3px solid var(--brand-yellow);
	outline-offset: 3px;
}

.del-table {
	background: var(--card);
	border-radius: 24px;
	overflow: hidden;
	box-shadow: 0 20px 50px rgba(23, 19, 15, 0.07);
}

.del-row {
	display: grid;
	grid-template-columns: 1.4fr 1.4fr 0.8fr;
	gap: 16px;
	padding: 16px clamp(20px, 3vw, 28px);
	border-top: 1px solid var(--paper-line);
	font-family: "MADE Tommy Soft", sans-serif;
	font-size: 15px;
	line-height: 1.5;
	color: var(--ink-soft);
}

.del-row-head {
	border-top: none;
	font-family: var(--mono);
	font-size: 12px;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--ink);
	background: var(--brand-red-soft);
}

.del-cell-data {
	color: var(--ink);
	font-weight: 600;
}

.del-cell-period {
	color: var(--ink);
	font-weight: 700;
}

@media (max-width: 640px) {
	.del-row {
		grid-template-columns: 1fr;
		gap: 4px;
	}

	.del-row-head {
		display: none;
	}
}
</style>

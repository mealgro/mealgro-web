<template>
	<SitePage>
		<DocHero
			label="Your data"
			title="Delete your Mealgro account"
			lead="How to delete your account in the Mealgro app or the Mealgro Rider app, by Mealgro Logistics Ltd, what we delete, and what we have to keep."
		/>
		<section class="s-section">
			<div class="s-wrap del">

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
		</div>
		</section>
	</SitePage>
</template>

<script setup lang="ts">
import SitePage from "../../components/site/SitePage.vue";
import DocHero from "../../components/site/DocHero.vue";

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
</script>

<style scoped>
.del {
	display: grid;
	gap: clamp(40px, 6vw, 64px);
	max-width: 980px;
}
.del-heading {
	font-size: clamp(26px, 3.2vw, 38px);
	line-height: 1.05;
	margin-bottom: 18px !important;
}
.del-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;
}
.del-card {
	padding: clamp(22px, 3.5vw, 32px);
	border-radius: 1.75rem;
	background: var(--surface);
	border: 1px solid var(--line);
	display: grid;
	gap: 14px;
	align-content: start;
}
.del-card-eyebrow {
	font-family: var(--font-display);
	font-weight: 800;
	font-size: 20px;
	letter-spacing: -0.02em;
}
.del-steps {
	counter-reset: step;
	display: grid;
	gap: 10px;
}
.del-steps li {
	counter-increment: step;
	position: relative;
	padding-left: 40px;
	min-height: 28px;
	line-height: 1.5;
}
.del-steps li::before {
	content: counter(step);
	position: absolute;
	left: 0;
	top: -1px;
	display: grid;
	place-items: center;
	width: 28px;
	height: 28px;
	border-radius: 8px;
	background: var(--brand-soft);
	color: var(--brand);
	font-weight: 700;
	font-size: 14px;
}
.del-card-note {
	padding: 12px 16px;
	border-radius: 1rem;
	background: color-mix(in srgb, var(--warn) 22%, var(--surface));
	font-size: 15px;
}
.del-text {
	line-height: 1.65;
	color: color-mix(in srgb, var(--ink) 82%, var(--surface));
}
.del-link {
	color: var(--brand);
	font-weight: 600;
	text-decoration: underline;
	text-underline-offset: 3px;
}
.del-button {
	justify-self: start;
	display: inline-flex;
	align-items: center;
	min-height: 52px;
	padding: 0 24px;
	border-radius: 999px;
	background: var(--brand);
	color: var(--on-brand) !important;
	font-weight: 600;
	text-decoration: none;
}
.del-list {
	display: grid;
	gap: 10px;
}
.del-list li {
	position: relative;
	padding-left: 26px;
	line-height: 1.6;
	color: color-mix(in srgb, var(--ink) 82%, var(--surface));
}
.del-list li::before {
	content: "";
	position: absolute;
	left: 4px;
	top: 0.62em;
	width: 8px;
	height: 8px;
	border-radius: 2px;
	background: var(--cat-1);
}
.del-table {
	margin-top: 18px;
	border-radius: 1.5rem;
	overflow: hidden;
	border: 1px solid var(--line);
	background: var(--surface);
}
.del-row {
	display: grid;
	grid-template-columns: 1.3fr 1.2fr 0.6fr;
	gap: 16px;
	padding: 16px 20px;
	border-top: 1px solid var(--line);
	font-size: 15px;
	line-height: 1.5;
}
.del-row-head {
	border-top: 0;
	background: var(--bg);
	font-weight: 700;
	font-size: 14px;
}
.del-cell-data {
	font-weight: 600;
}
.del-cell-period {
	font-weight: 700;
	color: var(--brand);
}
.contact-note {
	padding: 20px 24px;
	border-radius: 1.5rem;
	background: var(--brand-soft);
	font-size: 16px;
}
@media (max-width: 760px) {
	.del-grid {
		grid-template-columns: minmax(0, 1fr);
	}
	.del-row-head {
		display: none;
	}
	.del-row {
		grid-template-columns: minmax(0, 1fr);
		gap: 4px;
	}
	.del-row:nth-child(2) {
		border-top: 0;
	}
}
</style>

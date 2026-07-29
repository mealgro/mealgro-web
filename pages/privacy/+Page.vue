<template>
	<div class="privacy-page">
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
				<p class="doc-eyebrow">Legal Document</p>
				<h1 class="doc-title">{{ pageTitle }}</h1>
				<dl class="doc-meta">
					<div class="doc-meta-item">
						<dt>Entity</dt>
						<dd>{{ entityName }}</dd>
					</div>
					<div class="doc-meta-item">
						<dt>Last reviewed</dt>
						<dd>{{ lastReviewed }}</dd>
					</div>
					<div class="doc-meta-item">
						<dt>Sections</dt>
						<dd>{{ tocItems.length || "&mdash;" }}</dd>
					</div>
				</dl>
			</header>

			<details class="doc-toc-mobile">
				<summary>
					<span>Contents</span>
					<span class="doc-toc-count"
						>{{ tocItems.length }} sections</span
					>
				</summary>
				<nav class="doc-toc-list" aria-label="Table of contents">
					<a
						v-for="item in tocItems"
						:key="item.id"
						:href="`#${item.id}`"
						class="doc-toc-link"
						@click.prevent="scrollToSection(item.id)"
					>
						<span class="doc-toc-num">{{ padNum(item.num) }}</span>
						<span class="doc-toc-title">{{ item.title }}</span>
					</a>
				</nav>
			</details>

			<div class="doc-layout">
				<aside class="doc-toc" aria-label="Table of contents">
					<p class="doc-toc-heading">Contents</p>
					<nav class="doc-toc-list">
						<a
							v-for="item in tocItems"
							:key="item.id"
							:href="`#${item.id}`"
							class="doc-toc-link"
							:class="{
								'is-active': activeSectionId === item.id,
							}"
							@click.prevent="scrollToSection(item.id)"
						>
							<span class="doc-toc-num">{{
								padNum(item.num)
							}}</span>
							<span class="doc-toc-title">{{ item.title }}</span>
						</a>
					</nav>
				</aside>

				<article class="doc-sheet">
					<div
						class="markdown-content"
						v-html="renderedContent"
					></div>
				</article>
			</div>
		</main>

		<button
			v-show="showBackToTop"
			class="back-to-top"
			type="button"
			aria-label="Back to top"
			@click="scrollToTop"
		>
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12 19V5M12 5L5 12M12 5L19 12"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>

		<div class="footer-spacer"></div>
		<Footer />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { marked } from "marked";
import logoImage from "../../assets/logo.svg";
import Footer from "../../components/shared/Footer.vue";
import { navLinks } from "../../components/shared/navLinks";
import {
	parseLegalDocument,
	padSectionNumber,
	type TocItem,
} from "../../components/shared/legalDocumentParser";

const pageTitle = "Privacy Policy";
const entityName = "Mealgro Logistics Ltd";
const lastReviewed = "23 July 2026";

const isMobileMenuOpen = ref(false);
const renderedContent = ref("");
const tocItems = ref<TocItem[]>([]);
const activeSectionId = ref("");
const showBackToTop = ref(false);

let sectionObserver: IntersectionObserver | null = null;

const mobileNavLinks = computed(() => {
	return navLinks.filter((link) => link.href !== "/");
});

const padNum = padSectionNumber;

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

const prefersReducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrollToTop = () => {
	window.scrollTo({
		top: 0,
		behavior: prefersReducedMotion() ? "auto" : "smooth",
	});
};

const scrollToSection = (id: string) => {
	document.getElementById(id)?.scrollIntoView({
		behavior: prefersReducedMotion() ? "auto" : "smooth",
		block: "start",
	});
};

const handleScroll = () => {
	showBackToTop.value = window.scrollY > 640;
};

const setupScrollSpy = () => {
	sectionObserver?.disconnect();
	const headings = document.querySelectorAll(".markdown-content h2[id]");
	if (!headings.length) return;

	sectionObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					activeSectionId.value = entry.target.id;
				}
			});
		},
		{ rootMargin: "-15% 0px -75% 0px", threshold: 0 },
	);
	headings.forEach((heading) => sectionObserver?.observe(heading));
};

const fetchPrivacyPolicy = async () => {
	const content = `## 1. Introduction

Mealgro Logistics Ltd ("Mealgro", "we", "us", "our") provides a platform through which Users can request and purchase items from Vendors and have them delivered by Riders to their doorstep (the "Services"). At Mealgro, transparency is a core value, and we owe you a duty to explain how we collect, use, and share your personal information. We recommend you read this Privacy Policy ("Policy") carefully, together with our Terms of Use, to understand your rights and our obligations regarding your personal data. Questions about either document can be sent to **support@mealgro.com**.

## 2. Definitions

For the purposes of this Policy:

2.1 "Application" or "Platform" means the Mealgro mobile application, website, and any other digital properties operated by Mealgro.

2.2 "AI-Generated Content" means any text, audio, image, video, or other output produced wholly or partly through artificial intelligence or machine-learning tools, whether generated by Mealgro or by a User through features of the Platform.

2.3 "Personal Information" means any information that identifies or could reasonably be used to identify you, including but not limited to your name, email address, telephone number, physical address, and device or location data.

2.4 "Rider" means an independent contractor or partner engaged to collect and deliver orders placed through the Platform.

2.5 "Services" means the ordering, payment, delivery, and related services made available through the Platform.

2.6 "User" means any individual who accesses or uses the Platform, including customers, Vendors, and Riders, unless the context requires otherwise.

2.7 "User-Generated Content" or "UGC" means any photos, videos, reviews, ratings, comments, or other content that a User submits, uploads, or posts on the Platform.

2.8 "Vendor" means a restaurant, merchant, or business that lists products or services for sale on the Platform.

## 3. Scope

This Policy applies to all Users of the Services, including customers, Vendors, and Riders, and to anyone who otherwise contacts Mealgro or submits information to us through our Platform, customer support channels, or offline touchpoints (such as promotions or surveys). It covers our collection, use, storage, disclosure, and protection of personal information across our mobile application, website, and any associated services. It does not apply to third-party websites, applications, or services that may be linked to or accessible from our Platform, which are governed by their own privacy policies.

## 4. Information We Collect

We collect only the information essential for you to create an account and use our Services. This may include:

4.1 Account information such as your name, age, date of birth, gender, physical address, email address, and phone number;

4.2 Order details, including items purchased, order history, delivery address, and delivery instructions;

4.3 Device information, including operating system, unique device identifiers, serial numbers, and mobile network or Wi-Fi information;

4.4 Payment-related information, as described further in Section 13;

4.5 Location information, as described further in Section 8;

4.6 Photos, videos, and other content you choose to upload, as described further in Section 5;

4.7 Information you provide when you contact customer support, take part in a survey or promotion, or communicate with us through the Platform;

4.8 Information about third parties (such as family members or referrals) that you choose to share with us, on the assumption that you have obtained their consent to do so;

4.9 Demographic information (such as marital status, ethnicity, profession, and income) if you choose to respond to optional surveys;

4.10 Information we receive from other sources, such as fraud-prevention agencies, credit reference agencies, or business directories, where permitted by law.

## 5. Video Content & User-Generated Content

5.1 Our Platform may allow Users to upload photos, videos, reviews, ratings, or comments in connection with orders, Vendor listings, or promotions ("User-Generated Content" or "UGC").

5.2 By submitting UGC, you grant Mealgro a non-exclusive, worldwide, royalty-free, transferable licence to host, store, reproduce, display, and distribute that content in connection with operating and promoting the Platform.

5.3 You are solely responsible for the content you upload. You confirm that you own or have the necessary rights to the UGC you submit, and that it does not infringe the intellectual property, privacy, or other rights of any third party.

5.4 Mealgro reserves the right, but is not obligated, to review, moderate, or remove UGC that it reasonably believes violates this Policy, our Terms of Use, or applicable law.

5.5 UGC may be visible to other Users and, where applicable, the public. Do not include personal information in UGC that you do not wish to be publicly visible.

## 6. AI-Generated Content

6.1 Mealgro may use artificial intelligence and machine-learning tools to generate, personalise, or enhance certain content and features on the Platform, including (without limitation) customer support responses, product recommendations, promotional content, and audio or visual elements as described in Section 7.

6.2 AI-Generated Content is produced using automated systems and may not always be reviewed by a human before being presented to you. While we take reasonable steps to ensure accuracy and appropriateness, AI-Generated Content may occasionally contain errors, and it should not be relied upon as professional, medical, legal, or financial advice.

6.3 Where AI tools process your personal information (for example, to personalise recommendations or respond to a support query), we handle that information in accordance with this Policy and applicable data protection law.

6.4 If you interact with an AI-powered feature (such as a chatbot), we may retain records of that interaction for quality assurance, training, and service-improvement purposes, consistent with Section 18 (Data Retention).

## 7. Audio & Sound Copyright Policy

7.1 Mealgro's Platform may contain audio and sound elements, including notification tones, background music, sound effects, and voice prompts (collectively, "Audio Content").

7.2 All Audio Content used within our Platform is either (a) royalty-free and copyright-cleared for commercial use under licences held or obtained by Mealgro, or (b) AI-Generated Audio produced through automated or machine-learning-based tools. Mealgro warrants that it holds the necessary rights, licences, or clearances to use all Audio Content featured on its Platform.

7.3 AI-Generated Audio does not knowingly derive from, sample, or reproduce any copyrighted sound recording, musical composition, or performance owned by a third party, except to the extent such use is duly licensed.

7.4 Users may not extract, download, reproduce, distribute, publicly perform, or otherwise use Audio Content outside of its intended use within the Mealgro application, without our prior written consent.

7.5 If you believe any Audio Content on our Platform infringes your copyright or other intellectual property rights, contact us at **info@mealgro.com** with sufficient detail to allow us to identify and investigate the content. We will review and respond to legitimate claims in accordance with applicable law.

7.6 All rights, title, and interest in the Audio Content remain with Mealgro or its licensors. Nothing in this section transfers any ownership rights to Users.

## 8. Location Services

8.1 Before first use of the Platform, we will ask you to choose whether to allow Mealgro to access your location and under what circumstances. Location services must be enabled for us to provide our Services. You may change these settings at any time on your device.

8.2 Once enabled, we obtain your location through IP address, GPS, and other sensors, primarily so that we can recommend Vendors closest to you and enable accurate delivery by Riders.

8.3 We may collect Wi-Fi metadata from your device, including whether it is Wi-Fi and GPS enabled, the Media Access Control (MAC) address, the Set Service Identifier (SSID) and signal level of nearby Wi-Fi networks, the GPS location of your device relative to those networks, and the time the metadata was collected.

## 9. Camera & Microphone Permissions

9.1 Certain features of the Platform, such as uploading photos or videos for UGC, scanning documents for verification, voice-based search, or in-app voice/video communication, may require access to your device's camera and/or microphone.

9.2 We will request your permission before accessing your camera or microphone, and these permissions can be enabled or disabled at any time through your device settings.

9.3 If you decline to grant camera or microphone access, certain features of the Platform may not be available to you, but you may continue to use the core Services.

9.4 Any photos, videos, or audio captured through these permissions are used only for the purpose for which they were collected (for example, order verification or UGC submission) unless you consent to additional use.

## 10. How We Use Your Information

We may use and analyse your information to:

10.1 Provide the Services and facilitate the listing of Vendors around you;

10.2 Keep you informed about new products and services, unless you opt out of marketing messages;

10.3 Understand how you use our Platform, to develop more relevant products, services, and personalisation;

10.4 Comply with applicable laws and regulations;

10.5 Develop, improve, enhance, and further develop our Services;

10.6 Authenticate users, verify identity, and ensure data credibility;

10.7 Prevent and detect fraud and illegal activities;

10.8 Provide customer support and respond to enquiries or complaints;

10.9 Conduct surveys and research and development activities;

10.10 Fulfil our obligations or claim our rights in legal proceedings;

10.11 Process and facilitate payment for Services;

10.12 Notify you about products and services from third-party providers that may interest you, including negotiated offers and discounts;

10.13 Contact you through your provided phone number, email address, or other contact details;

10.14 Provide reports to Vendors and Riders to enable them to serve you better;

10.15 For any other purpose with your consent.

## 11. Vendor Information

11.1 If you register as a Vendor, we collect business information such as your business name, registration details, contact information, bank account or payment details, menu or product listings, and performance data (such as order volume, ratings, and fulfilment times).

11.2 Vendor information is used to facilitate order fulfilment, process payments, generate performance reports, resolve disputes, and communicate with you regarding your listing on the Platform.

11.3 We may share limited Vendor information (such as business name, location, and ratings) with Users to facilitate their purchasing decisions.

11.4 Vendors are responsible for ensuring that any personal information about their staff or representatives shared with Mealgro has been provided in compliance with applicable data protection law.

## 12. Rider Information

12.1 If you register as a Rider, we collect information necessary to verify your identity and eligibility, including your name, contact details, government-issued identification, proof of address, vehicle information (where applicable), and bank account details for payment purposes.

12.2 We collect real-time location data from Riders during active delivery periods to facilitate order tracking, optimise delivery routes, ensure safety, and provide accurate updates to Users.

12.3 Rider performance data (such as delivery times, acceptance rates, and customer ratings) may be collected and used for performance management, incentive calculations, and quality assurance.

12.4 Rider information is retained and processed in accordance with Section 18 (Data Retention) and shared only as necessary to operate the Services, comply with legal obligations, or as described in Section 16 (Data Sharing).

## 13. Payment Information

13.1 When you make a payment through the Platform, we (or our third-party payment processors) collect payment information such as your card details, bank account information, or mobile money details.

13.2 Payment information is processed by PCI-DSS-compliant third-party payment processors. Mealgro does not store full card numbers on its own servers except as permitted under applicable payment card industry standards.

13.3 We use payment information solely to process transactions, issue refunds, detect and prevent fraud, and comply with applicable financial regulations.

13.4 You are responsible for ensuring that any payment information you provide is accurate and that you are authorised to use the relevant payment method.

## 14. Cookies & Analytics

14.1 We use cookies (small text files stored in your browser) and similar technologies, such as web beacons, to recognise you, understand how you use our Platform, and improve your experience.

14.2 Cookies help us remember your preferences, keep you logged in, and personalise the content and offers we show you.

14.3 You can manage your cookie preferences through your browser settings. Rejecting cookies may limit certain functionality or performance of the Platform.

14.4 We may also use analytics tools provided by third parties to help us understand usage patterns and improve our Services. These tools operate in accordance with their own privacy policies.

## 15. Third-Party Services

15.1 Our Platform may include or link to third-party products, services, or websites that we do not operate, including social media platforms such as Facebook and Twitter/X.

15.2 These third parties have their own privacy policies, and Mealgro has no responsibility or liability for their content, practices, or data handling.

15.3 We recommend reviewing the privacy policies of any third-party service you interact with through our Platform, as they may use your information differently from how Mealgro does.

## 16. Data Sharing

16.1 Mealgro does not sell or rent your personal information to third parties. However, we may disclose your information to:

- group companies or subsidiaries;
- agents, Vendors, Riders, or partners who collaborate with us to provide the Services;
- Vendor and Rider partners, to facilitate complaint resolution and follow-up on reviews;
- companies engaged to perform services on our behalf (such as payment processors, cloud hosting providers, and analytics providers);
- credit reference, fraud-prevention, or business-scoring agencies, where applicable;
- debt collection or recovery organisations;
- law enforcement agencies, regulators, courts, or other public authorities, where required or authorised by law;
- parties as reasonably necessary to protect us against fraud, defend our legal rights, or protect the interests of our Users;
- investors, financial advisers, or auditors;
- other parties for our everyday business purposes, such as processing orders and deliveries, subject to any limitations in your privacy settings.

16.2 Where we disclose personal information to third parties, we use reasonable commercial efforts to ensure they only use it as required for the relevant purpose and in a manner consistent with applicable data protection law, including through contractual confidentiality and privacy obligations where practicable.

## 17. International Data Transfers

17.1 Personal information may be collected, stored, and processed on servers located in VDS/Europe, managed by our related entities and/or third-party vendors.

17.2 Where personal information is transferred outside Nigeria, we ensure such transfers comply with applicable data protection law, including the NDPA, and that appropriate safeguards (such as contractual clauses or adequacy determinations) are implemented to protect your data.

17.3 Recipients of transferred data are not permitted to use your personal information for their own purposes unless authorised by you.

## 18. Data Retention

18.1 We retain personal information for as long as necessary to fulfil the purposes described in this Policy, comply with our legal obligations, resolve disputes, and enforce our agreements.

18.2 As a general rule, personal information is retained for seven (7) years after your last active use of the Platform, in line with our Records Retention Policy, unless a longer or shorter period is required by law.

18.3 We may retain information beyond your deletion request where there is an ongoing investigation or dispute, where required by law, or where necessary for legitimate business interests such as fraud prevention.

## 19. Security

19.1 We implement physical, technical, and administrative security measures to reduce the risk of loss, misuse, unauthorised access, disclosure, or alteration of your personal information.

19.2 Safeguards include firewalls, data encryption, physical access controls at our data centres, and information access authorisation controls. Our website uses Secure Sockets Layer (SSL) encryption to protect data in transit.

19.3 We limit access to personal information to individuals who reasonably need it to perform their duties or provide the Services.

19.4 We will never ask for your secure personal or account information through unsolicited communications. You are responsible for keeping your account credentials confidential, and we are not liable for unauthorised access resulting from your failure to do so.

## 20. Your Rights

Subject to applicable law, including the NDPA, you have the right to:

20.1 Confirm what personal information we hold about you;

20.2 Access the personal information we hold about you;

20.3 Correct or update inaccurate or incomplete personal information;

20.4 Request the anonymisation, blocking, or erasure of personal information no longer necessary for the purposes for which it was collected;

20.5 Request data portability, in a structured, machine-readable format, in certain circumstances;

20.6 Request deletion or erasure of personal information processed on the basis of your consent, subject to legal exceptions;

20.7 Withdraw your consent at any time, where processing is based on consent;

20.8 Lodge a complaint with the Nigeria Data Protection Commission.

You may exercise these rights by emailing **support@mealgro.com** or completing our Data Subject Request Form. We may request identification to verify your identity before processing your request, and will respond as promptly as possible.

## 21. Children's Privacy

21.1 Our Services are not directed at, and are not intended for use by, individuals under the age of 18. We do not knowingly collect personal information from children.

21.2 If we become aware that we have inadvertently collected personal information from a child without appropriate parental or guardian consent, we will take reasonable steps to delete that information promptly.

21.3 If you are a parent or guardian and believe your child has provided personal information to us, please contact us at **info@mealgro.com** so we can investigate and take appropriate action.

## 22. Marketing Communications

22.1 We may contact you with delivery-related information and special offers from us and our Vendors, including by telemarketing, email, SMS, and other digital channels, where you have subscribed to receive such communications.

22.2 You may opt out of marketing communications at any time by clicking "Unsubscribe" in our marketing emails or messages, or by contacting us. Opting out does not affect non-promotional communications, such as order receipts or service notifications.

## 23. Intellectual Property

23.1 All content on the Platform, including but not limited to text, graphics, logos, icons, images, software, and Audio Content (see Section 7), is the property of Mealgro or its licensors and is protected by applicable intellectual property laws.

23.2 Except for UGC submitted under Section 5, you may not copy, reproduce, distribute, modify, or create derivative works from any content on the Platform without our prior written consent.

23.3 "Mealgro" and associated logos and trademarks are the property of Mealgro Logistics Ltd. Nothing in this Policy grants you any right or licence to use our trademarks without our prior written permission.

## 24. Account Deletion

24.1 You may delete your account at any time through the Mealgro application settings or by contacting **support@mealgro.com**.

24.2 Following account deletion, we will retain your personal information in accordance with our Records Retention Policy and Section 18 of this Policy, and delete or de-identify it once it is no longer required.

24.3 Account deletion does not affect information that we are required to retain for legal, regulatory, or legitimate business purposes, such as resolving an ongoing dispute or complying with tax or accounting obligations.

## 25. Changes to this Policy

We review this Policy annually to ensure compliance with applicable data protection laws, including the NDPA. We may update this Policy from time to time to reflect changes in our practices, new features, or legal requirements. Updates will be published on our website and application, and where changes are material, we will take reasonable steps to notify you.

## 26. Governing Law

This Policy is governed by the laws of the Federal Republic of Nigeria. Where any provision of this Policy is inconsistent with applicable law, regulation, or convention, that law, regulation, or convention shall prevail. This Policy applies to all Users of the Services, and to anyone who otherwise contacts Mealgro or submits information to us.

## 27. Contact Information

If you have questions about this Policy or how we handle your personal information, please contact us:

- **General enquiries:** info@mealgro.com
- **Data Protection Officer:** info@mealgro.com
- **Registered address:** Sungold estate galadimawa Close D No 7

In compliance with the Nigeria Data Protection Act (NDPA) 2023, Mealgro has appointed a Data Protection Officer responsible for overseeing our data protection strategy and implementation.`;

	marked.setOptions({
		breaks: true,
		gfm: true,
	});

	const html = await marked.parse(content);
	const { html: processedHtml, toc } = parseLegalDocument(html);
	tocItems.value = toc;
	renderedContent.value = processedHtml;

	await nextTick();
	setupScrollSpy();
};

onMounted(() => {
	window.addEventListener("keydown", handleEscape);
	window.addEventListener("scroll", handleScroll, { passive: true });
	fetchPrivacyPolicy();
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleEscape);
	window.removeEventListener("scroll", handleScroll);
	sectionObserver?.disconnect();
});
</script>

<style scoped>
.privacy-page {
	--paper: #f6f6f6;
	--paper-line: rgba(23, 19, 15, 0.12);
	--ink: #17130f;
	--ink-soft: rgba(23, 19, 15, 0.64);
	--brand-red: #d62300;
	--brand-red-soft: rgba(214, 35, 0, 0.08);
	--brand-yellow: #ffe100;
	--card: #ffffff;
	--mono:
		ui-monospace, "SF Mono", "SFMono-Regular", Menlo, Consolas, monospace;

	background: var(--paper);
	color: var(--ink);
}

.doc {
	max-width: 1320px;
	margin: 0 auto;
	padding: clamp(120px, 14vw, 176px) clamp(20px, 4vw, 40px)
		clamp(64px, 8vw, 96px);
}

/* Hero / letterhead */
.doc-hero {
	max-width: 780px;
	margin: 0 auto clamp(40px, 6vw, 64px);
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
	font-size: clamp(40px, 6vw, 68px);
	line-height: 1.05;
	letter-spacing: -0.02em;
	margin: 0 0 clamp(24px, 4vw, 36px);
}

.doc-meta {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: clamp(20px, 4vw, 40px);
	margin: 0;
	padding-top: clamp(20px, 3vw, 28px);
	border-top: 1px solid var(--paper-line);
}

.doc-meta-item {
	text-align: left;
}

.doc-meta-item dt {
	font-family: var(--mono);
	font-size: 11px;
	font-weight: 500;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--ink-soft);
	margin: 0 0 4px;
}

.doc-meta-item dd {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 600;
	font-size: 15px;
	color: var(--ink);
	margin: 0;
}

/* Mobile "Contents" disclosure */
.doc-toc-mobile {
	display: none;
	margin: 0 0 24px;
	background: var(--card);
	border: 1px solid var(--paper-line);
	border-radius: 20px;
	overflow: hidden;
}

.doc-toc-mobile summary {
	list-style: none;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 700;
	font-size: 16px;
	cursor: pointer;
}

.doc-toc-mobile summary::-webkit-details-marker {
	display: none;
}

.doc-toc-mobile .doc-toc-count {
	font-family: var(--mono);
	font-size: 12px;
	font-weight: 400;
	color: var(--ink-soft);
}

.doc-toc-mobile .doc-toc-list {
	max-height: 50vh;
	overflow-y: auto;
	padding: 0 8px 12px;
	border-top: 1px solid var(--paper-line);
}

/* Layout: sticky contents rail + paper sheet */
.doc-layout {
	display: grid;
	grid-template-columns: 260px minmax(0, 1fr);
	gap: clamp(24px, 4vw, 56px);
	align-items: start;
}

.doc-toc {
	position: sticky;
	top: clamp(24px, 3vw, 40px);
	max-height: calc(100vh - 64px);
	overflow-y: auto;
	padding-right: 8px;
}

.doc-toc-heading {
	font-family: var(--mono);
	font-size: 11px;
	font-weight: 500;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--ink-soft);
	margin: 0 0 12px;
}

.doc-toc-list {
	display: flex;
	flex-direction: column;
}

.doc-toc-link {
	display: flex;
	align-items: baseline;
	gap: 10px;
	padding: 8px 10px;
	border-radius: 10px;
	border-left: 2px solid transparent;
	text-decoration: none;
	color: var(--ink-soft);
	transition:
		color 0.15s ease,
		background 0.15s ease,
		border-color 0.15s ease;
}

.doc-toc-link:hover {
	color: var(--ink);
	background: var(--brand-red-soft);
}

.doc-toc-link.is-active {
	color: var(--ink);
	background: var(--brand-red-soft);
	border-left-color: var(--brand-red);
	font-weight: 600;
}

.doc-toc-num {
	font-family: var(--mono);
	font-size: 12px;
	font-variant-numeric: tabular-nums;
	color: var(--brand-red);
	flex-shrink: 0;
}

.doc-toc-title {
	font-family: "MADE Tommy Soft", sans-serif;
	font-size: 14px;
	line-height: 1.4;
}

.doc-sheet {
	background: var(--card);
	border-radius: 28px;
	padding: clamp(32px, 5vw, 64px);
	box-shadow: 0 24px 60px rgba(23, 19, 15, 0.08);
	min-width: 0;
}

/* Back to top */
.back-to-top {
	position: fixed;
	right: clamp(16px, 3vw, 32px);
	bottom: clamp(16px, 3vw, 32px);
	width: 48px;
	height: 48px;
	border-radius: 50%;
	border: none;
	background: var(--brand-red, #d62300);
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	box-shadow: 0 10px 24px rgba(214, 35, 0, 0.35);
	transition:
		transform 0.15s ease,
		opacity 0.15s ease;
	z-index: 50;
}

.back-to-top:hover {
	transform: translateY(-2px);
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

	.doc-layout {
		grid-template-columns: 1fr;
	}

	.doc-toc {
		display: none;
	}

	.doc-toc-mobile {
		display: block;
	}
}

@media (prefers-reduced-motion: reduce) {
	.doc-toc-link,
	.back-to-top,
	.mobile-menu-enter-active,
	.mobile-menu-leave-active {
		transition: none !important;
	}
}
</style>

<!--
	Unscoped on purpose: Vue's scoped-CSS attribute is only applied to nodes the
	compiler sees in this template. Everything below lives inside `v-html`, so a
	scoped selector such as `.markdown-content h2[data-v-xxx]` would silently
	never match. These class names are specific to this document body.
-->
<style>
.privacy-page .markdown-content {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 400;
	font-size: clamp(16px, 1.6vw, 18px);
	line-height: 1.75;
	color: var(--ink, #17130f);
	max-width: 74ch;
	margin: 0 auto;
}

.privacy-page .markdown-content p {
	margin: 0 0 clamp(18px, 2.5vw, 22px);
	color: var(--ink-soft, rgba(23, 19, 15, 0.64));
}

.privacy-page .markdown-content h2 {
	display: grid;
	grid-template-columns: auto 1fr;
	align-items: baseline;
	column-gap: clamp(12px, 2vw, 20px);
	margin: clamp(40px, 6vw, 64px) 0 clamp(18px, 2.5vw, 24px);
	scroll-margin-top: 24px;
}

.privacy-page .markdown-content h2:first-child {
	margin-top: 0;
}

.privacy-page .markdown-content .chip {
	font-family: "MADE Tommy Soft Outline", "MADE Tommy Soft", sans-serif;
	font-weight: 800;
	font-size: clamp(34px, 5vw, 56px);
	line-height: 1;
	color: var(--brand-red, #d62300);
	-webkit-text-stroke: 0.5px var(--brand-red, #d62300);
}

.privacy-page .markdown-content .chip-title {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 700;
	font-size: clamp(20px, 2.6vw, 28px);
	line-height: 1.3;
	letter-spacing: -0.01em;
	color: var(--ink, #17130f);
}

.privacy-page .markdown-content .clause-num {
	font-family:
		ui-monospace, "SF Mono", "SFMono-Regular", Menlo, Consolas, monospace;
	font-size: 0.78em;
	font-weight: 600;
	color: var(--brand-red, #d62300);
	white-space: nowrap;
}

.privacy-page .markdown-content a {
	color: var(--brand-red, #d62300);
	text-decoration: underline;
	text-underline-offset: 2px;
	transition: opacity 0.2s;
}

.privacy-page .markdown-content a:hover {
	opacity: 0.75;
}

.privacy-page .markdown-content strong {
	color: var(--ink, #17130f);
	font-weight: 700;
}

.privacy-page .markdown-content em {
	color: var(--ink-soft, rgba(23, 19, 15, 0.64));
}

.privacy-page .markdown-content hr {
	border: none;
	border-top: 2px solid var(--brand-red, #d62300);
	width: 64px;
	margin: clamp(40px, 6vw, 56px) auto;
	opacity: 0.4;
}

.privacy-page .markdown-content ul,
.privacy-page .markdown-content ol {
	margin: 0 0 clamp(18px, 2.5vw, 22px);
	padding-left: clamp(20px, 3vw, 28px);
	color: var(--ink-soft, rgba(23, 19, 15, 0.64));
	list-style: none;
}

.privacy-page .markdown-content li {
	position: relative;
	margin-bottom: 10px;
	line-height: 1.7;
	padding-left: 1.1em;
}

.privacy-page .markdown-content li::before {
	content: "";
	position: absolute;
	left: 0;
	top: 0.65em;
	width: 6px;
	height: 6px;
	border-radius: 2px;
	background: var(--brand-red, #d62300);
}

.privacy-page .markdown-content code {
	background: var(--brand-red-soft, rgba(214, 35, 0, 0.08));
	padding: 2px 6px;
	border-radius: 4px;
	font-family: ui-monospace, monospace;
	font-size: 0.9em;
}

.privacy-page .markdown-content .contact-card {
	margin: clamp(24px, 4vw, 32px) 0 0;
	padding: clamp(20px, 3vw, 28px);
	background: var(--brand-red-soft, rgba(214, 35, 0, 0.08));
	border-left: 3px solid var(--brand-red, #d62300);
	border-radius: 12px;
}

.privacy-page .markdown-content .contact-card p:last-child,
.privacy-page .markdown-content .contact-card ul:last-child {
	margin-bottom: 0;
}

.privacy-page .markdown-content .contact-card strong {
	color: var(--ink, #17130f);
}
</style>

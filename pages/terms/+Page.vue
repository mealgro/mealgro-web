<template>
	<div class="terms-page">
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
						<dt>Last updated</dt>
						<dd>{{ lastUpdated }}</dd>
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
					<span class="doc-toc-count">{{ tocItems.length }} sections</span>
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
							:class="{ 'is-active': activeSectionId === item.id }"
							@click.prevent="scrollToSection(item.id)"
						>
							<span class="doc-toc-num">{{ padNum(item.num) }}</span>
							<span class="doc-toc-title">{{ item.title }}</span>
						</a>
					</nav>
				</aside>

				<article class="doc-sheet">
					<div class="markdown-content" v-html="renderedContent"></div>
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

const pageTitle = "Terms of Service";
const entityName = "MealGro Logistics Ltd";
const lastUpdated = "23 July 2026";

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

const fetchTermsAndConditions = async () => {
	const content = `## 1. Introduction

1.1 Welcome to MealGro, a video-first food discovery and delivery marketplace operated by MealGro Logistics Ltd ("**MealGro**," "**we**," "**us**," or "**our**"). MealGro allows Customers to discover restaurants, home kitchens, grocery stores, supermarkets, and other food vendors through short-form videos, images, livestreams, and AI-powered recommendations, and to place orders for delivery or pickup.

1.2 MealGro operates a technology platform. We connect Customers with independent Vendors and independent delivery Riders. We do not prepare, cook, sell, or own any food or grocery item listed on the Platform, and we do not employ Riders as staff unless a separate written employment agreement expressly states otherwise.

1.3 This document (the "**Terms**") governs your access to and use of the MealGro website, mobile applications, APIs, and related services (collectively, the "**Platform**"), whether you are a Customer, Vendor, Rider, business partner, advertiser, influencer, affiliate, or a visitor.

1.4 Please read these Terms carefully. They contain important information about your legal rights, remedies, and obligations, including limitations of liability and an arbitration clause.

## 2. Acceptance of Terms

2.1 By creating an account, downloading the app, browsing the Platform, or placing an order, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.

2.2 If you do not agree to these Terms, you must not access or use the Platform.

2.3 If you are using the Platform on behalf of a business (for example, as a Vendor or advertiser), you represent that you have authority to bind that business to these Terms, and "you" refers to both you and that business.

2.4 Separate supplemental terms may apply to specific features (for example, Vendor Terms, Rider Terms, or Advertising Terms). Where a conflict exists, the supplemental terms govern for that specific feature, and these Terms govern everything else.

## 3. Definitions

3.1 **"Customer"** means any individual who uses the Platform to browse, discover, or order food, groceries, or related products.

3.2 **"Vendor"** means any restaurant, home kitchen, grocery store, supermarket, or food business listed on the Platform.

3.3 **"Rider"** means any independent delivery partner who fulfils delivery orders through the Platform.

3.4 **"Content"** means any video, image, livestream, text, comment, rating, or review uploaded to the Platform by any User.

3.5 **"User"** means any Customer, Vendor, Rider, advertiser, influencer, affiliate, or other registered user of the Platform.

3.6 **"Order"** means a request placed by a Customer through the Platform for the purchase of food, groceries, or related items from a Vendor.

3.7 **"Platform"** means the MealGro website, mobile applications (iOS and Android), APIs, and all related services.

3.8 **"Wallet"** means the in-app stored value account made available to Users for payments, refunds, and cashback.

3.9 **"NDPA"** means the Nigeria Data Protection Act 2023.

## 4. Eligibility

4.1 You must be at least 18 years old, or the age of legal majority in your jurisdiction, to create an account and transact on the Platform. Minors may only use the Platform under the supervision of a parent or legal guardian who accepts these Terms on their behalf.

4.2 You must be able to form legally binding contracts under Nigerian law or the law of your jurisdiction.

4.3 You must provide accurate, current, and complete registration information and keep it up to date.

4.4 We may refuse to register, or may suspend or terminate, any User who does not meet these eligibility requirements or who we reasonably believe has provided false information.

## 5. Scope of Services

5.1 MealGro provides a technology platform that enables:

- Vendors to list, market, and sell food and grocery items through video, image, and text listings;
- Customers to discover, order, and pay for those items;
- Riders to accept and fulfil delivery requests; and
- advertisers, influencers, and affiliates to promote Vendors and products on the Platform.

5.2 MealGro is not a restaurant, grocery store, food preparer, or seller of food. MealGro is not a common carrier or logistics company; Riders are independent contractors or independent partners of third-party logistics providers, not employees or agents of MealGro, except where a separate written agreement states otherwise.

5.3 We may add, modify, suspend, or discontinue any feature of the Platform at any time, with or without notice, provided that any material adverse change to core Customer, Vendor, or Rider functionality will be communicated in advance where reasonably practicable.

## 6. User Accounts

6.1 You are responsible for maintaining the confidentiality of your login credentials, including any password, PIN, or one-time password (OTP) associated with your account.

6.2 You are responsible for all activity that occurs under your account, whether or not you authorised it, except to the extent caused by our proven negligence or a security failure attributable to us.

6.3 You must notify us immediately at the contact details in Section 54 if you suspect unauthorised access to your account.

6.4 You may not create more than one account per identity, transfer your account to another person, or allow another person to use your account credentials.

6.5 We may request identity verification (including government-issued identification, business registration documents, or bank verification details) before allowing certain transactions, and may decline service where verification cannot be reasonably completed.

## 7. Customer Responsibilities

7.1 You must provide an accurate delivery address, working contact number, and any access details (such as gate codes) reasonably necessary for delivery.

7.2 You are responsible for disclosing known allergies or dietary restrictions to the Vendor at the point of ordering; MealGro relays this information but does not verify or guarantee its accuracy or the Vendor's compliance with it.

7.3 You must be available to receive the Order at the delivery address within a reasonable window of the estimated delivery time, or make reasonable alternative arrangements with the Rider.

7.4 You must treat Riders and Vendor staff with courtesy and must not engage in abusive, threatening, or discriminatory conduct.

7.5 You are responsible for inspecting your Order upon receipt and for promptly reporting any issue in accordance with Section 16 (Refund Policy).

## 8. Vendor Responsibilities

8.1 Vendors are solely responsible for the preparation, quality, safety, hygiene, packaging, and accuracy of the food and grocery items they list and sell.

8.2 Vendors must hold and maintain all licences, permits, and regulatory approvals required to lawfully prepare and sell food or groceries in their jurisdiction, including applicable health and food safety certifications, and must provide evidence of these on request.

8.3 Vendors must accurately describe menu items, ingredients, allergens, and pricing, and must keep listings up to date, including marking items unavailable when out of stock.

8.4 Vendors must prepare accepted Orders within the timeframes communicated on the Platform and must package food appropriately for transport.

8.5 Vendors are responsible for the accuracy of any video, image, or promotional Content they upload, and must not misrepresent the food shown.

8.6 Vendors must comply with all applicable consumer protection, food safety, tax, and labour laws in their jurisdiction. MealGro's provision of the Platform does not constitute an endorsement or verification of a Vendor's compliance.

8.7 Vendors authorise MealGro to collect payment on their behalf from Customers and to remit the applicable Vendor proceeds, less MealGro's commission and any applicable fees, in accordance with the payout schedule set out in the Vendor dashboard.

## 9. Rider Responsibilities

9.1 Riders must hold a valid means of transportation, applicable licences (including a valid driver's or rider's licence where required), and any permits required by law to perform deliveries.

9.2 Riders must handle food and grocery items with reasonable care, maintain food packaging integrity during transit, and follow any temperature-sensitive handling instructions provided.

9.3 Riders must accurately report their location through the Platform's GPS tracking features while an active delivery is in progress.

9.4 Riders must treat Customers and Vendor staff with courtesy and must not engage in abusive, threatening, fraudulent, or discriminatory conduct.

9.5 Riders acknowledge that they operate as independent contractors, or as partners of a third-party logistics provider, and are solely responsible for their own tax obligations, insurance, and compliance with applicable transport and labour regulations, unless a separate written agreement with MealGro states otherwise.

9.6 Riders must not subcontract or permit another person to fulfil deliveries under their account without MealGro's prior written consent.

## 10. Orders

10.1 An Order is a binding offer by the Customer to purchase the listed items, which is accepted when the Vendor confirms the Order through the Platform.

10.2 MealGro transmits Orders to Vendors on the Customer's behalf and facilitates payment collection but is not a party to the underlying contract of sale between the Customer and the Vendor.

10.3 Vendors may decline or partially fulfil an Order due to stock unavailability, operational capacity, or other reasonable grounds, in which case Section 16 (Refund Policy) applies to any amount paid for unfulfilled items.

10.4 Order details (items, quantities, special instructions, and delivery address) are the Customer's responsibility to review and confirm before submission.

## 11. Delivery

11.1 Estimated delivery times shown on the Platform are estimates only and are affected by factors including traffic, weather, Vendor preparation time, and Rider availability. They do not constitute a guaranteed delivery time.

11.2 Riders will make reasonable attempts to contact the Customer at the delivery address. If a Customer cannot be reached or is unavailable to receive the Order within a reasonable period, the Order may be deemed undeliverable, and Section 17 (Cancellation Policy) will apply.

11.3 Live GPS tracking is provided for convenience and is subject to network availability, device accuracy, and connectivity limitations.

11.4 Risk in the food or grocery items passes to the Customer upon delivery to the address (or handover to the Customer, if earlier).

## 12. Pickup Orders

12.1 Customers may elect to place an Order for self-pickup directly from the Vendor's premises in lieu of delivery.

12.2 The Vendor is responsible for preparing pickup Orders within the estimated time shown, and the Customer is responsible for collecting the Order within a reasonable window of that time.

12.3 MealGro's role in a pickup Order is limited to facilitating the listing, ordering, and payment process; the Vendor is solely responsible for the handover.

## 13. Pricing

13.1 Prices displayed on the Platform for food and grocery items are set by the relevant Vendor and may differ from prices charged at the Vendor's physical premises.

13.2 MealGro may charge Customers a delivery fee, service fee, small-order fee, or other platform fee, each of which will be disclosed before checkout.

13.3 Prices, fees, and applicable charges may change from time to time; the price shown at the time an Order is placed is the price that applies to that Order.

13.4 MealGro is not responsible for pricing errors caused solely by a Vendor's listing mistakes, but will work in good faith with the Vendor and Customer to resolve any resulting dispute.

## 14. Taxes

14.1 Vendors are solely responsible for determining, collecting, remitting, and reporting any value added tax (VAT), consumption tax, or other applicable tax on the sale of their food and grocery items, in accordance with Nigerian tax law and any other applicable jurisdiction's tax law.

14.2 MealGro may, where required by applicable law, collect and remit specific taxes on behalf of Vendors or display tax-inclusive pricing, and will disclose this on the Platform where applicable.

14.3 Riders and Vendors are responsible for their own personal or corporate income tax obligations arising from amounts earned through the Platform.

## 15. Payment Processing

15.1 Payments made through the Platform are processed by licensed third-party payment service providers. MealGro does not store full card numbers, card verification values (CVV), or complete bank account credentials.

15.2 By submitting payment information, you authorise MealGro and its payment processors to charge the applicable payment method for the total Order amount, including applicable fees and taxes.

15.3 Failed, delayed, or reversed payments may result in an Order being cancelled or your account being temporarily restricted pending resolution.

15.4 MealGro is not liable for losses arising from a payment processor's system error, outage, or security incident, save to the extent caused by MealGro's own proven negligence in selecting or overseeing that processor.

## 16. Refund Policy

16.1 Customers may request a refund through the Platform for issues including missing items, incorrect items, food safety concerns, or an Order that was not delivered.

16.2 Refund requests must be submitted within a reasonable period after delivery, generally within 24 hours, together with any evidence reasonably requested (for example, photographs).

16.3 Refunds may be issued in full, in part, as a Wallet credit, or reversed to the original payment method, at MealGro's reasonable discretion, having regard to the nature of the issue and the evidence provided.

16.4 MealGro may recover the cost of a valid refund from the responsible Vendor or Rider in accordance with the applicable Vendor or Rider agreement.

16.5 Refunds are not guaranteed for issues arising from a Customer's own error (for example, providing an incorrect delivery address) or from subjective dissatisfaction with taste or portion size where the item matches the listing.

## 17. Cancellation Policy

17.1 Customers may cancel an Order before the Vendor begins preparation, generally without charge. Cancellations after preparation has begun may incur a partial or full charge to cover the Vendor's cost.

17.2 Vendors may cancel an Order due to stock unavailability or operational constraints; the Customer will receive a full refund for cancelled items in accordance with Section 16.

17.3 MealGro may cancel an Order where fraud, abuse, safety concerns, or a Platform error is suspected, and will provide an appropriate refund where the Customer was not at fault.

17.4 Repeated cancellations by a Customer, Vendor, or Rider without reasonable cause may result in restrictions on the responsible party's account.

## 18. Wallet Terms

18.1 The Wallet is a stored-value account within the Platform that may be funded through top-ups, refunds, cashback, or promotional credits.

18.2 Wallet balances are not bank deposits, do not earn interest, and are not insured by any deposit insurance scheme.

18.3 Wallet balances may only be used to pay for Orders and applicable fees on the Platform and, unless required by law or expressly stated otherwise, are non-transferable and non-withdrawable to a bank account.

18.4 MealGro may place reasonable limits on Wallet top-up amounts and balances to comply with anti-money laundering obligations and payment processor requirements.

18.5 Unused promotional Wallet credit may expire in accordance with the terms disclosed at the time it was issued.

## 19. Promotional Codes

19.1 Promotional and discount codes are subject to the specific terms disclosed at the time of issuance, including minimum order value, applicable Vendors, expiry date, and usage limits.

19.2 MealGro may cancel or withhold the benefit of a promotional code where it detects fraud, abuse, code-sharing outside the intended audience, or a technical error in the code's configuration.

19.3 Promotional codes have no cash value and cannot be exchanged for cash, combined with other offers unless expressly stated, or applied retroactively to a completed Order.

## 20. Loyalty Rewards

20.1 MealGro may operate a loyalty rewards programme under which Customers earn points or benefits for qualifying activity on the Platform.

20.2 Loyalty points have no cash value, are non-transferable, and may expire after a period of inactivity as disclosed in the programme terms.

20.3 MealGro may modify, suspend, or discontinue the loyalty rewards programme at any time, provided that points already earned and not yet expired will be honoured for redemption for a reasonable wind-down period following any discontinuation, except where discontinuation is required by law or by a change in a third-party partner's programme.

## 21. Referral Program

21.1 Users may refer new Customers, Vendors, or Riders to the Platform using a unique referral code, and may earn Wallet credit, discounts, or other rewards as disclosed in the referral programme terms in effect at the time.

21.2 Referral rewards are only payable where the referred person completes the qualifying action (for example, their first Order) and where no fraud, self-referral, or circumvention of the intended referral mechanism is detected.

21.3 MealGro may adjust referral reward amounts, close a referral programme to new participants, or reverse rewards obtained through fraudulent means.

## 22. Video Content

22.1 The Platform allows Vendors and Users to upload short-form videos, images, and livestreams (once available) showcasing food, meals, and the Vendor's premises.

22.2 Video Content must accurately represent the food or product being promoted and must not be materially misleading as to appearance, ingredients, portion size, or price.

22.3 MealGro may use automated moderation tools and human review to screen Video Content for compliance with these Terms and applicable law, but does not guarantee that all Video Content is reviewed before publication.

22.4 MealGro may feature, promote, resize, add captions to, or otherwise adapt Video Content for display across the Platform and its marketing channels, subject to Section 23 (User Generated Content).

## 23. User Generated Content

23.1 By uploading any video, image, comment, review, or other Content to the Platform, you grant MealGro a worldwide, royalty-free, non-exclusive, sublicensable licence to host, store, reproduce, display, distribute, and adapt that Content for the purpose of operating, promoting, and improving the Platform.

23.2 You retain ownership of your Content. You represent that you own or have the necessary rights to the Content you upload and that it does not infringe any third party's intellectual property, privacy, or other rights.

23.3 MealGro may remove or restrict access to any Content that violates these Terms, our Community Guidelines, or applicable law, without prior notice where urgent action is warranted.

23.4 MealGro is not obliged to monitor all Content but may do so, and disclaims liability for Content posted by Users to the fullest extent permitted by law.

## 24. Vendor Generated Content

24.1 Vendors are solely responsible for the accuracy and lawfulness of menu listings, prices, images, and videos they upload, including compliance with advertising standards and consumer protection law.

24.2 Vendor Content must not contain misleading health or nutritional claims, counterfeit branding, or content that infringes another party's trademarks or copyright.

24.3 MealGro may request supporting evidence (such as ingredient lists or certifications) for claims made in Vendor Content and may remove Content that cannot be substantiated.

## 25. Reviews & Ratings

25.1 Customers may submit reviews and ratings of Vendors, Riders, and specific Orders based on their genuine experience.

25.2 Reviews must not contain false statements of fact, defamatory content, hate speech, or content unrelated to the actual transaction.

25.3 Vendors and Riders may not submit, solicit, or incentivise fake reviews, including reviews from accounts with no genuine transaction history, and may not offer payment, discounts, or other inducements in exchange for positive reviews.

25.4 MealGro may remove reviews that violate these Terms and may display an average rating calculated from genuine, verified reviews.

## 26. Community Guidelines

26.1 All Users must interact respectfully on the Platform. The following are prohibited in any Content, comment, review, message, or livestream:

- hate speech, harassment, or discriminatory content based on ethnicity, religion, gender, disability, or other protected characteristic;
- graphic violence, sexually explicit content, or content endangering minors;
- content promoting illegal activity, counterfeit goods, or dangerous products;
- spam, deceptive links, or content designed to defraud other Users; and
- impersonation of another person, Vendor, or brand.

26.2 MealGro may remove violating Content, issue warnings, and suspend or terminate accounts of repeat or severe offenders, in accordance with Section 43 (Suspension & Termination).

26.3 Users may report Content or conduct that they believe violates these Community Guidelines through the in-app reporting tool.

## 27. AI Features

27.1 The Platform uses artificial intelligence and machine learning to power features including personalised food recommendations, AI-powered search, AI-generated food suggestions, and content ranking in the video feed.

27.2 AI features are based on your activity on the Platform, aggregated ordering trends, and Vendor listing data, and are intended to improve discovery and convenience.

27.3 You may adjust certain personalisation settings through your account preferences, where such controls are made available on the Platform.

## 28. Artificial Intelligence Disclaimer

28.1 AI-generated recommendations, search results, and suggestions are provided for convenience only and do not constitute dietary, medical, nutritional, or professional advice.

28.2 MealGro does not guarantee the accuracy, completeness, or suitability of any AI-generated output, including AI-suggested pairings, portion estimates, or nutritional summaries, and Users should independently verify information critical to health or safety, such as allergen content, directly with the Vendor.

28.3 AI features may occasionally produce incorrect, incomplete, or unexpected results. MealGro will act to correct systemic errors identified in AI outputs but is not liable for decisions made solely in reliance on an AI-generated suggestion, save to the extent caused by MealGro's own negligence.

## 29. Intellectual Property

29.1 The Platform, including its software, design, trademarks, logos, "MealGro" branding, and underlying technology, is owned by or licensed to MealGro Logistics Ltd and is protected by intellectual property laws.

29.2 You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform for its intended purpose. No other rights are granted.

29.3 You may not copy, modify, reverse engineer, decompile, or create derivative works of the Platform's software, except to the extent such restriction is prohibited by applicable law.

29.4 All trademarks, service marks, and trade names displayed on the Platform belong to their respective owners.

## 30. Copyright Policy

30.1 MealGro respects the intellectual property rights of others and expects Users to do the same.

30.2 If you believe Content on the Platform infringes your copyright, you may submit a takedown notice to the contact address in Section 54, including: identification of the copyrighted work, identification of the allegedly infringing Content, your contact details, and a statement of good-faith belief that the use is unauthorised.

30.3 MealGro will review valid takedown notices and may remove or disable access to allegedly infringing Content, and will notify the User who posted it where reasonably practicable.

30.4 Users who repeatedly infringe third-party copyright may have their accounts suspended or terminated.

## 31. AI Generated Audio & Sound

31.1 MealGro uses commercially licensed audio on the Platform, which may include AI-generated music, AI-generated notification sounds, AI-generated voiceovers, copyright-free sounds, royalty-free music, and content from licensed sound libraries.

31.2 All such audio is either owned by MealGro, generated under a licence permitting commercial platform use, or licensed from a third-party sound library with appropriate rights.

31.3 Users may not extract, copy, redistribute, resell, or independently commercially exploit any audio, music, voiceover, or sound made available through the Platform.

31.4 MealGro is not liable for a User's independent use of third-party audio uploaded within User-Generated Content, which remains the responsibility of the uploading User under Section 23.

## 32. Camera Permission

32.1 The Platform may request access to your device camera to enable features such as uploading videos and images, scanning QR codes, and verifying identity documents.

32.2 Camera access is only used when you actively engage a feature requiring it, and you may withdraw camera permission at any time through your device settings, though this may disable related features.

32.3 MealGro does not access your camera in the background without your knowledge and consent.

## 33. Microphone Permission

33.1 The Platform may request access to your device microphone to enable features such as recording video with audio, voice search, or customer support voice notes.

33.2 Microphone access is only used when you actively engage a feature requiring it, and you may withdraw microphone permission at any time through your device settings, though this may disable related features.

## 34. Location Permission

34.1 The Platform requests access to your device location to show nearby Vendors, calculate delivery distances and fees, and enable live GPS tracking of Orders in progress.

34.2 Riders' location is shared with the relevant Customer and Vendor only for the duration of an active delivery, for the purpose of that delivery.

34.3 You may disable location permissions through your device settings; doing so may limit or disable core ordering and delivery-tracking features.

34.4 Location data is processed in accordance with our Privacy Policy and applicable data protection law, including the NDPA.

## 35. Push Notifications

35.1 The Platform may send push notifications, SMS messages, and marketing emails relating to Order status, promotions, account activity, and Platform updates.

35.2 You may opt out of marketing push notifications, SMS, and email communications at any time through your account settings or the unsubscribe mechanism provided, while continuing to receive essential transactional notifications (such as Order status updates) necessary for the Platform to function.

## 36. Third Party Services

36.1 The Platform integrates third-party services, including payment processors, mapping and geolocation providers, cloud infrastructure providers, SMS gateways, and analytics providers.

36.2 Your use of any third-party service accessed through the Platform is also subject to that third party's own terms and privacy policy. MealGro is not responsible for the acts or omissions of independent third-party service providers, save to the extent caused by MealGro's own negligence in selecting or overseeing them.

36.3 The Platform may contain links to third-party websites or applications. MealGro does not endorse and is not responsible for the content or practices of any linked third-party site.

## 37. Restaurant Disclaimer

37.1 MealGro is a technology platform only. MealGro is NOT responsible for:

- the quality, taste, or nutritional value of food or grocery items;
- the accuracy of ingredient lists or allergen disclosures;
- allergic reactions, foodborne illness, or other health consequences arising from consumption of a Vendor's food;
- the hygiene standards or food safety practices of any Vendor's kitchen or premises; or
- the conduct of any Vendor or its staff.

37.2 These responsibilities belong solely to the Vendor. Customers with known allergies or medical dietary requirements should contact the Vendor directly before ordering and exercise their own judgment.

37.3 MealGro will provide Vendor contact details and take reasonable steps to relay complaints to Vendors, and may suspend Vendors found to have committed serious or repeated food safety violations, but does not independently inspect or certify Vendor premises unless expressly stated on the Vendor's profile.

## 38. Delivery Disclaimer

38.1 MealGro is not responsible for delays, damage, spillage, temperature loss, or other issues arising during delivery caused by traffic conditions, weather, road conditions, or Rider error, except to the extent caused by MealGro's own negligence in the design or operation of the Platform's delivery-matching systems.

38.2 Where a Rider is responsible for damage or loss during delivery, the Customer's remedy is a refund or replacement in accordance with Section 16, and MealGro will pursue recovery from the responsible Rider in accordance with the applicable Rider agreement.

38.3 MealGro is not liable for the acts of a Rider that fall outside the scope of the delivery task assigned through the Platform.

## 39. Platform Availability

39.1 MealGro will use reasonable efforts to keep the Platform available but does not guarantee uninterrupted, error-free, or continuous access.

39.2 The Platform may be unavailable from time to time due to scheduled maintenance, technical failure, third-party service outages, or circumstances beyond MealGro's reasonable control.

39.3 MealGro is not liable for losses arising from Platform downtime, except to the extent caused by MealGro's own negligence, and subject always to Section 40 (Limitation of Liability).

## 40. Limitation of Liability

40.1 To the fullest extent permitted by applicable law, MealGro's total aggregate liability to you for any claim arising out of or relating to these Terms or the Platform shall not exceed the greater of (a) the total fees paid by you to MealGro (excluding amounts passed through to Vendors and Riders) in the three months preceding the claim, or (b) ₦50,000 (fifty thousand Naira).

40.2 MealGro shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profit, loss of data, or loss of goodwill, arising from your use of the Platform.

40.3 Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law, including liability for death or personal injury caused by proven negligence, fraud, or wilful misconduct.

40.4 The limitations in this Section apply to the fullest extent permitted by law, whether the claim arises in contract, tort (including negligence), strict liability, or otherwise.

## 41. Indemnification

41.1 You agree to indemnify and hold harmless MealGro, its directors, officers, employees, and agents from and against any claims, losses, liabilities, damages, and expenses (including reasonable legal fees) arising out of:

- your breach of these Terms;
- your Content or its infringement of a third party's rights;
- your violation of applicable law; or
- your negligent or wrongful conduct in connection with the Platform, including, for Vendors, claims relating to food safety, and for Riders, claims relating to delivery conduct.

41.2 This indemnity does not apply to the extent a claim arises from MealGro's own negligence, wilful misconduct, or breach of these Terms.

## 42. Prohibited Activities

42.1 You must not engage in, attempt, or facilitate any of the following:

- posting or soliciting fake reviews or ratings;
- creating fake or duplicate accounts;
- scraping, crawling, or extracting Platform data using automated means without prior written consent;
- using bots, scripts, or automated tools to place Orders, manipulate rankings, or interact with the Platform;
- reverse engineering, decompiling, or attempting to derive the source code of the Platform;
- sending spam or unsolicited commercial messages through the Platform;
- engaging in fraud, including payment fraud, promo abuse, or falsely disputing legitimate charges;
- money laundering or using the Platform's Wallet or payment features to disguise the origin of funds;
- harassment, threats, or hate speech directed at other Users;
- listing, advertising, or selling illegal or counterfeit products; and
- infringing the intellectual property rights of MealGro or any third party.

42.2 Violation of this Section may result in immediate suspension or termination under Section 43, reporting to relevant authorities, and legal action.

## 43. Suspension & Termination

43.1 MealGro may suspend or terminate your account, with or without prior notice, if you breach these Terms, engage in prohibited activity under Section 42, pose a risk to other Users or the Platform, or if required by law or a competent authority.

43.2 You may deactivate or delete your account at any time through account settings or by contacting us, subject to settlement of any outstanding Order, payment, or payout obligations.

43.3 Upon termination, your licence to use the Platform ends immediately, but provisions that by their nature should survive (including Sections 29 to 31, 40, 41, and 49 to 51) will continue to apply.

43.4 Where reasonably practicable, MealGro will provide the reason for suspension or termination and an opportunity to appeal through the contact details in Section 54, except where doing so would compromise an investigation or violate applicable law.

## 44. Privacy

44.1 Our collection, use, storage, and disclosure of personal data is governed by our separate Privacy Policy, which forms part of these Terms by reference and is available on the Platform.

44.2 By using the Platform, you consent to the processing of your personal data as described in the Privacy Policy.

## 45. Data Protection

45.1 MealGro processes personal data in accordance with the NDPA, and, where applicable to Users outside Nigeria, in a manner consistent with GDPR principles including lawfulness, purpose limitation, data minimisation, and accountability.

45.2 MealGro acts as a data controller for account and Order data, and may act as a data processor for certain data processed strictly on behalf of Vendors (for example, Order fulfilment data shared for a specific transaction).

45.3 You have rights under the NDPA, including the right to access, correct, and request deletion of your personal data, and the right to object to certain processing, subject to applicable legal exceptions. Requests may be made through the contact details in Section 54.

45.4 MealGro will not sell personal data to third parties and will only share personal data with third parties as described in the Privacy Policy or as required by law.

45.5 Where MealGro transfers personal data outside Nigeria, it will do so using safeguards consistent with the NDPA and applicable international data transfer principles.

## 46. Cookies

46.1 The Platform's website uses cookies and similar tracking technologies to enable core functionality, remember preferences, and analyse usage.

46.2 You may manage cookie preferences through your browser settings or any cookie consent tool provided on our website. Disabling certain cookies may affect Platform functionality.

46.3 Further detail on the categories of cookies used and their purposes is set out in our Privacy Policy or a separate Cookie Policy where applicable.

## 47. Security

47.1 MealGro implements reasonable administrative, technical, and physical safeguards designed to protect personal data and payment information against unauthorised access, loss, or misuse, consistent with the security requirements of the NDPA.

47.2 No system is completely secure. While MealGro takes reasonable steps to protect the Platform, it cannot guarantee absolute security, and you are responsible for safeguarding your own account credentials in accordance with Section 6.

47.3 In the event of a data breach affecting your personal data, MealGro will notify affected Users and the relevant regulator in accordance with the timelines and requirements of the NDPA.

## 48. Force Majeure

48.1 MealGro shall not be liable for any failure or delay in performing its obligations under these Terms where such failure or delay results from circumstances beyond its reasonable control, including natural disasters, fire, flood, pandemic, war, civil unrest, strikes, governmental action, internet or telecommunications failures, or failures of third-party payment or logistics providers.

48.2 MealGro will use reasonable efforts to notify affected Users and resume performance as soon as reasonably practicable once the force majeure event ends.

## 49. Governing Law

49.1 These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict of law principles.

## 50. Arbitration

50.1 Any dispute arising out of or in connection with these Terms, including any question regarding its existence, validity, or termination, that cannot be resolved through the informal process in Section 51 shall be referred to and finally resolved by arbitration in accordance with the Arbitration and Mediation Act 2023 of Nigeria.

50.2 The arbitration shall be conducted by a single arbitrator appointed by mutual agreement of the parties, or, failing agreement within 30 days, appointed in accordance with the rules of the Chartered Institute of Arbitrators (UK), Nigeria Branch.

50.3 The seat of arbitration shall be Lagos, Nigeria, and the language of arbitration shall be English.

50.4 Nothing in this Section prevents either party from seeking urgent injunctive relief from a court of competent jurisdiction.

## 51. Dispute Resolution

51.1 Before initiating arbitration, you agree to first contact MealGro through the details in Section 54 and attempt in good faith to resolve the dispute informally within 30 days.

51.2 Disputes between a Customer, Vendor, or Rider that do not involve MealGro as a party (for example, a food quality complaint against a Vendor) should first be raised through the in-app support or complaint tools, which MealGro will facilitate but is not obliged to adjudicate as a binding arbiter.

## 52. Electronic Communications

52.1 You consent to receive communications from MealGro electronically, including by email, SMS, push notification, and in-app messaging, and agree that such electronic communications satisfy any legal requirement that communications be in writing.

52.2 Electronic records of Orders, payments, and communications maintained by MealGro shall be admissible as evidence of the transactions they record, to the extent permitted by the Evidence Act and other applicable Nigerian law on electronic transactions.

## 53. Changes to Terms

53.1 MealGro may amend these Terms from time to time to reflect changes in the Platform, applicable law, or our business practices.

53.2 Material changes will be notified through the Platform, by email, or by push notification at least 7 days before they take effect, except where an immediate change is required by law or to address a security or fraud risk.

53.3 Continued use of the Platform after the effective date of an amendment constitutes acceptance of the amended Terms. If you do not agree to an amendment, you must stop using the Platform before it takes effect.

## 54. Contact Information

54.1 For questions about these Terms, to submit a copyright takedown notice, to exercise your data protection rights, or for any other query, please contact:

**MealGro Logistics Ltd**
Email: info@mealgro.com
Data Protection Officer: supportc@mealgro.com
Customer Support: support@mealgro.com

54.2 We aim to acknowledge all written enquiries within 5 business days.

---

*These Terms and Conditions were last updated on 23 July 2026 and are available on the MealGro website and mobile application in accordance with Section 53.*`;

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
	fetchTermsAndConditions();
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleEscape);
	window.removeEventListener("scroll", handleScroll);
	sectionObserver?.disconnect();
});
</script>

<style scoped>
.terms-page {
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
	transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
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
	transition: transform 0.15s ease, opacity 0.15s ease;
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
.terms-page .markdown-content {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 400;
	font-size: clamp(16px, 1.6vw, 18px);
	line-height: 1.75;
	color: var(--ink, #17130f);
	max-width: 74ch;
	margin: 0 auto;
}

.terms-page .markdown-content p {
	margin: 0 0 clamp(18px, 2.5vw, 22px);
	color: var(--ink-soft, rgba(23, 19, 15, 0.64));
}

.terms-page .markdown-content h2 {
	display: grid;
	grid-template-columns: auto 1fr;
	align-items: baseline;
	column-gap: clamp(12px, 2vw, 20px);
	margin: clamp(40px, 6vw, 64px) 0 clamp(18px, 2.5vw, 24px);
	scroll-margin-top: 24px;
}

.terms-page .markdown-content h2:first-child {
	margin-top: 0;
}

.terms-page .markdown-content .chip {
	font-family: "MADE Tommy Soft Outline", "MADE Tommy Soft", sans-serif;
	font-weight: 800;
	font-size: clamp(34px, 5vw, 56px);
	line-height: 1;
	color: var(--brand-red, #d62300);
	-webkit-text-stroke: 0.5px var(--brand-red, #d62300);
}

.terms-page .markdown-content .chip-title {
	font-family: "MADE Tommy Soft", sans-serif;
	font-weight: 700;
	font-size: clamp(20px, 2.6vw, 28px);
	line-height: 1.3;
	letter-spacing: -0.01em;
	color: var(--ink, #17130f);
}

.terms-page .markdown-content .clause-num {
	font-family: ui-monospace, "SF Mono", "SFMono-Regular", Menlo, Consolas,
		monospace;
	font-size: 0.78em;
	font-weight: 600;
	color: var(--brand-red, #d62300);
	white-space: nowrap;
}

.terms-page .markdown-content a {
	color: var(--brand-red, #d62300);
	text-decoration: underline;
	text-underline-offset: 2px;
	transition: opacity 0.2s;
}

.terms-page .markdown-content a:hover {
	opacity: 0.75;
}

.terms-page .markdown-content strong {
	color: var(--ink, #17130f);
	font-weight: 700;
}

.terms-page .markdown-content em {
	color: var(--ink-soft, rgba(23, 19, 15, 0.64));
}

.terms-page .markdown-content hr {
	border: none;
	border-top: 2px solid var(--brand-red, #d62300);
	width: 64px;
	margin: clamp(40px, 6vw, 56px) auto;
	opacity: 0.4;
}

.terms-page .markdown-content > p:last-of-type {
	text-align: center;
	font-size: 0.85em;
}

.terms-page .markdown-content ul,
.terms-page .markdown-content ol {
	margin: 0 0 clamp(18px, 2.5vw, 22px);
	padding-left: clamp(20px, 3vw, 28px);
	color: var(--ink-soft, rgba(23, 19, 15, 0.64));
	list-style: none;
}

.terms-page .markdown-content li {
	position: relative;
	margin-bottom: 10px;
	line-height: 1.7;
	padding-left: 1.1em;
}

.terms-page .markdown-content li::before {
	content: "";
	position: absolute;
	left: 0;
	top: 0.65em;
	width: 6px;
	height: 6px;
	border-radius: 2px;
	background: var(--brand-red, #d62300);
}

.terms-page .markdown-content code {
	background: var(--brand-red-soft, rgba(214, 35, 0, 0.08));
	padding: 2px 6px;
	border-radius: 4px;
	font-family: ui-monospace, monospace;
	font-size: 0.9em;
}

.terms-page .markdown-content .contact-card {
	margin: clamp(24px, 4vw, 32px) 0;
	padding: clamp(20px, 3vw, 28px);
	background: var(--brand-red-soft, rgba(214, 35, 0, 0.08));
	border-left: 3px solid var(--brand-red, #d62300);
	border-radius: 12px;
}

.terms-page .markdown-content .contact-card p {
	margin: 0;
	color: var(--ink, #17130f);
	line-height: 1.8;
}

.terms-page .markdown-content .contact-card strong {
	font-size: 1.05em;
}
</style>

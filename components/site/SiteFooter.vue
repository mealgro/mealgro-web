<script setup lang="ts">
// The foot of every rebuilt marketing page: the download band (the target of
// every "Get the app" on the page), then the site's links.
import logoImage from "../../assets/logo.svg";
import FeedClip from "./FeedClip.vue";
import AppPhone from "./phone/AppPhone.vue";
import StoreButtons from "./StoreButtons.vue";
import { CUSTOMER_APP, RIDER_APP } from "../../lib/site/links";

const props = withDefaults(defineProps<{ app?: "customer" | "rider" }>(), { app: "customer" });
const isRider = props.app === "rider";
const year = new Date().getFullYear();

const columns = [
	{
		title: "Mealgro",
		links: [
			{ href: "/", label: "Order food" },
			{ href: "/about", label: "About us" },
			{ href: "/contact", label: "Contact" },
			{ href: "/status", label: "Service status" },
		],
	},
	{
		title: "Work with us",
		links: [
			{ href: "/vendors", label: "Sell on Mealgro" },
			{ href: "/account", label: "Vendor portal" },
			{ href: "/riders", label: "Ride with Mealgro" },
			{ href: "/affiliate", label: "Affiliate program" },
		],
	},
	{
		title: "Legal",
		links: [
			{ href: "/terms", label: "Terms of service" },
			{ href: "/privacy", label: "Privacy policy" },
			{ href: "/account-deletion", label: "Delete your account" },
		],
	},
];

const socials = [
	{ href: "https://www.instagram.com/trymealgro", label: "Instagram" },
	{ href: "https://x.com/mealgro", label: "X" },
	{ href: "https://www.facebook.com/share/14VPaxDJVbY/", label: "Facebook" },
	{ href: "https://www.linkedin.com/company/mealgro/", label: "LinkedIn" },
];
</script>

<template>
	<footer class="s-stage foot">
		<section id="get-app" class="s-wrap band" aria-labelledby="get-app-h">
			<div class="band-copy">
				<h2 id="get-app-h" class="s-h2">
					{{ isRider ? "Get the rider app" : "Get the app" }}
				</h2>
				<p class="s-lead s-muted">
					<template v-if="isRider">
						Sign up, verify your ID and go online from your phone. Requests near you show up
						as soon as you're on.
					</template>
					<template v-else>
						Scroll the kitchens that deliver to you and order straight from the video. One app
						for ordering, and for running your store when you sell.
					</template>
				</p>
				<StoreButtons
					:links="isRider ? RIDER_APP : CUSTOMER_APP"
					:app-name="isRider ? 'Mealgro Rider' : 'Mealgro'"
				/>
			</div>
			<div class="band-phone" aria-hidden="true">
				<div class="s-phone s-phone--rec">
					<div class="s-phone-screen">
						<FeedClip v-if="isRider" id="rider-app" />
						<AppPhone v-else />
					</div>
				</div>
			</div>
		</section>

		<div class="s-wrap cols">
			<div class="brand">
				<a href="/" aria-label="Mealgro home"><img :src="logoImage" alt="" width="88" height="64" /></a>
				<p class="s-muted">Food from kitchens near you, ordered from the video.</p>
			</div>
			<nav v-for="c in columns" :key="c.title" :aria-label="c.title">
				<h3>{{ c.title }}</h3>
				<ul>
					<li v-for="l in c.links" :key="l.href"><a :href="l.href">{{ l.label }}</a></li>
				</ul>
			</nav>
		</div>
		<div class="s-wrap legal">
			<p>© {{ year }} Mealgro</p>
			<ul aria-label="Mealgro on social media">
				<li v-for="s in socials" :key="s.href">
					<a :href="s.href" rel="noopener" target="_blank">{{ s.label }}</a>
				</li>
			</ul>
		</div>
	</footer>
</template>

<style scoped>
.foot {
	padding-top: clamp(64px, 9vw, 120px);
	padding-bottom: 32px;
	overflow: hidden;
}
.band {
	display: grid;
	grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
	align-items: center;
	gap: 48px;
	padding-bottom: clamp(56px, 8vw, 104px);
	border-bottom: 1px solid color-mix(in srgb, var(--on-stage) 14%, transparent);
}
.band-copy {
	display: grid;
	gap: 24px;
	justify-items: start;
}
.band-phone {
	display: flex;
	justify-content: center;
}
.band-phone .s-phone {
	--pw: 260px;
	transform: rotate(4deg);
}
.cols {
	display: grid;
	grid-template-columns: 1.4fr repeat(3, 1fr);
	gap: 32px;
	padding-top: 56px;
	padding-bottom: 40px;
}
.brand img {
	height: 52px;
	width: auto;
	filter: brightness(0) invert(1);
}
.brand p {
	margin-top: 14px;
	max-width: 28ch;
	font-size: 15px;
}
.cols h3 {
	font-size: 15px;
	letter-spacing: -0.01em;
	margin-bottom: 14px;
}
.cols li + li {
	margin-top: 8px;
}
.cols a,
.legal a {
	text-decoration: none;
	font-size: 15px;
	color: color-mix(in srgb, var(--on-stage) 80%, var(--stage));
}
.cols a:hover,
.legal a:hover {
	color: var(--on-stage);
	text-decoration: underline;
}
.legal {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 16px;
	padding-top: 24px;
	border-top: 1px solid color-mix(in srgb, var(--on-stage) 14%, transparent);
	font-size: 14px;
	color: color-mix(in srgb, var(--on-stage) 74%, var(--stage));
}
.legal ul {
	display: flex;
	flex-wrap: wrap;
	gap: 18px;
}
@media (max-width: 860px) {
	.band {
		grid-template-columns: minmax(0, 1fr);
	}
	.band-phone {
		display: none;
	}
	.cols {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.brand {
		grid-column: 1 / -1;
	}
}
</style>

import type { Config } from "vike/types";

// Mealgro Ads, the advertiser portal. Unlisted on purpose (ADS_SPEC.md §3):
// nothing on the site links here, every page is `noindex` (+Head.vue), and it
// isn't in public/sitemap.xml. It's an app like the affiliate area: rendered
// in the browser, behind a sign-in, and wrapped only by its own layout.
// `Layout` is cumulative by default (vike-vue), which would nest these pages
// in the marketing layout; non-cumulative makes the nearest +Layout win.
export default {
	title: "Mealgro Ads",
	description: "Advertise to Mealgro customers",
	ssr: false,
	meta: {
		Layout: {
			env: { server: true, client: true },
			cumulative: false,
		},
	},
} as Config;

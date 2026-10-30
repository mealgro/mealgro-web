import type { Config } from "vike/types";

// The signed-in affiliate area is an app, not a page of the marketing site:
// rendered in the browser, behind a sign-in, and wrapped only by its own
// shell. `Layout` is cumulative by default (vike-vue), which would nest these
// pages inside the marketing layout (navigation, logo, zoom lock). Redefining
// it as non-cumulative for this folder makes the nearest +Layout win, so the
// global pages/+Layout.vue does not wrap the affiliate area.
export default {
	title: "Mealgro Affiliate",
	description: "Your Mealgro affiliate account",
	ssr: false,
	meta: {
		Layout: {
			env: { server: true, client: true },
			cumulative: false,
		},
	},
} as Config;

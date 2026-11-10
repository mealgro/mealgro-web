// Where the marketing pages send people. One place, so a store link is changed
// once. An app with no store listing yet is `null`, and its button is not shown.

export type StoreLinks = { ios: string | null; android: string | null };

/** The customer app (it also holds vendor mode). Package id from mealgro-app. */
export const CUSTOMER_APP: StoreLinks = {
	ios: null,
	android: "https://play.google.com/store/apps/details?id=app.mealgro.mobile",
};

/** The rider app. Package id from mealgro-rider. */
export const RIDER_APP: StoreLinks = {
	ios: null,
	android: "https://play.google.com/store/apps/details?id=app.mealgro.rider",
};

/** The site's main links, used by the header and footer of the rebuilt pages. */
export const SITE_LINKS = [
	{ href: "/", label: "Order food" },
	{ href: "/vendors", label: "Vendors" },
	{ href: "/riders", label: "Riders" },
	{ href: "/affiliate", label: "Affiliates" },
	{ href: "/about", label: "About" },
];

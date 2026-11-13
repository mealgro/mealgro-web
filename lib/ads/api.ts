import { anonymous, api, upload } from "./http";
import type {
	AdFormat,
	Advertiser,
	AuthResponse,
	Campaign,
	CampaignForm,
	CampaignStats,
	Notice,
	Overview,
	Place,
	Pricing,
	Terms,
	TopUp,
	TopUpCheckout,
	Upload,
	Wallet,
} from "./types";

/** Public: no sign-in needed. */
export const publicApi = {
	terms: () => anonymous<Terms>("GET", "/ads/terms"),
};

export const auth = {
	/** Emails a code; the account is made once the code is verified. */
	register: (body: {
		full_name: string;
		business_name: string;
		email: string;
		phone: string;
		website?: string;
		terms_version: string;
	}) => anonymous<{ email: string }>("POST", "/ads/auth/register", body),
	/** Emails a code. Answers the same whether or not the email is known. */
	login: (email: string) => anonymous<{ email: string }>("POST", "/ads/auth/login", { email }),
	verify: (email: string, otp: string) => anonymous<AuthResponse>("POST", "/ads/auth/verify", { email, otp }),
	logout: () => api<null>("POST", "/ads/auth/logout"),
};

export const me = {
	get: () => api<Advertiser>("GET", "/ads/me"),
	/** A new business name sends submitted ads back to review. `website: ""` clears it. */
	update: (body: { full_name?: string; business_name?: string; website?: string }) =>
		api<Advertiser>("PATCH", "/ads/me", body),
	acceptTerms: (version: string) => api<Advertiser>("POST", "/ads/terms/accept", { version }),
	overview: () => api<Overview>("GET", "/ads/overview"),
	pricing: () => api<Pricing>("GET", "/ads/pricing"),
	notices: () => api<Notice[]>("GET", "/ads/notices"),
};

export const wallet = {
	get: () => api<Wallet>("GET", "/ads/wallet"),
	/** `amount` in minor units. Answers Paystack's checkout page. */
	topUp: (amount: number, callback_url: string) =>
		api<TopUpCheckout>("POST", "/ads/wallet/top-up", { amount, callback_url }),
	/** Asks Paystack for the charge's status by its reference; never starts a charge. */
	verifyTopUp: (reference: string) =>
		api<TopUp>("POST", `/ads/wallet/top-up/${encodeURIComponent(reference)}/verify`),
};

export const media = {
	/** Answers the id to send as the campaign's `media`. */
	upload(file: File, format: AdFormat, onProgress?: (p: number) => void) {
		const form = new FormData();
		form.append("format", format);
		form.append("file", file);
		return upload<Upload>("/ads/media", form, onProgress);
	},
};

export const campaigns = {
	list: () => api<Campaign[]>("GET", "/ads/campaigns"),
	get: (id: string) => api<Campaign>("GET", `/ads/campaigns/${id}`),
	create: (body: CampaignForm) => api<Campaign>("POST", "/ads/campaigns", body),
	update: (id: string, body: CampaignForm) => api<Campaign>("PATCH", `/ads/campaigns/${id}`, body),
	/** Drafts and rejected campaigns only. */
	remove: (id: string) => api<null>("DELETE", `/ads/campaigns/${id}`),
	/** Locks the price and holds the whole budget. */
	submit: (id: string) => api<Campaign>("POST", `/ads/campaigns/${id}/submit`),
	pause: (id: string) => api<Campaign>("POST", `/ads/campaigns/${id}/pause`),
	resume: (id: string) => api<Campaign>("POST", `/ads/campaigns/${id}/resume`),
	/** What it didn't spend goes back to the wallet. */
	end: (id: string) => api<Campaign>("POST", `/ads/campaigns/${id}/end`),
	/** `amount` in minor units, held at once. */
	addBudget: (id: string, amount: number) => api<Campaign>("POST", `/ads/campaigns/${id}/budget`, { amount }),
	stats: (id: string) => api<CampaignStats>("GET", `/ads/campaigns/${id}/stats`),
};

/** The country → state → city reference data (public). */
export const places = {
	countries: () => anonymous<Place[]>("GET", "/countries"),
	states: (country: string) => anonymous<Place[]>("GET", `/countries/${country}/states`),
	cities: (state: string) => anonymous<Place[]>("GET", `/states/${state}/cities`),
};

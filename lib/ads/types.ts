/** Shapes of the Mealgro Ads API (`/v1/ads/*`). Amounts in responses
 *  (AmountDto) are in major units (naira); amounts sent (a budget, a top-up)
 *  are in minor units (kobo). */

export type ApiError = { name: string; message: string };

export type Amount = { symbol: string; amount: number; currency: string };

export type TokenPair = { access_token: string; refresh_token: string };

export type AdvertiserStatus = "active" | "suspended" | "banned";

export type Advertiser = {
	id: string;
	full_name: string;
	/** Shown on every ad: "Sponsored · {business_name}". */
	business_name: string;
	email: string;
	phone: string;
	website: string | null;
	/** Set from the phone at sign-up; never changes. */
	currency: string;
	status: AdvertiserStatus;
	status_reason: string | null;
	terms_version: string;
	/** False when the terms changed since they last accepted. */
	terms_current: boolean;
	created_at: string;
};

export type AuthResponse = TokenPair & { advertiser: Advertiser };

export type Terms = {
	version: string;
	content: string;
	/** False while sign-ups are closed (existing advertisers can still sign in). */
	signup_open: boolean;
};

export type Pricing = {
	currency: string;
	/** Per 1,000 impressions. */
	feed_cpm: Amount;
	banner_cpm: Amount;
	min_budget: Amount;
	min_daily_budget: Amount;
	top_up_min: Amount;
	top_up_max: Amount;
	/** An admin set this account's own price. */
	custom_price: boolean;
};

export type WalletLine = {
	kind: "top-up" | "spend" | "adjustment";
	title: string;
	amount: Amount;
	incoming: boolean;
	/** Top-ups: pending, paid, failed. */
	status: string | null;
	reference: string | null;
	at: string;
};

/** A top-up bonus running now, as it applies to this advertiser. Admins
 *  switch it on and off. */
export type BonusOffer = {
	/** 100 doubles a top-up. */
	percent: number;
	/** The most bonus one top-up earns. */
	cap: Amount;
	first_top_up_only: boolean;
	ends_at: string | null;
	/** False when it's a first-top-up offer and they've topped up before. */
	eligible: boolean;
};

export type Wallet = {
	currency: string;
	available: Amount;
	/** Held against submitted campaigns. */
	reserved: Amount;
	frozen: boolean;
	/** Always shown before a top-up. */
	notice: string;
	/** The top-up bonus running now, if any. */
	bonus_offer: BonusOffer | null;
	history: WalletLine[];
};

export type TopUpCheckout = {
	reference: string;
	authorization_url: string;
	/** Bonus credit this top-up earns once paid; zero for none. */
	bonus: Amount;
};

export type TopUpStatus = "pending" | "paid" | "failed";

export type TopUp = {
	reference: string;
	amount: Amount;
	/** Bonus promised when it started. */
	bonus: Amount;
	/** Bonus credited once paid. */
	bonus_paid: Amount;
	status: TopUpStatus;
	paid_at: string | null;
	created_at: string;
};

export type Overview = {
	currency: string;
	available: Amount;
	reserved: Amount;
	live: number;
	in_review: number;
	impressions_7d: number;
	clicks_7d: number;
	spend_7d: Amount;
};

export type AdFormat = "feed" | "banner";
export type MediaKind = "image" | "video";

export type Upload = { id: string; kind: MediaKind };

export type CampaignStatus =
	| "draft"
	| "in-review"
	| "rejected"
	| "scheduled"
	| "live"
	| "paused"
	| "exhausted"
	| "ended"
	| "removed";

export type Creative = {
	media_kind: MediaKind;
	/** The image or video on the CDN; "" until one is saved. */
	media_url: string;
	thumbnail_url: string | null;
	description: string;
	destination_url: string;
	destination_domain: string;
};

export type RejectReason = { reason: string; label: string };

export type Campaign = {
	id: string;
	advertiser: string;
	/** The market's currency: its dates are in that market's calendar. */
	currency: string;
	name: string;
	format: AdFormat;
	status: CampaignStatus;
	house: boolean;
	priority: number;
	version: number;
	creative: Creative;
	business_name: string;
	/** `location_key` prefixes; empty is the whole market. */
	areas: string[];
	starts_at: string;
	ends_at: string | null;
	budget: Amount;
	daily_budget: Amount | null;
	/** Per 1,000 impressions; zero until submitted. */
	cpm: Amount;
	spent: Amount;
	remaining: Amount;
	estimated_impressions: number;
	impressions: number;
	clicks: number;
	submitted_at: string | null;
	approved_at: string | null;
	pause_reason: "advertiser" | "suspended" | null;
	flagged_by_reports: boolean;
	reject_reasons: RejectReason[];
	status_note: string | null;
	created_at: string;
};

/** What a draft is made or changed with: only the fields sent move. Dates
 *  are `YYYY-MM-DD` in the market's calendar; money in minor units. */
export type CampaignForm = {
	name?: string;
	/** On create only. */
	format?: AdFormat;
	/** An upload's id, or the campaign's current media URL. */
	media?: string;
	thumbnail?: string;
	description?: string;
	destination_url?: string;
	areas?: string[];
	starts_on?: string;
	/** `null` clears it. */
	ends_on?: string | null;
	budget?: number;
	/** `null` clears it. */
	daily_budget?: number | null;
};

export type DailyStat = { day: string; impressions: number; clicks: number; spend: Amount };

export type CampaignStats = {
	impressions: number;
	clicks: number;
	/** Clicks per 100 impressions. */
	ctr: number;
	spent: Amount;
	days: DailyStat[];
};

export type Notice = { title: string; body: string; at: string };

/** A country, state or city from the reference data. */
export type Place = { id: string; name: string; code?: string };

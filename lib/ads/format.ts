import { sentence } from "../portal/format";
import { AdsApiError } from "./http";
import type { Amount, BonusOffer, Campaign, CampaignStatus } from "./types";

/** An API amount (AmountDto, major units) for display, always to the kobo:
 *  ₦12,500.00. Money sent TO the API is in minor units (`toMinor`). */
export function money(a: Amount | null | undefined): string {
	if (!a) return "—";
	return `${a.symbol}${a.amount.toLocaleString("en-NG", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

/** An amount in the same currency as `like`. */
export const amountLike = (like: Amount | null | undefined, amount: number): Amount => ({
	symbol: like?.symbol ?? "₦",
	currency: like?.currency ?? "NGN",
	amount,
});

/** What was typed, in major units; null when it isn't an amount. */
export function parseMajor(text: string): number | null {
	const t = text.replace(/[,\s₦]/g, "");
	if (!/^\d+(\.\d{0,2})?$/.test(t)) return null;
	return Number(t);
}

/** Major units to the minor units the API takes. */
export const toMinor = (major: number) => Math.round(major * 100);

/** The offer in a line: "Double your first top-up, up to ₦50,000.00", or
 *  "Get 20% extra credit on top-ups, up to ₦10,000.00", with its end date. */
export function bonusOfferText(o: BonusOffer): string {
	const base =
		o.percent === 100
			? `Double your ${o.first_top_up_only ? "first top-up" : "top-ups"}, up to ${money(o.cap)}`
			: `Get ${o.percent}% extra credit on ${o.first_top_up_only ? "your first top-up" : "top-ups"}, up to ${money(o.cap)}`;
	return o.ends_at ? `${base}, until ${day(o.ends_at)}.` : `${base}.`;
}

/** The bonus a top-up of `major` would earn under the offer (major units). */
export function bonusFor(o: BonusOffer | null | undefined, major: number | null): number {
	if (!o || !o.eligible || major === null || major <= 0) return 0;
	return Math.min(Math.floor(major * o.percent) / 100, o.cap.amount);
}

export const count = (n: number | null | undefined) => (n ?? 0).toLocaleString("en-NG");

export const dateTime = (iso: string | null | undefined) =>
	iso
		? new Date(iso).toLocaleString("en-NG", {
				day: "numeric",
				month: "short",
				hour: "numeric",
				minute: "2-digit",
			})
		: "—";

export const day = (iso: string | null | undefined) =>
	iso
		? new Date(iso).toLocaleDateString("en-NG", {
				day: "numeric",
				month: "short",
				year: "numeric",
			})
		: "—";

/** The API's error name, or "" for anything that isn't an API error. */
export const errorCode = (e: unknown) => (e instanceof AdsApiError ? e.code : "");

/** Friendlier copy for the errors people can act on. The rest use the
 *  API's own message, which is already written for advertisers. */
const FRIENDLY: Record<string, string> = {
	NetworkError: "Can't reach Mealgro. Check your connection and try again.",
	EmailIsInvalid: "Enter a valid email address.",
	OTPErrorInvalidOTP: "That code isn't right. Check the email and try again.",
	OTPErrorTokenExpired: "That code has expired or was entered wrong too many times. Ask for a new one.",
	AdsErrorSignupClosed:
		"Sign-ups for Mealgro Ads are closed right now. If you already have an account, you can still sign in.",
	AdsErrorBanned:
		"This Mealgro Ads account has been closed. Contact Mealgro support if you think this is a mistake.",
	AdsErrorSuspended: "Your account is suspended, so this isn't available right now. You can still read your account.",
	AdsErrorTermsOutdated: "Accept the updated Mealgro Ads terms on your account page first.",
	ImageFileTooLarge: "Images can be at most 20 MB.",
	VideoFileTooLarge: "Videos can be at most 50 MB.",
	UnsupportedMimeType: "Upload a JPG, PNG or WebP image, or an MP4 or MOV video.",
	TransactionErrorPaymentPending: "A top-up for this amount is already starting. Wait a moment, then try again.",
	TooManyRequests: "Too many attempts. Wait a minute, then try again.",
};

/** Readable text for a failure. */
export function describe(e: unknown): string {
	if (e instanceof AdsApiError) return FRIENDLY[e.code] ?? sentence(e.info.message || e.code);
	return e instanceof Error ? sentence(e.message) : "Something went wrong.";
}

export type Tone = "ok" | "warn" | "bad" | "brand" | "";

export const statusLabel: Record<CampaignStatus, string> = {
	draft: "Draft",
	"in-review": "In review",
	rejected: "Rejected",
	scheduled: "Scheduled",
	live: "Live",
	paused: "Paused",
	exhausted: "Budget spent",
	ended: "Ended",
	removed: "Removed",
};

export const statusTone: Record<CampaignStatus, Tone> = {
	draft: "",
	"in-review": "warn",
	rejected: "bad",
	scheduled: "brand",
	live: "ok",
	paused: "warn",
	exhausted: "warn",
	ended: "",
	removed: "bad",
};

/** One line on what the status means for this campaign. */
export function statusHint(c: Campaign): string {
	switch (c.status) {
		case "draft":
			return "Not sent yet. Nothing is held.";
		case "in-review":
			return c.flagged_by_reports
				? "Customers reported this ad, so it's back in review. It isn't showing until a reviewer looks at it."
				: "We're reviewing it, usually within 24 hours. The budget is held.";
		case "rejected":
			return "A reviewer said no. The budget went back to your wallet. Edit the ad and send it again.";
		case "scheduled":
			return "Approved. It starts showing on its start date.";
		case "live":
			return "Showing to customers now.";
		case "paused":
			return c.pause_reason === "suspended"
				? "Paused while your account is suspended. The budget stays held."
				: "You paused it. The budget stays held. Resume it any time.";
		case "exhausted":
			return "The budget is spent. Add budget to show it again, with no new review.";
		case "ended":
			return "Ended. What it didn't spend went back to your wallet.";
		case "removed":
			return "Mealgro took this ad down. What it didn't spend went back to your wallet.";
	}
}

/** Statuses whose budget is held: these can be ended, and take more budget. */
export const holdsBudget = (s: CampaignStatus) =>
	s === "in-review" || s === "scheduled" || s === "live" || s === "paused" || s === "exhausted";

/** Statuses a change can still be made in. */
export const editable = (s: CampaignStatus) => s !== "ended" && s !== "removed";

/** Submitted: a change to the media, text, link or areas sends it back to review. */
export const submitted = (s: CampaignStatus) => holdsBudget(s);

export const formatLabel = { feed: "Feed ad", banner: "Banner" } as const;

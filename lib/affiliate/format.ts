import { Marked } from "marked";
import { sentence } from "../portal/format";
import { AffiliateApiError } from "./http";
import type { Amount, ReferralStatus, VoidReason, WithdrawalStatus } from "./types";

/** An API amount (AmountDto, in naira — major units) for display, always to
 *  the kobo: ₦12,500.00, ₦12,500.50. Money sent TO the API is in kobo. */
export function money(a: Amount | null | undefined): string {
	if (!a) return "—";
	return `${a.symbol}${a.amount.toLocaleString("en-NG", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

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
export const errorCode = (e: unknown) => (e instanceof AffiliateApiError ? e.code : "");

/** Friendlier copy for the errors people can act on. */
const FRIENDLY: Record<string, string> = {
	NetworkError: "Can't reach Mealgro. Check your connection and try again.",
	AffiliateErrorFullNameRequired: "Enter your full name.",
	EmailIsInvalid: "Enter a valid email address.",
	AffiliateErrorPhoneInvalid: "Enter a valid phone number, like 0803 123 4567.",
	AffiliateErrorTermsRequired: "Please read and accept the affiliate terms.",
	AffiliateErrorAlreadyRegistered:
		"There's already an affiliate account with this email. Sign in instead.",
	AffiliateErrorCodeRecentlySent:
		"We sent you a code a moment ago. You can ask for another in a minute.",
	AffiliateErrorTooManyCodes: "Too many codes were asked for. Try again in an hour.",
	OTPErrorInvalidOTP: "That code isn't right. Check the email and try again.",
	OTPErrorTokenExpired:
		"That code has expired or was entered wrong too many times. Ask for a new one.",
	AffiliateErrorBanned:
		"This affiliate account has been closed. Contact Mealgro support if you think this is a mistake.",
	AffiliateErrorSuspended:
		"Your account is suspended, so this isn't available right now. You can still read your account.",
	AffiliateErrorTermsOutdated: "Please accept the updated affiliate terms first.",
	AffiliateErrorBelowMinimum: "That's less than the minimum withdrawal.",
	AffiliateErrorInsufficientBalance: "You don't have that much available to withdraw.",
	AffiliateErrorBankAccountRequired: "Add your bank account before withdrawing.",
	AffiliateErrorBankAccountCoolingOff:
		"Your bank details changed recently. Withdrawals open 24 hours after a change.",
	AffiliateErrorWithdrawalInProgress:
		"You already have a withdrawal in progress. Wait for it to finish, or cancel it if it's still pending.",
	AffiliateErrorWithdrawalNotCancellable: "Only a pending withdrawal can be cancelled.",
};

/** Readable text for a failure. */
export function describe(e: unknown): string {
	if (e instanceof AffiliateApiError) return FRIENDLY[e.code] ?? sentence(e.info.message || e.code);
	return e instanceof Error ? sentence(e.message) : "Something went wrong.";
}

export type Tone = "ok" | "warn" | "bad" | "brand" | "";

export const referralLabel: Record<ReferralStatus, string> = {
	pending: "Pending",
	"awaiting-budget": "Waiting on budget",
	paid: "Paid",
	void: "Voided",
};

export const referralTone: Record<ReferralStatus, Tone> = {
	pending: "warn",
	"awaiting-budget": "brand",
	paid: "ok",
	void: "bad",
};

export function voidReason(r: VoidReason | null): string {
	if (!r) return "";
	if (typeof r === "object") return r.admin;
	return {
		"area-inactive": "Area not active",
		"program-paused": "Program paused",
		cancelled: "Registration cancelled",
		banned: "Store banned",
		"no-reward": "No reward set",
	}[r];
}

export const withdrawalLabel: Record<WithdrawalStatus, string> = {
	pending: "Pending",
	queued: "Queued",
	processing: "Processing",
	paid: "Paid",
	failed: "Failed",
	reversed: "Reversed",
	rejected: "Rejected",
	cancelled: "Cancelled",
};

export const withdrawalTone = (s: string): Tone =>
	(
		({
			pending: "warn",
			queued: "brand",
			processing: "brand",
			paid: "ok",
			failed: "bad",
			reversed: "bad",
			rejected: "bad",
			cancelled: "",
		}) as Record<string, Tone>
	)[s] ?? "";

const escapeHtml = (s: string) =>
	s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Terms are Markdown from our API. Raw HTML in it is shown as text, never run.
const md = new Marked({
	gfm: true,
	renderer: {
		html: ({ text }) => escapeHtml(text),
		// The page has its own h1: the terms' headings start two levels down.
		heading({ tokens, depth }) {
			const level = Math.min(depth + 2, 6);
			return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
		},
		link({ href, title, tokens }) {
			const text = this.parser.parseInline(tokens);
			if (!/^(https?:|mailto:|\/|#)/i.test(href)) return text;
			const t = title ? ` title="${escapeHtml(title)}"` : "";
			return `<a href="${escapeHtml(href)}"${t} target="_blank" rel="noopener">${text}</a>`;
		},
	},
});

export const markdown = (src: string) => md.parse(src, { async: false }) as string;

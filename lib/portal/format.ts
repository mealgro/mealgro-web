import type { Amount } from "./types";

/** Money, always to the kobo: ₦1,234,567,890.50, ₦7,700.00. */
export const formatMoney = (amount: number, symbol = "") =>
	`${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const money = (a: Amount | null | undefined) => (a ? formatMoney(a.amount, a.symbol) : "—");

/** A phone number a person can read: +234 906 000 0005 for a Nigerian number,
 *  0906 000 0005 for one written with the trunk zero; anything else as given. */
export function phone(raw: string | null | undefined): string {
	if (!raw) return "";
	const d = raw.replace(/[\s\-()]/g, "");
	let m = /^\+?234(\d{3})(\d{3})(\d{4})$/.exec(d);
	if (m) return `+234 ${m[1]} ${m[2]} ${m[3]}`;
	m = /^0(\d{3})(\d{3})(\d{4})$/.exec(d);
	if (m) return `0${m[1]} ${m[2]} ${m[3]}`;
	return raw;
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

export const titleCase = (slug: string) =>
	slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** Readable text for an API failure; the server's own message when it has one. */
export function describe(e: unknown): string {
	if (e && typeof e === "object" && "info" in e) {
		const info = (e as { info: { message?: string; name: string } }).info;
		return sentence(info.message || info.name);
	}
	return e instanceof Error ? sentence(e.message) : "Something went wrong.";
}

/** A message as a sentence: capital first, a full stop at the end. */
export function sentence(text: string): string {
	const t = text.trim();
	if (!t) return t;
	const s = t[0].toUpperCase() + t.slice(1);
	return /[.!?…]$/.test(s) ? s : `${s}.`;
}

export const statusTone = (status: string): "ok" | "warn" | "bad" | "brand" | "" =>
	({
		pending: "warn",
		accepted: "brand",
		ready: "brand",
		"in-delivery": "brand",
		delivered: "ok",
		cancelled: "bad",
		rejected: "bad",
	})[status] as "ok" | "warn" | "bad" | "brand" | "";

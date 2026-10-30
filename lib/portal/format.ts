import type { Amount } from "./types";

export const money = (a: Amount | null | undefined) =>
	a ? `${a.symbol}${a.amount.toLocaleString("en-NG")}` : "—";

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
		return info.message || info.name;
	}
	return e instanceof Error ? e.message : "Something went wrong.";
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

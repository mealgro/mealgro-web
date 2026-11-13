// Campaign dates are days in the market's own calendar (`YYYY-MM-DD`), as
// the API takes them (`starts_on`, `ends_on`). It answers `starts_at` (that
// day's midnight in the market) and `ends_at` (midnight after the last day).
import { MARKETS } from "../portal/markets";

/** The market's clock: core's `SupportedCurrency.zone`. */
const ZONES: Record<string, string> = {
	NGN: "Africa/Lagos",
	GHS: "Africa/Accra",
	KES: "Africa/Nairobi",
	ZAR: "Africa/Johannesburg",
};

export const zoneOf = (currency: string | null | undefined) =>
	ZONES[(currency ?? "").toUpperCase()] ?? ZONES.NGN;

/** The country (ISO, upper case) of a currency's market. */
export const countryOf = (currency: string | null | undefined) =>
	MARKETS.find((m) => m.code === (currency ?? "").toUpperCase())?.country ?? "NG";

/** The day a moment falls on in the market: `YYYY-MM-DD`. */
export function dayIn(at: string | number | Date, currency: string | null | undefined): string {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: zoneOf(currency),
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date(at));
	const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
	return `${get("year")}-${get("month")}-${get("day")}`;
}

export const marketToday = (currency: string | null | undefined) => dayIn(Date.now(), currency);

/** The first day a campaign runs. */
export const startDay = (startsAt: string, currency: string) => dayIn(startsAt, currency);

/** The last day a campaign runs, or null when it runs until spent. */
export const endDay = (endsAt: string | null, currency: string) =>
	endsAt ? dayIn(Date.parse(endsAt) - 1000, currency) : null;

/** `YYYY-MM-DD` plus `n` days. */
export function addDays(ymd: string, n: number): string {
	const [y, m, d] = ymd.split("-").map(Number);
	return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Days from `from` to `to`, both counted. */
export function daysBetween(from: string, to: string): number {
	const a = Date.parse(`${from}T00:00:00Z`);
	const b = Date.parse(`${to}T00:00:00Z`);
	return Math.round((b - a) / 86_400_000) + 1;
}

/** `YYYY-MM-DD` for people: 13 Nov 2026. */
export function showDay(ymd: string | null | undefined): string {
	if (!ymd) return "—";
	return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-NG", {
		timeZone: "UTC",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

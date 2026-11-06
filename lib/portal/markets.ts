import type { Place } from "./types";

/** The markets Mealgro trades in: core's `SUPPORTED_CURRENCIES`. */
export const MARKETS = [
	{ code: "NGN", country: "NG", label: "Nigerian naira (NGN)" },
	{ code: "GHS", country: "GH", label: "Ghanaian cedi (GHS)" },
	{ code: "KES", country: "KE", label: "Kenyan shilling (KES)" },
	{ code: "ZAR", country: "ZA", label: "South African rand (ZAR)" },
] as const;

/** The market of a country from `/countries`, if Mealgro trades there. */
export const marketOfCountry = (country: Place | undefined) => {
	const iso = country?.code?.trim().toUpperCase();
	return MARKETS.find((m) => m.country === iso);
};

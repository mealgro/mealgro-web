// Top-ups go through Paystack's own checkout page. Paystack sends the payer
// back to `callback_url?reference=…`; the page then asks for the charge's
// status by that reference. A charge is started once and only ever queried
// after that (never started again).
import { wallet } from "./api";
import { errorCode } from "./format";
import type { TopUp } from "./types";

/** Where Paystack may send the payer back: the API accepts only pages under
 *  `https://mealgro.com/ads/` (and `http://localhost:3000/ads/` in dev). */
export function callbackUrl(path: string): string {
	const url = new URL(path, location.origin);
	url.searchParams.delete("reference");
	url.searchParams.delete("trxref");
	return url.toString();
}

/** Starts a top-up of `amount` (minor units) and leaves for Paystack. */
export async function startTopUp(amount: number, returnPath: string): Promise<void> {
	const checkout = await wallet.topUp(amount, callbackUrl(returnPath));
	location.assign(checkout.authorization_url);
}

/** The reference Paystack sent the payer back with, if any. */
export function returnedReference(): string | null {
	const q = new URLSearchParams(location.search);
	return q.get("reference") || q.get("trxref");
}

/** Takes the reference off the address, so a reload doesn't ask again. */
export function forgetReference() {
	const url = new URL(location.href);
	url.searchParams.delete("reference");
	url.searchParams.delete("trxref");
	history.replaceState(history.state, "", url.pathname + url.search + url.hash);
}

export type TopUpOutcome =
	| { state: "paid"; topUp: TopUp }
	| { state: "pending" }
	| { state: "failed" }
	| { state: "error"; error: unknown };

/** Waits between asks: Paystack usually confirms within a few seconds. */
const BACKOFF_MS = [0, 1500, 2500, 4000, 6000];

/** Asks for a top-up's status by its reference a few times, backing off,
 *  while the answer is "not yet". */
export async function checkTopUp(reference: string): Promise<TopUpOutcome> {
	for (const wait of BACKOFF_MS) {
		if (wait) await new Promise((r) => setTimeout(r, wait));
		try {
			const topUp = await wallet.verifyTopUp(reference);
			if (topUp.status === "paid") return { state: "paid", topUp };
			if (topUp.status === "failed") return { state: "failed" };
		} catch (e) {
			const code = errorCode(e);
			if (code === "AdsErrorTopUpFailed") return { state: "failed" };
			if (code !== "AdsErrorTopUpPending") return { state: "error", error: e };
		}
	}
	return { state: "pending" };
}

import type { ApiError, TokenPair } from "./types";

/** In development the dev server proxies `/api` to the local API (see
 *  vite.config.ts). */
export function apiBase(): string {
	return import.meta.env.DEV ? "/api/v1" : "https://api.mealgro.com/v1";
}

// Separate from the vendor portal's keys, so a person can be signed in to
// both at once.
const ACCESS = "mg.affiliate.access";
const REFRESH = "mg.affiliate.refresh";

export function read(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

export function write(key: string, value: string | null) {
	try {
		if (value === null) localStorage.removeItem(key);
		else localStorage.setItem(key, value);
	} catch {
		// Storage can be blocked; the session then lasts until reload.
	}
}

export const tokens = {
	access: () => read(ACCESS),
	refresh: () => read(REFRESH),
	set(pair: TokenPair) {
		write(ACCESS, pair.access_token);
		write(REFRESH, pair.refresh_token);
	},
	clear() {
		write(ACCESS, null);
		write(REFRESH, null);
	},
};

/** Why the session ended, for the sign-in page. */
export type SignedOutReason = "expired" | "banned";

/** Called when the session can no longer be used. */
let onSignedOut: (why: SignedOutReason) => void = () => {};
export function setSignedOutHandler(fn: (why: SignedOutReason) => void) {
	onSignedOut = fn;
}

type Envelope<T> =
	| { status: "success"; data: T }
	| { status: "failed"; error?: ApiError };

export class AffiliateApiError extends Error {
	constructor(
		readonly info: ApiError,
		readonly httpStatus: number,
	) {
		super(info.message);
	}
	/** The API's error name, e.g. `AffiliateErrorBelowMinimum`. */
	get code() {
		return this.info.name;
	}
}

function headers(auth: string | null, body: boolean): HeadersInit {
	const h: Record<string, string> = { "X-Client": "web" };
	if (body) h["Content-Type"] = "application/json";
	if (auth) h.Authorization = `Bearer ${auth}`;
	return h;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function call<T>(method: Method, path: string, body: unknown, auth: string | null): Promise<T> {
	let resp: Response;
	try {
		resp = await fetch(apiBase() + path, {
			method,
			headers: headers(auth, body !== undefined),
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	} catch {
		throw new AffiliateApiError(
			{ name: "NetworkError", message: "Can't reach Mealgro. Check your connection." },
			0,
		);
	}
	if (resp.status === 204) return null as T;
	let json: Envelope<T>;
	try {
		json = await resp.json();
	} catch {
		throw new AffiliateApiError(
			{ name: "ParseError", message: "Unexpected response from Mealgro." },
			resp.status,
		);
	}
	if (json.status === "failed" || !resp.ok) {
		const info = (json as { error?: ApiError }).error ?? {
			name: "HttpError",
			message: resp.statusText || "Something went wrong.",
		};
		throw new AffiliateApiError(info, resp.status);
	}
	return json.data;
}

let refreshing: Promise<boolean> | null = null;

/** One renewal at a time, however many requests found the token stale.
 *  The refresh token itself is the Bearer. */
function renew(): Promise<boolean> {
	refreshing ??= (async () => {
		const refresh = tokens.refresh();
		if (!refresh) return false;
		try {
			tokens.set(await call<TokenPair>("POST", "/affiliate/auth/refresh-token", undefined, refresh));
			return true;
		} catch (e) {
			// Only a refusal ends the session; an outage must not sign anyone out.
			const refused =
				e instanceof AffiliateApiError && e.httpStatus >= 400 && e.httpStatus < 500;
			return !refused;
		}
	})().finally(() => {
		refreshing = null;
	});
	return refreshing;
}

function end(why: SignedOutReason) {
	tokens.clear();
	onSignedOut(why);
}

/** A signed-in call: renews the access token once when it's stale, and
 *  signs out when it can't be renewed. */
export async function api<T>(method: Method, path: string, body?: unknown): Promise<T> {
	try {
		return await call<T>(method, path, body, tokens.access());
	} catch (e) {
		if (!(e instanceof AffiliateApiError)) throw e;
		if (e.code === "AffiliateErrorBanned") {
			end("banned");
			throw e;
		}
		if (e.httpStatus !== 401 && e.httpStatus !== 403) throw e;
		if (!tokens.refresh() || !(await renew())) {
			end("expired");
			throw e;
		}
		try {
			return await call<T>(method, path, body, tokens.access());
		} catch (again) {
			if (again instanceof AffiliateApiError && again.httpStatus === 401) end("expired");
			throw again;
		}
	}
}

/** Unauthenticated call (sign-up, sign-in, the public program and terms). */
export const anonymous = <T>(method: "GET" | "POST", path: string, body?: unknown) =>
	call<T>(method, path, body, null);

export const qs = (params: Record<string, string | number | null | undefined>) => {
	const q = new URLSearchParams();
	for (const [k, v] of Object.entries(params))
		if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
	const s = q.toString();
	return s ? `?${s}` : "";
};

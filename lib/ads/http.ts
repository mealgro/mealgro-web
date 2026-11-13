import { maintenance } from "../maintenance";
import type { ApiError, TokenPair } from "./types";

/** In development the dev server proxies `/api` to the local API (see
 *  vite.config.ts). */
export function apiBase(): string {
	return import.meta.env.DEV ? "/api/v1" : "https://api.mealgro.com/v1";
}

// Separate from the vendor portal's and the affiliate area's keys, so a
// person can be signed in to all of them at once.
const ACCESS = "mg.ads.access";
const REFRESH = "mg.ads.refresh";

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

let onSignedOut: (why: SignedOutReason) => void = () => {};
export function setSignedOutHandler(fn: (why: SignedOutReason) => void) {
	onSignedOut = fn;
}

type Envelope<T> = { status: "success"; data: T } | { status: "failed"; error?: ApiError };

export class AdsApiError extends Error {
	constructor(
		readonly info: ApiError,
		readonly httpStatus: number,
	) {
		super(info.message);
	}
	/** The API's error name, e.g. `AdsErrorInsufficientBalance`. */
	get code() {
		return this.info.name;
	}
}

function headers(auth: string | null, json: boolean): Record<string, string> {
	const h: Record<string, string> = { "X-Client": "web" };
	if (json) h["Content-Type"] = "application/json";
	if (auth) h.Authorization = `Bearer ${auth}`;
	return h;
}

const REQUEST_TIMEOUT_MS = 30_000;
/** A 50 MB video on a slow line. */
const UPLOAD_TIMEOUT_MS = 10 * 60_000;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const networkError = () =>
	new AdsApiError({ name: "NetworkError", message: "Can't reach Mealgro. Check your connection." }, 0);

/** Reads the API's envelope: the data, or an AdsApiError. */
function unwrap<T>(status: number, ok: boolean, statusText: string, json: Envelope<T> | null): T {
	if (status === 204) return null as T;
	if (!json) {
		throw new AdsApiError({ name: "ParseError", message: "Unexpected response from Mealgro." }, status);
	}
	if (json.status === "failed" || !ok) {
		const info = (json as { error?: ApiError }).error ?? {
			name: "HttpError",
			message: statusText || "Something went wrong.",
		};
		maintenance.noticeError(info.name);
		throw new AdsApiError(info, status);
	}
	return json.data;
}

async function call<T>(method: Method, path: string, body: unknown, auth: string | null): Promise<T> {
	let resp: Response;
	try {
		resp = await fetch(apiBase() + path, {
			method,
			headers: headers(auth, body !== undefined),
			body: body === undefined ? undefined : JSON.stringify(body),
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});
	} catch {
		throw networkError();
	}
	let json: Envelope<T> | null = null;
	if (resp.status !== 204) {
		try {
			json = await resp.json();
		} catch {
			json = null;
		}
	}
	return unwrap(resp.status, resp.ok, resp.statusText, json);
}

/** A multipart upload with progress (0..1). fetch can't report upload
 *  progress, so this one is an XHR. */
function send<T>(path: string, form: FormData, auth: string | null, onProgress?: (p: number) => void): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("POST", apiBase() + path);
		for (const [k, v] of Object.entries(headers(auth, false))) xhr.setRequestHeader(k, v);
		xhr.timeout = UPLOAD_TIMEOUT_MS;
		if (onProgress) {
			xhr.upload.onprogress = (e) => {
				if (e.lengthComputable) onProgress(e.loaded / e.total);
			};
		}
		xhr.onerror = () => reject(networkError());
		xhr.ontimeout = () => reject(networkError());
		xhr.onload = () => {
			let json: Envelope<T> | null = null;
			try {
				json = JSON.parse(xhr.responseText);
			} catch {
				json = null;
			}
			try {
				resolve(unwrap(xhr.status, xhr.status >= 200 && xhr.status < 300, xhr.statusText, json));
			} catch (e) {
				reject(e);
			}
		};
		xhr.send(form);
	});
}

let refreshing: Promise<boolean> | null = null;

/** One renewal at a time, however many requests found the token stale.
 *  The refresh token itself is the Bearer. */
function renew(): Promise<boolean> {
	refreshing ??= (async () => {
		const refresh = tokens.refresh();
		if (!refresh) return false;
		try {
			tokens.set(await call<TokenPair>("POST", "/ads/auth/refresh-token", undefined, refresh));
			return true;
		} catch (e) {
			// Only a refusal ends the session; an outage must not sign anyone out.
			const refused = e instanceof AdsApiError && e.httpStatus >= 400 && e.httpStatus < 500;
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

/** Runs a signed-in request: renews the access token once when it's stale,
 *  and signs out when it can't be renewed. */
async function signedIn<T>(run: (access: string | null) => Promise<T>): Promise<T> {
	try {
		return await run(tokens.access());
	} catch (e) {
		if (!(e instanceof AdsApiError)) throw e;
		if (e.code === "AdsErrorBanned") {
			end("banned");
			throw e;
		}
		if (e.httpStatus !== 401 && e.httpStatus !== 403) throw e;
		if (!tokens.refresh() || !(await renew())) {
			end("expired");
			throw e;
		}
		try {
			return await run(tokens.access());
		} catch (again) {
			if (again instanceof AdsApiError && again.httpStatus === 401) end("expired");
			throw again;
		}
	}
}

export const api = <T>(method: Method, path: string, body?: unknown): Promise<T> =>
	signedIn((access) => call<T>(method, path, body, access));

/** A signed-in multipart upload. */
export const upload = <T>(path: string, form: FormData, onProgress?: (p: number) => void): Promise<T> =>
	signedIn((access) => send<T>(path, form, access, onProgress));

/** Unauthenticated call (sign-up, sign-in, the terms, the place lists). */
export const anonymous = <T>(method: "GET" | "POST", path: string, body?: unknown) =>
	call<T>(method, path, body, null);

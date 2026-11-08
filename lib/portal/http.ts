import type { ApiError, TokenPair } from "./types";

/** In development the dev server proxies `/api` to the local API (see
 *  vite.config.ts). */
function apiBase(): string {
	return import.meta.env.DEV ? "/api/v1" : "https://api.mealgro.com/v1";
}

const ACCESS = "mg.portal.access";
const REFRESH = "mg.portal.refresh";

function read(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function write(key: string, value: string | null) {
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

/** Called when the session can no longer be renewed. */
let onSignedOut: () => void = () => {};
export function setSignedOutHandler(fn: () => void) {
	onSignedOut = fn;
}

type Envelope<T> =
	| { status: "success"; data: T }
	| { status: "failed"; error?: ApiError };

export class PortalError extends Error {
	constructor(
		readonly info: ApiError,
		readonly httpStatus: number,
	) {
		super(info.message);
	}
	get name() {
		return this.info.name;
	}
}

/** The branch vendor requests are for, sent as `X-Store-Id`. Set by the
 *  session; a call can name another branch for itself (`opts.store`). */
let currentStore: string | null = null;
export function setCurrentStore(id: string | null) {
	currentStore = id;
}
export const getCurrentStore = () => currentStore;

const REQUEST_TIMEOUT_MS = 30_000;

type CallOptions = { store?: string | null; raw?: boolean };

function headers(auth: string | null, body: boolean, store: string | null): HeadersInit {
	const h: Record<string, string> = { "X-Client": "web" };
	if (body) h["Content-Type"] = "application/json";
	if (auth) h.Authorization = `Bearer ${auth}`;
	if (auth && store) h["X-Store-Id"] = store;
	return h;
}

async function call<T>(
	method: string,
	path: string,
	body: unknown,
	auth: string | null,
	opts: CallOptions = {},
): Promise<T> {
	let resp: Response;
	try {
		resp = await fetch(apiBase() + path, {
			method,
			headers: headers(auth, body !== undefined, opts.store ?? currentStore),
			body: body === undefined ? undefined : JSON.stringify(body),
			// Never wait for ever: a hung API reads as an error with a retry.
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});
	} catch {
		throw new PortalError(
			{ name: "NetworkError", message: "Can't reach Mealgro. Check your connection." },
			0,
		);
	}
	if (resp.status === 204) return null as T;
	// A file comes back as itself; a failure still comes back as JSON.
	if (opts.raw && resp.ok && !(resp.headers.get("content-type") ?? "").includes("json"))
		return (await resp.blob()) as T;
	let json: Envelope<T>;
	try {
		json = await resp.json();
	} catch {
		throw new PortalError(
			{ name: "ParseError", message: "Unexpected response from Mealgro." },
			resp.status,
		);
	}
	if (json.status === "failed" || !resp.ok) {
		const info = (json as { error?: ApiError }).error ?? {
			name: "HttpError",
			message: resp.statusText || "Something went wrong.",
		};
		throw new PortalError(info, resp.status);
	}
	return json.data;
}

let refreshing: Promise<boolean> | null = null;

/** One renewal at a time, however many requests found the token stale. */
function renew(): Promise<boolean> {
	refreshing ??= (async () => {
		const refresh = tokens.refresh();
		if (!refresh) return false;
		try {
			tokens.set(await call<TokenPair>("POST", "/auth/refresh-token", undefined, refresh));
			return true;
		} catch (e) {
			// Only a refusal ends the session; an outage must not sign anyone out.
			const refused = e instanceof PortalError && e.httpStatus >= 400 && e.httpStatus < 500;
			return !refused;
		}
	})().finally(() => {
		refreshing = null;
	});
	return refreshing;
}

export async function api<T>(
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
	path: string,
	body?: unknown,
	opts: CallOptions = {},
): Promise<T> {
	try {
		return await call<T>(method, path, body, tokens.access(), opts);
	} catch (e) {
		const stale =
			e instanceof PortalError && (e.httpStatus === 401 || e.httpStatus === 403);
		if (!stale || !tokens.refresh()) throw e;
		if (!(await renew())) {
			tokens.clear();
			onSignedOut();
			throw e;
		}
		return call<T>(method, path, body, tokens.access(), opts);
	}
}

/** Unauthenticated call (sign-in). */
export const anonymous = <T>(method: "POST", path: string, body: unknown) =>
	call<T>(method, path, body, null);

export const qs = (params: Record<string, string | number | null | undefined>) => {
	const q = new URLSearchParams();
	for (const [k, v] of Object.entries(params))
		if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
	const s = q.toString();
	return s ? `?${s}` : "";
};

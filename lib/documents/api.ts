// The document request page's calls. No account: the token from the email's
// link is the permission, sent as `Authorization: Token <token>` so it never
// sits in a URL the API logs. See the backend's `modules::document_requests`.

import { maintenance } from "../maintenance";
import type { ApiError } from "../portal/types";

function apiBase(): string {
	return import.meta.env.DEV ? "/api/v1" : "https://api.mealgro.com/v1";
}

export type RequestedItem = { kind: string; label: string };
export type PlaceOption = { id: string; name: string };

export type DocumentRequestView = {
	subject: "store" | "rider";
	/** The business's name, or the rider's first name. */
	name: string;
	/** The files asked for. */
	documents: RequestedItem[];
	/** Present when the store's address was asked for. */
	address: {
		country: string;
		states: PlaceOption[];
		current_address: string | null;
		current_state: string;
		current_city: string;
	} | null;
	note: string | null;
	expires_at: string;
};

export type PlaceSuggestion = { place_id: string; description: string; main_text: string; secondary_text: string };
export type PlaceDetail = { place_id: string; formatted_address: string; city: string | null; latitude: number; longitude: number };

export class RequestError extends Error {
	constructor(readonly info: ApiError) {
		super(info.message);
	}
	get name() {
		return this.info.name;
	}
}

/** Why a link no longer works, by the API's error name. */
export const LINK_ERRORS = {
	DocumentRequestErrorLinkNotFound: "invalid",
	DocumentRequestErrorLinkUsed: "used",
	DocumentRequestErrorLinkReplaced: "replaced",
	DocumentRequestErrorLinkExpired: "expired",
} as const;
export type LinkProblem = (typeof LINK_ERRORS)[keyof typeof LINK_ERRORS];

export function linkProblem(e: unknown): LinkProblem | null {
	return e instanceof RequestError ? (LINK_ERRORS[e.name as keyof typeof LINK_ERRORS] ?? null) : null;
}

async function call<T>(token: string, method: "GET" | "POST", path: string, body?: FormData, timeoutMs = 30_000): Promise<T> {
	let resp: Response;
	try {
		resp = await fetch(apiBase() + "/document-requests" + path, {
			method,
			headers: { Authorization: `Token ${token}` },
			body,
			signal: AbortSignal.timeout(timeoutMs),
		});
	} catch {
		throw new RequestError({ name: "NetworkError", message: "Can't reach Mealgro. Check your connection and try again." });
	}
	let json: { status: "success"; data: T } | { status: "failed"; error?: ApiError };
	try {
		json = await resp.json();
	} catch {
		throw new RequestError({
			name: resp.status === 413 ? "TooLarge" : "ParseError",
			message: resp.status === 413 ? "Those files are too large together. Use smaller ones." : "Unexpected response from Mealgro.",
		});
	}
	if (json.status === "failed" || !resp.ok) {
		const info = (json as { error?: ApiError }).error ?? { name: "HttpError", message: resp.statusText || "Something went wrong." };
		maintenance.noticeError(info.name);
		throw new RequestError(info);
	}
	return json.data;
}

export const loadRequest = (token: string) => call<DocumentRequestView>(token, "GET", "");

export const loadCities = (token: string, stateId: string) =>
	call<PlaceOption[]>(token, "GET", `/states/${encodeURIComponent(stateId)}/cities`);

export const searchPlaces = (token: string, q: string, session: string) =>
	call<PlaceSuggestion[]>(token, "GET", `/places?q=${encodeURIComponent(q)}&session=${encodeURIComponent(session)}`);

export const placeDetail = (token: string, placeId: string, session: string) =>
	call<PlaceDetail>(token, "GET", `/places/${encodeURIComponent(placeId)}?session=${encodeURIComponent(session)}`);

/** Uploads can take a while on a phone connection. */
export const submitRequest = (token: string, form: FormData) => call<{ received: string[] }>(token, "POST", "", form, 180_000);

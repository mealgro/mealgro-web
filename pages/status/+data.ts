import type { PageContextServer } from "vike/types";

export type ServiceState = "operational" | "down" | "unknown";

export type StatusData = {
	/** Whether the API answered at all. */
	reachable: boolean;
	api: ServiceState;
	/** Live delivery — order tracking and feed updates. */
	live: ServiceState;
	/** Round trip from this server to the API. */
	apiMs: number | null;
	checkedAt: string;
};

// Base URL of the Mealgro API (override per-environment via API_BASE).
const API_BASE = process.env.API_BASE ?? "https://api.mealgro.com";

const state = (value: unknown): ServiceState =>
	value === "ok" ? "operational" : value === "unavailable" ? "down" : "unknown";

// Runs on the server for every request. The API's `/health` answers 200 when
// it can serve and 503 when it cannot, with `{status, live}` either way — and
// nothing about what sits behind it.
export async function data(_: PageContextServer): Promise<StatusData> {
	const checkedAt = new Date().toISOString();
	const started = Date.now();
	try {
		const res = await fetch(`${API_BASE}/health`, {
			signal: AbortSignal.timeout(5000),
			headers: { accept: "application/json" },
		});
		const apiMs = Date.now() - started;
		const body = (await res.json()) as { status?: string; live?: string };
		return {
			reachable: true,
			api: state(body.status),
			live: state(body.live),
			apiMs,
			checkedAt,
		};
	} catch {
		return { reachable: false, api: "down", live: "unknown", apiMs: null, checkedAt };
	}
}

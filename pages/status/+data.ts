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
	/** `GET /v1/maintenance`: on now, planned, or null (neither, or unknown). */
	maintenance: Maintenance | null;
};

export type Maintenance = {
	/** Closed now. */
	active: boolean;
	/** When it starts or started; ahead of now and not active = planned. */
	starts_at: string | null;
	/** When Mealgro is expected back, if anyone said. */
	ends_at: string | null;
	message: string | null;
};

// Base URL of the Mealgro API (override per-environment via API_BASE).
const API_BASE = process.env.API_BASE ?? "https://api.mealgro.com";

const state = (value: unknown): ServiceState =>
	value === "ok" ? "operational" : value === "unavailable" ? "down" : "unknown";

/** Maintenance on or planned, else null. Served by the API during
 *  maintenance; any failure counts as none. */
async function maintenance(): Promise<Maintenance | null> {
	try {
		const res = await fetch(`${API_BASE}/v1/maintenance`, {
			signal: AbortSignal.timeout(5000),
			headers: { accept: "application/json" },
		});
		const body = (await res.json()) as { status?: string; data?: Maintenance };
		const m = body.status === "success" ? body.data : undefined;
		if (!m) return null;
		const planned = !!m.starts_at && Date.parse(m.starts_at) > Date.now();
		return m.active || planned ? m : null;
	} catch {
		return null;
	}
}

// Runs on the server for every request. The API's `/health` answers 200 when
// it can serve and 503 when it cannot, with `{status, live}` either way — and
// nothing about what sits behind it.
export async function data(_: PageContextServer): Promise<StatusData> {
	const checkedAt = new Date().toISOString();
	const upkeep = maintenance();
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
			maintenance: await upkeep,
		};
	} catch {
		return {
			reachable: false,
			api: "down",
			live: "unknown",
			apiMs: null,
			checkedAt,
			maintenance: await upkeep,
		};
	}
}

// The status page's check (pages/status), run in the visitor's browser: the
// page is prerendered like the rest of the site (static hosting has no server
// to render it per visit), and the API lets mealgro.com call it (CORS).
export type ServiceState = "operational" | "down" | "unknown";

export type Maintenance = {
	/** Closed now. */
	active: boolean;
	/** When it starts or started; ahead of now and not active = planned. */
	starts_at: string | null;
	/** When Mealgro is expected back, if anyone said. */
	ends_at: string | null;
	message: string | null;
};

export type StatusData = {
	/** Whether the API answered at all. */
	reachable: boolean;
	api: ServiceState;
	/** Live delivery — order tracking and feed updates. */
	live: ServiceState;
	/** Round trip from this browser to the API. */
	apiMs: number | null;
	checkedAt: string;
	/** `GET /v1/maintenance`: on now, planned, or null (neither, or unknown). */
	maintenance: Maintenance | null;
};

/** The API's root: proxied by the dev server, the real host in a build (as lib/maintenance.ts). */
const API_ROOT = import.meta.env.DEV ? "/api" : "https://api.mealgro.com";

const state = (value: unknown): ServiceState =>
	value === "ok" ? "operational" : value === "unavailable" ? "down" : "unknown";

/** Maintenance on or planned, else null. Any failure counts as none. */
async function maintenance(): Promise<Maintenance | null> {
	try {
		const res = await fetch(`${API_ROOT}/v1/maintenance`, {
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

/** The API's `/health` answers 200 when it can serve and 503 when it cannot,
 *  with `{status, live}` either way. */
export async function checkStatus(): Promise<StatusData> {
	const checkedAt = new Date().toISOString();
	const upkeep = maintenance();
	const started = performance.now();
	try {
		const res = await fetch(`${API_ROOT}/health`, {
			signal: AbortSignal.timeout(5000),
			headers: { accept: "application/json" },
			cache: "no-store",
		});
		const apiMs = Math.round(performance.now() - started);
		const body = (await res.json()) as { status?: string; live?: string };
		return { reachable: true, api: state(body.status), live: state(body.live), apiMs, checkedAt, maintenance: await upkeep };
	} catch {
		return { reachable: false, api: "down", live: "unknown", apiMs: null, checkedAt, maintenance: await upkeep };
	}
}

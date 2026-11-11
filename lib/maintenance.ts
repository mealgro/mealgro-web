// Maintenance, as both portals (vendor and affiliate) see it. While it is on,
// every API route but `GET /v1/maintenance` answers `MaintenanceActive` (HTTP
// 503); the portals' fetch wrappers report that here, the frame shows the
// maintenance page instead of the area, and asks again every 30 seconds until
// it is over. Maintenance never signs anyone out.
import { computed, onBeforeUnmount, reactive, watch } from "vue";

export type MaintenanceStatus = {
	/** Mealgro is closed now. */
	active: boolean;
	/** When it starts or started; ahead of now (and not active) = planned. */
	starts_at: string | null;
	/** When Mealgro is expected back, if anyone said. */
	ends_at: string | null;
	/** The admin's note. */
	message: string | null;
};

/** The error every closed route answers with. */
export const MAINTENANCE_ERROR = "MaintenanceActive";
/** What the API says on every closed route. */
export const MAINTENANCE_LINE = "Mealgro is down for maintenance. Please check back soon.";
/** The announcement title the API gives planned maintenance (vendor cards). */
export const PLANNED_TITLE = "Planned maintenance";

const POLL_MS = 30_000;
const TIMEOUT_MS = 10_000;

/** Same base as lib/portal/http.ts and lib/affiliate/http.ts. */
function apiBase(): string {
	return import.meta.env.DEV ? "/api/v1" : "https://api.mealgro.com/v1";
}

const state = reactive<{ status: MaintenanceStatus | null; checking: boolean }>({
	status: null,
	checking: false,
});

let inFlight: Promise<MaintenanceStatus | null> | null = null;
let checkedOnce = false;

/** Asks the API whether maintenance is on or planned. Resolves `null` when it
 *  can't tell, and then changes nothing. */
function check(): Promise<MaintenanceStatus | null> {
	inFlight ??= (async () => {
		state.checking = true;
		try {
			const resp = await fetch(`${apiBase()}/maintenance`, {
				headers: { "X-Client": "web" },
				signal: AbortSignal.timeout(TIMEOUT_MS),
			});
			const json = (await resp.json()) as { status?: string; data?: MaintenanceStatus };
			if (!resp.ok || json.status !== "success" || !json.data) return null;
			state.status = json.data;
			return json.data;
		} catch {
			return null;
		} finally {
			state.checking = false;
		}
	})().finally(() => {
		inFlight = null;
	});
	return inFlight;
}

/** The ISO time when it is ahead of now, else null. */
function ahead(iso: string | null | undefined): string | null {
	return iso && Date.parse(iso) > Date.now() ? iso : null;
}

const STYLE: Intl.DateTimeFormatOptions = {
	weekday: "short",
	day: "numeric",
	month: "short",
	hour: "numeric",
	minute: "2-digit",
};

/** A time where the viewer is: just the time today, with the day otherwise. */
export function localTime(iso: string): string {
	const at = new Date(iso);
	const today = at.toDateString() === new Date().toDateString();
	return at.toLocaleString(
		"en-NG",
		today ? { hour: "numeric", minute: "2-digit", timeZoneName: "short" } : { ...STYLE, timeZoneName: "short" },
	);
}

/** When planned maintenance is, where the viewer is: "on Tue, 12 Nov,
 *  01:00–03:00 WAT", or "from Tue, 12 Nov, 01:00 WAT" with no end. */
export function plannedWhen(start: string, end: string | null): string {
	const fmt = new Intl.DateTimeFormat("en-NG", { ...STYLE, timeZoneName: "short" });
	const from = new Date(start);
	if (!end) return `from ${fmt.format(from)}`;
	try {
		return `on ${fmt.formatRange(from, new Date(end))}`;
	} catch {
		return `on ${fmt.format(from)} – ${fmt.format(new Date(end))}`;
	}
}

export const maintenance = {
	state,
	/** Mealgro is closed now. */
	active: computed(() => state.status?.active === true),
	/** Maintenance planned for later (not on yet), or null. */
	planned: computed<MaintenanceStatus | null>(() => {
		const s = state.status;
		return s && !s.active && ahead(s.starts_at) ? s : null;
	}),
	/** The expected end, while it is still ahead. */
	expectedBack: computed(() => ahead(state.status?.ends_at)),
	check,

	/** Once per page load, when a portal boots: never blocks it. */
	checkOnce() {
		if (checkedOnce || typeof window === "undefined") return;
		checkedOnce = true;
		void check();
	},

	/** Called by the fetch wrappers with every API error's name: a
	 *  `MaintenanceActive` puts the portal in maintenance at once. */
	noticeError(name: string | undefined) {
		if (name !== MAINTENANCE_ERROR || typeof window === "undefined") return;
		const had = state.status;
		state.status = {
			active: true,
			starts_at: had?.starts_at ?? null,
			ends_at: had?.ends_at ?? null,
			message: had?.message ?? null,
		};
		// For the expected end and the note.
		if (!had?.active) void check();
	},
};

/** For the view that shows the maintenance page (PortalFrame, AuthLayout):
 *  while it is on, asks again every 30 seconds; when it ends, reloads the
 *  page, so everything that failed during it loads afresh. */
export function useMaintenancePoll() {
	let timer: ReturnType<typeof setInterval> | undefined;
	const stop = () => {
		clearInterval(timer);
		timer = undefined;
	};
	watch(
		maintenance.active,
		(on, was) => {
			if (typeof window === "undefined") return;
			if (on) {
				timer ??= setInterval(() => void check(), POLL_MS);
				return;
			}
			stop();
			if (was) location.reload();
		},
		{ immediate: true },
	);
	onBeforeUnmount(stop);
}

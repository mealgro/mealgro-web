import { api, getCurrentStore, qs } from "./http";
import type {
	CapabilityCatalogue,
	Order,
	OrderStatus,
	PlanDetails,
	BillingContact,
	Branch,
	BrandBranches,
	Place,
	Report,
	StaffMember,
	StaffPerson,
	StoreDetails,
	StoreSettings,
	Subscription,
	SubscriptionPlan,
	VendorAnnouncement,
} from "./types";

/** The core's "today" list starts at midnight UTC, which is 1:00 am in Nigeria.
 *  The first hours of a local day are only in the month's history, so they are
 *  fetched from there, kept a few minutes, and dropped when an order changes. */
const EARLY_TTL_MS = 5 * 60_000;
let early: { key: string; at: number; rows: Order[] } | null = null;

async function earlierToday(start: Date): Promise<Order[]> {
	const utcMidnight = Date.UTC(
		new Date().getUTCFullYear(),
		new Date().getUTCMonth(),
		new Date().getUTCDate(),
	);
	// Nothing to fetch when the local day begins after midnight UTC (west of it).
	if (start.getTime() >= utcMidnight) return [];
	const first = new Date(start);
	// The API answers for the current year only: a day that began last year is
	// out of reach, and its first hours stay missing.
	if (first.getUTCFullYear() !== new Date().getUTCFullYear()) return [];
	const key = `${getCurrentStore() ?? ""}|${start.getTime()}`;
	if (early && early.key === key && Date.now() - early.at < EARLY_TTL_MS) return early.rows;
	const rows = await orders.history(first.getUTCMonth() + 1);
	early = { key, at: Date.now(), rows };
	return rows;
}

export const orders = {
	recent: () => api<Order[]>("GET", "/vendor/orders"),
	/** Orders placed since midnight where the viewer is, not midnight UTC. */
	today: async (): Promise<Order[]> => {
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const [now, before] = await Promise.all([orders.recent(), earlierToday(start)]);
		const seen = new Set<string>();
		return [...now, ...before].filter((o) => {
			if (seen.has(o.id) || new Date(o.created_at).getTime() < start.getTime()) return false;
			seen.add(o.id);
			return true;
		});
	},
	/** Orders past their delivery time and waiting on the store, from any day
	 *  (today's list does not hold yesterday's late order). */
	attention: () => api<Order[]>("GET", "/vendor/orders/attention"),
	/** A month of the current year (the API takes no other year). Only 1-12 is
	 *  ever sent: anything else makes the API fail. */
	history: (month?: number) =>
		api<Order[]>(
			"GET",
			`/vendor/orders/history${qs({ month: month && month >= 1 && month <= 12 ? month : undefined })}`,
		),
	get: (id: string) => api<Order>("GET", `/vendor/orders/${id}`),
	/** Adds minutes to an accepted order's delivery time. */
	extend: (id: string, minutes: number) => {
		early = null;
		return api<unknown>("POST", `/vendor/orders/${id}/extend`, { minutes });
	},
	setStatus: (
		id: string,
		body: {
			status: OrderStatus;
			reason?: string;
			/** Minutes of prep, asked when accepting an order wanted now. */
			estimated_arrival_time?: number;
			rider?: string;
			delivery_fullfilment?: string;
		},
	) => {
		early = null;
		return api<unknown>("PUT", `/vendor/orders/${id}`, body);
	},
};

export const store = {
	overview: () =>
		api<{ total_orders: number; total_customers: number; total_cancellation: number }>(
			"GET",
			"/vendor/store/orders-overview",
		),
	details: () => api<StoreDetails>("GET", "/vendor/store"),
	settings: () => api<StoreSettings>("GET", "/vendor/store/settings"),
	setOnline: (is_online: boolean) =>
		api<null>("PATCH", "/vendor/store/online-status", { is_online }),
	/** The store's announcement cards, warnings first. No `x-app-version` is
	 *  sent, so the API leaves out the app's "new version" card. */
	announcements: () => api<VendorAnnouncement[]>("GET", "/vendor/store/announcements"),
};

export const subscription = {
	plans: () => api<PlanDetails[]>("GET", "/vendor/subscription/plans"),
	current: () => api<Subscription>("GET", "/vendor/subscription"),
	/** Starter answers `null`; a paid plan answers Paystack's checkout page,
	 *  which returns the vendor to `callback_url?reference=…`. */
	change: (plan: SubscriptionPlan, callback_url = "", billing_email?: string) =>
		api<{ reference: string; authorization_url: string } | null>("POST", "/vendor/subscription", {
			plan,
			callback_url,
			billing_email,
		}),
	verify: (reference: string) =>
		api<Subscription>("POST", `/vendor/subscription/verify${qs({ reference })}`),
	/** Paystack's page for changing the card, to open here — `null` when no
	 *  card renews the plan. */
	cardLink: () => api<{ link: string } | null>("POST", "/vendor/subscription/card"),
	stopRenewal: () => api<null>("DELETE", "/vendor/subscription/renewal"),
	/** Who an address reaches in the business's directory. */
	billingContact: (email: string) =>
		api<BillingContact>("GET", `/vendor/subscription/billing-contact${qs({ email })}`),
};

export const staff = {
	list: () => api<StaffMember[]>("GET", "/vendor/staff"),
	/** Everyone across the business, with where each works. */
	people: () => api<StaffPerson[]>("GET", "/vendor/staff/people"),
	catalogue: () => api<CapabilityCatalogue>("GET", "/vendor/staff/catalogue"),
	invite: (body: {
		username?: string;
		phone?: string;
		email?: string;
		branches?: string[];
		role?: string;
		capabilities?: string[];
	}) => api<{ status: "joined" | "pending" }>("POST", "/vendor/staff", body),
	// The three below act at one branch, which need not be the selected one.
	setAccess: (store: string, user: string, body: { role?: string; capabilities?: string[] }) =>
		api<unknown>("PUT", `/vendor/staff/${user}`, body, { store }),
	remove: (store: string, user: string) =>
		api<null>("DELETE", `/vendor/staff/${user}`, undefined, { store }),
	cancelInvite: (store: string, invite: string) =>
		api<null>("DELETE", `/vendor/staff/invites/${invite}`, undefined, { store }),
};

export const riders = {
	list: () => api<{ id: string; full_name: string; phone?: string }[]>("GET", "/vendor/riders"),
};

export const storeSettings = {
	contact: (full_name: string, phone: string) =>
		api<unknown>("POST", "/vendor/store/settings/contact", { full_name, phone }),
	prepTime: (min: number, max: number) =>
		api<unknown>("POST", "/vendor/store/settings/prep-time", { min, max }),
	storeType: (store_type: "online" | "physical" | "both") =>
		api<unknown>("POST", "/vendor/store/settings/store-type", { store_type }),
};

export const branches = {
	list: () => api<BrandBranches>("GET", "/vendor/branches"),
	open: (body: {
		label: string;
		state: string;
		city: string;
		address?: string;
		copy_menu: boolean;
		currency?: string;
	}) => api<Branch>("POST", "/vendor/branches", body),
	relabel: (id: string, label: string) => api<null>("PUT", `/vendor/branches/${id}`, { label }),
	renameBrand: (name: string) => api<null>("PUT", "/vendor/brand", { name }),
};

export const places = {
	countries: () => api<Place[]>("GET", "/countries"),
	states: (country: string) => api<Place[]>("GET", `/countries/${country}/states`),
	cities: (state: string) => api<Place[]>("GET", `/states/${state}/cities`),
};

export type ReportQuery = {
	scope: "brand" | "branch";
	from: string;
	to: string;
	group?: "day" | "week" | "month";
};

export const reports = {
	get: (q: ReportQuery) => api<Report>("GET", `/vendor/reports${qs(q)}`),
	/** The report as a file to save. */
	export: (q: ReportQuery, format: "csv" | "xlsx") =>
		api<Blob>("GET", `/vendor/reports/export${qs({ ...q, format })}`, undefined, { raw: true }),
};

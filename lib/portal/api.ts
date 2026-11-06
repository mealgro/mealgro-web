import { api, qs } from "./http";
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
} from "./types";

export const orders = {
	recent: () => api<Order[]>("GET", "/vendor/orders"),
	history: (month?: number) =>
		api<Order[]>("GET", `/vendor/orders/history${qs({ month })}`),
	get: (id: string) => api<Order>("GET", `/vendor/orders/${id}`),
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
	) => api<unknown>("PUT", `/vendor/orders/${id}`, body),
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

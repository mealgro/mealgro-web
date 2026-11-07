export type Capability =
	| "view-orders"
	| "manage-orders"
	| "manage-menu"
	| "publish-content"
	| "view-finances"
	| "request-withdrawal"
	| "manage-store"
	| "manage-reviews"
	| "manage-promotions"
	| "view-store"
	| "manage-staff"
	| "manage-branches";

export type ApiError = {
	name: string;
	message: string;
	code?: number | string;
};

export type Amount = { symbol: string; amount: number; currency: string };

export type StoreStatus = "inactive" | "active" | "suspended" | "rejected" | "banned";

/** A branch this person works at. */
export type SessionStore = {
	id: string;
	brand: string;
	/** The business. */
	name: string;
	branch_label: string;
	/** What customers see: the name, plus "(label)" once there are two branches. */
	display_name: string;
	is_base: boolean;
	status: StoreStatus;
	logo: string | null;
	email_verified: boolean;
	capabilities: Capability[];
};

export type SessionUser = {
	id: string;
	full_name: string | null;
	username: string | null;
	email: string | null;
	phone: string | null;
	avatar: string | null;
	stores: SessionStore[];
};

export type TokenPair = { access_token: string; refresh_token: string };

export type AuthResponse = TokenPair & { user: SessionUser; code: string };

export type OrderStatus =
	| "pending"
	| "accepted"
	| "ready"
	| "in-delivery"
	| "delivered"
	| "cancelled"
	| "rejected";

export type DeliveryFulfillment = "vendor" | "mealgro" | "pickup" | "partner";

export type OrderItem = {
	slug: string;
	name: string;
	price: Amount;
	quantity: number;
	/** What the customer chose on the item ("Spice (Mild)"). */
	modifiers: { name?: string; quantity?: number; [k: string]: unknown }[];
	thumbnail: string;
};

export type Order = {
	id: string;
	display_id: string;
	status: OrderStatus;
	address: string;
	delivery_fee: Amount;
	sub_total: Amount;
	service_charge: Amount;
	total_amount: Amount;
	vendor_earning: Amount;
	store_message: string | null;
	scheduled_at: string | null;
	contact: { full_name: string; phone: string };
	rider: { id: string; full_name: string; phone: string } | null;
	delivery_fulfillment: DeliveryFulfillment;
	items: OrderItem[];
	cancelled_reason: string | null;
	created_at: string;
	updated_at: string;
	/** The end of the delivery window; null until the order is accepted. */
	due_at?: string | null;
	/** Past due and waiting on the store. */
	needs_attention?: boolean;
	/** Whether the store may cancel now (the server's answer). */
	can_cancel?: boolean;
	/** When cancelling opens, if time alone will do it. */
	cancel_opens_at?: string | null;
	/** Extensions left, and the minutes they can add up to. 0 when it can't be extended. */
	extensions_left?: number;
	extension_minutes_left?: number;
};

export type SubscriptionPlan = "starter" | "premium" | "odogwu";

export type PlanDetails = {
	plan: SubscriptionPlan;
	title: string;
	amount: Amount | null;
	features: { icon: string; text: string }[];
};

export type Subscription = {
	plan: SubscriptionPlan;
	status: "active" | "paused";
	expires_at: string | null;
	last_paid_at: string | null;
	renews: boolean;
	/** Where this branch is billed; empty until it first pays. */
	billing_email: string;
};

export type BillingContact = {
	email: string;
	member: {
		name: string;
		places: { branch_label: string; display_name: string; role: string }[];
	} | null;
	invited: boolean;
	in_use: boolean;
};

export type StaffMember = {
	user: string | null;
	name: string | null;
	username: string | null;
	phone: string | null;
	email: string | null;
	role: string;
	capabilities: Capability[];
	pending: boolean;
	invite: string | null;
};

export type CapabilityCatalogue = {
	capabilities: { slug: Capability; requires_live_store: boolean }[];
	roles: { slug: string; display_name: string; capabilities: Capability[] }[];
};

export type StoreDetails = {
	name: string;
	status: StoreStatus;
	is_online: boolean;
	is_open: boolean;
};

export type StoreSettings = {
	logo: string | null;
	business_name: string;
	email: string;
	email_verified: boolean;
	contact: { full_name: string; phone: string };
	location: { address: string; city: string; state: string };
	store_type: { store_type: "online" | "physical" | "both" };
	prep_time: { min: number; max: number };
	pending_address: { address: string } | null;
};

export type StaffPlace = {
	store: string;
	branch_label: string;
	display_name: string;
	role: string;
	capabilities: Capability[];
	invite: string | null;
};

export type StaffPerson = {
	user: string | null;
	name: string | null;
	username: string | null;
	phone: string | null;
	email: string | null;
	pending: boolean;
	branches: StaffPlace[];
};

export type Branch = {
	id: string;
	display_name: string;
	branch_label: string;
	is_base: boolean;
	status: StoreStatus;
	is_online: boolean;
	address: string | null;
	city: string;
	state: string;
	/** `copying` while a menu from another market's branch is on its way;
	 *  `failed` when it stopped, keeping what got copied. */
	menu_copy: "none" | "copying" | "done" | "failed";
};

export type BrandBranches = { id: string; name: string; branches: Branch[] };

export type Totals = {
	orders: number;
	completed: number;
	cancelled: number;
	gross_sales: number;
	delivery_fees: number;
	service_charges: number;
	earnings: number;
	average_order: number;
};

export type Report = {
	scope: "brand" | "branch";
	from: string;
	to: string;
	currency: string;
	symbol: string;
	totals: Totals;
	branches: { store: string; display_name: string; branch_label: string; totals: Totals }[];
	series: { period: string; orders: number; gross_sales: number; earnings: number }[];
	top_items: { name: string; quantity: number; sales: number }[];
};

/** `code` is the ISO country code on a country, lower or upper case. */
export type Place = { id: string; name: string; code?: string };

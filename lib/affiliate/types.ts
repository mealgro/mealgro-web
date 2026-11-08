/** Shapes of the affiliate API (`/v1/affiliate/*`). Amounts in responses
 *  (AmountDto) are in naira; amounts sent (a withdrawal) are in kobo. */

export type ApiError = { name: string; message: string };

export type Amount = { symbol: string; amount: number; currency: string };

export type TokenPair = { access_token: string; refresh_token: string };

export type AffiliateStatus = "active" | "suspended" | "banned";

export type Affiliate = {
	id: string;
	full_name: string;
	email: string;
	phone: string;
	code: string;
	status: AffiliateStatus;
	status_reason: string | null;
	/** False when the terms changed since they last accepted. */
	terms_current: boolean;
	last_login_at: string | null;
	joined_at: string;
};

export type AuthResponse = TokenPair & { affiliate: Affiliate };

export type Terms = { version: string; content: string };

export type AreaState = {
	state: string;
	/** The whole state is active ("All cities in {state}"). */
	whole_state: boolean;
	cities: string[];
};

export type Program = {
	active: boolean;
	message: string | null;
	reward: Amount | null;
	min_withdrawal: Amount;
	areas: AreaState[];
};

export type Overview = {
	program_active: boolean;
	program_message: string | null;
	referred: number;
	pending: number;
	paid: number;
	void: number;
	awaiting_budget: number;
	earned_total: Amount;
	balance_available: Amount;
	balance_reserved: Amount;
};

export type ReferralStatus = "pending" | "awaiting-budget" | "paid" | "void";

export type VoidReason =
	| "area-inactive"
	| "program-paused"
	| "cancelled"
	| "banned"
	| "no-reward"
	| { admin: string };

export type Referral = {
	id: string;
	store_name: string;
	city: string;
	state: string;
	registered_at: string;
	status: ReferralStatus;
	reward: Amount | null;
	approved_at: string | null;
	void_reason: VoidReason | null;
	/** Set on pending ones: false means the store's area isn't active now. */
	area_active: boolean | null;
};

export type Notice = { id: string; title: string; body: string; at: string };

export type HistoryLine = {
	kind: "reward" | "withdrawal";
	title: string;
	amount: Amount;
	status: string | null;
	at: string;
};

export type Wallet = {
	available: Amount;
	reserved: Amount;
	min_withdrawal: Amount;
	can_withdraw: boolean;
	blocked_reason: string | null;
	bank_cool_off_until: string | null;
	history: HistoryLine[];
};

export type BankAccount = {
	bank_name: string;
	bank_code: string;
	/** Masked: ••••••6789. */
	account_number: string;
	account_name: string;
	updated_at: string;
};

export type Bank = { name: string; code: string };
/** How many digits an account number has in the affiliate's market (the server's rule). */
export type AccountNumberLength = { min: number; max: number };
export type BankDirectory = { commercial: Bank[]; microfinance: Bank[]; account_number_length?: AccountNumberLength };

export type WithdrawalStatus =
	| "pending"
	| "queued"
	| "processing"
	| "paid"
	| "failed"
	| "reversed"
	| "rejected"
	| "cancelled";

export type Withdrawal = {
	id: string;
	amount: Amount;
	status: WithdrawalStatus;
	created_at: string;
	updated_at: string;
	failure_reason: string | null;
};

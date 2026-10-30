import { anonymous, api, qs } from "./http";
import type {
	Affiliate,
	AuthResponse,
	BankAccount,
	BankDirectory,
	Notice,
	Overview,
	Program,
	Referral,
	ReferralStatus,
	Terms,
	Wallet,
	Withdrawal,
} from "./types";

/** Public: no sign-in needed. */
export const publicApi = {
	program: () => anonymous<Program>("GET", "/affiliate/program"),
	terms: () => anonymous<Terms>("GET", "/affiliate/terms"),
};

export const auth = {
	/** Emails a code; the account is made once the code is verified. */
	register: (body: { full_name: string; email: string; phone: string; terms_version: string }) =>
		anonymous<{ email: string }>("POST", "/affiliate/auth/register", body),
	/** Emails a code. Answers the same whether or not the email is known. */
	login: (email: string) => anonymous<{ email: string }>("POST", "/affiliate/auth/login", { email }),
	verify: (email: string, otp: string) =>
		anonymous<AuthResponse>("POST", "/affiliate/auth/verify", { email, otp }),
	logout: () => api<null>("POST", "/affiliate/auth/logout"),
};

export const me = {
	get: () => api<Affiliate>("GET", "/affiliate/me"),
	update: (body: { full_name?: string; phone?: string }) =>
		api<Affiliate>("PATCH", "/affiliate/me", body),
	acceptTerms: (version: string) => api<Affiliate>("POST", "/affiliate/terms/accept", { version }),
	overview: () => api<Overview>("GET", "/affiliate/overview"),
	referrals: (status?: ReferralStatus) =>
		api<Referral[]>("GET", `/affiliate/referrals${qs({ status })}`),
	notices: () => api<Notice[]>("GET", "/affiliate/notices"),
};

export const wallet = {
	get: () => api<Wallet>("GET", "/affiliate/wallet"),
	withdrawals: () => api<Withdrawal[]>("GET", "/affiliate/withdrawals"),
	/** `amount` in kobo (naira × 100), unlike the naira AmountDto it answers. */
	withdraw: (amount: number) => api<Withdrawal>("POST", "/affiliate/withdrawals", { amount }),
	cancel: (id: string) => api<null>("DELETE", `/affiliate/withdrawals/${id}`),
};

export const bank = {
	get: () => api<BankAccount | null>("GET", "/affiliate/bank-account"),
	banks: () => api<BankDirectory>("GET", "/affiliate/bank-account/banks"),
	resolve: (bank_code: string, account_number: string) =>
		api<{ account_name: string }>("POST", "/affiliate/bank-account/resolve", {
			bank_code,
			account_number,
		}),
	/** Step 1 of a change: a confirmation code is emailed. */
	request: (bank_code: string, account_number: string) =>
		api<{ account_name: string }>("POST", "/affiliate/bank-account", { bank_code, account_number }),
	/** Step 2: the emailed code saves it. Withdrawals then pause for 24 h. */
	verify: (otp: string) => api<BankAccount>("POST", "/affiliate/bank-account/verify", { otp }),
};

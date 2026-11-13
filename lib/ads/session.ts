import { computed, reactive } from "vue";
import { auth, me } from "./api";
import { read, setSignedOutHandler, tokens, write, type SignedOutReason } from "./http";
import type { Advertiser, AuthResponse, Pricing } from "./types";

const USER_KEY = "mg.ads.user";

/** Where the signed-in area starts, and where signing in happens. */
export const HOME = "/ads/dashboard";
export const LOGIN = "/ads";

const state = reactive<{
	user: Advertiser | null;
	ready: boolean;
	/** This market's prices and minimums, once asked for. */
	pricing: Pricing | null;
}>({
	user: null,
	ready: false,
	pricing: null,
});

let restoring: Promise<boolean> | null = null;
let loadingPricing: Promise<Pricing> | null = null;

function cached(): Advertiser | null {
	try {
		const raw = read(USER_KEY);
		return raw ? (JSON.parse(raw) as Advertiser) : null;
	} catch {
		return null;
	}
}

function remember(user: Advertiser | null) {
	state.user = user;
	write(USER_KEY, user ? JSON.stringify(user) : null);
}

function endSession() {
	tokens.clear();
	remember(null);
	state.pricing = null;
}

function toLogin(why?: SignedOutReason) {
	if (location.pathname.replace(/\/$/, "") === LOGIN) return;
	if (why === "expired") {
		try {
			// The sign-in page says why they are back there, once.
			sessionStorage.setItem("mg.ads.ended", "1");
		} catch {
			// Storage blocked: they just land on sign-in.
		}
	}
	location.assign(why === "banned" ? `${LOGIN}?closed=1` : LOGIN);
}

setSignedOutHandler((why) => {
	endSession();
	toLogin(why);
});

export const session = {
	state,
	user: computed(() => state.user),
	pricing: computed(() => state.pricing),
	/** Whether the current terms are accepted. Until they are, nothing can be submitted. */
	termsCurrent: computed(() => state.user?.terms_current !== false),
	/** Suspended: can read, can't top up, create or submit. */
	suspended: computed(() => state.user?.status === "suspended"),
	hasToken: () => !!tokens.access(),

	/** Loads the cached advertiser, then the live one. Resolves signed-in or
	 *  not. The shell and the page both ask; they share one request. */
	restore(): Promise<boolean> {
		if (state.ready && (state.user || !tokens.access())) return Promise.resolve(!!state.user && !!tokens.access());
		restoring ??= (async () => {
			if (tokens.access()) {
				state.user = cached();
				try {
					remember(await me.get());
				} catch {
					if (!tokens.access()) state.user = null; // signed out while renewing
				}
			}
			state.ready = true;
			return !!state.user && !!tokens.access();
		})().finally(() => {
			restoring = null;
		});
		return restoring;
	},

	setUser(user: Advertiser) {
		remember(user);
	},

	/** This market's prices (one request at a time; kept for the page's life). */
	loadPricing(force = false): Promise<Pricing> {
		if (state.pricing && !force) return Promise.resolve(state.pricing);
		loadingPricing ??= me
			.pricing()
			.then((p) => (state.pricing = p))
			.finally(() => {
				loadingPricing = null;
			});
		return loadingPricing;
	},

	/** Finishes sign-up or sign-in with the emailed code. */
	async verify(email: string, otp: string): Promise<AuthResponse> {
		const res = await auth.verify(email, otp);
		tokens.set(res);
		remember(res.advertiser);
		state.ready = true;
		return res;
	},

	async signOut() {
		try {
			await auth.logout();
		} catch {
			// Signing out locally is enough if the call fails.
		}
		endSession();
		location.assign(LOGIN);
	},
};

import { computed, reactive } from "vue";
import { auth, me } from "./api";
import { setSignedOutHandler, tokens, write, read, type SignedOutReason } from "./http";
import type { Affiliate, AuthResponse, Overview } from "./types";

const USER_KEY = "mg.affiliate.user";

/** Where the signed-in area starts. */
export const HOME = "/affiliate/dashboard";
export const LOGIN = "/affiliate/login";

const state = reactive<{
	user: Affiliate | null;
	ready: boolean;
	/** The latest overview; the shell reads the program switch from it. */
	overview: Overview | null;
}>({
	user: null,
	ready: false,
	overview: null,
});

let restoring: Promise<boolean> | null = null;
let loadingOverview: Promise<Overview> | null = null;

function cached(): Affiliate | null {
	try {
		const raw = read(USER_KEY);
		return raw ? (JSON.parse(raw) as Affiliate) : null;
	} catch {
		return null;
	}
}

function remember(user: Affiliate | null) {
	state.user = user;
	write(USER_KEY, user ? JSON.stringify(user) : null);
}

function endSession() {
	tokens.clear();
	remember(null);
	state.overview = null;
}

function toLogin(why?: SignedOutReason) {
	const onAuthPage = ["/affiliate/login", "/affiliate/signup"].some((p) =>
		location.pathname.startsWith(p),
	);
	if (onAuthPage) return;
	location.assign(why === "banned" ? `${LOGIN}?closed=1` : LOGIN);
}

setSignedOutHandler((why) => {
	endSession();
	toLogin(why);
});

export const session = {
	state,
	user: computed(() => state.user),
	overview: computed(() => state.overview),
	/** Whether the current terms are accepted. Until they are, only reading
	 *  and withdrawing work. */
	termsCurrent: computed(() => state.user?.terms_current !== false),
	/** False only once the API has said the program is paused. */
	programActive: computed(() => state.overview?.program_active !== false),
	hasToken: () => !!tokens.access(),

	/** Loads the cached affiliate, then the live one. Resolves signed-in or
	 *  not. The shell and the page both ask; they share one request. */
	restore(): Promise<boolean> {
		// Known already — unless a sign-in happened since (a token but no one).
		if (state.ready && (state.user || !tokens.access()))
			return Promise.resolve(!!state.user && !!tokens.access());
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

	setUser(user: Affiliate) {
		remember(user);
	},

	/** Reloads the overview (one request at a time). */
	loadOverview(): Promise<Overview> {
		loadingOverview ??= me
			.overview()
			.then((o) => (state.overview = o))
			.finally(() => {
				loadingOverview = null;
			});
		return loadingOverview;
	},

	/** Finishes sign-up or sign-in with the emailed code. */
	async verify(email: string, otp: string): Promise<AuthResponse> {
		const res = await auth.verify(email, otp);
		tokens.set(res);
		remember(res.affiliate);
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

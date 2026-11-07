import { computed, reactive } from "vue";
import { anonymous, api, setCurrentStore, setSignedOutHandler, tokens } from "./http";
import type { AuthResponse, Capability, SessionStore, SessionUser } from "./types";

const USER_KEY = "mg.portal.user";
/** The branch last worked on, kept across visits and sign-ins. */
const STORE_KEY = "mg.portal.store";

const state = reactive<{ user: SessionUser | null; ready: boolean; storeId: string | null }>({
	user: null,
	ready: false,
	storeId: null,
});

function savedStore(): string | null {
	try {
		return localStorage.getItem(STORE_KEY);
	} catch {
		return null;
	}
}

/** The last branch used if they still work there, else the base of a
 *  business, else the first. */
function choose(stores: SessionStore[], wanted: string | null): string | null {
	return (
		stores.find((s) => s.id === wanted)?.id ??
		stores.find((s) => s.is_base)?.id ??
		stores[0]?.id ??
		null
	);
}

function select(id: string | null) {
	state.storeId = id;
	setCurrentStore(id);
	try {
		if (id) localStorage.setItem(STORE_KEY, id);
	} catch {
		// Not persisted; the base opens next time.
	}
}

function cached(): SessionUser | null {
	try {
		const raw = localStorage.getItem(USER_KEY);
		return raw ? (JSON.parse(raw) as SessionUser) : null;
	} catch {
		return null;
	}
}

function remember(user: SessionUser | null) {
	state.user = user;
	if (user) select(choose(user.stores ?? [], state.storeId ?? savedStore()));
	try {
		if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
		else localStorage.removeItem(USER_KEY);
	} catch {
		// Not persisted; fine.
	}
}

function endSession() {
	tokens.clear();
	remember(null);
}

setSignedOutHandler(() => {
	endSession();
	if (location.pathname.startsWith("/account/login")) return;
	try {
		// The sign-in page says why they are back there, once.
		sessionStorage.setItem("mg.portal.ended", "1");
	} catch {
		// Storage blocked: they just land on sign-in.
	}
	location.assign("/account/login");
});

export const session = {
	state,
	user: computed(() => state.user),
	stores: computed<SessionStore[]>(() => state.user?.stores ?? []),
	/** The branch being worked on. */
	store: computed<SessionStore | null>(
		() => state.user?.stores?.find((s) => s.id === state.storeId) ?? null,
	),
	/** What the person may do at the selected branch. A display hint only —
	 *  the API decides every request itself. */
	can: (c: Capability) =>
		(state.user?.stores?.find((s) => s.id === state.storeId)?.capabilities ?? []).includes(c),
	/** Whether they may do `c` at any branch they work at. */
	canAnywhere: (c: Capability) =>
		(state.user?.stores ?? []).some((s) => s.capabilities.includes(c)),
	/** Switches branch. Every page loads for the branch it opens on, so the
	 *  page is reloaded rather than patched. */
	switchTo(id: string) {
		if (id === state.storeId) return;
		select(id);
		location.reload();
	},
	isSignedIn: () => !!tokens.access() && !!state.user,

	/** Loads the cached user, then the live one. Resolves signed-in or not. */
	async restore(): Promise<boolean> {
		if (state.ready) return !!state.user;
		if (tokens.access()) {
			const user = cached();
			state.user = user;
			if (user) select(choose(user.stores ?? [], savedStore()));
			try {
				remember((await api<{ user: SessionUser }>("GET", "/account/profile")).user);
			} catch (e) {
				if (!tokens.access()) state.user = null; // signed out while renewing
			}
		}
		state.ready = true;
		return !!state.user && !!tokens.access();
	},

	/** Reloads who they are and where they work — after opening a branch. */
	async refresh() {
		remember((await api<{ user: SessionUser }>("GET", "/account/profile")).user);
	},

	async signIn(phone: string, password: string): Promise<SessionUser> {
		const res = await anonymous<AuthResponse>("POST", "/auth/login", { phone, password });
		tokens.set(res);
		remember(res.user);
		state.ready = true;
		return res.user;
	},

	async signOut() {
		try {
			await api("POST", "/auth/logout");
		} catch {
			// Signing out locally is enough if the call fails.
		}
		endSession();
		location.assign("/account/login");
	},
};

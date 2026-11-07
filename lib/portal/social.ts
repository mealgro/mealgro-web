// Sign in with Google and Apple on the vendor sign-in page.
//
// The providers' own scripts are loaded here, from their official hosts, and
// only when the sign-in page asks for them and a client id is configured. The
// ids are public (`PUBLIC_ENV__…`); nothing secret is held in the browser. The
// API does the verifying: it gets the provider's identity token and answers as
// it does the mobile app (`POST /auth/provider/{google|apple}`, then
// `POST /auth/link-provider` when the email already belongs to an account).
import { anonymous, PortalError } from "./http";
import type { AuthResponse, LinkOffer, SocialOutcome } from "./types";

const clean = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

/** Google OAuth *web* client id. Without it there is no Google button. */
export const googleClientId = clean(import.meta.env.PUBLIC_ENV__GOOGLE_CLIENT_ID);
/** The Sign in with Apple Services ID. Without it there is no Apple button. */
export const appleClientId = clean(import.meta.env.PUBLIC_ENV__APPLE_CLIENT_ID);
/** The return URL listed on the Services ID; this page unless told otherwise. */
const appleRedirect = () =>
	clean(import.meta.env.PUBLIC_ENV__APPLE_REDIRECT_URI) ?? `${location.origin}/account/login`;

export const socialEnabled = !!(googleClientId || appleClientId);

// ── The providers' scripts ──────────────────────────────────────────────────

const GOOGLE_SRC = "https://accounts.google.com/gsi/client";
const APPLE_SRC =
	"https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

type GoogleId = {
	initialize(config: {
		client_id: string;
		callback: (response: { credential?: string }) => void;
		ux_mode?: "popup" | "redirect";
		auto_select?: boolean;
		use_fedcm_for_button?: boolean;
	}): void;
	renderButton(
		parent: HTMLElement,
		options: {
			type?: "standard" | "icon";
			theme?: "outline" | "filled_blue" | "filled_black";
			size?: "large" | "medium" | "small";
			text?: "signin_with" | "signup_with" | "continue_with" | "signin";
			shape?: "rectangular" | "pill" | "circle" | "square";
			logo_alignment?: "left" | "center";
			width?: number;
			locale?: string;
		},
	): void;
};
type AppleAuth = {
	init(config: {
		clientId: string;
		scope: string;
		redirectURI: string;
		state: string;
		nonce: string;
		usePopup: boolean;
	}): void;
	signIn(): Promise<{
		authorization: { code?: string; id_token: string; state?: string };
		user?: { name?: { firstName?: string; lastName?: string } };
	}>;
};
type Provided = { google?: { accounts?: { id?: GoogleId } }; AppleID?: { auth?: AppleAuth } };
const provided = () => window as unknown as Provided;
const googleId = () => provided().google?.accounts?.id;
const appleAuth = () => provided().AppleID?.auth;

const loading = new Map<string, Promise<void>>();

/** Adds the script once. A failure (offline, blocked) is not remembered, so
 *  asking again tries again. */
function load(src: string, ready: () => boolean): Promise<void> {
	if (ready()) return Promise.resolve();
	const known = loading.get(src);
	if (known) return known;
	const p = new Promise<void>((resolve, reject) => {
		const el = document.createElement("script");
		const fail = () => {
			el.remove();
			reject(new Error(`Could not load ${src}`));
		};
		const timer = setTimeout(fail, 15_000);
		el.src = src;
		el.async = true;
		el.onload = () => {
			clearTimeout(timer);
			if (ready()) resolve();
			else fail();
		};
		el.onerror = () => {
			clearTimeout(timer);
			fail();
		};
		document.head.append(el);
	}).finally(() => loading.delete(src));
	loading.set(src, p);
	return p;
}

// ── Google ──────────────────────────────────────────────────────────────────

let onGoogleCredential: (jwt: string) => void = () => {};
let googleStarted = false;

/** Draws Google's own button in `el` (the only way Google issues an identity
 *  token to a page), as wide as `width`. Its white "outline" look stands out on
 *  the portal's card in the day and at night, and pairs with Apple's button. */
export async function renderGoogleButton(
	el: HTMLElement,
	opts: { width: number; onCredential: (jwt: string) => void },
): Promise<void> {
	if (!googleClientId) return;
	await load(GOOGLE_SRC, () => !!googleId());
	const gsi = googleId();
	if (!gsi) throw new Error("Google sign-in did not start");
	onGoogleCredential = opts.onCredential;
	if (!googleStarted) {
		// Once per page: Google warns about, and misbehaves on, a second call.
		gsi.initialize({
			client_id: googleClientId,
			callback: (r) => r.credential && onGoogleCredential(r.credential),
			ux_mode: "popup",
			auto_select: false,
			use_fedcm_for_button: true,
		});
		googleStarted = true;
	}
	el.replaceChildren();
	gsi.renderButton(el, {
		type: "standard",
		theme: "outline",
		size: "large",
		text: "continue_with",
		shape: "pill",
		logo_alignment: "left",
		// Google takes a width in pixels, 200 to 400.
		width: Math.max(200, Math.min(400, Math.floor(opts.width))),
		locale: "en",
	});
}

// ── Apple ───────────────────────────────────────────────────────────────────

/** Random and unguessable: a URL-safe string of `bytes` random bytes. */
function randomToken(bytes: number): string {
	const buf = new Uint8Array(bytes);
	crypto.getRandomValues(buf);
	return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(text: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
	return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

let armed: { raw: string; state: string } | null = null;

/** Loads Apple's script and gets one sign-in ready. Apple's popup has to open
 *  inside the click that asks for it, so the nonce is made beforehand and the
 *  click ({@link signInWithApple}) does nothing slow. Arm again after each
 *  attempt: a nonce is good for one. */
export async function armApple(): Promise<void> {
	if (!appleClientId) return;
	await load(APPLE_SRC, () => !!appleAuth());
	const auth = appleAuth();
	if (!auth) throw new Error("Apple sign-in did not start");
	const raw = randomToken(16);
	const state = randomToken(16);
	// The API wants the SHA-256 of `raw` in the token, and `raw` itself with it.
	auth.init({
		clientId: appleClientId,
		scope: "name email",
		redirectURI: appleRedirect(),
		state,
		nonce: await sha256Hex(raw),
		usePopup: true,
	});
	armed = { raw, state };
}

export const appleArmed = () => armed !== null;

export type AppleResult = {
	token: string;
	nonce: string;
	code: string | undefined;
	firstName: string | undefined;
	lastName: string | undefined;
};

/** Opens Apple's sign-in. Call it straight from the click. Rejects with an
 *  {@link AppleProblem}. */
export function signInWithApple(): Promise<AppleResult> {
	const auth = appleAuth();
	const attempt = armed;
	armed = null;
	if (!auth || !attempt) return Promise.reject(new AppleProblem("unavailable"));
	return auth.signIn().then(
		(res) => {
			const a = res.authorization;
			// A different state is an answer to some other request.
			if (!a?.id_token || a.state !== attempt.state) throw new AppleProblem("failed");
			return {
				token: a.id_token,
				nonce: attempt.raw,
				code: a.code,
				firstName: res.user?.name?.firstName,
				lastName: res.user?.name?.lastName,
			};
		},
		(e: unknown) => {
			const code = (e as { error?: string } | null)?.error ?? "";
			if (code === "popup_closed_by_user" || code === "user_cancelled_authorize")
				throw new AppleProblem("cancelled");
			if (code === "popup_blocked_by_browser") throw new AppleProblem("blocked");
			throw new AppleProblem("failed");
		},
	);
}

export class AppleProblem extends Error {
	constructor(readonly kind: "cancelled" | "blocked" | "failed" | "unavailable") {
		super(kind);
	}
}

// ── The API ─────────────────────────────────────────────────────────────────

export type Provider = "google" | "apple";

export const providerLabel: Record<Provider, string> = { google: "Google", apple: "Apple" };

export const signInWithProvider = (
	provider: Provider,
	body: {
		token: string;
		nonce?: string;
		authorization_code?: string;
		first_name?: string;
		last_name?: string;
	},
) => anonymous<SocialOutcome>("POST", `/auth/provider/${provider}`, body);

export const linkProvider = (linkToken: string) =>
	anonymous<AuthResponse & { claimed: boolean }>("POST", "/auth/link-provider", {
		link_token: linkToken,
	});

export const isLinkOffer = (o: SocialOutcome): o is { code: "LinkRequired"; link: LinkOffer } =>
	"link" in o;

/** What went wrong, in words for the person, and whether to point them to
 *  support. */
export type SocialFailure = { text: string; support: boolean };

export function socialFailure(e: unknown, provider: Provider): SocialFailure {
	const name = providerLabel[provider];
	const said = (text: string, support = false): SocialFailure => ({ text, support });
	if (!(e instanceof PortalError)) return said(`Signing in with ${name} didn't work. Please try again.`);
	switch (e.name) {
		case "NetworkError":
			return said("Can't reach Mealgro. Check your connection and try again.");
		// A blocked email, or a banned account (the API answers 403 `Forbidden`
		// there: nobody has a session at sign-in that could have expired).
		case "EmailNotAllowedError":
		case "EmailNotAllowed":
		case "Forbidden":
			return said("This account can't be used on Mealgro.", true);
		case "LoginErrorInvalidIdentityToken":
			return said(`${name} couldn't confirm it's you. Please try again.`);
		case "SocialAccountNotFound":
			return said(
				`No Mealgro account uses this ${name} account. Sign in with your phone number and password, or use the ${name} account whose email is on your Mealgro account.`,
			);
		case "LinkErrorLinkExpired":
			return said(`That took too long. Choose ${name} again.`);
		default:
			if (e.httpStatus === 429) return said("Too many attempts. Wait a minute and try again.");
			if (e.httpStatus >= 500) return said("Mealgro had a problem. Please try again in a moment.");
			return said(`Signing in with ${name} didn't work. Please try again.`);
	}
}

import type { PageContextServer } from "vike/types";

export type ShareData = {
	code: string;
	kind: string; // highlight | store | profile
	target: string;
	title: string;
	image: string | null;
	subtitle: string | null;
} | null;

// Base URL of the Mealgro API (override per-environment via API_BASE).
const API_BASE = process.env.API_BASE ?? "https://api.mealgro.com";

// Runs on the server during SSR. Resolves the share <code> to its preview
// snapshot so the page can render OG tags + the open-in-app UI.
export async function data(pageContext: PageContextServer): Promise<ShareData> {
	const code = (pageContext.routeParams as { code?: string } | undefined)?.code;
	if (!code) return null;

	try {
		const res = await fetch(`${API_BASE}/v1/share/${encodeURIComponent(code)}`);
		if (!res.ok) return null;
		const json = (await res.json()) as { data?: Record<string, unknown> | null };
		const d = json?.data;
		if (!d) return null;
		return {
			code,
			kind: String(d.kind ?? ""),
			target: String(d.target ?? ""),
			title: String(d.title ?? "Mealgro"),
			image: (d.image as string | null) ?? null,
			subtitle: (d.subtitle as string | null) ?? null,
		};
	} catch {
		return null;
	}
}

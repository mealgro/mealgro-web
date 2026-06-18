import type { PageContext } from "vike/types";
import type { ShareData } from "./+data";

export default function title(pageContext: PageContext): string {
	const data = pageContext.data as ShareData;
	return data?.title ? `${data.title} — Mealgro` : "Mealgro";
}

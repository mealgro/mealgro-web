import { reactive } from "vue";

export type Toast = { id: number; text: string; tone: "ok" | "bad" };

export const toasts = reactive<Toast[]>([]);
let next = 1;

export function toast(text: string, tone: Toast["tone"] = "ok") {
	const id = next++;
	toasts.push({ id, text, tone });
	setTimeout(() => {
		const i = toasts.findIndex((t) => t.id === id);
		if (i >= 0) toasts.splice(i, 1);
	}, 4000);
}

import { reactive } from "vue";

export type Toast = {
	id: number;
	text: string;
	tone: "ok" | "bad";
	/** A repeat of what failed, offered as a Retry button. */
	retry?: () => void;
};

export const toasts = reactive<Toast[]>([]);
let next = 1;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

/** A good result is gone in 3 seconds; a problem stays 5 (and can be held
 *  with the pointer or the keyboard, so it can be read), like the admin. */
const LIFE = { ok: 3000, bad: 5000 };

function arm(id: number, ms: number) {
	clearTimeout(timers.get(id));
	timers.set(
		id,
		setTimeout(() => dismiss(id), ms),
	);
}

export function dismiss(id: number) {
	clearTimeout(timers.get(id));
	timers.delete(id);
	const i = toasts.findIndex((t) => t.id === id);
	if (i >= 0) toasts.splice(i, 1);
}

/** Holds a toast while it is hovered or focused, then gives it a fresh few seconds. */
export const hold = (id: number) => {
	clearTimeout(timers.get(id));
};
export const release = (id: number) => {
	const t = toasts.find((x) => x.id === id);
	if (t) arm(id, LIFE[t.tone]);
};

export function toast(text: string, tone: Toast["tone"] = "ok", retry?: () => void) {
	const id = next++;
	toasts.push({ id, text, tone, retry });
	arm(id, LIFE[tone]);
}

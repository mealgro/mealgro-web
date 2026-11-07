import { reactive } from "vue";

/** One confirm / ask dialog for both signed-in areas, in place of
 *  `window.confirm` and `window.prompt` (see ConfirmHost.vue, mounted once by
 *  the frame). */
export type ConfirmOptions = {
	title: string;
	message?: string;
	confirmText?: string;
	/** Red confirm button, for a step that can't be undone. */
	destructive?: boolean;
	/** Asks for a line of text too. */
	input?: { label: string; value?: string; required?: boolean; maxLength?: number };
};
export type ConfirmResult = { value: string };

type State = ConfirmOptions & { open: boolean; value: string };
const state = reactive<State>({ open: false, title: "", value: "" });
let resolver: ((r: ConfirmResult | null) => void) | null = null;

export const confirmState = () => state;

/** Resolves `{ value }` when confirmed (the typed text, or "" without an
 *  input) and `null` when cancelled. */
export function confirmAction(opts: ConfirmOptions): Promise<ConfirmResult | null> {
	resolver?.(null);
	Object.assign(state, { message: undefined, confirmText: undefined, destructive: false, input: undefined }, opts);
	state.value = opts.input?.value ?? "";
	state.open = true;
	return new Promise((resolve) => {
		resolver = resolve;
	});
}

export function settleConfirm(ok: boolean) {
	const done = resolver;
	resolver = null;
	state.open = false;
	done?.(ok ? { value: state.value.trim() } : null);
}

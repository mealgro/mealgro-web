import { onBeforeUnmount, onMounted, watch, type Ref } from "vue";

/** What a dialog owes the person using it: focus moves in and stays in (Tab
 *  wraps), Escape closes it from anywhere inside, the page behind is `inert`
 *  (no focus, no clicks, hidden from screen readers), and focus goes back to
 *  what opened it. Dialogs stack: only the top one answers the keyboard. */
const stack: symbol[] = [];

const FOCUSABLE =
	'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** `panel` is the dialog's box (role="dialog"); `active` lets a host that is
 *  always mounted (the confirm dialog) switch it on and off. */
export function useDialog(panel: Ref<HTMLElement | undefined | null>, close: () => void, active?: Ref<boolean>) {
	const id = Symbol("dialog");
	let opener: HTMLElement | null = null;
	let inerted: Element[] = [];
	let on = false;

	const visible = () =>
		[...(panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(
			(e) => e.offsetParent !== null || e === document.activeElement,
		);

	function onKey(e: KeyboardEvent) {
		if (stack[stack.length - 1] !== id || !panel.value) return;
		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			close();
			return;
		}
		if (e.key !== "Tab") return;
		const items = visible();
		if (!items.length) {
			e.preventDefault();
			panel.value.focus();
			return;
		}
		const first = items[0];
		const last = items[items.length - 1];
		const here = document.activeElement as HTMLElement | null;
		if (!here || !panel.value.contains(here) || here === panel.value) {
			e.preventDefault();
			(e.shiftKey ? last : first).focus();
		} else if (e.shiftKey && here === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && here === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function open() {
		if (on || !panel.value) return;
		on = true;
		stack.push(id);
		opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		// Everything outside this dialog's own root goes inert.
		const root = [...document.body.children].find((c) => c.contains(panel.value!));
		inerted = [...document.body.children].filter((c) => c !== root && !c.hasAttribute("inert"));
		for (const c of inerted) c.setAttribute("inert", "");
		document.addEventListener("keydown", onKey, true);
	}

	function shut() {
		if (!on) return;
		on = false;
		document.removeEventListener("keydown", onKey, true);
		const i = stack.indexOf(id);
		if (i >= 0) stack.splice(i, 1);
		for (const c of inerted) c.removeAttribute("inert");
		inerted = [];
		if (opener?.isConnected) opener.focus();
		opener = null;
	}

	function focusIn() {
		// A field that asks to be first, else the dialog itself (it is announced
		// by its label, and the first Tab goes to its first control).
		const target = panel.value?.querySelector<HTMLElement>("[autofocus], [data-autofocus]") ?? panel.value;
		target?.focus();
	}

	onMounted(() => {
		if (!active) {
			open();
			focusIn();
		}
	});
	if (active)
		watch(active, async (now) => {
			if (now) {
				await Promise.resolve();
				// The panel renders on the next tick.
				setTimeout(() => {
					open();
					focusIn();
				}, 0);
			} else shut();
		});
	onBeforeUnmount(shut);
}

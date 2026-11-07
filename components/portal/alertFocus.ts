/** An error that appears after a button press must be seen, also on a phone
 *  where it lands off-screen: when an `[role=alert]` message is added inside a
 *  form or dialog, scroll it into view and move focus to it (screen readers
 *  read it, the next Tab goes on from there). Alerts present on first render
 *  (a page that failed to load) are left alone. */
export function watchAlerts(root: HTMLElement): () => void {
	const mo = new MutationObserver((records) => {
		for (const r of records) {
			for (const n of r.addedNodes) {
				if (!(n instanceof HTMLElement)) continue;
				const alert = n.matches('[role="alert"]') ? n : n.querySelector<HTMLElement>('[role="alert"]');
				if (!alert || !alert.closest("form, .p-modal")) continue;
				if (!alert.hasAttribute("tabindex")) alert.setAttribute("tabindex", "-1");
				alert.scrollIntoView({ block: "center", behavior: "auto" });
				alert.focus({ preventScroll: true });
				return;
			}
		}
	});
	mo.observe(root, { childList: true, subtree: true });
	return () => mo.disconnect();
}

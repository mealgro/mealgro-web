<script setup lang="ts">
// The vendor portal's announcement cards (`GET /vendor/store/announcements`),
// at the top of every page: the store's own warnings, and Mealgro's notices.
// A card's button opens the portal page that fixes it, when there is one and
// the person may open it; what only the app can change says so. Dismissed
// cards are remembered on this device by id.
import { computed, ref } from "vue";
import { session } from "../../lib/portal/session";
import type { AnnouncementAction, Capability, VendorAnnouncement } from "../../lib/portal/types";

const props = defineProps<{ cards: VendorAnnouncement[] }>();

const DISMISSED_KEY = "mg.portal.dismissed";
/** Enough for every card a store sees; the oldest go first. */
const KEEP = 100;

function readDismissed(): string[] {
	try {
		const raw = localStorage.getItem(DISMISSED_KEY);
		const ids: unknown = raw ? JSON.parse(raw) : [];
		return Array.isArray(ids) ? ids.filter((i): i is string => typeof i === "string") : [];
	} catch {
		return [];
	}
}

const dismissed = ref<string[]>(readDismissed());

function dismiss(id: string) {
	dismissed.value = [...dismissed.value.filter((i) => i !== id), id].slice(-KEEP);
	try {
		localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed.value));
	} catch {
		// Not remembered: it comes back on the next page.
	}
}

/** Portal pages a card can open. */
const PAGES: Partial<Record<AnnouncementAction["kind"], { href: string; label: string; need: Capability }>> = {
	"open-subscription": { href: "/account/subscription", label: "Go to subscription", need: "manage-store" },
	"open-store-settings": { href: "/account/store", label: "Go to store settings", need: "view-store" },
	"open-orders-needing-attention": { href: "/account/orders", label: "Go to orders", need: "view-orders" },
};
/** Changed in the Mealgro app only (see pages/account/store). */
const IN_APP = new Set<AnnouncementAction["kind"]>([
	"open-delivery-settings",
	"open-bank-account",
	"open-business-hours",
]);

type Shown = VendorAnnouncement & {
	page?: { href: string; label: string };
	link?: string;
	inApp?: boolean;
};

const shown = computed<Shown[]>(() =>
	props.cards
		// The app's "new version" card is the app's business.
		.filter((c) => c.action?.kind !== "update-app")
		.filter((c) => !(c.dismissible && dismissed.value.includes(c.id)))
		.map((c) => {
			const a = c.action;
			if (!a) return c;
			if (a.kind === "open-link")
				return /^https?:\/\//i.test(a.value) ? { ...c, link: a.value } : c;
			const page = PAGES[a.kind];
			if (page) return session.can(page.need) ? { ...c, page } : c;
			return IN_APP.has(a.kind) ? { ...c, inApp: true } : c;
		}),
);
</script>

<template>
	<section v-if="shown.length" class="p-stack-sm" aria-label="Announcements">
		<div
			v-for="c in shown"
			:key="c.id"
			class="p-alert"
			:class="[c.kind === 'warning' ? 'p-alert--warn' : 'p-alert--info', { 'p-alert--closable': c.dismissible }]"
			role="status"
		>
			<strong class="p-alert-title">{{ c.title }}</strong>
			<p>{{ c.message }}</p>
			<p v-if="c.page" class="p-alert-more"><a :href="c.page.href">{{ c.page.label }}</a></p>
			<p v-else-if="c.link" class="p-alert-more">
				<a :href="c.link" target="_blank" rel="noopener noreferrer">Read more<span class="sr-only"> (opens in a new tab)</span></a>
			</p>
			<p v-else-if="c.inApp" class="p-alert-more">Change this in the Mealgro app.</p>
			<button
				v-if="c.dismissible"
				class="p-alert-x"
				type="button"
				:aria-label="`Dismiss: ${c.title}`"
				@click="dismiss(c.id)"
			>
				<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AnnouncementCards from "./AnnouncementCards.vue";
import MaintenanceBanner from "./MaintenanceBanner.vue";
import PortalFrame, { type RailItem } from "./PortalFrame.vue";
import { PLANNED_TITLE, maintenance } from "../../lib/maintenance";
import { store as storeApi } from "../../lib/portal/api";
import { session } from "../../lib/portal/session";
import { toasts } from "../../lib/portal/toast";
import type { Capability, VendorAnnouncement } from "../../lib/portal/types";

const props = defineProps<{
	title: string;
	/** What the page needs: a person without it sees "no access", not the page. */
	need?: Capability;
}>();

const ready = ref(false);
const bootError = ref("");

type Item = RailItem & { need?: Capability };
const items: Item[] = [
	{ href: "/account", label: "Overview", need: "view-store", icon: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
	{ href: "/account/orders", label: "Orders", need: "view-orders", icon: "M6 2h12l2 5v14H4V7zM4 7h16M9 11h6" },
	{ href: "/account/reports", label: "Reports", need: "view-finances", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
	{ href: "/account/subscription", label: "Subscription", need: "manage-store", icon: "M3 8l4 4 5-7 5 7 4-4-2 11H5z" },
	{ href: "/account/branches", label: "Branches", need: "view-store", icon: "M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
	{ href: "/account/store", label: "Store", need: "view-store", icon: "M4 9l1-5h14l1 5M4 9v11h16V9M4 9a3 3 0 006 0 3 3 0 006 0 3 3 0 004 0M10 20v-5h4v5" },
	{ href: "/account/staff", label: "Staff", need: "manage-staff", icon: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21v-1a6 6 0 0112 0v1M17 11a3 3 0 100-6M22 21v-1a5 5 0 00-4-4.9" },
];
const visible = computed(() => items.filter((i) => !i.need || session.can(i.need)));
const active = (href: string, path: string) => (href === "/account" ? path === href : path.startsWith(href));

const denied = computed(() => ready.value && !!props.need && !session.can(props.need));

const user = session.user;
const store = session.store;
const stores = session.stores;

// The store's announcement cards, on every page. A failure only means none
// are shown: they are extras.
const cards = ref<VendorAnnouncement[]>([]);
const cardsLoaded = ref(false);
async function loadCards() {
	try {
		if (session.can("view-store")) cards.value = await storeApi.announcements();
	} catch {
		// Nothing to show.
	} finally {
		cardsLoaded.value = true;
	}
}
// Planned maintenance reaches vendors as an announcement card too (from the
// API, in GMT); the frame's own banner (local times) stands in only when that
// card isn't there. Waits for the cards so the two never flash together.
const plannedBanner = computed(
	() => cardsLoaded.value && !cards.value.some((c) => c.channel === "broadcast" && c.title === PLANNED_TITLE),
);

const reload = () => location.reload();
const BOOT_MS = 15_000;
onMounted(async () => {
	const slow = new Promise<"slow">((r) => setTimeout(() => r("slow"), BOOT_MS));
	const signedIn = await Promise.race([session.restore(), slow]);
	if (signedIn === "slow") {
		bootError.value = "Mealgro is taking too long to answer. Check your connection and try again.";
		return;
	}
	if (!signedIn) {
		// Maintenance (the profile call met it) is not a reason to sign in
		// again: the frame shows maintenance, and reloads when it's over.
		if (!maintenance.active.value) location.replace("/account/login");
		return;
	}
	ready.value = true;
	void loadCards();
});
</script>

<template>
	<PortalFrame
		:title="title"
		area="Vendor portal"
		home-href="/account"
		:items="visible"
		:is-active="active"
		:user-name="user?.full_name || 'You'"
		:user-sub="store?.display_name"
		:toasts="toasts"
		:loading="!ready"
		:boot-error="bootError"
		:denied="denied"
		@retry="reload"
		@sign-out="session.signOut()"
	>
		<template #rail>
			<label v-if="stores.length > 1" class="switch">
				<span class="rail-label">Branch</span>
				<select
					class="p-input"
					:value="store?.id"
					aria-label="Branch you're working on"
					@change="session.switchTo(($event.target as HTMLSelectElement).value)"
				>
					<option v-for="s in stores" :key="s.id" :value="s.id">
						{{ s.display_name }}{{ s.is_base ? " · main" : "" }}{{ s.status !== "active" ? ` · ${s.status}` : "" }}
					</option>
				</select>
			</label>
			<div v-else-if="store" class="switch">
				<span class="rail-label">Store</span>
				<strong>{{ store.display_name }}</strong>
			</div>
		</template>
		<template #banners>
			<MaintenanceBanner v-if="plannedBanner" />
			<AnnouncementCards :cards="cards" />
		</template>
		<template v-if="$slots.actions" #actions><slot name="actions" /></template>
		<slot />
	</PortalFrame>
</template>

<style scoped>
.switch {
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 0 6px;
}
.switch .rail-label {
	font-size: 12px;
	font-weight: 600;
}
.switch strong {
	font-size: 14px;
	line-height: 1.3;
}
</style>

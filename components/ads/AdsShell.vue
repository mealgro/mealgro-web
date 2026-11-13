<script setup lang="ts">
// The signed-in Mealgro Ads frame: rail items, the suspension and terms
// banners on every page. A sibling of AffiliateShell; the look is PortalFrame's.
import { onMounted, ref } from "vue";
import MaintenanceBanner from "../portal/MaintenanceBanner.vue";
import PortalFrame, { type RailItem } from "../portal/PortalFrame.vue";
import { maintenance } from "../../lib/maintenance";
import { LOGIN, session } from "../../lib/ads/session";
import { toasts } from "../../lib/ads/toast";

withDefaults(defineProps<{ title: string; hideTermsBanner?: boolean }>(), { hideTermsBanner: false });

const ready = ref(false);
const bootError = ref("");

const items: RailItem[] = [
	{ href: "/ads/dashboard", label: "Dashboard", icon: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
	{ href: "/ads/campaigns", label: "Campaigns", icon: "M4 10v4a1 1 0 001 1h2l5 4V5L7 9H5a1 1 0 00-1 1zM16 8a5 5 0 010 8M19 5a9 9 0 010 14" },
	{ href: "/ads/wallet", label: "Wallet", icon: "M3 7h15a3 3 0 013 3v8a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l12-4v4M17 14h.01" },
	{ href: "/ads/account", label: "Account", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-1a7 7 0 0114 0v1" },
];
const active = (href: string, path: string) => path === href || path.startsWith(`${href}/`);

const user = session.user;
const termsCurrent = session.termsCurrent;
const suspended = session.suspended;

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
		// Maintenance is not a reason to sign in again.
		if (!maintenance.active.value) location.replace(LOGIN);
		return;
	}
	ready.value = true;
});
</script>

<template>
	<PortalFrame
		:title="title"
		area="Mealgro Ads"
		home-href="/ads/dashboard"
		:items="items"
		:is-active="active"
		:user-name="user?.full_name || 'You'"
		:user-sub="user?.email"
		:toasts="toasts"
		:loading="!ready"
		:boot-error="bootError"
		@retry="reload"
		@sign-out="session.signOut()"
	>
		<template #rail>
			<div v-if="user" class="biz">
				<span class="rail-label">Your ads say</span>
				<strong>Sponsored · {{ user.business_name }}</strong>
			</div>
		</template>
		<template #banners>
			<MaintenanceBanner />
			<div v-if="suspended" class="p-alert" role="status">
				<p>
					<strong>Your account is suspended.</strong>
					Your ads are paused. You can read your account, but you can't top up, create or send ads.
					<template v-if="user?.status_reason"> Reason: {{ user.status_reason }}</template>
				</p>
			</div>
			<div v-else-if="!termsCurrent && !hideTermsBanner" class="p-alert p-alert--warn" role="status">
				<p>
					<strong>We've updated the Mealgro Ads terms.</strong>
					Accept them to send ads for review. <a href="/ads/account#terms">Read and accept</a>
				</p>
			</div>
		</template>
		<template v-if="$slots.actions" #actions><slot name="actions" /></template>
		<slot />
	</PortalFrame>
</template>

<style scoped>
.biz {
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin: 0 6px;
	padding: 12px 18px;
	border-radius: 1.25rem;
	background: color-mix(in srgb, var(--on-rail) 10%, transparent);
}
.biz .rail-label {
	font-size: 12px;
	font-weight: 600;
}
.biz strong {
	font-size: 14px;
	line-height: 1.3;
	color: var(--cat-3);
	overflow-wrap: anywhere;
}
</style>

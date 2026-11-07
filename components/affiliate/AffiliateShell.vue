<script setup lang="ts">
// The signed-in affiliate area's frame: rail items, the pause/suspension
// banners and the terms gate on every page. A sibling of
// components/portal/PortalShell.vue; the look is PortalFrame's.
import { computed, onMounted, ref } from "vue";
import PortalFrame, { type RailItem } from "../portal/PortalFrame.vue";
import { LOGIN, session } from "../../lib/affiliate/session";
import { toasts } from "../../lib/affiliate/toast";
import PauseBanner from "./PauseBanner.vue";
import TermsGate from "./TermsGate.vue";

defineProps<{ title: string }>();

const ready = ref(false);
const bootError = ref("");

const items: RailItem[] = [
	{ href: "/affiliate/dashboard", label: "Dashboard", icon: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
	{ href: "/affiliate/referrals", label: "Referrals", icon: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21v-1a6 6 0 0112 0v1M19 8v6M16 11h6" },
	{ href: "/affiliate/wallet", label: "Wallet", icon: "M3 7h15a3 3 0 013 3v8a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l12-4v4M17 14h.01" },
	{ href: "/affiliate/bank", label: "Bank account", icon: "M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18" },
	{ href: "/affiliate/profile", label: "Profile", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-1a7 7 0 0114 0v1" },
];
const active = (href: string, path: string) => path.startsWith(href);

const user = session.user;
const overview = session.overview;
const programActive = session.programActive;
const termsCurrent = session.termsCurrent;
const suspended = computed(() => user.value?.status === "suspended");

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
		location.replace(LOGIN);
		return;
	}
	ready.value = true;
	// For the pause banner; a page that needs the numbers loads them itself.
	if (!session.overview.value) session.loadOverview().catch(() => {});
});
</script>

<template>
	<PortalFrame
		:title="title"
		area="Affiliate program"
		home-href="/affiliate/dashboard"
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
			<div v-if="user" class="code">
				<span class="rail-label">Your code</span>
				<strong class="disp">{{ user.code }}</strong>
			</div>
		</template>
		<template #rail-foot>
			<a class="more" href="/affiliate?view=public">How the program works</a>
		</template>
		<template #banners>
			<!-- One notice at a time, the most serious first: a suspension says it all. -->
			<div v-if="suspended" class="p-alert" role="status">
				<p>
					<strong>Your account is suspended.</strong>
					You can sign in and read your account, but you can't withdraw or make changes.
					Contact Mealgro support if you think this is a mistake.
				</p>
			</div>
			<template v-else>
				<PauseBanner v-if="!programActive" look="portal" variant="account" :message="overview?.program_message" />
				<TermsGate v-if="!termsCurrent" />
			</template>
		</template>
		<template v-if="$slots.actions" #actions><slot name="actions" /></template>
		<slot />
	</PortalFrame>
</template>

<style scoped>
.code {
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin: 0 6px;
	padding: 12px 18px;
	border-radius: 1.25rem;
	background: color-mix(in srgb, var(--on-rail) 10%, transparent);
}
.code .rail-label {
	font-size: 12px;
	font-weight: 600;
}
.code strong {
	font-size: 22px;
	line-height: 1.1;
	letter-spacing: 0.06em;
	color: var(--cat-3);
	overflow-wrap: anywhere;
}
.more {
	display: flex;
	align-items: center;
	min-height: 44px;
	font-size: 13px;
	font-weight: 600;
	padding: 0 16px;
	color: color-mix(in srgb, var(--on-rail) 66%, transparent);
	text-underline-offset: 3px;
}
.more:hover {
	color: var(--on-rail);
}
</style>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import OrderDetail from "../../components/portal/OrderDetail.vue";
import OrdersTable from "../../components/portal/OrdersTable.vue";
import PortalShell from "../../components/portal/PortalShell.vue";
import { orders, store as storeApi, subscription } from "../../lib/portal/api";
import { day, describe, titleCase } from "../../lib/portal/format";
import { session } from "../../lib/portal/session";
import { toast } from "../../lib/portal/toast";
import type { Order, StoreDetails, Subscription } from "../../lib/portal/types";

const store = session.store;
const details = ref<StoreDetails | null>(null);
const overview = ref<{ total_orders: number; total_customers: number; total_cancellation: number } | null>(null);
const recent = ref<Order[]>([]);
const sub = ref<Subscription | null>(null);
const planTitles = ref<Record<string, string>>({});
const open = ref<Order | null>(null);
const error = ref("");
const toggling = ref(false);

async function load() {
	const jobs: Promise<void>[] = [];
	if (session.can("view-store"))
		jobs.push(storeApi.details().then((d) => void (details.value = d)));
	if (session.can("view-orders")) {
		jobs.push(storeApi.overview().then((o) => void (overview.value = o)));
		jobs.push(orders.recent().then((r) => void (recent.value = r.slice(0, 6))));
	}
	if (session.can("manage-store")) {
		jobs.push(subscription.current().then((s) => void (sub.value = s)));
		jobs.push(
			subscription
				.plans()
				.then((ps) => void (planTitles.value = Object.fromEntries(ps.map((p) => [p.plan, p.title])))),
		);
	}
	// A card failing to load shouldn't blank the others.
	const results = await Promise.allSettled(jobs);
	const failed = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
	if (failed) error.value = describe(failed.reason);
}
onMounted(load);

async function setOnline(value: boolean) {
	toggling.value = true;
	try {
		await storeApi.setOnline(value);
		if (details.value) details.value.is_online = value;
		toast(value ? "Your store is online" : "Your store is offline");
	} catch (e) {
		toast(describe(e), "bad");
	} finally {
		toggling.value = false;
	}
}
</script>

<template>
	<PortalShell :title="store?.display_name ?? 'Overview'">
		<div v-if="store && store.status !== 'active'" class="p-alert p-mb" role="alert">
			Your store is {{ store.status }}, so some actions are unavailable. Contact Mealgro support if you think this is a mistake.
		</div>
		<div v-if="error" class="p-alert p-alert--warn p-mb">{{ error }}</div>

		<div class="p-stack">
			<section v-if="details" class="p-hero arrive" aria-labelledby="st-h">
				<div>
					<span class="p-hero-h"><span class="sh sh-ci" :style="{ '--c': details.is_online ? 'var(--cat-4)' : 'var(--cat-2)' }" />Store status</span>
					<h2 id="st-h">{{ details.is_online ? "Online — taking orders" : "Offline" }}</h2>
					<p class="p-muted">{{ details.is_open ? "Within business hours" : "Outside business hours" }}</p>
				</div>
				<button
					v-if="session.can('manage-store') && store?.status === 'active'"
					class="p-btn"
					:class="{ 'p-btn--primary': !details.is_online }"
					:disabled="toggling"
					@click="setOnline(!details.is_online)"
				>
					{{ details.is_online ? "Go offline" : "Go online" }}
				</button>
			</section>

			<div class="p-grid tiles">
				<template v-if="overview">
					<section class="p-tile tone-1 arrive" style="--i: 1" aria-label="Orders">
						<span class="p-tile-h"><span class="sh sh-sq" />Orders</span>
						<strong>{{ overview.total_orders.toLocaleString() }}</strong>
					</section>
					<section class="p-tile tone-4 arrive" style="--i: 2" aria-label="Customers">
						<span class="p-tile-h"><span class="sh sh-di" />Customers</span>
						<strong>{{ overview.total_customers.toLocaleString() }}</strong>
					</section>
					<section class="p-tile p-card arrive" style="--i: 3" aria-label="Cancellations">
						<span class="p-tile-h"><span class="sh sh-tr" :style="{ '--c': 'var(--bad)' }" />Cancellations</span>
						<strong>{{ overview.total_cancellation.toLocaleString() }}</strong>
					</section>
				</template>
				<section v-if="sub" class="p-tile tone-2 arrive" style="--i: 4" aria-label="Plan">
					<span class="p-tile-h"><span class="sh sh-cd" />Plan</span>
					<strong>{{ planTitles[sub.plan] ?? titleCase(sub.plan) }}</strong>
					<small>
						<template v-if="sub.status === 'paused'">Payment due</template>
						<template v-else-if="sub.plan !== 'starter'">{{ sub.renews ? "Renews" : "Ends" }} {{ day(sub.expires_at) }}</template>
						<template v-else>Free plan</template>
						· <a href="/account/subscription">Manage</a>
					</small>
				</section>
			</div>
		</div>

		<section v-if="session.can('view-orders')" class="p-mt arrive" style="--i: 5">
			<div class="p-row p-between p-mb-sm">
				<h2>Recent orders</h2>
				<a href="/account/orders">View all</a>
			</div>
			<div class="p-card p-card--flush">
				<OrdersTable :orders="recent" empty="No orders yet." @open="open = $event" />
			</div>
		</section>

		<OrderDetail v-if="open" :order="open" @close="open = null" @changed="load" />
	</PortalShell>
</template>

<style scoped>
.tiles {
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.p-tile strong {
	overflow-wrap: anywhere;
}
.tiles > :last-child:nth-child(odd) {
	grid-column: 1 / -1;
}
.p-tile.tone-2 small a {
	color: inherit;
	font-weight: 700;
	text-decoration: underline;
}
</style>

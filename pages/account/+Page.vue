<script setup lang="ts">
import { onMounted, ref } from "vue";
import OrderDetail from "../../components/portal/OrderDetail.vue";
import OrdersTable from "../../components/portal/OrdersTable.vue";
import HeroPanel from "../../components/portal/HeroPanel.vue";
import PortalShell from "../../components/portal/PortalShell.vue";
import StatTile from "../../components/portal/StatTile.vue";
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
const loading = ref(true);
const toggling = ref(false);
/** Orders past their delivery time and waiting on the store. */
const attention = ref(0);

async function load() {
	error.value = "";
	const jobs: Promise<void>[] = [];
	if (session.can("view-store"))
		jobs.push(storeApi.details().then((d) => void (details.value = d)));
	if (session.can("view-orders")) {
		jobs.push(storeApi.overview().then((o) => void (overview.value = o)));
		jobs.push(
			Promise.all([orders.recent(), orders.attention().catch(() => [] as Order[])]).then(([today, late]) => {
				attention.value = late.length;
				const ids = new Set(late.map((o) => o.id));
				// Late orders first, then today's, six in all.
				recent.value = [...late, ...today.filter((o) => !ids.has(o.id))].slice(0, 6);
			}),
		);
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
	loading.value = false;
}
onMounted(load);

async function setOnline(value: boolean) {
	if (toggling.value) return;
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
	<PortalShell title="Overview">
		<div v-if="store && store.status !== 'active'" class="p-alert" role="alert">
			Your store is {{ store.status }}, so some actions are unavailable. Contact Mealgro support if you think this is a mistake.
		</div>
		<div v-if="error" class="p-alert p-alert--warn" role="alert">
			{{ error }}
			<button class="p-btn p-btn--sm" type="button" @click="load">Retry</button>
		</div>

		<h2 class="ov-name disp arrive">{{ store?.display_name ?? "Your store" }}</h2>

		<div class="ov-grid">
			<HeroPanel
				v-if="details"
				class="ov-hero"
				eyebrow="Store status"
				shape="ci"
				:color="details.is_online ? 'var(--cat-4)' : 'var(--cat-2)'"
				:title="details.is_online ? 'Online — taking orders' : 'Offline'"
				:lead="details.is_open ? 'Within business hours' : 'Outside business hours'"
			>
				<template v-if="session.can('manage-store') && store?.status === 'active'" #aside>
					<button class="p-btn" :class="{ 'p-btn--primary': !details.is_online }" :disabled="toggling" @click="setOnline(!details.is_online)">
						{{ details.is_online ? "Go offline" : "Go online" }}
					</button>
				</template>
			</HeroPanel>
			<div v-else-if="loading" class="p-skeleton p-skeleton--block ov-hero" aria-hidden="true" />

			<div class="ov-tiles">
				<template v-if="overview">
					<StatTile
						href="/account/orders"
						:order="0"
						:tone="attention ? 5 : 0"
						shape="di"
						color="var(--bad)"
						label="Needs attention"
						:value="attention.toLocaleString()"
						:sub="attention ? 'Past their delivery time' : 'Nothing is late'"
					/>
					<StatTile :order="1" :tone="1" shape="sq" label="Orders" :value="overview.total_orders.toLocaleString()" />
					<StatTile :order="2" :tone="2" shape="ci" label="Customers" :value="overview.total_customers.toLocaleString()" />
					<StatTile :order="3" :tone="0" shape="tr" color="var(--bad)" label="Cancellations" :value="overview.total_cancellation.toLocaleString()" />
				</template>
				<template v-else-if="loading && session.can('view-orders')">
					<div v-for="i in 4" :key="i" class="p-skeleton p-skeleton--block" aria-hidden="true" />
				</template>
				<StatTile
					v-if="sub"
					:order="4"
					:tone="3"
					shape="cd"
					label="Plan"
					:value="planTitles[sub.plan] ?? titleCase(sub.plan)"
					:sub="sub.status === 'paused' ? 'Payment due' : sub.plan !== 'starter' ? `${sub.renews ? 'Renews' : 'Ends'} ${day(sub.expires_at)}` : 'Free plan'"
				>
					<a class="manage p-tap" href="/account/subscription">Manage plan →</a>
				</StatTile>
			</div>
		</div>

		<section v-if="session.can('view-orders')" class="card-box card-box--flush arrive" style="--i: 5" aria-labelledby="ov-recent">
			<div class="card-h ov-recent-h">
				<div>
					<h3 id="ov-recent">Today's orders</h3>
					<p>Placed today on this branch, and any that are late</p>
				</div>
				<a class="link p-tap" href="/account/orders">View all</a>
			</div>
			<OrdersTable :orders="recent" :loading="loading" empty="No orders today." @open="open = $event" />
		</section>

		<OrderDetail v-if="open" :order="open" @close="open = null" @changed="load" />
	</PortalShell>
</template>

<style scoped>
.ov-name {
	font-size: clamp(32px, 5vw, 48px);
	line-height: 1;
	letter-spacing: -0.04em;
	overflow-wrap: anywhere;
}
.ov-grid {
	display: grid;
	gap: 20px;
	grid-template-columns: minmax(0, 1fr);
}
.ov-tiles {
	display: grid;
	gap: 20px;
	grid-template-columns: repeat(2, minmax(0, 1fr));
}
.ov-tiles > :last-child:nth-child(odd) {
	grid-column: 1 / -1;
}
.ov-hero {
	min-height: 144px;
}
.manage {
	font-weight: 700;
	font-size: 13px;
	text-underline-offset: 3px;
	margin-top: 2px;
}
.ov-recent-h {
	padding: 24px 24px 12px;
}
@media (min-width: 1280px) {
	.ov-grid {
		grid-template-columns: repeat(5, minmax(0, 1fr));
	}
	.ov-hero {
		grid-column: span 2;
	}
	.ov-tiles {
		grid-column: span 3;
	}
}
@media (max-width: 559px) {
	/* Four tiles in a 2x2, so the orders are not four screens down. */
	.ov-tiles {
		gap: 12px;
	}
	.ov-tiles :deep(.p-tile) {
		padding: 16px;
	}
}
</style>

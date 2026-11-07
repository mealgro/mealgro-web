<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import OrderDetail from "../../../components/portal/OrderDetail.vue";
import OrdersTable from "../../../components/portal/OrdersTable.vue";
import PortalShell from "../../../components/portal/PortalShell.vue";
import { orders as api } from "../../../lib/portal/api";
import { describe } from "../../../lib/portal/format";
import { session } from "../../../lib/portal/session";
import type { Order } from "../../../lib/portal/types";

const tab = ref<"live" | "history">("live");
const now = new Date();
const month = ref(now.getMonth() + 1);
const list = ref<Order[]>([]);
const loading = ref(true);
const error = ref("");
const open = ref<Order | null>(null);
let timer: ReturnType<typeof setInterval> | undefined;
/** The newest request wins: a slow answer for the old tab never lands. */
let seq = 0;

/** The months of this year up to now: the API answers for the current year
 *  only, and a future month has nothing in it. */
const months = Array.from({ length: now.getMonth() + 1 }, (_, i) => ({
	value: i + 1,
	label: new Date(now.getFullYear(), i, 1).toLocaleString("en-NG", { month: "long", year: "numeric" }),
}));

async function load(quiet = false) {
	const mine = ++seq;
	if (!quiet) loading.value = true;
	error.value = "";
	try {
		let rows: Order[];
		if (tab.value === "live") {
			// Today's orders, plus any late one from an earlier day.
			const [today, late] = await Promise.all([api.recent(), api.attention().catch(() => [] as Order[])]);
			const ids = new Set(today.map((o) => o.id));
			rows = [...today, ...late.filter((o) => !ids.has(o.id))];
		} else rows = await api.history(month.value);
		if (mine === seq) list.value = rows;
	} catch (e) {
		if (mine === seq) {
			error.value = describe(e);
			// A failed load shows its error, never the other tab's rows.
			if (!quiet) list.value = [];
		}
	} finally {
		if (mine === seq) loading.value = false;
	}
}

// Another tab or month: forget the old rows before the new ones arrive.
watch([tab, month], () => {
	list.value = [];
	load();
});
const canView = computed(() => session.can("view-orders"));
onMounted(() => {
	if (!canView.value) return;
	load();
	// New orders arrive while the page is open.
	timer = setInterval(() => tab.value === "live" && !open.value && load(true), 20000);
});
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
	<PortalShell title="Orders" need="view-orders">
		<template #actions>
			<select v-if="tab === 'history'" v-model.number="month" class="p-input p-input--auto" aria-label="Month">
				<option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
			</select>
			<div class="p-tabs" role="group" aria-label="Orders view">
				<button :aria-pressed="tab === 'live'" @click="tab = 'live'">Today</button>
				<button :aria-pressed="tab === 'history'" @click="tab = 'history'">History</button>
			</div>
		</template>

		<div v-if="error && list.length" class="p-alert" role="alert">
			{{ error }}
			<button class="p-btn p-btn--sm" type="button" @click="load()">Retry</button>
		</div>
		<section class="card-box card-box--flush arrive" :aria-label="tab === 'live' ? 'Today\'s orders' : 'Order history'">
			<OrdersTable
				:orders="list"
				:loading="loading"
				:error="error"
				:empty="tab === 'live' ? 'No orders today.' : 'No orders in this month.'"
				@open="open = $event"
				@retry="load()"
			/>
		</section>

		<OrderDetail v-if="open" :order="open" @close="open = null" @changed="load(true)" />
	</PortalShell>
</template>

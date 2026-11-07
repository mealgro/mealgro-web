<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import OrderDetail from "../../../components/portal/OrderDetail.vue";
import OrdersTable from "../../../components/portal/OrdersTable.vue";
import PortalShell from "../../../components/portal/PortalShell.vue";
import { orders as api } from "../../../lib/portal/api";
import { describe } from "../../../lib/portal/format";
import type { Order } from "../../../lib/portal/types";

const tab = ref<"live" | "history">("live");
const month = ref(new Date().getMonth() + 1);
const list = ref<Order[]>([]);
const loading = ref(true);
const error = ref("");
const open = ref<Order | null>(null);
let timer: ReturnType<typeof setInterval> | undefined;

const months = Array.from({ length: 12 }, (_, i) =>
	new Date(2000, i, 1).toLocaleString("en", { month: "long" }),
);

async function load(quiet = false) {
	if (!quiet) loading.value = true;
	error.value = "";
	try {
		list.value = tab.value === "live" ? await api.recent() : await api.history(month.value);
	} catch (e) {
		error.value = describe(e);
	} finally {
		loading.value = false;
	}
}

watch([tab, month], () => load());
onMounted(() => {
	load();
	// New orders arrive while the page is open.
	timer = setInterval(() => tab.value === "live" && !open.value && load(true), 20000);
});
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
	<PortalShell title="Orders">
		<template #actions>
			<select v-if="tab === 'history'" v-model.number="month" class="p-input p-input--auto" aria-label="Month">
				<option v-for="(m, i) in months" :key="m" :value="i + 1">{{ m }}</option>
			</select>
			<div class="p-tabs" role="group" aria-label="Orders view">
				<button :aria-pressed="tab === 'live'" @click="tab = 'live'">Recent</button>
				<button :aria-pressed="tab === 'history'" @click="tab = 'history'">History</button>
			</div>
		</template>

		<div v-if="error && list.length" class="p-alert" role="alert">{{ error }}</div>
		<section class="card-box card-box--flush arrive" :aria-label="tab === 'live' ? 'Recent orders' : 'Order history'">
			<OrdersTable
				:orders="list"
				:loading="loading"
				:error="error"
				:empty="tab === 'live' ? 'No recent orders yet.' : 'No orders in this month.'"
				@open="open = $event"
				@retry="load()"
			/>
		</section>

		<OrderDetail v-if="open" :order="open" @close="open = null" @changed="load(true)" />
	</PortalShell>
</template>

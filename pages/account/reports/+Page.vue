<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import PortalShell from "../../../components/portal/PortalShell.vue";
import { reports, type ReportQuery } from "../../../lib/portal/api";
import { describe } from "../../../lib/portal/format";
import { session } from "../../../lib/portal/session";
import { toast } from "../../../lib/portal/toast";
import type { Report } from "../../../lib/portal/types";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const today = new Date();

const several = computed(() => session.stores.value.length > 1);
const q = ref<ReportQuery>({
	scope: "branch",
	from: iso(new Date(today.getTime() - 29 * 864e5)),
	to: iso(today),
	group: "day",
});
const report = ref<Report | null>(null);
const loading = ref(false);
const error = ref("");
const exporting = ref<"" | "csv" | "xlsx">("");

async function load() {
	loading.value = true;
	error.value = "";
	try {
		report.value = await reports.get(q.value);
	} catch (e) {
		error.value = describe(e);
	} finally {
		loading.value = false;
	}
}
// The session loads with the page shell; a business with several branches
// opens on all of them once it is known.
watch(
	several,
	(yes) => {
		if (yes) q.value.scope = "brand";
	},
	{ immediate: true },
);
onMounted(load);
watch(q, load, { deep: true });

async function download(format: "csv" | "xlsx") {
	exporting.value = format;
	try {
		const blob = await reports.export(q.value, format);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `mealgro-report-${q.value.from}-to-${q.value.to}.${format}`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	} catch (e) {
		toast(describe(e), "bad");
	} finally {
		exporting.value = "";
	}
}

const money = (n: number) => `${report.value?.symbol ?? ""}${n.toLocaleString("en-NG")}`;
const peak = computed(() => Math.max(1, ...(report.value?.series ?? []).map((p) => p.gross_sales)));
const periodLabel = (iso: string) =>
	new Date(iso).toLocaleDateString("en-NG", {
		day: q.value.group === "month" ? undefined : "numeric",
		month: "short",
		year: q.value.group === "month" ? "numeric" : undefined,
	});
</script>

<template>
	<PortalShell title="Reports">
		<template #actions>
			<button class="p-btn" :disabled="!!exporting" @click="download('csv')">{{ exporting === "csv" ? "Exporting…" : "Export CSV" }}</button>
			<button class="p-btn" :disabled="!!exporting" @click="download('xlsx')">{{ exporting === "xlsx" ? "Exporting…" : "Export Excel" }}</button>
		</template>

		<div class="p-card filters">
			<div v-if="several" class="p-tabs" role="group" aria-label="Report scope">
				<button :aria-pressed="q.scope === 'brand'" @click="q.scope = 'brand'">All branches</button>
				<button :aria-pressed="q.scope === 'branch'" @click="q.scope = 'branch'">{{ session.store.value?.branch_label || "This branch" }}</button>
			</div>
			<label class="p-field"><span>From</span><input v-model="q.from" class="p-input" type="date" :max="q.to" /></label>
			<label class="p-field"><span>To</span><input v-model="q.to" class="p-input" type="date" :min="q.from" /></label>
			<label class="p-field"><span>Group by</span>
				<select v-model="q.group" class="p-input">
					<option value="day">Day</option><option value="week">Week</option><option value="month">Month</option>
				</select>
			</label>
		</div>

		<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
		<p v-else-if="loading && !report" class="p-muted">Loading…</p>
		<template v-else-if="report">
			<p v-if="report.scope === 'brand' && report.branches.length < session.stores.value.length" class="p-alert p-alert--warn">
				This total covers {{ report.branches.length }} of your {{ session.stores.value.length }} branches — the ones where you can see finances.
			</p>
			<div class="p-grid stats">
				<div class="p-card p-stat"><strong>{{ money(report.totals.gross_sales) }}</strong><span>Gross sales</span></div>
				<div class="p-card p-stat"><strong>{{ money(report.totals.earnings) }}</strong><span>Your earnings</span></div>
				<div class="p-card p-stat"><strong>{{ report.totals.completed.toLocaleString() }}</strong><span>Completed of {{ report.totals.orders.toLocaleString() }} orders</span></div>
				<div class="p-card p-stat"><strong>{{ money(report.totals.average_order) }}</strong><span>Average order</span></div>
				<div class="p-card p-stat"><strong>{{ report.totals.cancelled.toLocaleString() }}</strong><span>Cancelled or rejected</span></div>
			</div>

			<section v-if="report.scope === 'brand' && report.branches.length > 1" class="p-card block">
				<h2>By branch</h2>
				<div class="p-scroll">
					<table class="p-table">
						<thead><tr><th>Branch</th><th>Orders</th><th>Completed</th><th>Cancelled</th><th>Gross sales</th><th>Earnings</th></tr></thead>
						<tbody>
							<tr v-for="b in report.branches" :key="b.store">
								<td><strong>{{ b.display_name }}</strong></td>
								<td>{{ b.totals.orders }}</td><td>{{ b.totals.completed }}</td><td>{{ b.totals.cancelled }}</td>
								<td>{{ money(b.totals.gross_sales) }}</td><td>{{ money(b.totals.earnings) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<div class="p-grid two-col">
				<section class="p-card block">
					<h2>Sales over time</h2>
					<p v-if="!report.series.length" class="p-muted">No sales in this period.</p>
					<ul v-else class="bars" role="list">
						<li v-for="p in report.series" :key="p.period">
							<span class="when">{{ periodLabel(p.period) }}</span>
							<span class="bar" :aria-label="money(p.gross_sales)"><span :style="{ width: `${(p.gross_sales / peak) * 100}%` }" /></span>
							<span class="amt">{{ money(p.gross_sales) }}</span>
						</li>
					</ul>
				</section>
				<section class="p-card block">
					<h2>Top items</h2>
					<p v-if="!report.top_items.length" class="p-muted">Nothing sold in this period.</p>
					<table v-else class="p-table">
						<thead><tr><th>Item</th><th>Sold</th><th>Sales</th></tr></thead>
						<tbody>
							<tr v-for="i in report.top_items" :key="i.name"><td>{{ i.name }}</td><td>{{ i.quantity }}</td><td>{{ money(i.sales) }}</td></tr>
						</tbody>
					</table>
				</section>
			</div>
		</template>
	</PortalShell>
</template>

<style scoped>
.filters {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-end;
	gap: 14px;
	margin-bottom: 16px;
}
.filters .p-field {
	min-width: 140px;
}
.stats {
	grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
	margin: 14px 0;
}
.block {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-bottom: 14px;
}
.two-col {
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
.bars {
	display: flex;
	flex-direction: column;
	gap: 6px;
}
.bars li {
	display: grid;
	grid-template-columns: 64px 1fr auto;
	align-items: center;
	gap: 10px;
	font-size: 13px;
}
.when {
	color: var(--muted);
}
.bar {
	height: 10px;
	background: var(--line);
	border-radius: 999px;
	overflow: hidden;
}
.bar span {
	display: block;
	height: 100%;
	background: var(--brand);
	border-radius: 999px;
}
.amt {
	font-variant-numeric: tabular-nums;
}
</style>

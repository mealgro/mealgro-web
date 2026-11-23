<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import HeroPanel from "../../../components/portal/HeroPanel.vue";
import PortalShell from "../../../components/portal/PortalShell.vue";
import StatTile from "../../../components/portal/StatTile.vue";
import StateBlock from "../../../components/portal/StateBlock.vue";
import { reports, type ReportQuery } from "../../../lib/portal/api";
import { describe, formatMoney } from "../../../lib/portal/format";
import { session } from "../../../lib/portal/session";
import { toast } from "../../../lib/portal/toast";
import type { Report } from "../../../lib/portal/types";

/** A date as the viewer's calendar has it (toISOString would give the UTC day,
 *  yesterday for the first hour of a Nigerian morning). */
const iso = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

/** The range as a sentence in the one date format (9 Oct 2026). */
const dayOnly = (s: string) =>
	new Date(`${s}T12:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
/** A range that can't be asked for says why, instead of quietly showing ₦0. */
const rangeError = computed(() => {
	if (!q.value.from || !q.value.to) return "Choose both a start and an end date.";
	if (q.value.from > q.value.to) return "The start date is after the end date.";
	return "";
});
const rangeText = computed(() => (rangeError.value ? "" : `${dayOnly(q.value.from)} to ${dayOnly(q.value.to)}`));

let seq = 0;
async function load() {
	if (rangeError.value || !session.can("view-finances")) return;
	const mine = ++seq;
	loading.value = true;
	error.value = "";
	try {
		const r = await reports.get(q.value);
		if (mine === seq) report.value = r;
	} catch (e) {
		if (mine === seq) error.value = describe(e);
	} finally {
		if (mine === seq) loading.value = false;
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
		toast(describe(e), "bad", () => download(format));
	} finally {
		exporting.value = "";
	}
}

const money = (n: number) => formatMoney(n, report.value?.symbol ?? "");
const peak = computed(() => Math.max(1, ...(report.value?.series ?? []).map((p) => p.earnings)));
const completedShare = computed(() => {
	const t = report.value?.totals;
	return t && t.orders ? `${Math.round((t.completed / t.orders) * 100)}% of orders` : "";
});
const periodLabel = (iso: string) =>
	new Date(iso).toLocaleDateString("en-NG", {
		day: q.value.group === "month" ? undefined : "numeric",
		month: "short",
		year: q.value.group === "month" ? "numeric" : undefined,
	});
</script>

<template>
	<PortalShell title="Reports" need="view-finances">
		<template #actions>
			<button class="p-btn" :disabled="!!exporting" @click="download('csv')">{{ exporting === "csv" ? "Exporting…" : "Export CSV" }}</button>
			<button class="p-btn" :disabled="!!exporting" @click="download('xlsx')">{{ exporting === "xlsx" ? "Exporting…" : "Export Excel" }}</button>
		</template>

		<section class="card-box filters arrive" aria-label="Report period">
			<div v-if="several" class="p-tabs" role="group" aria-label="Report scope">
				<button :aria-pressed="q.scope === 'brand'" @click="q.scope = 'brand'">All branches</button>
				<button :aria-pressed="q.scope === 'branch'" @click="q.scope = 'branch'">{{ session.store.value?.branch_label || "This branch" }}</button>
			</div>
			<label class="p-field"><span>From</span><input v-model="q.from" class="p-input" type="date" :max="q.to" lang="en-NG" /></label>
			<label class="p-field"><span>To</span><input v-model="q.to" class="p-input" type="date" :min="q.from" lang="en-NG" /></label>
			<label class="p-field"><span>Group by</span>
				<select v-model="q.group" class="p-input">
					<option value="day">Day</option><option value="week">Week</option><option value="month">Month</option>
				</select>
			</label>
		</section>

		<p v-if="rangeError" class="p-alert p-alert--warn" role="alert">{{ rangeError }}</p>
		<StateBlock v-else-if="error || (loading && !report)" class="card-box" :loading="!error" :error="error" :lines="4" @retry="load" />
		<template v-else-if="report">
			<p v-if="report.scope === 'brand' && report.branches.length < session.stores.value.length" class="p-alert p-alert--warn">
				This total covers {{ report.branches.length }} of your {{ session.stores.value.length }} branches — the ones where you can see finances.
			</p>
			<div class="stats">
				<HeroPanel
					class="stats-hero"
					numeric
					eyebrow="Your earnings"
					shape="ci"
					color="var(--cat-2)"
					:title="money(report.totals.earnings)"
					:lead="rangeText"
				/>
				<div class="stats-tiles">
					<StatTile :order="1" :tone="1" shape="sq" label="Orders" :value="report.totals.orders.toLocaleString()" />
					<StatTile :order="2" :tone="4" shape="di" label="Completed" :value="report.totals.completed.toLocaleString()" :sub="completedShare" />
					<StatTile :order="3" :tone="3" shape="cd" label="Average earning" :value="money(report.totals.average_earning)" sub="per completed order" />
					<StatTile :order="4" :tone="5" shape="tr" label="Cancelled or rejected" :value="report.totals.cancelled.toLocaleString()" />
				</div>
			</div>

			<section v-if="report.scope === 'brand' && report.branches.length > 1" class="card-box card-box--flush arrive" style="--i: 5" aria-labelledby="rp-branch">
				<div class="card-h pad"><h3 id="rp-branch">By branch</h3></div>
				<div class="p-scroll">
					<table class="p-table">
						<thead><tr><th>Branch</th><th class="num">Orders</th><th class="num">Completed</th><th class="num">Cancelled</th><th class="num">Earnings</th></tr></thead>
						<tbody>
							<tr v-for="b in report.branches" :key="b.store">
								<td data-primary><strong>{{ b.display_name }}</strong></td>
								<td class="num" data-label="Orders">{{ b.totals.orders }}</td>
								<td class="num" data-label="Completed">{{ b.totals.completed }}</td>
								<td class="num" data-label="Cancelled">{{ b.totals.cancelled }}</td>
								<td class="num" data-label="Earnings">{{ money(b.totals.earnings) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<div class="two-col">
				<section class="card-box arrive" style="--i: 6" aria-labelledby="rp-sales">
					<h3 id="rp-sales" class="chart-h"><span class="sh sh-ci" style="--c: var(--cat-2)" />Earnings over time</h3>
					<StateBlock :empty="!report.series.length" empty-text="No earnings in this period.">
						<ul class="bars" role="list">
							<li v-for="p in report.series" :key="p.period">
								<span class="when">{{ periodLabel(p.period) }}</span>
								<span class="bar" :aria-label="money(p.earnings)"><span class="grow-x" :style="{ width: `${(p.earnings / peak) * 100}%` }" /></span>
								<span class="amt">{{ money(p.earnings) }}</span>
							</li>
						</ul>
					</StateBlock>
				</section>
				<section class="card-box card-box--flush arrive" style="--i: 7" aria-labelledby="rp-items">
					<div class="card-h pad"><h3 id="rp-items">Top items</h3></div>
					<StateBlock :empty="!report.top_items.length" empty-text="Nothing sold in this period.">
						<table class="p-table">
							<thead><tr><th>Item</th><th class="num">Sold</th></tr></thead>
							<tbody>
								<tr v-for="i in report.top_items" :key="i.name">
									<td data-primary>{{ i.name }}</td>
									<td class="num" data-label="Sold">{{ i.quantity }}</td>
								</tr>
							</tbody>
						</table>
					</StateBlock>
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
}
.filters .p-field {
	min-width: 140px;
	flex: 1 1 140px;
	max-width: 220px;
}
.stats {
	display: grid;
	gap: 20px;
	grid-template-columns: minmax(0, 1fr);
}
.stats-tiles {
	display: grid;
	gap: 20px;
	grid-template-columns: repeat(2, minmax(0, 1fr));
}
.pad {
	padding: 24px 24px 12px;
}
.two-col {
	display: grid;
	gap: 20px;
	grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr));
	align-items: start;
}
.chart-h {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 16px;
}
.bars {
	display: flex;
	flex-direction: column;
	gap: 8px;
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
	height: 12px;
	background: var(--bg);
	border-radius: 9999px;
	overflow: hidden;
}
.bar span {
	display: block;
	height: 100%;
	background: var(--cat-2);
	border-radius: 9999px;
}
.amt {
	font-variant-numeric: tabular-nums;
}
@media (min-width: 1280px) {
	.stats {
		grid-template-columns: repeat(5, minmax(0, 1fr));
	}
	.stats-hero {
		grid-column: span 2;
	}
	.stats-tiles {
		grid-column: span 3;
	}
}
@media (max-width: 559px) {
	.stats-tiles {
		grid-template-columns: minmax(0, 1fr);
	}
	.filters .p-field {
		max-width: none;
	}
}
</style>

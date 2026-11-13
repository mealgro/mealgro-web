<script setup lang="ts">
// A campaign's day-by-day numbers: one measure at a time (impressions,
// clicks or spend), one series, bars on one axis. Each bar has a hover /
// focus tooltip, and the same numbers are there as a table.
import { computed, ref } from "vue";
import { count, money } from "../../lib/ads/format";
import { addDays, showDay } from "../../lib/ads/market";
import type { Amount, DailyStat } from "../../lib/ads/types";

const props = defineProps<{ days: DailyStat[]; currency: Amount }>();

type Measure = "impressions" | "clicks" | "spend";
const measure = ref<Measure>("impressions");
const LABEL: Record<Measure, string> = { impressions: "Impressions", clicks: "Clicks", spend: "Spend" };

/** Every day from the first to the last, with the quiet ones as zero. */
const series = computed(() => {
	const sorted = props.days.slice().sort((a, b) => a.day.localeCompare(b.day));
	if (!sorted.length) return [];
	const byDay = new Map(sorted.map((d) => [d.day, d]));
	const out: DailyStat[] = [];
	const last = sorted[sorted.length - 1].day;
	for (let d = sorted[0].day; d <= last && out.length < 400; d = addDays(d, 1)) {
		out.push(byDay.get(d) ?? { day: d, impressions: 0, clicks: 0, spend: { ...props.currency, amount: 0 } });
	}
	return out;
});

const value = (d: DailyStat) => (measure.value === "spend" ? d.spend.amount : d[measure.value]);
const show = (d: DailyStat) => (measure.value === "spend" ? money(d.spend) : count(value(d)));

/** A round top for the axis: 1, 2 or 5 × a power of ten. */
const top = computed(() => {
	const max = Math.max(0, ...series.value.map(value));
	if (max <= 0) return 1;
	const p = 10 ** Math.floor(Math.log10(max));
	return ([1, 2, 5, 10].find((m) => m * p >= max) ?? 10) * p;
});
const axisLabel = (v: number) =>
	measure.value === "spend" ? money({ ...props.currency, amount: v }) : count(v);

const H = 180;
const hover = ref<number | null>(null);
const table = ref(false);
</script>

<template>
	<div class="chart p-stack-sm">
		<div class="p-row p-wrap p-between">
			<div class="p-tabs" role="group" aria-label="Measure">
				<button v-for="m in (['impressions', 'clicks', 'spend'] as Measure[])" :key="m" type="button" :aria-pressed="measure === m" @click="measure = m">
					{{ LABEL[m] }}
				</button>
			</div>
			<button class="link p-tap" type="button" :aria-pressed="table" @click="table = !table">
				{{ table ? "Show the chart" : "Show as a table" }}
			</button>
		</div>

		<div v-if="!table" class="plot" :aria-label="`${LABEL[measure]} by day`" role="group">
			<div class="axis" aria-hidden="true">
				<span>{{ axisLabel(top) }}</span>
				<span>{{ axisLabel(top / 2) }}</span>
				<span>0</span>
			</div>
			<div class="bars" :style="{ height: `${H}px` }">
				<div class="grid" aria-hidden="true"><i /><i /><i /></div>
				<button
					v-for="(d, i) in series"
					:key="d.day"
					class="col"
					type="button"
					:aria-label="`${showDay(d.day)}: ${show(d)} ${measure === 'spend' ? 'spent' : LABEL[measure].toLowerCase()}`"
					@mouseenter="hover = i"
					@mouseleave="hover = null"
					@focus="hover = i"
					@blur="hover = null"
				>
					<span class="bar grow-y" :style="{ height: `${(value(d) / top) * 100}%` }" />
					<span v-if="hover === i" class="tip" role="tooltip" :class="{ left: i > series.length / 2 }">
						<strong>{{ show(d) }}</strong>
						<span>{{ showDay(d.day) }}</span>
					</span>
				</button>
			</div>
			<div class="xs" aria-hidden="true">
				<span>{{ showDay(series[0]?.day) }}</span>
				<span v-if="series.length > 1">{{ showDay(series[series.length - 1]?.day) }}</span>
			</div>
		</div>

		<div v-else class="p-scroll">
			<table class="p-table table-scroll">
				<thead>
					<tr><th>Day</th><th class="num">Impressions</th><th class="num">Clicks</th><th class="num">Spend</th></tr>
				</thead>
				<tbody>
					<tr v-for="d in series.slice().reverse()" :key="d.day">
						<td>{{ showDay(d.day) }}</td>
						<td class="num">{{ count(d.impressions) }}</td>
						<td class="num">{{ count(d.clicks) }}</td>
						<td class="num">{{ money(d.spend) }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<style scoped>
.plot {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr);
	grid-template-rows: auto auto;
	gap: 6px 10px;
}
.axis {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: flex-end;
	font-size: 11px;
	color: var(--muted);
	font-variant-numeric: tabular-nums;
	transform: translateY(-0.5em);
}
.bars {
	position: relative;
	display: flex;
	align-items: flex-end;
	gap: 2px;
	border-bottom: 1px solid var(--line);
}
.grid {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	pointer-events: none;
}
.grid i {
	display: block;
	border-top: 1px dashed color-mix(in srgb, var(--line) 80%, transparent);
}
.grid i:last-child {
	border: 0;
}
.col {
	position: relative;
	flex: 1 1 0;
	min-width: 3px;
	max-width: 40px;
	height: 100%;
	display: flex;
	align-items: flex-end;
	padding: 0;
	border: 0;
	background: transparent;
	cursor: default;
}
.col:hover .bar,
.col:focus-visible .bar {
	background: color-mix(in srgb, var(--cat-1) 80%, var(--ink));
}
.bar {
	display: block;
	width: 100%;
	min-height: 0;
	border-radius: 4px 4px 0 0;
	background: var(--cat-1);
}
.tip {
	position: absolute;
	bottom: calc(100% + 6px);
	left: 50%;
	z-index: 2;
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 8px 10px;
	border-radius: 0.75rem;
	background: var(--surface);
	border: 1px solid var(--line);
	box-shadow: 0 6px 24px color-mix(in srgb, var(--ink) 15%, transparent);
	white-space: nowrap;
	font-size: 12px;
	color: var(--muted);
	pointer-events: none;
}
.tip.left {
	left: auto;
	right: 50%;
}
.tip strong {
	color: var(--ink);
	font-size: 14px;
	font-variant-numeric: tabular-nums;
}
.xs {
	grid-column: 2;
	display: flex;
	justify-content: space-between;
	font-size: 11px;
	color: var(--muted);
}
@media (prefers-reduced-motion: no-preference) {
	.grow-y {
		animation: grow-y 0.5s var(--ease) both;
		transform-origin: bottom;
	}
	@keyframes grow-y {
		from {
			transform: scaleY(0);
		}
	}
}
</style>

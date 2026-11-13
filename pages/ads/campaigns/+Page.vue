<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AdsShell from "../../../components/ads/AdsShell.vue";
import TableState from "../../../components/portal/TableState.vue";
import { campaigns as campaignsApi } from "../../../lib/ads/api";
import { count, describe, formatLabel, money, statusLabel, statusTone } from "../../../lib/ads/format";
import { endDay, showDay, startDay } from "../../../lib/ads/market";
import { session } from "../../../lib/ads/session";
import type { Campaign, CampaignStatus } from "../../../lib/ads/types";

const list = ref<Campaign[] | null>(null);
const error = ref("");

type Show = "all" | "live" | "review" | "drafts" | "done";
const show = ref<Show>("all");
const FILTERS: { key: Show; label: string; statuses: CampaignStatus[] | null }[] = [
	{ key: "all", label: "All", statuses: null },
	{ key: "live", label: "Live", statuses: ["live", "scheduled", "paused", "exhausted"] },
	{ key: "review", label: "In review", statuses: ["in-review", "rejected"] },
	{ key: "drafts", label: "Drafts", statuses: ["draft"] },
	{ key: "done", label: "Ended", statuses: ["ended", "removed"] },
];

async function load() {
	error.value = "";
	try {
		list.value = await campaignsApi.list();
	} catch (e) {
		error.value = describe(e);
	}
}

onMounted(async () => {
	const q = new URLSearchParams(location.search).get("show") as Show | null;
	if (q && FILTERS.some((f) => f.key === q)) show.value = q;
	if (await session.restore()) await load();
});

function pick(s: Show) {
	show.value = s;
	const url = new URL(location.href);
	if (s === "all") url.searchParams.delete("show");
	else url.searchParams.set("show", s);
	history.replaceState(history.state, "", url.pathname + url.search);
}

const shown = computed(() => {
	const f = FILTERS.find((x) => x.key === show.value)?.statuses;
	return (list.value ?? []).filter((c) => !f || f.includes(c.status));
});

const dates = (c: Campaign) => {
	const from = showDay(startDay(c.starts_at, c.currency));
	const to = endDay(c.ends_at, c.currency);
	return to ? `${from} – ${showDay(to)}` : `From ${from}`;
};
</script>

<template>
	<AdsShell title="Campaigns">
		<template #actions>
			<a class="p-btn p-btn--primary" href="/ads/campaigns/new">New campaign</a>
		</template>

		<div class="p-tabs" role="group" aria-label="Show">
			<button v-for="f in FILTERS" :key="f.key" type="button" :aria-pressed="show === f.key" @click="pick(f.key)">
				{{ f.label }}
			</button>
		</div>

		<section class="card-box card-box--flush arrive" aria-label="Your campaigns">
			<div class="p-scroll">
				<table class="p-table">
					<thead>
						<tr>
							<th>Campaign</th>
							<th>Status</th>
							<th>Runs</th>
							<th class="num">Budget</th>
							<th class="num">Spent</th>
							<th class="num">Impressions</th>
							<th class="num">Clicks</th>
						</tr>
					</thead>
					<tbody>
						<TableState
							v-if="list === null || error || !shown.length"
							:loading="list === null && !error"
							:error="error || null"
							:colspan="7"
							:empty-text="list?.length ? 'No campaigns here.' : 'No campaigns yet.'"
							:empty-hint="list?.length ? undefined : 'Make your first ad: choose a format, add your image or video, pick where it shows, and set a budget.'"
							@retry="load"
						/>
						<template v-else>
							<tr v-for="c in shown" :key="c.id">
								<td data-primary>
									<a class="link" :href="`/ads/campaigns/view?id=${c.id}`">{{ c.name }}</a>
									<span class="sub">{{ formatLabel[c.format] }}</span>
								</td>
								<td data-label="Status">
									<span class="p-badge" :class="statusTone[c.status] && `p-badge--${statusTone[c.status]}`">{{ statusLabel[c.status] ?? c.status }}</span>
								</td>
								<td data-label="Runs">{{ dates(c) }}</td>
								<td class="num" data-label="Budget">{{ money(c.budget) }}</td>
								<td class="num" data-label="Spent">{{ money(c.spent) }}</td>
								<td class="num" data-label="Impressions">{{ count(c.impressions) }}</td>
								<td class="num" data-label="Clicks">{{ count(c.clicks) }}</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
		</section>
	</AdsShell>
</template>

<style scoped>
.sub {
	display: block;
	color: var(--muted);
	font-size: 12px;
	margin-top: 2px;
}
</style>

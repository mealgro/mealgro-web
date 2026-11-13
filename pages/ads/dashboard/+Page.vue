<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AdsShell from "../../../components/ads/AdsShell.vue";
import TopUpReturn from "../../../components/ads/TopUpReturn.vue";
import HeroPanel from "../../../components/portal/HeroPanel.vue";
import StatTile from "../../../components/portal/StatTile.vue";
import StateBlock from "../../../components/portal/StateBlock.vue";
import TableState from "../../../components/portal/TableState.vue";
import { campaigns as campaignsApi, me } from "../../../lib/ads/api";
import { count, dateTime, describe, money } from "../../../lib/ads/format";
import { addDays, marketToday } from "../../../lib/ads/market";
import { session } from "../../../lib/ads/session";
import type { Campaign, CampaignStats, Notice, Overview } from "../../../lib/ads/types";

const user = session.user;
const overview = ref<Overview | null>(null);
const notices = ref<Notice[] | null>(null);
const live = ref<Campaign[] | null>(null);
const stats = ref<Record<string, CampaignStats>>({});
const error = ref("");
const liveError = ref("");

/** How many live campaigns get their day's numbers fetched. */
const LIVE_SHOWN = 10;

async function loadLive() {
	liveError.value = "";
	try {
		const list = await campaignsApi.list();
		live.value = list.filter((c) => c.status === "live").slice(0, LIVE_SHOWN);
		const got = await Promise.allSettled(live.value.map((c) => campaignsApi.stats(c.id)));
		const next: Record<string, CampaignStats> = {};
		got.forEach((r, i) => {
			if (r.status === "fulfilled") next[live.value![i].id] = r.value;
		});
		stats.value = next;
	} catch (e) {
		liveError.value = describe(e);
	}
}

async function load() {
	error.value = "";
	const [o, n] = await Promise.allSettled([me.overview(), me.notices()]);
	if (o.status === "fulfilled") overview.value = o.value;
	else error.value = describe(o.reason);
	notices.value = n.status === "fulfilled" ? n.value : [];
}

onMounted(async () => {
	if (!(await session.restore())) return; // the shell sends them to sign in
	await Promise.all([load(), loadLive()]);
});

const today = computed(() => marketToday(user.value?.currency));
const weekFrom = computed(() => addDays(today.value, -6));

function dayOf(c: Campaign) {
	const s = stats.value[c.id];
	const d = s?.days.find((x) => x.day === today.value);
	return { impressions: d?.impressions ?? 0, clicks: d?.clicks ?? 0, spend: d?.spend ?? { ...c.spent, amount: 0 } };
}
function weekOf(c: Campaign) {
	const s = stats.value[c.id];
	const days = s?.days.filter((x) => x.day >= weekFrom.value) ?? [];
	return {
		impressions: days.reduce((t, d) => t + d.impressions, 0),
		clicks: days.reduce((t, d) => t + d.clicks, 0),
	};
}
</script>

<template>
	<AdsShell title="Dashboard">
		<template #actions>
			<a class="p-btn" href="/ads/wallet#top-up">Top up</a>
			<a class="p-btn p-btn--primary" href="/ads/campaigns/new">New campaign</a>
		</template>

		<TopUpReturn @paid="load" />
		<div v-if="error" class="p-alert" role="alert">
			{{ error }}
			<button class="p-btn p-btn--sm" type="button" @click="load">Retry</button>
		</div>

		<div class="top">
			<HeroPanel
				v-if="overview"
				class="top-hero"
				numeric
				eyebrow="Ad credit you can spend"
				shape="sq"
				color="var(--cat-1)"
				:title="money(overview.available)"
			>
				<p class="held">{{ money(overview.reserved) }} held for ads you've sent.</p>
				<div class="p-row p-wrap actions">
					<a class="p-btn p-btn--primary" href="/ads/wallet#top-up">Top up</a>
					<a class="p-btn hero-btn" href="/ads/wallet">See wallet</a>
				</div>
			</HeroPanel>
			<div v-else-if="!error" class="p-skeleton p-skeleton--block top-hero" aria-hidden="true" />

			<div v-if="overview" class="top-tiles">
				<StatTile :order="1" :tone="4" shape="di" label="Live now" :value="overview.live" sub="Ads showing to customers" href="/ads/campaigns?show=live" />
				<StatTile :order="2" :tone="3" shape="cd" label="In review" :value="overview.in_review" sub="Usually decided within 24 hours" href="/ads/campaigns?show=review" />
			</div>
		</div>

		<section v-if="overview" class="stats" aria-label="The last 7 days">
			<StatTile :order="3" shape="sq" color="var(--cat-1)" label="Impressions, 7 days" :value="count(overview.impressions_7d)" />
			<StatTile :order="4" shape="ci" color="var(--cat-2)" label="Clicks, 7 days" :value="count(overview.clicks_7d)" />
			<StatTile :order="5" shape="tr" color="var(--ink)" label="Spent, 7 days" :value="money(overview.spend_7d)" />
		</section>

		<section class="card-box card-box--flush arrive" style="--i: 6" aria-labelledby="ads-live-h">
			<div class="card-h pad">
				<div>
					<h2 id="ads-live-h">Live campaigns</h2>
					<p>Today and the last 7 days, in your market's time</p>
				</div>
				<a class="link p-tap" href="/ads/campaigns">All campaigns</a>
			</div>
			<div class="p-scroll">
				<table class="p-table">
					<thead>
						<tr>
							<th>Campaign</th>
							<th class="num">Today: impressions</th>
							<th class="num">Today: clicks</th>
							<th class="num">Today: spent</th>
							<th class="num">7 days: impressions</th>
							<th class="num">7 days: clicks</th>
							<th class="num">Budget left</th>
						</tr>
					</thead>
					<tbody>
						<TableState
							v-if="live === null || liveError || !live.length"
							:loading="live === null && !liveError"
							:error="liveError || null"
							:colspan="7"
							empty-text="Nothing is live right now."
							empty-hint="Ads show here once they're approved and their start date comes."
							@retry="loadLive"
						/>
						<template v-else>
							<tr v-for="c in live ?? []" :key="c.id">
								<td data-primary><a class="link" :href="`/ads/campaigns/view?id=${c.id}`">{{ c.name }}</a></td>
								<td class="num" data-label="Today: impressions">{{ count(dayOf(c).impressions) }}</td>
								<td class="num" data-label="Today: clicks">{{ count(dayOf(c).clicks) }}</td>
								<td class="num" data-label="Today: spent">{{ money(dayOf(c).spend) }}</td>
								<td class="num" data-label="7 days: impressions">{{ count(weekOf(c).impressions) }}</td>
								<td class="num" data-label="7 days: clicks">{{ count(weekOf(c).clicks) }}</td>
								<td class="num" data-label="Budget left">{{ money(c.remaining) }}</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
		</section>

		<section class="card-box arrive" style="--i: 7" aria-labelledby="ads-notices-h">
			<div class="card-h">
				<div>
					<h2 id="ads-notices-h">Notices</h2>
					<p>Review decisions and account news, newest first</p>
				</div>
			</div>
			<StateBlock :loading="notices === null" :empty="notices !== null && !notices.length" empty-text="Nothing yet." empty-hint="When a reviewer decides on an ad or a top-up lands, you'll see it here.">
				<ul class="p-list notices">
					<li v-for="(n, i) in notices ?? []" :key="`${n.at}-${i}`">
						<div>
							<strong>{{ n.title }}</strong>
							<p class="p-muted">{{ n.body }}</p>
						</div>
						<time class="sub" :datetime="n.at">{{ dateTime(n.at) }}</time>
					</li>
				</ul>
			</StateBlock>
		</section>
	</AdsShell>
</template>

<style scoped>
.top {
	display: grid;
	gap: 20px;
	grid-template-columns: minmax(0, 1fr);
}
.top-tiles {
	display: grid;
	gap: 20px;
	grid-template-columns: repeat(2, minmax(0, 1fr));
}
.stats {
	display: grid;
	gap: 20px;
	grid-template-columns: repeat(3, minmax(0, 1fr));
}
.held {
	margin: 10px 0 16px;
	opacity: 0.8;
}
.actions {
	gap: 10px;
}
.hero-btn {
	border-color: color-mix(in srgb, var(--on-hero) 50%, transparent);
	color: var(--on-hero);
}
.pad {
	padding: 24px 24px 12px;
}
.card-h {
	margin-bottom: 8px;
}
.notices .sub {
	white-space: nowrap;
}
@media (min-width: 1280px) {
	.top {
		grid-template-columns: repeat(5, minmax(0, 1fr));
	}
	.top-hero {
		grid-column: span 3;
	}
	.top-tiles {
		grid-column: span 2;
		grid-template-columns: minmax(0, 1fr);
	}
}
@media (max-width: 1023px) {
	.stats {
		grid-template-columns: minmax(0, 1fr);
	}
}
@media (max-width: 559px) {
	.top-tiles {
		gap: 12px;
	}
	.top-tiles :deep(.p-tile) {
		padding: 16px;
	}
}
</style>

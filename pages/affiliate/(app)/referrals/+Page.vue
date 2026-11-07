<script setup lang="ts">
import { onMounted, ref } from "vue";
import AffiliateShell from "../../../../components/affiliate/AffiliateShell.vue";
import TableState from "../../../../components/portal/TableState.vue";
import { me } from "../../../../lib/affiliate/api";
import {
	day,
	describe,
	money,
	referralLabel,
	referralTone,
	voidReason,
} from "../../../../lib/affiliate/format";
import { session } from "../../../../lib/affiliate/session";
import type { Referral, ReferralStatus } from "../../../../lib/affiliate/types";

type Filter = ReferralStatus | "all";
const filters: { value: Filter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "pending", label: "Pending" },
	{ value: "awaiting-budget", label: "Waiting on budget" },
	{ value: "paid", label: "Paid" },
	{ value: "void", label: "Voided" },
];
const filter = ref<Filter>("all");
const rows = ref<Referral[] | null>(null);
const error = ref("");
let seq = 0;

async function load() {
	const mine = ++seq;
	rows.value = null;
	error.value = "";
	try {
		const list = await me.referrals(filter.value === "all" ? undefined : filter.value);
		if (mine === seq) rows.value = list;
	} catch (e) {
		if (mine === seq) {
			error.value = describe(e);
			rows.value = [];
		}
	}
}

function pick(f: Filter) {
	if (f === filter.value) return;
	filter.value = f;
	void load();
}

onMounted(async () => {
	if (await session.restore()) void load();
});
</script>

<template>
	<AffiliateShell title="Referrals">
		<template #actions>
			<div class="p-tabs" role="group" aria-label="Filter by status">
				<button
					v-for="f in filters"
					:key="f.value"
					type="button"
					:aria-pressed="filter === f.value"
					@click="pick(f.value)"
				>
					{{ f.label }}
				</button>
			</div>
		</template>

		<section class="card-box card-box--flush arrive" aria-label="Vendors you referred">
			<div class="p-scroll">
				<table class="p-table">
					<caption class="sr-only">Vendors you referred</caption>
					<thead>
						<tr>
							<th scope="col">Store</th>
							<th scope="col">Area</th>
							<th scope="col">Registered</th>
							<th scope="col">Status</th>
							<th scope="col" class="num">Reward</th>
						</tr>
					</thead>
					<tbody>
						<template v-if="rows?.length">
							<tr v-for="r in rows" :key="r.id">
								<td data-primary><strong>{{ r.store_name }}</strong></td>
								<td data-label="Area">{{ [r.city, r.state].filter(Boolean).join(", ") || "—" }}</td>
								<td data-label="Registered">{{ day(r.registered_at) }}</td>
								<td data-label="Status" data-wide>
									<div class="p-badge-row">
										<span
											v-if="r.status !== 'void'"
											class="p-badge"
											:class="referralTone[r.status] && `p-badge--${referralTone[r.status]}`"
										>
											{{ referralLabel[r.status] }}
										</span>
										<span v-else class="p-badge p-badge--bad">
											Voided{{ r.void_reason ? `: ${voidReason(r.void_reason)}` : "" }}
										</span>
										<span
											v-if="r.status === 'pending' && r.area_active === false"
											class="p-badge p-badge--warn"
											title="Rewards aren't active in this store's area right now. If the area is switched on before approval, it pays."
										>
											Area not active
										</span>
									</div>
									<small v-if="r.approved_at" class="sub">Approved {{ day(r.approved_at) }}</small>
								</td>
								<td class="num" data-label="Reward">{{ r.reward ? money(r.reward) : "—" }}</td>
							</tr>
						</template>
						<TableState
							v-else
							:loading="rows === null"
							:error="error"
							:colspan="5"
							:empty-text="filter === 'all' ? 'No referrals yet.' : 'Nothing here.'"
							:empty-hint="filter === 'all' ? 'Share your code with vendors — they enter it when they register their store.' : undefined"
							@retry="load"
						/>
					</tbody>
				</table>
			</div>
		</section>

		<p class="p-muted note">
			A referral is paid when we approve the store, if the store's area is active then. "Waiting
			on budget" means it's approved and will be paid as soon as the reward budget is topped up.
		</p>
	</AffiliateShell>
</template>

<style scoped>
.sub {
	display: block;
	margin-top: 4px;
	color: var(--muted);
	font-size: 12px;
}
.note {
	font-size: 13px;
	max-width: 70ch;
}
</style>

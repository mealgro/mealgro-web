<script setup lang="ts">
import { computed } from "vue";
import { dateTime, money, phone, statusTone, titleCase } from "../../lib/portal/format";
import type { Order } from "../../lib/portal/types";
import TableState from "./TableState.vue";

const props = defineProps<{ orders: Order[]; empty: string; loading?: boolean; error?: string | null }>();
defineEmits<{ open: [order: Order]; retry: [] }>();

/** Orders that need the store first; the rest in the order they came. */
const sorted = computed(() =>
	[...props.orders].sort((a, b) => Number(!!b.needs_attention) - Number(!!a.needs_attention)),
);
</script>

<template>
	<div class="p-scroll">
		<table class="p-table">
			<thead>
				<tr><th>Order</th><th>Customer</th><th>Items</th><th>Status</th><th class="num">Order total (excl. service charge)</th><th>Placed</th></tr>
			</thead>
			<tbody>
				<template v-if="!loading && orders.length">
					<tr v-for="o in sorted" :key="o.id" class="is-clickable" tabindex="0" @click="$emit('open', o)" @keydown.enter="$emit('open', o)">
						<td data-primary><strong>{{ o.display_id }}</strong></td>
						<td data-label="Customer">{{ o.contact.full_name }}<small class="sub">{{ phone(o.contact.phone) }}</small></td>
						<td data-label="Items" data-wide>
							<ul class="lines">
								<li v-for="it in o.items.slice(0, 3)" :key="it.slug + it.name">
									{{ it.quantity }} × {{ it.name }}
									<span v-if="it.modifiers?.length" class="sub">{{ it.modifiers.map((m) => m.name).filter(Boolean).join(" · ") }}</span>
								</li>
								<li v-if="o.items.length > 3" class="sub">+ {{ o.items.length - 3 }} more</li>
							</ul>
						</td>
						<td data-label="Status">
							<div class="p-badge-row">
								<span class="p-badge" :class="`p-badge--${statusTone(o.status)}`">{{ titleCase(o.status) }}</span>
								<span v-if="o.needs_attention" class="p-badge p-badge--bad">Needs attention</span>
							</div>
						</td>
						<td class="num" data-label="Order total (excl. service charge)" data-wide>{{ money(o.total_amount) }}</td>
						<td class="p-muted" data-label="Placed">{{ dateTime(o.created_at) }}</td>
					</tr>
				</template>
				<TableState v-else :loading="loading" :error="error" :colspan="6" :empty-text="empty" @retry="$emit('retry')" />
			</tbody>
		</table>
	</div>
</template>

<style scoped>
.sub {
	display: block;
	font-size: 12px;
	color: var(--muted);
}
td[data-label="Customer"] .sub {
	white-space: nowrap;
}
.lines {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
</style>

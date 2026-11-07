<script setup lang="ts">
import { dateTime, money, statusTone, titleCase } from "../../lib/portal/format";
import type { Order } from "../../lib/portal/types";
import TableState from "./TableState.vue";

defineProps<{ orders: Order[]; empty: string; loading?: boolean; error?: string | null }>();
defineEmits<{ open: [order: Order]; retry: [] }>();
</script>

<template>
	<div class="p-scroll">
		<table class="p-table">
			<thead>
				<tr><th>Order</th><th>Customer</th><th>Status</th><th class="num">Order total (excl. service charge)</th><th>Placed</th></tr>
			</thead>
			<tbody>
				<template v-if="!loading && orders.length">
					<tr v-for="o in orders" :key="o.id" class="is-clickable" tabindex="0" @click="$emit('open', o)" @keydown.enter="$emit('open', o)">
						<td data-primary><strong>{{ o.display_id }}</strong></td>
						<td data-label="Customer">{{ o.contact.full_name }}</td>
						<td data-label="Status"><span class="p-badge" :class="`p-badge--${statusTone(o.status)}`">{{ titleCase(o.status) }}</span></td>
						<td class="num" data-label="Order total (excl. service charge)" data-wide>{{ money(o.total_amount) }}</td>
						<td class="p-muted" data-label="Placed">{{ dateTime(o.created_at) }}</td>
					</tr>
				</template>
				<TableState v-else :loading="loading" :error="error" :colspan="5" :empty-text="empty" @retry="$emit('retry')" />
			</tbody>
		</table>
	</div>
</template>

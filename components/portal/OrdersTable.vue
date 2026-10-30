<script setup lang="ts">
import { dateTime, money, statusTone, titleCase } from "../../lib/portal/format";
import type { Order } from "../../lib/portal/types";

defineProps<{ orders: Order[]; empty: string }>();
defineEmits<{ open: [order: Order] }>();
</script>

<template>
	<div class="p-scroll">
		<table class="p-table">
			<thead>
				<tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Placed</th></tr>
			</thead>
			<tbody>
				<tr v-for="o in orders" :key="o.id" class="is-clickable" tabindex="0" @click="$emit('open', o)" @keydown.enter="$emit('open', o)">
					<td><strong>{{ o.display_id }}</strong></td>
					<td>{{ o.contact.full_name }}</td>
					<td><span class="p-badge" :class="`p-badge--${statusTone(o.status)}`">{{ titleCase(o.status) }}</span></td>
					<td>{{ money(o.total_amount) }}</td>
					<td class="p-muted">{{ dateTime(o.created_at) }}</td>
				</tr>
				<tr v-if="!orders.length"><td colspan="5" class="p-muted">{{ empty }}</td></tr>
			</tbody>
		</table>
	</div>
</template>

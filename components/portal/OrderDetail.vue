<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { orders, riders } from "../../lib/portal/api";
import { dateTime, describe, money, statusTone, titleCase } from "../../lib/portal/format";
import { session } from "../../lib/portal/session";
import { toast } from "../../lib/portal/toast";
import type { Order } from "../../lib/portal/types";
import Modal from "./Modal.vue";

const props = defineProps<{ order: Order }>();
const emit = defineEmits<{ close: []; changed: [] }>();

const order = ref<Order>(props.order);
const busy = ref(false);
const error = ref("");
const prep = ref(20);
const reason = ref("");
const rider = ref("");
const ownRiders = ref<{ id: string; full_name: string }[]>([]);

const canAct = computed(() => session.can("manage-orders"));
const needsRider = computed(
	() => order.value.status === "accepted" && order.value.delivery_fulfillment === "vendor",
);

onMounted(async () => {
	// The list row can be a few seconds stale; the order itself is current.
	try {
		order.value = await orders.get(props.order.id);
	} catch {
		// Fall back to the row.
	}
	if (needsRider.value) {
		try {
			ownRiders.value = await riders.list();
		} catch {
			// Ready can't be marked without a rider; the error explains it.
		}
	}
});

async function act(status: "accepted" | "rejected" | "ready" | "cancelled") {
	busy.value = true;
	error.value = "";
	try {
		await orders.setStatus(order.value.id, {
			status,
			reason: status === "rejected" || status === "cancelled" ? reason.value || undefined : undefined,
			estimated_arrival_time:
				status === "accepted" && !order.value.scheduled_at ? prep.value : undefined,
			rider: status === "ready" && needsRider.value ? rider.value : undefined,
		});
		toast(`Order ${order.value.display_id} ${status === "ready" ? "marked ready" : status}`);
		emit("changed");
		emit("close");
	} catch (e) {
		error.value = describe(e);
	} finally {
		busy.value = false;
	}
}
</script>

<template>
	<Modal :title="`Order ${order.display_id}`" wide @close="emit('close')">
		<div class="p-stack">
			<div class="p-row p-between">
				<span class="p-badge" :class="`p-badge--${statusTone(order.status)}`">{{ titleCase(order.status) }}</span>
				<span class="p-muted">{{ dateTime(order.created_at) }}</span>
			</div>
			<p v-if="order.scheduled_at" class="p-alert p-alert--warn">Scheduled for {{ dateTime(order.scheduled_at) }}</p>

			<div class="p-grid cols">
				<div>
					<h2>Customer</h2>
					<p>{{ order.contact.full_name }}</p>
					<p class="p-muted">{{ order.contact.phone }}</p>
				</div>
				<div>
					<h2>{{ order.delivery_fulfillment === "pickup" ? "Pickup" : "Delivery" }}</h2>
					<p>{{ order.address }}</p>
					<p v-if="order.rider" class="p-muted">Rider: {{ order.rider.full_name }} · {{ order.rider.phone }}</p>
				</div>
			</div>

			<ul class="items">
				<li v-for="it in order.items" :key="it.slug + it.name" class="p-row p-between">
					<span>{{ it.quantity }} × {{ it.name }}</span>
					<span>{{ money(it.price) }}</span>
				</li>
			</ul>
			<div class="totals">
				<div class="p-row p-between"><span class="p-muted">Subtotal</span><span>{{ money(order.sub_total) }}</span></div>
				<div class="p-row p-between"><span class="p-muted">Delivery</span><span>{{ money(order.delivery_fee) }}</span></div>
				<div class="p-row p-between"><span class="p-muted">Total paid</span><strong>{{ money(order.total_amount) }}</strong></div>
				<div class="p-row p-between"><span class="p-muted">Your earning</span><strong>{{ money(order.vendor_earning) }}</strong></div>
			</div>
			<p v-if="order.store_message">“{{ order.store_message }}”</p>
			<p v-if="order.cancelled_reason" class="p-alert">Reason: {{ order.cancelled_reason }}</p>

			<template v-if="canAct && ['pending', 'accepted', 'ready'].includes(order.status)">
				<div v-if="order.status === 'pending' && !order.scheduled_at" class="p-field">
					<span>Prep time</span>
					<select v-model.number="prep" class="p-input">
						<option v-for="m in [10, 15, 20, 30, 45, 60, 90]" :key="m" :value="m">{{ m }} minutes</option>
					</select>
				</div>
				<div v-if="needsRider" class="p-field">
					<span>Rider</span>
					<select v-model="rider" class="p-input">
						<option value="" disabled>Choose a rider</option>
						<option v-for="r in ownRiders" :key="r.id" :value="r.id">{{ r.full_name }}</option>
					</select>
				</div>
				<label v-if="order.status !== 'ready'" class="p-field">
					<span>Reason (to reject or cancel)</span>
					<input v-model="reason" class="p-input" maxlength="200" />
				</label>
			</template>
			<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
		</div>

		<template v-if="canAct" #footer>
			<template v-if="order.status === 'pending'">
				<button class="p-btn p-btn--danger" :disabled="busy" @click="act('rejected')">Reject</button>
				<button class="p-btn p-btn--primary" :disabled="busy" @click="act('accepted')">Accept order</button>
			</template>
			<template v-else-if="order.status === 'accepted'">
				<button class="p-btn p-btn--danger" :disabled="busy" @click="act('cancelled')">Cancel order</button>
				<button class="p-btn p-btn--primary" :disabled="busy || (needsRider && !rider)" @click="act('ready')">
					Mark ready
				</button>
			</template>
			<template v-else-if="order.status === 'ready'">
				<button class="p-btn p-btn--danger" :disabled="busy" @click="act('cancelled')">Cancel order</button>
			</template>
		</template>
	</Modal>
</template>

<style scoped>
.cols {
	grid-template-columns: 1fr 1fr;
}
.items {
	border-top: 1px solid var(--line);
	border-bottom: 1px solid var(--line);
	padding: 10px 0;
	display: flex;
	flex-direction: column;
	gap: 6px;
}
.totals {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
@media (max-width: 520px) {
	.cols {
		grid-template-columns: 1fr;
	}
}
</style>

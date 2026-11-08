<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { orders, riders } from "../../lib/portal/api";
import { confirmAction } from "../../lib/portal/confirm";
import { dateTime, describe, money, phone, statusTone, titleCase } from "../../lib/portal/format";
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
/** Who delivers: "mealgro" for Mealgro's riders, else one of the store's own riders. */
const carrier = ref("");
const ownRiders = ref<{ id: string; full_name: string; phone?: string }[]>([]);
const ridersState = ref<"idle" | "loading" | "ready" | "failed">("idle");
const extendBy = ref(0);

const canAct = computed(() => session.can("manage-orders"));
const delivered = computed(() => ["vendor", "mealgro"].includes(order.value.delivery_fulfillment));
const needsRider = computed(() => order.value.status === "accepted" && delivered.value);
const pastDue = computed(
	() => !!order.value.due_at && new Date(order.value.due_at).getTime() <= Date.now(),
);
/** The store's overdue state: extend, cancel, or why neither (as in the app). */
const overdue = computed(
	() =>
		!!order.value.needs_attention ||
		(order.value.status === "in-delivery" && !!order.value.can_cancel && pastDue.value),
);
const left = computed(() => order.value.extensions_left ?? 0);
const minutesLeft = computed(() => order.value.extension_minutes_left ?? 0);
/** The usual steps that still fit, and whatever is left. Empty: it can't be extended. */
const choices = computed(() => {
	if (left.value <= 0 || minutesLeft.value <= 0) return [];
	return [...new Set([...[10, 15, 30].filter((m) => m <= minutesLeft.value), minutesLeft.value])];
});
const canCancelNow = computed(() => order.value.can_cancel !== false);
/** The overdue panel carries its own Cancel; the footer doesn't repeat it. */
const cancelInFooter = computed(() => canCancelNow.value && !(overdue.value && order.value.can_cancel));

const dueHint = computed(() => {
	const o = order.value;
	if (o.status === "accepted") {
		if (!choices.value.length)
			return "You can't extend this order any more. Finish it or cancel it. The customer can cancel it for a full refund, and it counts against your store.";
		if (left.value < 2)
			return "Extend the time or cancel it. The customer can already cancel for a full refund, and it counts against your store.";
		return "Extend the time or cancel it. If you don't reply, the customer can cancel for a full refund and it counts against your store.";
	}
	if (o.status === "ready" && o.delivery_fulfillment === "vendor")
		return "Your rider hasn't delivered it yet. Cancel it if it can't get there.";
	if (o.status === "ready") {
		if (o.can_cancel) return "No rider has collected it. You can cancel it, and it won't count against your store.";
		if (o.cancel_opens_at)
			return `No rider has collected it yet. You can cancel it from ${dateTime(o.cancel_opens_at)}, and it won't count against your store.`;
		return "A rider is on this order, so it can't be cancelled from here. Mealgro is following up.";
	}
	return "Your rider hasn't delivered it yet. Cancel it if it can't get there.";
});

/** Why "Mark ready" can't be pressed yet, in words. */
const readyHint = computed(() => {
	if (!needsRider.value || carrier.value) return "";
	if (ridersState.value === "loading") return "Loading your riders…";
	return "Choose who delivers this order to mark it ready.";
});

onMounted(async () => {
	// The list row can be a few seconds stale; the order itself is current.
	try {
		order.value = await orders.get(props.order.id);
	} catch {
		// Fall back to the row.
	}
	extendBy.value = choices.value[0] ?? 0;
	if (needsRider.value) {
		if (order.value.delivery_fulfillment === "mealgro") carrier.value = "mealgro";
		ridersState.value = "loading";
		try {
			ownRiders.value = await riders.list();
			ridersState.value = "ready";
			// With no riders of their own, Mealgro's are the only way out.
			if (!carrier.value && !ownRiders.value.length) carrier.value = "mealgro";
		} catch {
			ridersState.value = "failed";
		}
	}
});

async function guarded(fn: () => Promise<void>) {
	if (busy.value) return;
	busy.value = true;
	error.value = "";
	try {
		await fn();
	} catch (e) {
		error.value = describe(e);
	} finally {
		busy.value = false;
	}
}

function done(message: string) {
	toast(message);
	emit("changed");
	emit("close");
}

const accept = () =>
	guarded(async () => {
		await orders.setStatus(order.value.id, {
			status: "accepted",
			estimated_arrival_time: !order.value.scheduled_at ? prep.value : undefined,
		});
		done(`Order ${order.value.display_id} accepted`);
	});

const ready = () =>
	guarded(async () => {
		const own = needsRider.value && carrier.value && carrier.value !== "mealgro";
		await orders.setStatus(order.value.id, {
			status: "ready",
			delivery_fullfilment: needsRider.value ? (carrier.value === "mealgro" ? "mealgro" : "vendor") : undefined,
			rider: own ? carrier.value : undefined,
		});
		done(`Order ${order.value.display_id} marked ready`);
	});

/** Rejecting and cancelling can't be taken back: ask first, with the reason
 *  the customer is told and what it does. */
async function leave(status: "rejected" | "cancelled") {
	if (busy.value) return;
	const reject = status === "rejected";
	const ask = await confirmAction({
		title: reject ? `Reject order ${order.value.display_id}?` : `Cancel order ${order.value.display_id}?`,
		message: reject
			? "The customer is told why and refunded in full. This can't be undone."
			: "The customer is told why and refunded in full. It counts as a cancellation for your store. This can't be undone.",
		confirmText: reject ? "Reject order" : "Cancel order",
		cancelText: "Keep order",
		destructive: true,
		input: { label: "Reason (the customer sees it)", required: true, maxLength: 200 },
	});
	const reason = ask?.value.trim();
	if (!reason) return;
	await guarded(async () => {
		await orders.setStatus(order.value.id, { status, reason });
		done(`Order ${order.value.display_id} ${reject ? "rejected" : "cancelled"}`);
	});
}

const extend = () =>
	guarded(async () => {
		const minutes = extendBy.value;
		await orders.extend(order.value.id, minutes);
		toast(`Extended by ${minutes} minutes. The customer has been told.`);
		order.value = await orders.get(order.value.id);
		extendBy.value = choices.value[0] ?? 0;
		emit("changed");
	});
</script>

<template>
	<Modal :title="`Order ${order.display_id}`" wide @close="emit('close')">
		<div class="p-stack-sm">
			<div class="p-row p-between p-wrap">
				<div class="p-badge-row">
					<span class="p-badge" :class="`p-badge--${statusTone(order.status)}`">{{ titleCase(order.status) }}</span>
					<span v-if="overdue" class="p-badge p-badge--bad">Needs attention</span>
				</div>
				<span class="p-muted">{{ dateTime(order.created_at) }}</span>
			</div>
			<p v-if="order.scheduled_at" class="p-alert p-alert--warn">Scheduled for {{ dateTime(order.scheduled_at) }}</p>

			<section v-if="overdue" class="due" aria-labelledby="due-h">
				<h3 id="due-h">Past its delivery time</h3>
				<p v-if="order.due_at">It was due at {{ dateTime(order.due_at) }}.</p>
				<p class="p-muted">{{ dueHint }}</p>
				<template v-if="canAct && choices.length">
					<div class="p-tabs" role="group" aria-label="Extend by">
						<button v-for="m in choices" :key="m" type="button" :aria-pressed="extendBy === m" @click="extendBy = m">
							{{ m }} min
						</button>
					</div>
					<p class="p-hint">
						The customer will be told. You have {{ left === 1 ? "1 extension" : `${left} extensions` }} and
						{{ minutesLeft }} minutes left on this order.
					</p>
				</template>
				<div v-if="canAct && (choices.length || canCancelNow)" class="p-row p-wrap">
					<button v-if="choices.length" class="p-btn p-btn--primary p-btn--sm" type="button" :disabled="busy || !extendBy" @click="extend">
						Extend time
					</button>
					<button v-if="order.can_cancel" class="p-btn p-btn--danger p-btn--sm" type="button" :disabled="busy" @click="leave('cancelled')">
						Cancel order
					</button>
				</div>
			</section>

			<div class="p-grid cols">
				<div>
					<h3><span class="sh sh-ci" style="--c: var(--cat-2)" /> Customer</h3>
					<p class="who">{{ order.contact.full_name }}</p>
					<p class="p-muted">{{ phone(order.contact.phone) }}</p>
				</div>
				<div>
					<h3><span class="sh sh-sq" style="--c: var(--cat-1)" /> {{ order.delivery_fulfillment === "pickup" ? "Pickup" : "Delivery" }}</h3>
					<p class="who">{{ order.address }}</p>
					<p v-if="order.rider" class="p-muted">Rider: {{ order.rider.full_name }} · {{ phone(order.rider.phone) }}</p>
				</div>
			</div>

			<ul class="items">
				<li v-for="it in order.items" :key="it.slug + it.name" class="item">
					<div class="p-row p-between">
						<span class="who">{{ it.quantity }} × {{ it.name }}</span>
						<span class="amt">{{ money(it.price) }}</span>
					</div>
					<ul v-if="it.modifiers?.length" class="mods" :aria-label="`Choices for ${it.name}`">
						<li v-for="(m, i) in it.modifiers" :key="i">{{ m.name }}<template v-if="(m.quantity ?? 1) > 1"> × {{ m.quantity }}</template></li>
					</ul>
				</li>
			</ul>
			<div class="totals">
				<div class="p-row p-between"><span class="p-muted">Subtotal</span><span class="amt">{{ money(order.sub_total) }}</span></div>
				<div v-if="order.delivery_fulfillment === 'vendor'" class="p-row p-between"><span class="p-muted">Delivery</span><span class="amt">{{ money(order.delivery_fee) }}</span></div>
				<div class="p-row p-between"><span class="p-muted">Order total (excl. service charge)</span><strong class="amt">{{ money(order.total_amount) }}</strong></div>
				<div class="p-row p-between earn"><span>Your earning</span><strong class="disp">{{ money(order.vendor_earning) }}</strong></div>
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
				<fieldset v-if="needsRider" class="p-fieldset carrier">
					<legend>Who delivers this order?</legend>
					<label class="p-check">
						<input v-model="carrier" type="radio" name="carrier" value="mealgro" />
						<span><strong>Mealgro riders</strong><small class="p-hint">When a rider arrives, check their phone shows this order's number, then confirm pickup.</small></span>
					</label>
					<p v-if="ridersState === 'loading'" class="p-muted p-small">Loading your riders…</p>
					<p v-else-if="ridersState === 'failed'" class="p-alert p-alert--warn">
						We couldn't load your own riders. You can still hand the order to Mealgro riders.
					</p>
					<template v-else>
						<label v-for="r in ownRiders" :key="r.id" class="p-check">
							<input v-model="carrier" type="radio" name="carrier" :value="r.id" />
							<span><strong>{{ r.full_name }}</strong><small v-if="r.phone" class="p-hint">Your rider · {{ phone(r.phone) }}</small></span>
						</label>
						<p v-if="!ownRiders.length" class="p-hint">You have no riders of your own yet. Add them in the Mealgro app, under Settings → Riders.</p>
					</template>
				</fieldset>
				<p v-if="readyHint" class="p-hint" role="status">{{ readyHint }}</p>
				<p v-if="order.status === 'accepted' && order.can_cancel === false && order.cancel_opens_at" class="p-hint">
					You can cancel this order from {{ dateTime(order.cancel_opens_at) }}.
				</p>
			</template>
			<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
		</div>

		<template v-if="canAct" #footer>
			<template v-if="order.status === 'pending'">
				<button class="p-btn p-btn--danger foot-apart" :disabled="busy" @click="leave('rejected')">Reject</button>
				<button class="p-btn p-btn--primary" :disabled="busy" @click="accept">Accept order</button>
			</template>
			<template v-else-if="order.status === 'accepted'">
				<button v-if="cancelInFooter" class="p-btn p-btn--danger foot-apart" :disabled="busy" @click="leave('cancelled')">Cancel order</button>
				<button class="p-btn p-btn--primary" :disabled="busy || !!readyHint" @click="ready">
					Mark ready
				</button>
			</template>
			<template v-else-if="order.status === 'ready'">
				<button v-if="cancelInFooter" class="p-btn p-btn--danger" :disabled="busy" @click="leave('cancelled')">Cancel order</button>
			</template>
		</template>
	</Modal>
</template>

<style scoped>
.cols {
	grid-template-columns: 1fr 1fr;
}
.cols h3 {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 15px;
	margin-bottom: 4px;
}
.who {
	font-weight: 600;
	overflow-wrap: anywhere;
}
.items {
	border-top: 1px solid var(--line);
	border-bottom: 1px solid var(--line);
	padding: 12px 0;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.mods {
	margin-top: 4px;
	padding-left: 12px;
	border-left: 3px solid var(--line);
	display: flex;
	flex-direction: column;
	gap: 2px;
	font-size: 13px;
	color: var(--muted);
}
.totals {
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 16px 18px;
	border-radius: 1.25rem;
	background: var(--bg);
}
.amt {
	font-variant-numeric: tabular-nums;
	white-space: nowrap;
}
.earn {
	margin-top: 6px;
	padding-top: 10px;
	border-top: 1px solid var(--line);
	font-weight: 700;
}
.earn strong {
	font-size: 24px;
	letter-spacing: -0.03em;
}
.due {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 16px 18px;
	border: 2px solid var(--bad);
	border-radius: 1.25rem;
}
.due h3 {
	color: var(--bad);
}
.carrier {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.carrier .p-check span {
	display: flex;
	flex-direction: column;
}
.foot-apart {
	margin-right: auto;
}
@media (max-width: 520px) {
	.cols {
		grid-template-columns: 1fr;
	}
}
@media (max-width: 639px) {
	/* Reject sits well away from Accept: a stray tap can't lose an order. */
	.foot-apart {
		margin-right: 0;
		margin-top: 28px;
	}
}
</style>

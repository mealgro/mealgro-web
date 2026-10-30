<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BillingEmail from "../../../components/portal/BillingEmail.vue";
import PortalShell from "../../../components/portal/PortalShell.vue";
import { subscription as api } from "../../../lib/portal/api";
import { day, describe, money, titleCase } from "../../../lib/portal/format";
import { session } from "../../../lib/portal/session";
import { toast } from "../../../lib/portal/toast";
import type { PlanDetails, Subscription, SubscriptionPlan } from "../../../lib/portal/types";

const plans = ref<PlanDetails[]>([]);
const current = ref<Subscription | null>(null);
const loading = ref(true);
const error = ref("");
const busy = ref(false);
/** Set while a payment Paystack returned from is being confirmed. */
const confirming = ref<string | null>(null);
const pending = ref(false);
/** The paid plan waiting on a billing email before checkout. */
const billing = ref<PlanDetails | null>(null);

const rank: Record<SubscriptionPlan, number> = { starter: 0, premium: 1, odogwu: 2 };
const paused = computed(() => current.value?.status === "paused");
const currentTitle = computed(
	() => plans.value.find((p) => p.plan === current.value?.plan)?.title ?? titleCase(current.value?.plan ?? ""),
);

async function load() {
	try {
		const [all, now] = await Promise.all([api.plans(), api.current()]);
		plans.value = [...all].sort((a, b) => rank[a.plan] - rank[b.plan]);
		current.value = now;
	} catch (e) {
		error.value = describe(e);
	} finally {
		loading.value = false;
	}
}
onMounted(async () => {
	// Paystack sends the vendor back here with the payment's reference.
	const params = new URLSearchParams(location.search);
	const reference = params.get("reference") ?? params.get("trxref");
	if (reference) {
		history.replaceState(null, "", location.pathname);
		confirming.value = reference;
		await confirmPayment();
	}
	await load();
});

/** Only ever asks about the payment by its reference — never charges again. */
async function confirmPayment() {
	if (!confirming.value) return;
	busy.value = true;
	pending.value = false;
	try {
		current.value = await api.verify(confirming.value);
		confirming.value = null;
		toast("Payment received — your plan is active");
	} catch (e) {
		if ((e as { name?: string }).name === "PaymentPending") pending.value = true;
		else {
			confirming.value = null;
			toast(describe(e), "bad");
		}
	} finally {
		busy.value = false;
	}
}

function choose(p: PlanDetails) {
	if (p.amount) {
		billing.value = p; // pays once the billing email is settled
		return;
	}
	if (!confirm("Move to Starter? You'll lose the paid plan's benefits when you confirm.")) return;
	change(p);
}

async function change(p: PlanDetails, billingEmail?: string) {
	billing.value = null;
	busy.value = true;
	try {
		const checkout = await api.change(p.plan, `${location.origin}/account/subscription`, billingEmail);
		if (checkout) {
			location.assign(checkout.authorization_url);
			return; // stay busy while the browser leaves
		}
		toast("You're on Starter");
		await load();
	} catch (e) {
		toast(describe(e), "bad");
	}
	busy.value = false;
}

async function updateCard() {
	// Opened before the request so the browser treats it as the click's window.
	const tab = window.open("", "_blank");
	busy.value = true;
	try {
		const res = await api.cardLink();
		if (res && tab) tab.location.href = res.link;
		else {
			tab?.close();
			toast("No card renews this plan. Pay for it with a card instead.", "bad");
		}
	} catch (e) {
		tab?.close();
		toast(describe(e), "bad");
	} finally {
		busy.value = false;
	}
}

async function stopRenewal() {
	if (!current.value) return;
	if (!confirm(`Stop renewing? ${currentTitle.value} stays active until ${day(current.value.expires_at)}, then this branch moves to Starter.`))
		return;
	busy.value = true;
	try {
		await api.stopRenewal();
		toast("Renewal stopped");
		await load();
	} catch (e) {
		toast(describe(e), "bad");
	} finally {
		busy.value = false;
	}
}

function label(p: PlanDetails): string {
	const cur = current.value;
	if (!cur) return "Choose";
	if (p.plan === cur.plan) return paused.value ? "Pay now" : "Current plan";
	return rank[p.plan] > rank[cur.plan] ? "Upgrade" : "Switch";
}
const disabled = (p: PlanDetails) => !current.value || (p.plan === current.value.plan && !paused.value) || busy.value;
</script>

<template>
	<PortalShell title="Subscription">
		<div v-if="confirming" class="p-alert p-alert--warn p-mb" role="status">
			<template v-if="pending">
				Your bank is still processing the payment. This usually takes a moment.
				<button class="p-btn p-btn--sm p-ml-sm" :disabled="busy" @click="confirmPayment">Check again</button>
			</template>
			<template v-else>Confirming your payment…</template>
		</div>
		<p v-if="loading" class="p-muted">Loading your plan…</p>
		<div v-else-if="error" class="p-alert" role="alert">{{ error }}</div>
		<template v-else-if="current">
			<div v-if="paused" class="p-alert p-alert--warn p-mb" role="alert">
				Your last renewal didn't go through, so your store is on Starter features until it's paid.
				Pay the {{ currentTitle }} invoice below{{ current.renews ? ", or change the card it renews on" : "" }}.
			</div>

			<section class="p-card now">
				<div>
					<span class="p-muted">Plan for {{ session.store.value?.display_name ?? "this branch" }}</span>
					<h1>{{ currentTitle }}</h1>
					<div class="p-row p-mt-xs">
						<span class="p-badge" :class="paused ? 'p-badge--warn' : 'p-badge--ok'">{{ paused ? "Payment due" : "Active" }}</span>
						<span v-if="current.plan !== 'starter'" class="p-muted">
							{{ current.renews ? "Renews" : "Ends" }} {{ day(current.expires_at) }}
						</span>
					</div>
					<p v-if="current.last_paid_at" class="p-muted p-mt-xs">Last paid {{ day(current.last_paid_at) }}</p>
					<p v-if="current.billing_email" class="p-muted">Billed to {{ current.billing_email }}</p>
				</div>
				<div v-if="current.plan !== 'starter' && current.renews" class="p-row manage">
					<button class="p-btn" :disabled="busy" @click="updateCard">Change card</button>
					<button class="p-btn p-btn--danger" :disabled="busy" @click="stopRenewal">Stop renewing</button>
				</div>
			</section>

			<h2 class="p-mt p-mb-xs">Plans</h2>
			<p v-if="session.stores.value.length > 1" class="p-muted p-mb-sm">Each branch has its own plan.</p>
			<div class="p-grid plans">
				<article v-for="p in plans" :key="p.plan" class="p-card plan" :class="{ here: p.plan === current.plan }">
					<div>
						<h2>{{ p.title }}</h2>
						<p class="price"><strong>{{ p.amount ? money(p.amount) : "Free" }}</strong><span v-if="p.amount" class="p-muted"> / month</span></p>
					</div>
					<ul>
						<li v-for="f in p.features" :key="f.text">✓ {{ f.text }}</li>
					</ul>
					<button class="p-btn" :class="{ 'p-btn--primary': !disabled(p) }" :disabled="disabled(p)" @click="choose(p)">
						{{ label(p) }}
					</button>
					<p v-if="p.amount && !disabled(p)" class="p-muted secure">You'll pay on Paystack's secure checkout.</p>
				</article>
			</div>
		</template>

		<BillingEmail
			v-if="billing && current"
			:plan="billing"
			:current="current.billing_email"
			@close="billing = null"
			@confirmed="(email: string) => billing && change(billing, email)"
		/>
	</PortalShell>
</template>

<style scoped>
.now {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16px;
	flex-wrap: wrap;
}
.manage {
	flex-wrap: wrap;
}
.plans {
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
.plan {
	display: flex;
	flex-direction: column;
	gap: 14px;
}
.plan.here {
	border-color: var(--brand);
}
.plan ul {
	display: flex;
	flex-direction: column;
	gap: 6px;
	flex: 1;
}
.secure {
	font-size: 12px;
	margin-top: -6px;
}
.price strong {
	font-size: 24px;
}
</style>

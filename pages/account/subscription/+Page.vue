<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BillingEmail from "../../../components/portal/BillingEmail.vue";
import HeroPanel from "../../../components/portal/HeroPanel.vue";
import PortalShell from "../../../components/portal/PortalShell.vue";
import StateBlock from "../../../components/portal/StateBlock.vue";
import { subscription as api } from "../../../lib/portal/api";
import { confirmAction } from "../../../lib/portal/confirm";
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
	error.value = "";
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

async function choose(p: PlanDetails) {
	if (p.amount) {
		billing.value = p; // pays once the billing email is settled
		return;
	}
	const ok = await confirmAction({
		title: "Move to Starter?",
		message: "You'll lose the paid plan's benefits when you confirm.",
		confirmText: "Move to Starter",
		destructive: true,
	});
	if (!ok) return;
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
	const ok = await confirmAction({
		title: "Stop renewing?",
		message: `${currentTitle.value} stays active until ${day(current.value.expires_at)}, then this branch moves to Starter.`,
		confirmText: "Stop renewing",
		destructive: true,
	});
	if (!ok) return;
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

/** Each plan owns a colour and a shape (square, circle, card), in the order the plans are listed. */
const PLAN_SHAPES = ["sh-sq", "sh-ci", "sh-cd"];
const PLAN_COLORS = ["var(--cat-1)", "var(--cat-2)", "var(--cat-3)"];
</script>

<template>
	<PortalShell title="Subscription">
		<div v-if="confirming" class="p-alert p-alert--warn" role="status">
			<template v-if="pending">
				Your bank is still processing the payment. This usually takes a moment.
				<button class="p-btn p-btn--sm" :disabled="busy" @click="confirmPayment">Check again</button>
			</template>
			<template v-else>Confirming your payment…</template>
		</div>
		<StateBlock v-if="loading || error" class="card-box" :loading="loading" :error="error" :lines="4" @retry="load" />
		<template v-else-if="current">
			<div v-if="paused" class="p-alert p-alert--warn" role="alert">
				Your last renewal didn't go through, so your store is on Starter features until it's paid.
				Pay the {{ currentTitle }} invoice below{{ current.renews ? ", or change the card it renews on" : "" }}.
			</div>

			<HeroPanel
				eyebrow="Plan for"
				shape="cd"
				color="var(--cat-3)"
				:title="currentTitle"
			>
				<p class="for">{{ session.store.value?.display_name ?? "this branch" }}</p>
				<div class="p-row p-wrap p-mt-xs">
					<span class="p-badge" :class="paused ? 'p-badge--warn' : 'p-badge--ok'">{{ paused ? "Payment due" : "Active" }}</span>
					<span v-if="current.plan !== 'starter'">
						{{ current.renews ? "Renews" : "Ends" }} {{ day(current.expires_at) }}
					</span>
				</div>
				<p v-if="current.last_paid_at" class="p-mt-xs">Last paid {{ day(current.last_paid_at) }}</p>
				<p v-if="current.billing_email">Billed to {{ current.billing_email }}</p>
				<template v-if="current.plan !== 'starter' && current.renews" #aside>
					<div class="p-row p-wrap">
						<button class="p-btn" :disabled="busy" @click="updateCard">Change card</button>
						<button class="p-btn" :disabled="busy" @click="stopRenewal">Stop renewing</button>
					</div>
				</template>
			</HeroPanel>

			<div class="plans-h">
				<h2>Plans</h2>
				<p v-if="session.stores.value.length > 1" class="p-muted">Each branch has its own plan.</p>
			</div>
			<div class="p-grid plans">
				<article v-for="(p, i) in plans" :key="p.plan" class="card-box plan arrive" :style="{ '--i': i + 1 }" :class="{ here: p.plan === current.plan }">
					<div>
						<h3 class="plan-h"><span class="sh" :class="PLAN_SHAPES[i % 3]" :style="{ '--c': PLAN_COLORS[i % 3] }" />{{ p.title }}</h3>
						<p class="price"><strong class="disp">{{ p.amount ? money(p.amount) : "Free" }}</strong><span v-if="p.amount" class="p-muted"> / month</span></p>
					</div>
					<ul class="feats">
						<li v-for="f in p.features" :key="f.text">
							<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
							<span>{{ f.text }}</span>
						</li>
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
.for {
	font-weight: 600;
	font-size: 16px;
}
.plans-h {
	margin-top: 8px;
}
.plans {
	grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
}
.plan {
	display: flex;
	flex-direction: column;
	gap: 16px;
}
.plan.here {
	border: 2px solid var(--brand);
}
.plan-h {
	display: flex;
	align-items: center;
	gap: 10px;
}
.feats {
	display: flex;
	flex-direction: column;
	gap: 8px;
	flex: 1;
}
.feats li {
	display: flex;
	align-items: flex-start;
	gap: 8px;
}
.feats svg {
	flex: none;
	margin-top: 3px;
	color: var(--ok);
}
.secure {
	font-size: 12px;
	margin-top: -6px;
}
.price strong {
	font-size: 36px;
	line-height: 1.1;
}
</style>

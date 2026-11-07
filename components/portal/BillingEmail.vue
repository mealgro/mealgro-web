<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { staff, subscription } from "../../lib/portal/api";
import { describe, titleCase } from "../../lib/portal/format";
import { session } from "../../lib/portal/session";
import type { BillingContact, CapabilityCatalogue, PlanDetails } from "../../lib/portal/types";
import Modal from "./Modal.vue";

/** Asks where a branch is billed before it pays, and says who that reaches. */
const props = defineProps<{ plan: PlanDetails; current: string }>();
const emit = defineEmits<{ close: []; confirmed: [email: string] }>();

const email = ref(props.current);
const contact = ref<BillingContact | null>(null);
const checking = ref(false);
const error = ref("");
const busy = ref(false);
const catalogue = ref<CapabilityCatalogue | null>(null);
const role = ref("manager");
const canInvite = computed(() => session.can("manage-staff"));
const presets = computed(() => catalogue.value?.roles.filter((r) => r.slug !== "owner") ?? []);

onMounted(async () => {
	if (email.value) await check();
	if (canInvite.value) catalogue.value = await staff.catalogue().catch(() => null);
});

async function check() {
	error.value = "";
	contact.value = null;
	if (!email.value.trim()) return;
	checking.value = true;
	try {
		contact.value = await subscription.billingContact(email.value.trim());
	} catch (e) {
		error.value = describe(e);
	} finally {
		checking.value = false;
	}
}

const roleName = (slug: string) =>
	catalogue.value?.roles.find((r) => r.slug === slug)?.display_name ?? titleCase(slug);
const where = computed(
	() =>
		contact.value?.member?.places
			.map((p) => `${titleCase(p.role)}${session.stores.value.length > 1 ? ` at ${p.branch_label}` : ""}`)
			.join(", ") ?? "",
);
const ready = computed(() => !!contact.value && !contact.value.in_use && !checking.value);

async function addAndContinue() {
	if (!contact.value) return;
	busy.value = true;
	error.value = "";
	try {
		await staff.invite({ email: contact.value.email, role: role.value });
		emit("confirmed", contact.value.email);
	} catch (e) {
		error.value = describe(e);
		busy.value = false;
	}
}
</script>

<template>
	<Modal :title="`Billing for ${plan.title}`" @close="emit('close')">
		<form class="p-stack-sm" @submit.prevent="check">
			<p>
				Each branch is billed to its own email. Paystack sends receipts and renewal notices there. Anyone who
				manages this plan in Mealgro can still change the card or stop renewal.
			</p>
			<label class="p-field">
				<span>Billing email for {{ session.store.value?.display_name }}</span>
				<div class="email-row">
					<input v-model="email" class="p-input" type="email" placeholder="billing@yourbusiness.com" required @change="check" />
					<button class="p-btn" :disabled="checking || !email.trim()">{{ checking ? "Checking…" : "Check" }}</button>
				</div>
			</label>
			<div v-if="error" class="p-alert" role="alert">{{ error }}</div>

			<template v-if="contact && !checking">
				<p v-if="contact.in_use" class="p-alert" role="alert">
					Another branch is already billed to {{ contact.email }}. Each branch needs its own billing email.
				</p>
				<p v-else-if="contact.member" class="p-alert p-alert--ok">
					Billing emails will go to <strong>{{ contact.member.name }}</strong> ({{ where }}).
				</p>
				<p v-else-if="contact.invited" class="p-alert p-alert--warn">
					{{ contact.email }} has been invited to your team and hasn't joined yet. Billing emails will still reach it.
				</p>
				<div v-else class="p-stack-sm">
					<p class="p-alert p-alert--warn">
						Nobody in your business uses {{ contact.email }}. Billing emails will go to that inbox.
					</p>
					<template v-if="canInvite && presets.length">
						<p>Add them to your team so they can sign in to Mealgro too?</p>
						<label class="p-field">
							<span>Role at {{ session.store.value?.display_name }}</span>
							<select v-model="role" class="p-input">
								<option v-for="r in presets" :key="r.slug" :value="r.slug">{{ roleName(r.slug) }}</option>
							</select>
						</label>
					</template>
				</div>
			</template>
		</form>
		<template #footer>
			<button class="p-btn p-btn--ghost" type="button" @click="emit('close')">Cancel</button>
			<template v-if="ready && contact && !contact.member && !contact.invited && canInvite && presets.length">
				<button class="p-btn" :disabled="busy" @click="emit('confirmed', contact.email)">Continue without adding</button>
				<button class="p-btn p-btn--primary" :disabled="busy" @click="addAndContinue">
					Add as {{ roleName(role) }} and pay
				</button>
			</template>
			<button v-else class="p-btn p-btn--primary" :disabled="!ready || busy" @click="contact && emit('confirmed', contact.email)">
				Continue to payment
			</button>
		</template>
	</Modal>
</template>

<style scoped>
.email-row {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}
.email-row .p-input {
	flex: 1 1 220px;
}
</style>

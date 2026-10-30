<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import PortalShell from "../../../components/portal/PortalShell.vue";
import { store as api, storeSettings } from "../../../lib/portal/api";
import { describe, titleCase } from "../../../lib/portal/format";
import { session } from "../../../lib/portal/session";
import { toast } from "../../../lib/portal/toast";
import type { StoreSettings } from "../../../lib/portal/types";

const data = ref<StoreSettings | null>(null);
const error = ref("");
const saving = ref("");

const canEdit = computed(() => session.can("manage-store") && session.store.value?.status === "active");

const contact = ref({ full_name: "", phone: "" });
const prep = ref({ min: 10, max: 30 });
const type = ref<"online" | "physical" | "both">("online");

onMounted(async () => {
	try {
		const s = await api.settings();
		data.value = s;
		contact.value = { full_name: s.contact?.full_name ?? "", phone: s.contact?.phone ?? "" };
		prep.value = { min: s.prep_time?.min ?? 10, max: s.prep_time?.max ?? 30 };
		type.value = s.store_type?.store_type ?? "online";
	} catch (e) {
		error.value = describe(e);
	}
});

async function save(what: string, fn: () => Promise<unknown>) {
	saving.value = what;
	try {
		await fn();
		toast("Saved");
	} catch (e) {
		toast(describe(e), "bad");
	} finally {
		saving.value = "";
	}
}
</script>

<template>
	<PortalShell title="Store">
		<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
		<p v-else-if="!data" class="p-muted">Loading…</p>
		<div v-else class="p-stack">
			<section class="p-card p-stack">
				<h2>Business</h2>
				<div class="p-row">
					<img v-if="data.logo" :src="data.logo" alt="" class="logo" />
					<div>
						<strong>{{ data.business_name }}</strong>
						<p class="p-muted">
							{{ data.email }}
							<span class="p-badge" :class="data.email_verified ? 'p-badge--ok' : 'p-badge--warn'">
								{{ data.email_verified ? "Verified" : "Not verified" }}
							</span>
						</p>
					</div>
				</div>
				<div>
					<span class="p-muted">Address</span>
					<p>{{ data.location?.address }}, {{ data.location?.city }}, {{ data.location?.state }}</p>
					<p v-if="data.pending_address" class="p-alert p-alert--warn">
						A new address ({{ data.pending_address.address }}) is waiting for approval.
					</p>
				</div>
				<p class="p-muted">Logo, address, business hours and bank details are changed in the Mealgro app.</p>
			</section>

			<form class="p-card p-stack" @submit.prevent="save('contact', () => storeSettings.contact(contact.full_name, contact.phone))">
				<h2>Contact person</h2>
				<div class="p-grid two">
					<label class="p-field"><span>Full name</span><input v-model="contact.full_name" class="p-input" :disabled="!canEdit" required /></label>
					<label class="p-field"><span>Phone</span><input v-model="contact.phone" class="p-input" type="tel" :disabled="!canEdit" required /></label>
				</div>
				<div v-if="canEdit"><button class="p-btn p-btn--primary" :disabled="saving === 'contact'">Save</button></div>
			</form>

			<form class="p-card p-stack" @submit.prevent="save('prep', () => storeSettings.prepTime(prep.min, prep.max))">
				<h2>Preparation time</h2>
				<div class="p-grid two">
					<label class="p-field"><span>Shortest (minutes)</span><input v-model.number="prep.min" class="p-input" type="number" min="1" :disabled="!canEdit" required /></label>
					<label class="p-field"><span>Longest (minutes)</span><input v-model.number="prep.max" class="p-input" type="number" min="1" :disabled="!canEdit" required /></label>
				</div>
				<div v-if="canEdit"><button class="p-btn p-btn--primary" :disabled="saving === 'prep' || prep.min > prep.max">Save</button></div>
			</form>

			<form class="p-card p-stack" @submit.prevent="save('type', () => storeSettings.storeType(type))">
				<h2>Store type</h2>
				<label class="p-field">
					<span>Where customers can order from you</span>
					<select v-model="type" class="p-input" :disabled="!canEdit">
						<option v-for="t in ['online', 'physical', 'both']" :key="t" :value="t">{{ titleCase(t) }}</option>
					</select>
				</label>
				<div v-if="canEdit"><button class="p-btn p-btn--primary" :disabled="saving === 'type'">Save</button></div>
			</form>
		</div>
	</PortalShell>
</template>

<style scoped>
.logo {
	width: 56px;
	height: 56px;
	border-radius: 12px;
	object-fit: cover;
}
.two {
	grid-template-columns: 1fr 1fr;
}
@media (max-width: 560px) {
	.two {
		grid-template-columns: 1fr;
	}
}
</style>

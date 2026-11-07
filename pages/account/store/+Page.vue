<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import HeroPanel from "../../../components/portal/HeroPanel.vue";
import PortalShell from "../../../components/portal/PortalShell.vue";
import StateBlock from "../../../components/portal/StateBlock.vue";
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

async function load() {
	error.value = "";
	try {
		const s = await api.settings();
		data.value = s;
		contact.value = { full_name: s.contact?.full_name ?? "", phone: s.contact?.phone ?? "" };
		prep.value = { min: s.prep_time?.min ?? 10, max: s.prep_time?.max ?? 30 };
		type.value = s.store_type?.store_type ?? "online";
	} catch (e) {
		error.value = describe(e);
	}
}
onMounted(load);

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
		<StateBlock v-if="error || !data" class="card-box" :loading="!error && !data" :error="error" :lines="4" @retry="load" />
		<div v-else class="p-stack">
			<HeroPanel eyebrow="Your business" shape="sq" color="var(--cat-1)" :title="data.business_name">
				<div class="hero-line">
					<span>{{ data.email }}</span>
					<span class="p-badge" :class="data.email_verified ? 'p-badge--ok' : 'p-badge--warn'">
						{{ data.email_verified ? "Verified" : "Not verified" }}
					</span>
				</div>
				<dl class="kv hero-kv">
					<div>
						<dt>Address</dt>
						<dd>{{ data.location?.address }}, {{ data.location?.city }}, {{ data.location?.state }}</dd>
					</div>
				</dl>
				<div v-if="data.pending_address" class="p-alert p-alert--warn pending">
					A new address ({{ data.pending_address.address }}) is waiting for approval.
				</div>
				<p class="hero-note">Logo, address, business hours and bank details are changed in the Mealgro app.</p>
				<template v-if="data.logo" #aside>
					<img :src="data.logo" alt="" class="logo" />
				</template>
			</HeroPanel>

			<div class="forms">
				<form class="card-box p-stack-sm arrive" style="--i: 1" @submit.prevent="save('contact', () => storeSettings.contact(contact.full_name, contact.phone))">
					<h2>Contact person</h2>
					<div class="p-grid two">
						<label class="p-field"><span>Full name</span><input v-model="contact.full_name" class="p-input" :disabled="!canEdit" required /></label>
						<label class="p-field"><span>Phone</span><input v-model="contact.phone" class="p-input" type="tel" :disabled="!canEdit" required /></label>
					</div>
					<div v-if="canEdit"><button class="p-btn p-btn--primary" :disabled="saving === 'contact'">Save</button></div>
				</form>

				<form class="card-box p-stack-sm arrive" style="--i: 2" @submit.prevent="save('prep', () => storeSettings.prepTime(prep.min, prep.max))">
					<h2>Preparation time</h2>
					<div class="p-grid two">
						<label class="p-field"><span>Shortest (minutes)</span><input v-model.number="prep.min" class="p-input" type="number" min="1" :disabled="!canEdit" required /></label>
						<label class="p-field"><span>Longest (minutes)</span><input v-model.number="prep.max" class="p-input" type="number" min="1" :disabled="!canEdit" required /></label>
					</div>
					<div v-if="canEdit"><button class="p-btn p-btn--primary" :disabled="saving === 'prep' || prep.min > prep.max">Save</button></div>
				</form>

				<form class="card-box p-stack-sm arrive" style="--i: 3" @submit.prevent="save('type', () => storeSettings.storeType(type))">
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
		</div>
	</PortalShell>
</template>

<style scoped>
.logo {
	width: 88px;
	height: 88px;
	border-radius: 1.5rem;
	object-fit: cover;
}
.hero-line {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10px;
	margin-top: 4px;
}
.hero-line > span:first-child {
	opacity: 0.86;
}
.hero-kv {
	margin-top: 16px;
}
.hero-kv dt {
	color: inherit;
	opacity: 0.7;
}
.pending {
	margin-top: 12px;
}
.hero-note {
	margin-top: 16px;
	font-size: 13px;
}
.forms {
	display: grid;
	gap: 20px;
	grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr));
	align-items: start;
}
.two {
	grid-template-columns: 1fr 1fr;
	gap: 14px;
}
@media (max-width: 560px) {
	.two {
		grid-template-columns: 1fr;
	}
}
</style>

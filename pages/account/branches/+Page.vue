<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Modal from "../../../components/portal/Modal.vue";
import HeroPanel from "../../../components/portal/HeroPanel.vue";
import PortalShell from "../../../components/portal/PortalShell.vue";
import StateBlock from "../../../components/portal/StateBlock.vue";
import { branches as api, places } from "../../../lib/portal/api";
import { confirmAction } from "../../../lib/portal/confirm";
import { MARKETS, marketOfCountry } from "../../../lib/portal/markets";
import { describe, titleCase } from "../../../lib/portal/format";
import { session } from "../../../lib/portal/session";
import { toast } from "../../../lib/portal/toast";
import type { Branch, BrandBranches, Place } from "../../../lib/portal/types";

const brand = ref<BrandBranches | null>(null);
const error = ref("");
const canManage = computed(() => session.can("manage-branches"));

async function load() {
	error.value = "";
	try {
		brand.value = await api.list();
	} catch (e) {
		error.value = describe(e);
	}
}
onMounted(() => {
	if (session.can("view-store")) load();
});

// A menu going to another market's branch copies in the background: keep
// asking until it has ended, so "Copying" doesn't outlive the copy.
const COPY_POLL_MS = 15_000;
let copyPoll: ReturnType<typeof setTimeout> | undefined;
watch(brand, (now) => {
	clearTimeout(copyPoll);
	if (now?.branches.some((b) => b.menu_copy === "copying")) copyPoll = setTimeout(load, COPY_POLL_MS);
});
onBeforeUnmount(() => clearTimeout(copyPoll));

// ── open a branch ──────────────────────────────────────────────────────────
const opening = ref(false);
const busy = ref(false);
const formError = ref("");
const form = ref({ label: "", state: "", city: "", address: "", copy_menu: true, currency: "" });
const countries = ref<Place[]>([]);
const country = ref("");
const states = ref<Place[]>([]);
const cities = ref<Place[]>([]);
const chosenCountry = computed(() => countries.value.find((c) => c.id === country.value));

async function startOpening() {
	form.value = {
		label: "",
		state: "",
		city: "",
		address: "",
		copy_menu: true,
		currency: marketOfCountry(chosenCountry.value)?.code ?? "",
	};
	formError.value = "";
	opening.value = true;
	if (!countries.value.length) {
		try {
			countries.value = await places.countries();
			country.value =
				countries.value.find((c) => c.name.toLowerCase() === "nigeria")?.id ??
				countries.value[0]?.id ??
				"";
		} catch (e) {
			formError.value = describe(e);
		}
	}
}
watch(country, async (id) => {
	form.value.state = "";
	// The country's currency, until the vendor says otherwise.
	form.value.currency = marketOfCountry(chosenCountry.value)?.code ?? "";
	states.value = id ? await places.states(id).catch(() => []) : [];
});
watch(
	() => form.value.state,
	async (state) => {
		form.value.city = "";
		cities.value = state ? await places.cities(state).catch(() => []) : [];
	},
);
// The label defaults to the city chosen, as it does for the first branch.
watch(
	() => form.value.city,
	(city) => {
		const name = cities.value.find((c) => c.id === city)?.name;
		if (name && !form.value.label.trim()) form.value.label = name;
	},
);

async function open() {
	busy.value = true;
	formError.value = "";
	try {
		const branch = await api.open({ ...form.value, address: form.value.address || undefined });
		opening.value = false;
		toast(`${branch.display_name} opened — it goes live once Mealgro approves it`);
		await load();
		// So the new branch is in the switcher.
		await session.refresh().catch(() => {});
	} catch (e) {
		formError.value = describe(e);
	} finally {
		busy.value = false;
	}
}

// ── names ─────────────────────────────────────────────────────────────────
async function relabel(b: Branch) {
	const ask = await confirmAction({
		title: "Rename this branch?",
		message: `Customers see it as “${brand.value?.name} (${b.branch_label})”. What should follow “${brand.value?.name}”?`,
		confirmText: "Rename",
		input: { label: "Branch name", value: b.branch_label, required: true, maxLength: 40 },
	});
	const label = ask?.value;
	if (!label || label === b.branch_label) return;
	try {
		await api.relabel(b.id, label);
		toast("Branch renamed");
		await load();
	} catch (e) {
		toast(describe(e), "bad");
	}
}
async function renameBrand() {
	const ask = await confirmAction({
		title: "Rename your business?",
		message: "Every branch follows the new name, and customers see it straight away.",
		confirmText: "Rename",
		input: { label: "Your business name", value: brand.value?.name, required: true, maxLength: 80 },
	});
	const name = ask?.value;
	if (!name || name === brand.value?.name) return;
	try {
		await api.renameBrand(name);
		toast("Business renamed — every branch follows");
		await load();
	} catch (e) {
		toast(describe(e), "bad");
	}
}

const tone = (s: Branch["status"]) =>
	s === "active" ? "ok" : s === "inactive" ? "warn" : "bad";
</script>

<template>
	<PortalShell title="Branches" need="view-store">
		<template #actions>
			<button v-if="canManage" class="p-btn" @click="renameBrand">Rename business</button>
			<button v-if="canManage" class="p-btn p-btn--primary" @click="startOpening">Open a branch</button>
		</template>

		<StateBlock v-if="error || !brand" class="card-box" :loading="!error && !brand" :error="error" :lines="4" @retry="load" />
		<template v-else>
			<HeroPanel eyebrow="Your business" shape="sq" color="var(--cat-1)" :title="brand.name">
				<p class="intro">
					Customers see each branch as its own store, named
					<strong>{{ brand.name }}</strong><template v-if="brand.branches.length > 1"> followed by the branch name, like <strong>{{ brand.branches[0].display_name }}</strong></template>.
					Each branch has its own menu, orders, wallet and plan.
				</p>
				<template #aside>
					<div class="count disp">{{ brand.branches.length }}</div>
					<p class="count-l">{{ brand.branches.length === 1 ? "branch" : "branches" }}</p>
				</template>
			</HeroPanel>
			<div class="p-grid list">
				<article v-for="(b, i) in brand.branches" :key="b.id" class="card-box branch arrive" :style="{ '--i': i + 1 }" :class="{ here: b.id === session.store.value?.id }">
					<div class="p-badge-row">
						<span v-if="b.is_base" class="p-badge p-badge--brand">Main</span>
						<span class="p-badge" :class="`p-badge--${tone(b.status)}`">{{ titleCase(b.status) }}</span>
					</div>
					<div class="branch-name">
						<h3>{{ b.display_name }}</h3>
						<p class="p-muted">{{ b.address || [b.city, b.state].filter(Boolean).join(", ") }}</p>
					</div>
					<p v-if="b.status === 'inactive'" class="p-muted p-small">Waiting for Mealgro to approve it before it can take orders.</p>
					<p v-if="b.menu_copy === 'copying'" class="p-muted p-small" role="status">Copying your menu… prices are being converted to this branch's currency. We'll tell you when it's done.</p>
					<div v-else-if="b.menu_copy === 'failed'" class="p-alert" role="alert">We couldn't finish copying your menu. What was copied is still on this branch; add the rest yourself in the Mealgro app.</div>
					<div class="p-row p-wrap branch-actions">
						<button v-if="b.id !== session.store.value?.id" class="p-btn p-btn--sm" @click="session.switchTo(b.id)">Work on this branch</button>
						<span v-else class="here-tag"><span class="sh sh-ci" style="--c: var(--brand)" />You're working on this branch</span>
						<button v-if="canManage" class="p-btn p-btn--sm p-btn--ghost" @click="relabel(b)">Rename</button>
					</div>
				</article>
			</div>
		</template>

		<Modal v-if="opening" title="Open a branch" @close="opening = false">
			<form id="branch-form" class="p-stack-sm" @submit.prevent="open">
				<div v-if="formError" class="p-alert" role="alert">{{ formError }}</div>
				<label class="p-field"><span>Country</span>
					<select v-model="country" class="p-input" required>
						<option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
					</select>
				</label>
				<div class="two">
					<label class="p-field"><span>State</span>
						<select v-model="form.state" class="p-input" required>
							<option value="" disabled>Choose</option>
							<option v-for="s in states" :key="s.id" :value="s.id">{{ s.name }}</option>
						</select>
					</label>
					<label class="p-field"><span>City</span>
						<select v-model="form.city" class="p-input" :disabled="!cities.length" required>
							<option value="" disabled>Choose</option>
							<option v-for="c in cities" :key="c.id" :value="c.id">{{ c.name }}</option>
						</select>
					</label>
				</div>
				<label class="p-field"><span>Currency</span>
					<select v-model="form.currency" class="p-input" required>
						<option value="" disabled>Choose</option>
						<option v-for="m in MARKETS" :key="m.code" :value="m.code">{{ m.label }}</option>
					</select>
					<small>
						<template v-if="chosenCountry && !marketOfCountry(chosenCountry)">Mealgro doesn't trade in {{ chosenCountry.name }} yet, so choose the currency this branch will charge in. </template>
						A branch keeps its currency for life.
					</small>
				</label>
				<label class="p-field"><span>Street address</span>
					<input v-model="form.address" class="p-input" maxlength="200" placeholder="12 Example Street" />
				</label>
				<label class="p-field"><span>Branch name</span>
					<input v-model="form.label" class="p-input" maxlength="40" required />
					<small>Customers see “{{ brand?.name }} ({{ form.label || "…" }})”.</small>
				</label>
				<label class="p-check">
					<input v-model="form.copy_menu" type="checkbox" />
					<span>Copy the main branch's menu (categories, items and options). You can change it afterwards. In another currency, prices are converted at today's rate and the copy finishes in the background.</span>
				</label>
				<p class="p-muted p-small">The new branch starts offline. Mealgro approves it before it can take orders.</p>
			</form>
			<template #footer>
				<button class="p-btn p-btn--ghost" type="button" @click="opening = false">Cancel</button>
				<button class="p-btn p-btn--primary" form="branch-form" :disabled="busy || !form.city || !form.currency || !form.label.trim()">
					{{ busy ? "Opening…" : "Open branch" }}
				</button>
			</template>
		</Modal>
	</PortalShell>
</template>

<style scoped>
.intro {
	max-width: 62ch;
	margin-top: 8px;
}
.count {
	font-size: clamp(56px, 8vw, 96px);
	line-height: 0.85;
	text-align: right;
}
.count-l {
	text-align: right;
	font-weight: 700;
}
.list {
	grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
}
.branch {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.branch.here {
	border: 2px solid var(--brand);
}
.branch-name {
	min-width: 0;
}
.branch-name h3 {
	overflow-wrap: anywhere;
}
.branch-actions {
	margin-top: auto;
}
.here-tag {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	font-weight: 600;
}
.two {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}
@media (max-width: 520px) {
	.two {
		grid-template-columns: 1fr;
	}
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Modal from "../../../components/portal/Modal.vue";
import PortalShell from "../../../components/portal/PortalShell.vue";
import TableState from "../../../components/portal/TableState.vue";
import { branches as branchApi, staff as api } from "../../../lib/portal/api";
import { confirmAction } from "../../../lib/portal/confirm";
import { describe, titleCase } from "../../../lib/portal/format";
import { session } from "../../../lib/portal/session";
import { toast } from "../../../lib/portal/toast";
import type { Branch, CapabilityCatalogue, StaffPerson, StaffPlace } from "../../../lib/portal/types";

const people = ref<StaffPerson[]>([]);
const catalogue = ref<CapabilityCatalogue | null>(null);
const branches = ref<Branch[]>([]);
const loading = ref(true);
const error = ref("");
const filter = ref("");

async function load() {
	error.value = "";
	try {
		[people.value, catalogue.value] = await Promise.all([api.people(), api.catalogue()]);
		branches.value = (await branchApi.list()).branches;
	} catch (e) {
		error.value = describe(e);
	} finally {
		loading.value = false;
	}
}
onMounted(load);

const several = computed(() => branches.value.length > 1);
// Invites can name only branches where you manage staff.
const invitable = computed(() =>
	branches.value.filter((b) =>
		session.stores.value.find((s) => s.id === b.id)?.capabilities.includes("manage-staff"),
	),
);
const shown = computed(() =>
	filter.value ? people.value.filter((p) => p.branches.some((b) => b.store === filter.value)) : people.value,
);

// Owners hold everything and are never edited here.
const presets = computed(() => catalogue.value?.roles.filter((r) => r.slug !== "owner") ?? []);

type Form = {
	by: "username" | "phone" | "email";
	who: string;
	preset: string; // a role slug, or "custom"
	caps: Set<string>;
	stores: Set<string>;
	/** Set when editing one person at one branch. */
	target: { person: StaffPerson; place: StaffPlace } | null;
};
const form = ref<Form | null>(null);
const busy = ref(false);
const formError = ref("");

function openInvite() {
	const first = presets.value[0];
	const here = session.store.value?.id;
	form.value = {
		by: "email",
		who: "",
		preset: first?.slug ?? "custom",
		caps: new Set(first?.capabilities ?? []),
		stores: new Set(here && invitable.value.some((b) => b.id === here) ? [here] : []),
		target: null,
	};
	formError.value = "";
}
function openEdit(person: StaffPerson, place: StaffPlace) {
	form.value = {
		by: "username",
		who: "",
		preset: presets.value.some((r) => r.slug === place.role) ? place.role : "custom",
		caps: new Set(place.capabilities),
		stores: new Set([place.store]),
		target: { person, place },
	};
	formError.value = "";
}
function pickPreset(slug: string) {
	if (!form.value) return;
	form.value.preset = slug;
	const role = presets.value.find((r) => r.slug === slug);
	if (role) form.value.caps = new Set(role.capabilities);
}
function toggle(set: Set<string>, value: string) {
	if (set.has(value)) set.delete(value);
	else set.add(value);
}
function toggleCap(cap: string) {
	if (!form.value) return;
	toggle(form.value.caps, cap);
	form.value.preset = "custom";
}

async function submit() {
	const f = form.value;
	if (!f || busy.value) return;
	busy.value = true;
	formError.value = "";
	const access = f.preset === "custom" ? { capabilities: [...f.caps] } : { role: f.preset };
	try {
		if (f.target?.person.user) {
			await api.setAccess(f.target.place.store, f.target.person.user, access);
			toast("Access updated");
		} else {
			const who = f.who.trim();
			const res = await api.invite({ [f.by]: who, branches: [...f.stores], ...access });
			toast(
				res.status === "joined"
					? "Added to your team"
					: f.by === "email"
						? `Invite emailed to ${who} — they join when they sign up`
						: "Invite saved — they join when they sign up",
			);
		}
		form.value = null;
		await load();
	} catch (e) {
		formError.value = describe(e);
	} finally {
		busy.value = false;
	}
}

async function remove(person: StaffPerson, place: StaffPlace) {
	const name = label(person);
	const where = several.value ? ` from ${place.display_name}` : "";
	const ok = await confirmAction({
		title: person.pending ? `Cancel the invite for ${name}${where}?` : `Remove ${name}${where}?`,
		confirmText: person.pending ? "Cancel invite" : "Remove",
		destructive: true,
	});
	if (!ok) return;
	try {
		if (place.invite) await api.cancelInvite(place.store, place.invite);
		else if (person.user) await api.remove(place.store, person.user);
		toast(person.pending ? "Invite cancelled" : "Removed");
		await load();
	} catch (e) {
		toast(describe(e), "bad");
	}
}

const label = (p: StaffPerson) =>
	p.name || p.username || p.email || p.phone || (p.pending ? "Invited person" : "Team member");
const contact = (p: StaffPerson) => (p.username ? `@${p.username}` : p.email || p.phone || "");
const isYou = (p: StaffPerson) => !!p.user && p.user === session.user.value?.id;
const roleLabel = (place: StaffPlace) =>
	catalogue.value?.roles.find((r) => r.slug === place.role)?.display_name ?? titleCase(place.role);
const placeholder = { username: "their Mealgro username", phone: "+234 …", email: "name@example.com" };
</script>

<template>
	<PortalShell title="Staff">
		<template #actions>
			<select v-if="several" v-model="filter" class="p-input p-input--auto" aria-label="Show branch">
				<option value="">All branches</option>
				<option v-for="b in branches" :key="b.id" :value="b.id">{{ b.display_name }}</option>
			</select>
			<button class="p-btn p-btn--primary" :disabled="!catalogue || !invitable.length" @click="openInvite">Invite staff</button>
		</template>

		<section class="card-box card-box--flush arrive" aria-label="Your team">
			<div class="p-scroll">
				<table class="p-table">
					<thead><tr><th>Person</th><th>{{ several ? "Works at" : "Role" }}</th></tr></thead>
					<tbody>
						<template v-if="!loading && !error && shown.length">
							<tr v-for="p in shown" :key="p.user ?? p.email ?? p.phone ?? label(p)">
								<td class="who" data-primary>
									<strong>{{ label(p) }}</strong><span v-if="isYou(p)" class="p-muted"> (you)</span>
									<p class="p-muted">{{ contact(p) }}</p>
									<span v-if="p.pending" class="p-badge p-badge--warn">Invited</span>
								</td>
								<td data-wide>
									<ul class="places">
										<li v-for="place in p.branches" :key="place.store" class="place">
											<div class="place-name">
												<strong v-if="several">{{ place.branch_label || place.display_name }}</strong>
												<span class="p-badge" :class="place.role === 'owner' ? 'p-badge--brand' : ''">{{ roleLabel(place) }}</span>
											</div>
											<div v-if="place.role !== 'owner'" class="p-row actions">
												<button v-if="!p.pending" class="p-btn p-btn--sm" @click="openEdit(p, place)">Edit</button>
												<button class="p-btn p-btn--sm p-btn--danger" @click="remove(p, place)">{{ p.pending ? "Cancel" : "Remove" }}</button>
											</div>
										</li>
									</ul>
								</td>
							</tr>
						</template>
						<TableState v-else :loading="loading" :error="error" :colspan="2" empty-text="Nobody here yet." @retry="load" />
					</tbody>
				</table>
			</div>
		</section>

		<Modal
			v-if="form && catalogue"
			:title="form.target ? `${label(form.target.person)} at ${form.target.place.display_name}` : 'Invite staff'"
			wide
			@close="form = null"
		>
			<form id="staff-form" class="p-stack-sm" @submit.prevent="submit">
				<div v-if="formError" class="p-alert" role="alert">{{ formError }}</div>
				<template v-if="!form.target">
					<div class="p-tabs" role="group" aria-label="Find by">
						<button type="button" :aria-pressed="form.by === 'email'" @click="form.by = 'email'">Email</button>
						<button type="button" :aria-pressed="form.by === 'phone'" @click="form.by = 'phone'">Phone</button>
						<button type="button" :aria-pressed="form.by === 'username'" @click="form.by = 'username'">Username</button>
					</div>
					<label class="p-field">
						<span>{{ titleCase(form.by) }}</span>
						<input
							v-model="form.who"
							class="p-input"
							:type="form.by === 'email' ? 'email' : form.by === 'phone' ? 'tel' : 'text'"
							:placeholder="placeholder[form.by]"
							required
						/>
						<small v-if="form.by === 'email'">
							No Mealgro account with this email? We'll email them, and they join once they sign up and confirm it.
						</small>
						<small v-else-if="form.by === 'phone'">
							No account with this number? They join once they sign up and verify it.
						</small>
					</label>
					<fieldset v-if="several" class="p-fieldset grid-box">
						<legend>Branches</legend>
						<label v-for="b in invitable" :key="b.id" class="p-check">
							<input type="checkbox" :checked="form.stores.has(b.id)" @change="toggle(form.stores, b.id)" />
							<span>{{ b.display_name }}</span>
						</label>
					</fieldset>
				</template>

				<label class="p-field">
					<span>Role</span>
					<select class="p-input" :value="form.preset" @change="pickPreset(($event.target as HTMLSelectElement).value)">
						<option v-for="r in presets" :key="r.slug" :value="r.slug">{{ r.display_name }}</option>
						<option value="custom">Custom</option>
					</select>
				</label>
				<fieldset class="p-fieldset grid-box">
					<legend>Permissions</legend>
					<label v-for="c in catalogue.capabilities.filter((c) => c.slug !== 'manage-branches')" :key="c.slug" class="p-check">
						<input type="checkbox" :checked="form.caps.has(c.slug)" @change="toggleCap(c.slug)" />
						<span>{{ titleCase(c.slug) }}</span>
					</label>
				</fieldset>
			</form>
			<template #footer>
				<button class="p-btn p-btn--ghost" type="button" @click="form = null">Cancel</button>
				<button
					class="p-btn p-btn--primary"
					form="staff-form"
					:disabled="busy || !form.caps.size || (!form.target && (!form.who.trim() || !form.stores.size))"
				>
					{{ form.target ? "Save" : "Send invite" }}
				</button>
			</template>
		</Modal>
	</PortalShell>
</template>

<style scoped>
.who {
	vertical-align: top;
	min-width: 180px;
}
.places {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.place {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	flex-wrap: wrap;
}
.place-name {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}
.actions {
	gap: 6px;
}
.grid-box {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 4px 16px;
}
@media (max-width: 520px) {
	.grid-box {
		grid-template-columns: 1fr;
	}
}
</style>

<script setup lang="ts">
// The page a document request email links to (`/documents#<token>`). No
// sign-in: the token in the link says what Mealgro asked for, and only those
// fields are shown. Sending spends the link. What's sent lands in the console
// as if an admin had attached it.
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import AuthLayout from "../../components/portal/AuthLayout.vue";
import HomeLink from "../../components/portal/HomeLink.vue";
import {
	RequestError,
	linkProblem,
	loadCities,
	loadRequest,
	placeDetail,
	searchPlaces,
	submitRequest,
	type DocumentRequestView,
	type LinkProblem,
	type PlaceOption,
	type PlaceSuggestion,
} from "../../lib/documents/api";

const MAX_FILE = 20 * 1024 * 1024;
/** What the API's proxy takes in one request, less room for the form. */
const MAX_TOTAL = 45 * 1024 * 1024;

const token = ref("");
const view = ref<DocumentRequestView | null>(null);
const loading = ref(true);
const problem = ref<LinkProblem | null>(null);
const loadError = ref("");
const done = ref(false);

const isRider = computed(() => view.value?.subject === "rider");

function readToken(): string {
	const fromHash = decodeURIComponent(location.hash.replace(/^#/, "")).trim();
	if (fromHash) return fromHash;
	return new URLSearchParams(location.search).get("token")?.trim() ?? "";
}

async function load() {
	loading.value = true;
	loadError.value = "";
	problem.value = null;
	try {
		if (!token.value) {
			problem.value = "invalid";
			return;
		}
		view.value = await loadRequest(token.value);
	} catch (e) {
		problem.value = linkProblem(e);
		if (!problem.value) loadError.value = e instanceof Error ? e.message : "Something went wrong.";
	} finally {
		loading.value = false;
	}
}

function start() {
	token.value = readToken();
	view.value = null;
	done.value = false;
	load();
}

onMounted(() => {
	start();
	// A newer link pasted into the same tab changes only the fragment.
	window.addEventListener("hashchange", start);
});
onBeforeUnmount(() => window.removeEventListener("hashchange", start));

const problemText: Record<LinkProblem, { title: string; body: string }> = {
	invalid: {
		title: "This link isn't valid",
		body: "It may have been cut short when it was copied. Open the link in the most recent email from Mealgro.",
	},
	used: {
		title: "This link has already been used",
		body: "We received what was sent with it and are processing your account. If we need anything else, we'll email you a new link.",
	},
	replaced: {
		title: "This link was replaced",
		body: "We sent you a newer request. Open the link in the most recent email from Mealgro.",
	},
	expired: {
		title: "This link has expired",
		body: "Contact Mealgro support and we'll send you a new one.",
	},
};

// ── Files ────────────────────────────────────────────────────────────────────
const files = ref<Record<string, File | null>>({});
const fileErrors = ref<Record<string, string>>({});

const acceptTypes = computed(() => (isRider.value ? "image/*" : "image/*,application/pdf"));

function pick(kind: string, e: Event) {
	const input = e.target as HTMLInputElement;
	const f = input.files?.[0] ?? null;
	fileErrors.value[kind] = "";
	if (f && f.size > MAX_FILE) {
		fileErrors.value[kind] = "That file is over 20 MB. Use a smaller one.";
		input.value = "";
		files.value[kind] = null;
		return;
	}
	const pdf = f?.type === "application/pdf";
	if (f && !(f.type.startsWith("image/") || (pdf && !isRider.value))) {
		fileErrors.value[kind] = isRider.value ? "Choose a photo." : "Choose an image or a PDF.";
		input.value = "";
		files.value[kind] = null;
		return;
	}
	files.value[kind] = f;
}

const size = (f: File) => (f.size >= 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`);

// ── Address ──────────────────────────────────────────────────────────────────
const stateId = ref("");
const cityId = ref("");
const cities = ref<PlaceOption[]>([]);
const citiesLoading = ref(false);
const addressLine = ref("");
const postalCode = ref("");
const coords = ref<{ latitude: number; longitude: number } | null>(null);
const query = ref("");
const suggestions = ref<PlaceSuggestion[]>([]);
const searching = ref(false);
const searchError = ref("");
const placesSession = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
/** The city Google named for the picked place, matched once the list loads. */
let wantedCity = "";

watch(stateId, async (id) => {
	cityId.value = "";
	cities.value = [];
	if (!id) return;
	citiesLoading.value = true;
	try {
		cities.value = await loadCities(token.value, id);
		matchCity();
	} catch (e) {
		searchError.value = e instanceof Error ? e.message : "Couldn't load the cities.";
	} finally {
		citiesLoading.value = false;
	}
});

function matchCity() {
	if (!wantedCity || cityId.value) return;
	const hit = cities.value.find((c) => c.name.toLowerCase() === wantedCity.toLowerCase());
	if (hit) cityId.value = hit.id;
}

let timer: ReturnType<typeof setTimeout> | undefined;
watch(query, (q) => {
	clearTimeout(timer);
	searchError.value = "";
	if (q.trim().length < 3) {
		suggestions.value = [];
		return;
	}
	timer = setTimeout(async () => {
		searching.value = true;
		try {
			suggestions.value = await searchPlaces(token.value, q.trim(), placesSession);
		} catch (e) {
			suggestions.value = [];
			searchError.value = e instanceof Error ? e.message : "Search isn't working right now.";
		} finally {
			searching.value = false;
		}
	}, 350);
});

async function choose(s: PlaceSuggestion) {
	suggestions.value = [];
	searchError.value = "";
	try {
		const place = await placeDetail(token.value, s.place_id, placesSession);
		addressLine.value = place.formatted_address;
		coords.value = { latitude: place.latitude, longitude: place.longitude };
		query.value = "";
		wantedCity = place.city ?? "";
		matchCity();
	} catch (e) {
		searchError.value = e instanceof Error ? e.message : "Couldn't use that place. Search for it again.";
	}
}

// ── Send ─────────────────────────────────────────────────────────────────────
const sending = ref(false);
const sendError = ref("");
const attempted = ref(false);

const missing = computed(() => {
	const v = view.value;
	if (!v) return [];
	const out = v.documents.filter((d) => !files.value[d.kind]).map((d) => d.label);
	if (v.address) {
		if (!stateId.value || !cityId.value) out.push("Your store's state and city");
		if (!addressLine.value.trim() || !coords.value) out.push("Your store's address, picked from the search");
	}
	return out;
});

async function send() {
	attempted.value = true;
	sendError.value = "";
	const v = view.value;
	if (!v || missing.value.length || sending.value) return;
	const total = v.documents.reduce((sum, d) => sum + (files.value[d.kind]?.size ?? 0), 0);
	if (total > MAX_TOTAL) {
		sendError.value = "These files are too large to send together (45 MB at most). Use smaller scans or photos.";
		return;
	}
	const form = new FormData();
	for (const d of v.documents) form.set(d.kind, files.value[d.kind]!);
	if (v.address && coords.value) {
		form.set("state", stateId.value);
		form.set("city", cityId.value);
		form.set("address", addressLine.value.trim());
		form.set("latitude", String(coords.value.latitude));
		form.set("longitude", String(coords.value.longitude));
		if (postalCode.value.trim()) form.set("postal_code", postalCode.value.trim());
	}
	sending.value = true;
	try {
		await submitRequest(token.value, form);
		done.value = true;
		window.scrollTo({ top: 0, behavior: "smooth" });
	} catch (e) {
		const p = linkProblem(e);
		if (p) {
			problem.value = p;
			view.value = null;
		} else {
			sendError.value = e instanceof RequestError || e instanceof Error ? e.message : "Something went wrong. Try again.";
		}
	} finally {
		sending.value = false;
	}
}

const expires = computed(() =>
	view.value ? new Date(view.value.expires_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "",
);
</script>

<template>
	<AuthLayout
		area="Documents"
		headline="Almost there."
		tagline="Send what we need here and we'll continue processing your account. No sign-in needed."
		wide
	>
		<template #top><HomeLink /></template>

		<div v-if="loading" class="p-stack" aria-busy="true">
			<div class="p-skeleton p-skeleton--block" style="height: 28px; width: 60%" />
			<div class="p-skeleton p-skeleton--block" style="height: 16px" />
			<div class="p-skeleton p-skeleton--block" style="height: 120px" />
		</div>

		<div v-else-if="done" class="p-stack" role="status">
			<h1>Thank you, we've got it</h1>
			<p class="p-muted">
				We've received everything and will continue processing your {{ isRider ? "rider account" : "store" }}. We'll let you know by email
				if we need anything else.
			</p>
			<p class="p-muted p-small">You can close this page. The link has now been used.</p>
		</div>

		<div v-else-if="problem" class="p-stack" role="alert">
			<h1>{{ problemText[problem].title }}</h1>
			<p class="p-muted">{{ problemText[problem].body }}</p>
			<p class="p-muted p-small">Need help? <a href="/contact">Contact Mealgro support</a>.</p>
		</div>

		<div v-else-if="loadError" class="p-stack">
			<h1>We couldn't open this request</h1>
			<div class="p-alert" role="alert">{{ loadError }}</div>
			<button class="p-btn p-btn--primary" @click="load">Try again</button>
		</div>

		<form v-else-if="view" class="p-stack" novalidate @submit.prevent="send">
			<div>
				<h1>Hi {{ view.name || "there" }}</h1>
				<p class="p-muted">
					We need the following to continue processing your {{ isRider ? "rider account" : "store" }} on Mealgro:
				</p>
				<ul class="ask-list">
					<li v-for="d in view.documents" :key="d.kind">{{ d.label }}</li>
					<li v-if="view.address">Your store's address</li>
				</ul>
			</div>
			<div v-if="view.note" class="p-alert p-alert--info">“{{ view.note }}”</div>

			<fieldset v-if="view.documents.length" class="p-fieldset p-stack-sm">
				<legend>{{ isRider ? "Photos" : "Documents" }}</legend>
				<p class="p-hint">{{ isRider ? "A clear photo each, up to 20 MB." : "An image or a PDF each, up to 20 MB." }}</p>
				<label v-for="d in view.documents" :key="d.kind" class="p-field">
					<span>{{ d.label }}</span>
					<input
						class="p-input file-input"
						type="file"
						:accept="acceptTypes"
						:aria-invalid="attempted && !files[d.kind] ? 'true' : undefined"
						@change="pick(d.kind, $event)"
					/>
					<small v-if="fileErrors[d.kind]" class="err">{{ fileErrors[d.kind] }}</small>
					<small v-else-if="files[d.kind]">{{ files[d.kind]!.name }} · {{ size(files[d.kind]!) }}</small>
					<small v-else-if="attempted" class="err">Add this one.</small>
				</label>
			</fieldset>

			<fieldset v-if="view.address" class="p-fieldset p-stack-sm">
				<legend>Store address</legend>
				<p v-if="view.address.current_address" class="p-hint">
					On record now: {{ view.address.current_address }}. The new address is checked by Mealgro before it shows to customers.
				</p>
				<p v-else class="p-hint">Checked by Mealgro before it shows to customers.</p>
				<div class="p-grid two">
					<label class="p-field">
						<span>State</span>
						<select v-model="stateId" class="p-input">
							<option value="" disabled>Choose a state</option>
							<option v-for="s in view.address.states" :key="s.id" :value="s.id">{{ s.name }}</option>
						</select>
					</label>
					<label class="p-field">
						<span>City</span>
						<select v-model="cityId" class="p-input" :disabled="!stateId || citiesLoading">
							<option value="" disabled>{{ citiesLoading ? "Loading…" : "Choose a city" }}</option>
							<option v-for="c in cities" :key="c.id" :value="c.id">{{ c.name }}</option>
						</select>
					</label>
				</div>
				<div class="p-field search">
					<label for="place-q"><span>Find the address</span></label>
					<input
						id="place-q"
						v-model="query"
						class="p-input"
						type="search"
						autocomplete="off"
						placeholder="Street, building or landmark"
						aria-autocomplete="list"
						aria-controls="place-results"
					/>
					<small v-if="searching">Searching…</small>
					<small v-else-if="searchError" class="err">{{ searchError }}</small>
					<ul v-if="suggestions.length" id="place-results" class="results" role="listbox">
						<li v-for="s in suggestions" :key="s.place_id">
							<button type="button" class="result" role="option" @click="choose(s)">
								<strong>{{ s.main_text }}</strong>
								<span class="p-muted p-small">{{ s.secondary_text }}</span>
							</button>
						</li>
					</ul>
				</div>
				<label v-if="coords" class="p-field">
					<span>Address</span>
					<input v-model="addressLine" class="p-input" maxlength="200" />
					<small>Add a shop or flat number if it helps riders find you.</small>
				</label>
				<small v-else-if="attempted" class="err p-hint">Search for the address and pick it from the list.</small>
				<label class="p-field">
					<span>Postal code <span class="p-muted">(optional)</span></span>
					<input v-model="postalCode" class="p-input" maxlength="12" inputmode="numeric" />
				</label>
			</fieldset>

			<div v-if="attempted && missing.length" class="p-alert" role="alert">
				Still needed: {{ missing.join("; ") }}.
			</div>
			<div v-if="sendError" class="p-alert" role="alert">{{ sendError }}</div>

			<button class="p-btn p-btn--primary p-btn--block" :disabled="sending">
				{{ sending ? "Sending…" : "Send to Mealgro" }}
			</button>
			<p class="p-muted p-small">This link works once and until {{ expires }}. Your files go straight to Mealgro and are kept private.</p>
		</form>
	</AuthLayout>
</template>

<style scoped>
.ask-list {
	margin: 12px 0 0;
	padding-left: 20px;
	display: grid;
	gap: 4px;
}
.ask-list li {
	font-weight: 600;
}
.two {
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
.file-input {
	padding-top: 9px;
	padding-bottom: 9px;
	height: auto;
}
.search {
	position: relative;
}
.results {
	list-style: none;
	margin: 0;
	padding: 4px;
	border: 1px solid var(--line);
	border-radius: 16px;
	background: var(--surface);
	display: grid;
	gap: 2px;
}
.result {
	width: 100%;
	text-align: left;
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 10px 12px;
	border-radius: 12px;
	background: transparent;
	border: 0;
	cursor: pointer;
	color: inherit;
	min-height: 44px;
}
.result:hover,
.result:focus-visible {
	background: var(--brand-soft);
}
</style>

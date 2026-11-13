<script setup lang="ts">
// Where an ad shows: the whole market, or states and cities picked from the
// reference data. The picks become `location_key` prefixes (lib/ads/areas.ts).
import { computed, onMounted, ref } from "vue";
import {
	MAX_AREAS,
	areaDirectory as dir,
	areaLabel,
	cityKey,
	loadCities,
	loadMarket,
	stateKey,
} from "../../lib/ads/areas";
import type { Place } from "../../lib/ads/types";

const props = withDefaults(defineProps<{ modelValue: string[]; currency: string; disabled?: boolean }>(), {
	disabled: false,
});
const emit = defineEmits<{ "update:modelValue": [areas: string[]] }>();

const choosing = ref(props.modelValue.length > 0);
const filter = ref("");
const open = ref<Record<string, boolean>>({});
const cityError = ref<Record<string, string>>({});

onMounted(() => {
	void loadMarket(props.currency);
});

const selected = computed(() => new Set(props.modelValue));
const full = computed(() => props.modelValue.length >= MAX_AREAS);

function set(next: string[]) {
	emit("update:modelValue", next);
}

function whole() {
	choosing.value = false;
	set([]);
}

const states = computed(() => {
	const f = filter.value.trim().toLowerCase();
	return f ? dir.states.filter((s) => s.name.toLowerCase().includes(f)) : dir.states;
});

const sKey = (s: Place) => (dir.country ? stateKey(dir.country, s) : "");
const cKey = (s: Place, c: Place) => (dir.country ? cityKey(dir.country, s, c) : "");

/** Cities of a state that are picked. */
const pickedIn = (s: Place) => props.modelValue.filter((k) => k.startsWith(`${sKey(s)}-`)).length;

function toggleState(s: Place, on: boolean) {
	const key = sKey(s);
	// A whole state replaces its cities.
	const rest = props.modelValue.filter((k) => k !== key && !k.startsWith(`${key}-`));
	set(on ? [...rest, key] : rest);
}

function toggleCity(s: Place, c: Place, on: boolean) {
	const state = sKey(s);
	const key = cKey(s, c);
	// Picking a city means "only these cities": the whole state comes off.
	const rest = props.modelValue.filter((k) => k !== key && k !== state);
	set(on ? [...rest, key] : rest);
}

async function expand(s: Place) {
	open.value[s.id] = !open.value[s.id];
	if (!open.value[s.id]) return;
	cityError.value[s.id] = "";
	try {
		await loadCities(s.id);
	} catch {
		cityError.value[s.id] = "Couldn't load the cities.";
	}
}

const remove = (key: string) => set(props.modelValue.filter((k) => k !== key));
</script>

<template>
	<div class="p-stack-sm">
		<div v-if="dir.error" class="p-alert" role="alert">
			{{ dir.error }}
			<button class="p-btn p-btn--sm" type="button" @click="loadMarket(currency)">Retry</button>
		</div>

		<fieldset class="p-fieldset p-stack-sm" :disabled="disabled">
			<legend>Where your ad shows</legend>
			<p class="p-muted p-small">
				Country: <strong>{{ dir.country?.name ?? "…" }}</strong> (your market; it can't be changed)
			</p>
			<label class="p-check">
				<input type="radio" name="ads-area-mode" :checked="!choosing" @change="whole" />
				<span>All of {{ dir.country?.name ?? "your country" }}</span>
			</label>
			<label class="p-check">
				<input type="radio" name="ads-area-mode" :checked="choosing" @change="choosing = true" />
				<span>Only some states or cities</span>
			</label>
		</fieldset>

		<template v-if="choosing">
			<div v-if="modelValue.length" class="chips" aria-label="Chosen areas">
				<span v-for="k in modelValue" :key="k" class="chip">
					{{ areaLabel(k) }}
					<button type="button" :aria-label="`Remove ${areaLabel(k)}`" :disabled="disabled" @click="remove(k)">
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
					</button>
				</span>
			</div>
			<p class="p-hint">
				{{ modelValue.length }} of {{ MAX_AREAS }} chosen.
				<template v-if="!modelValue.length"> Choose at least one, or show it in the whole country.</template>
				<template v-if="full"> That's the most one ad can have.</template>
			</p>

			<label class="p-field">
				<span>Find a state</span>
				<input v-model="filter" class="p-input" type="search" autocomplete="off" placeholder="Lagos" />
			</label>

			<div v-if="dir.loading" class="p-stack-sm" role="status" aria-label="Loading states">
				<span v-for="i in 4" :key="i" class="p-skeleton" />
			</div>
			<ul v-else class="states">
				<li v-for="s in states" :key="s.id" class="state">
					<div class="state-row">
						<label class="p-check grow">
							<input
								type="checkbox"
								:checked="selected.has(sKey(s))"
								:disabled="disabled || (full && !selected.has(sKey(s)))"
								@change="toggleState(s, ($event.target as HTMLInputElement).checked)"
							/>
							<span>All of {{ s.name }}</span>
						</label>
						<button class="link p-tap more" type="button" :aria-expanded="!!open[s.id]" @click="expand(s)">
							{{ open[s.id] ? "Hide cities" : pickedIn(s) ? `Cities (${pickedIn(s)})` : "Choose cities" }}
						</button>
					</div>
					<div v-if="open[s.id]" class="cities">
						<p v-if="cityError[s.id]" class="p-hint err">{{ cityError[s.id] }}</p>
						<p v-else-if="!dir.cities[s.id]" class="p-hint" role="status">Loading cities…</p>
						<p v-else-if="!dir.cities[s.id].length" class="p-hint">No cities listed for {{ s.name }}.</p>
						<label v-for="c in dir.cities[s.id] ?? []" :key="c.id" class="p-check city">
							<input
								type="checkbox"
								:checked="selected.has(cKey(s, c))"
								:disabled="disabled || (full && !selected.has(cKey(s, c)))"
								@change="toggleCity(s, c, ($event.target as HTMLInputElement).checked)"
							/>
							<span>{{ c.name }}</span>
						</label>
					</div>
				</li>
				<li v-if="!states.length && !dir.error" class="p-hint">No state matches “{{ filter }}”.</li>
			</ul>
		</template>
	</div>
</template>

<style scoped>
.chips {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}
.chip {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 4px 4px 12px;
	border-radius: 9999px;
	background: var(--brand-soft);
	font-size: 13px;
	font-weight: 600;
}
.chip button {
	display: grid;
	place-items: center;
	width: 28px;
	height: 28px;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: inherit;
	cursor: pointer;
}
.chip button:hover {
	background: color-mix(in srgb, var(--ink) 10%, transparent);
}
.states {
	max-height: 420px;
	overflow-y: auto;
	border: 1px solid var(--line);
	border-radius: 1.25rem;
	padding: 4px 16px;
}
.state {
	border-bottom: 1px solid var(--bg);
	padding: 8px 0;
}
.state:last-child {
	border-bottom: 0;
}
.state-row {
	display: flex;
	align-items: center;
	gap: 12px;
}
.grow {
	flex: 1;
	min-height: 44px;
	align-items: center;
}
.more {
	font-size: 13px;
	white-space: nowrap;
	min-height: 44px;
}
.cities {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: 4px 16px;
	padding: 4px 0 8px 32px;
}
.city {
	min-height: 36px;
	align-items: center;
}
.err {
	color: var(--bad);
}
</style>

// Targeting areas are `location_key` prefixes: `ng` (the market), `ng-lg`
// (a state), `ng-lg-lekki` (a city). They're built here from the reference
// data's codes exactly as core builds them (shared/utils/location_key.rs), so
// nobody types a key. An empty list is the whole market.
import { reactive } from "vue";
import { places } from "./api";
import { countryOf } from "./market";
import type { Place } from "./types";

/** core's `sanitize`: lower case, letters and digits only. */
const sanitize = (code: string | undefined) =>
	(code ?? "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");

export const stateKey = (country: Place, state: Place) => `${sanitize(country.code)}-${sanitize(state.code)}`;

/** core's `city_segment`: city codes carry their state (`lg-lekki`); drop it. */
function citySegment(cityCode: string, stateCode: string): string {
	const prefix = `${stateCode.trim().toLowerCase()}-`;
	const code = cityCode.trim();
	return code.toLowerCase().startsWith(prefix) ? code.slice(prefix.length) : code;
}

export function cityKey(country: Place, state: Place, city: Place): string {
	const seg = sanitize(citySegment(city.code ?? "", state.code ?? ""));
	return seg ? `${stateKey(country, state)}-${seg}` : stateKey(country, state);
}

/** At most this many areas on a campaign (core's MAX_AREAS). */
export const MAX_AREAS = 20;

type Directory = {
	country: Place | null;
	states: Place[];
	/** Cities by state id, once loaded. */
	cities: Record<string, Place[]>;
	loading: boolean;
	error: string;
};

/** The advertiser's market's states and cities, loaded once a page. */
const dir = reactive<Directory>({ country: null, states: [], cities: {}, loading: false, error: "" });
let loadingFor: string | null = null;
let loading: Promise<void> | null = null;
const loadingCities = new Map<string, Promise<Place[]>>();

export const areaDirectory = dir;

/** Loads the market's country and its states. Safe to call many times. */
export function loadMarket(currency: string): Promise<void> {
	const iso = countryOf(currency);
	if (loadingFor === iso && loading) return loading;
	if (loadingFor === iso && dir.country) return Promise.resolve();
	loadingFor = iso;
	dir.loading = true;
	dir.error = "";
	loading = (async () => {
		try {
			const countries = await places.countries();
			const country = countries.find((c) => (c.code ?? "").trim().toUpperCase() === iso) ?? null;
			if (!country) throw new Error("Your market isn't in the list of places yet.");
			dir.country = country;
			dir.states = (await places.states(country.id)).slice().sort((a, b) => a.name.localeCompare(b.name));
		} catch (e) {
			dir.error = e instanceof Error && e.message ? e.message : "Couldn't load the list of places.";
			loadingFor = null;
		} finally {
			dir.loading = false;
			loading = null;
		}
	})();
	return loading;
}

/** A state's cities, loaded once. */
export function loadCities(stateId: string): Promise<Place[]> {
	if (dir.cities[stateId]) return Promise.resolve(dir.cities[stateId]);
	let p = loadingCities.get(stateId);
	if (!p) {
		p = places
			.cities(stateId)
			.then((list) => {
				const sorted = list.slice().sort((a, b) => a.name.localeCompare(b.name));
				dir.cities[stateId] = sorted;
				return sorted;
			})
			.finally(() => loadingCities.delete(stateId));
		loadingCities.set(stateId, p);
	}
	return p;
}

/** The state an area sits in (the area itself when it is a state). */
export function stateOf(key: string): Place | undefined {
	const country = dir.country;
	if (!country) return undefined;
	return dir.states.find((s) => key === stateKey(country, s) || key.startsWith(`${stateKey(country, s)}-`));
}

/** A person's name for an area: "Lagos", "Lekki, Lagos", or the key itself
 *  until the names are loaded. Loads a state's cities when it needs them. */
export function areaLabel(key: string): string {
	const country = dir.country;
	if (!country) return key;
	if (key === sanitize(country.code)) return `All of ${country.name}`;
	const state = stateOf(key);
	if (!state) return key;
	if (key === stateKey(country, state)) return `All of ${state.name}`;
	const cities = dir.cities[state.id];
	if (!cities) {
		void loadCities(state.id).catch(() => {});
		return key;
	}
	const city = cities.find((c) => cityKey(country, state, c) === key);
	return city ? `${city.name}, ${state.name}` : key;
}

/** Where a campaign shows, in words. */
export function areasText(areas: string[]): string {
	if (!areas.length) return dir.country ? `All of ${dir.country.name}` : "The whole market";
	return areas.map(areaLabel).join(" · ");
}

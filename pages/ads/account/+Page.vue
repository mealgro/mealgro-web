<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import AdsShell from "../../../components/ads/AdsShell.vue";
import TermsText from "../../../components/affiliate/TermsText.vue";
import { me, publicApi } from "../../../lib/ads/api";
import { day, describe, errorCode } from "../../../lib/ads/format";
import { session } from "../../../lib/ads/session";
import { toast } from "../../../lib/ads/toast";
import type { Terms } from "../../../lib/ads/types";
import { confirmAction } from "../../../lib/portal/confirm";
import { phone } from "../../../lib/portal/format";

const user = session.user;
const termsCurrent = session.termsCurrent;
const suspended = session.suspended;
const form = reactive({ full_name: "", business_name: "", website: "" });
const busy = ref(false);
const error = ref("");
type Field = "full_name" | "business_name" | "website";
const bad = ref<Field | null>(null);

function fill() {
	if (!user.value) return;
	form.full_name = user.value.full_name;
	form.business_name = user.value.business_name;
	form.website = user.value.website ?? "";
}

onMounted(async () => {
	if (!(await session.restore())) return;
	fill();
	if (!termsCurrent.value) void loadTerms();
});

const nameChanged = computed(() => !!user.value && form.business_name.trim() !== user.value.business_name);
const changed = computed(
	() =>
		!!user.value &&
		(form.full_name.trim() !== user.value.full_name ||
			nameChanged.value ||
			form.website.trim() !== (user.value.website ?? "")),
);

const FIELD: Record<string, Field> = {
	AdsErrorFullNameRequired: "full_name",
	AdsErrorFullNameTooLong: "full_name",
	AdsErrorBusinessNameRequired: "business_name",
	AdsErrorBusinessNameTooLong: "business_name",
	AdsErrorWebsiteInvalid: "website",
};

async function save() {
	if (busy.value || !user.value || !changed.value) return;
	const website = form.website.trim();
	if (website && !/^https:\/\//i.test(website)) {
		bad.value = "website";
		error.value = "Enter a website starting with https://, or leave it empty.";
		return;
	}
	if (nameChanged.value) {
		const ok = await confirmAction({
			title: `Change your business name to “${form.business_name.trim()}”?`,
			message:
				"Every ad shows your business name. Ads you've sent go back to review with the new name, and live ones stop showing until they're approved again.",
			confirmText: "Change it",
		});
		if (!ok) return;
	}
	busy.value = true;
	error.value = "";
	bad.value = null;
	const body: { full_name?: string; business_name?: string; website?: string } = {};
	if (form.full_name.trim() !== user.value.full_name) body.full_name = form.full_name.trim();
	if (nameChanged.value) body.business_name = form.business_name.trim();
	if (website !== (user.value.website ?? "")) body.website = website;
	try {
		session.setUser(await me.update(body));
		fill();
		toast(body.business_name ? "Saved. Your ads with the old name are back in review." : "Profile saved.");
	} catch (e) {
		error.value = describe(e);
		bad.value = FIELD[errorCode(e)] ?? null;
	} finally {
		busy.value = false;
	}
}

// ── Terms ────────────────────────────────────────────────────────────────────
const terms = ref<Terms | null>(null);
const termsError = ref("");
const agreed = ref(false);
const accepting = ref(false);

async function loadTerms() {
	termsError.value = "";
	try {
		terms.value = await publicApi.terms();
	} catch (e) {
		termsError.value = describe(e);
	}
}

async function accept() {
	if (!terms.value || !agreed.value || accepting.value) return;
	accepting.value = true;
	termsError.value = "";
	try {
		session.setUser(await me.acceptTerms(terms.value.version));
		toast("Thanks. You've accepted the updated terms.");
	} catch (e) {
		termsError.value = describe(e);
		// A newer version may have just been published.
		agreed.value = false;
		await loadTerms();
	} finally {
		accepting.value = false;
	}
}
</script>

<template>
	<AdsShell title="Account" hide-terms-banner>
		<section v-if="user && !termsCurrent" id="terms" class="card-box p-stack-sm gate arrive" aria-labelledby="ads-terms-h">
			<div>
				<h2 id="ads-terms-h">We've updated the Mealgro Ads terms</h2>
				<p class="p-muted">Please read and accept them. Until you do, you can't send ads for review.</p>
			</div>
			<div v-if="termsError" class="p-alert" role="alert">
				{{ termsError }}
				<button v-if="!terms" class="p-btn p-btn--sm" type="button" @click="loadTerms">Retry</button>
			</div>
			<TermsText v-if="terms" :content="terms.content" label="Updated Mealgro Ads terms" />
			<div v-else-if="!termsError" class="p-skeleton p-skeleton--block" role="status" aria-label="Loading the terms" />
			<form v-if="terms" class="p-row p-wrap p-between" @submit.prevent="accept">
				<label class="p-check">
					<input v-model="agreed" type="checkbox" required />
					<span>I've read and accept the updated Mealgro Ads terms</span>
				</label>
				<button class="p-btn p-btn--primary" :disabled="!agreed || accepting">
					{{ accepting ? "Saving…" : "Accept" }}
				</button>
			</form>
		</section>

		<div class="cols">
			<form v-if="user" class="card-box p-stack-sm arrive" style="--i: 1" novalidate @submit.prevent="save">
				<div class="card-h">
					<div>
						<h2>Your details</h2>
						<p>Advertising since {{ day(user.created_at) }}</p>
					</div>
					<span class="p-badge p-badge--brand">{{ user.currency }} market</span>
				</div>
				<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
				<p v-if="suspended" class="p-alert p-alert--warn">Your account is suspended, so your details can't be changed right now.</p>
				<label class="p-field">
					<span>Full name</span>
					<input v-model="form.full_name" class="p-input" autocomplete="name" maxlength="50" :disabled="suspended" :aria-invalid="bad === 'full_name'" required />
				</label>
				<label class="p-field">
					<span>Business name</span>
					<input v-model="form.business_name" class="p-input" autocomplete="organization" maxlength="60" :disabled="suspended" :aria-invalid="bad === 'business_name'" aria-describedby="ads-biz-note" required />
					<small id="ads-biz-note" :class="{ err: nameChanged }">
						Shown on every ad as “Sponsored · {{ form.business_name.trim() || "…" }}”.
						Changing it sends your ads back to review, and live ones stop showing until approved.
					</small>
				</label>
				<label class="p-field">
					<span>Website (optional)</span>
					<input v-model="form.website" class="p-input" type="url" inputmode="url" autocomplete="url" maxlength="2048" placeholder="https://" :disabled="suspended" :aria-invalid="bad === 'website'" aria-describedby="ads-site-note" />
					<small id="ads-site-note">Our reviewers see it. It isn't shown on your ads.</small>
				</label>
				<dl class="kv">
					<div><dt>Email</dt><dd>{{ user.email }}</dd></div>
					<div><dt>Phone</dt><dd>{{ phone(user.phone) }}</dd></div>
					<div><dt>Currency</dt><dd>{{ user.currency }}</dd></div>
				</dl>
				<p class="p-hint">Your email, phone and market can't be changed here. Contact support if you need to. A new market needs a new account.</p>
				<div class="foot">
					<button class="p-btn p-btn--primary" :disabled="suspended || !changed || busy">
						{{ busy ? "Saving…" : "Save" }}
					</button>
				</div>
			</form>
			<div v-else class="p-skeleton p-skeleton--block" aria-hidden="true" />

			<section class="card-box p-stack-sm arrive" style="--i: 2">
				<div>
					<h2>Sign out</h2>
					<p class="p-muted">Signs you out of Mealgro Ads on this browser.</p>
				</div>
				<div><button class="p-btn" type="button" @click="session.signOut()">Sign out</button></div>
			</section>
		</div>
	</AdsShell>
</template>

<style scoped>
.gate {
	border: 2px solid var(--brand);
}
.cols {
	display: grid;
	gap: 20px;
	grid-template-columns: minmax(0, 1fr);
	align-items: start;
	max-width: 1000px;
}
.card-h {
	margin-bottom: 4px;
}
.foot {
	display: flex;
	justify-content: flex-end;
}
@media (min-width: 1024px) {
	.cols {
		grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
	}
}
</style>

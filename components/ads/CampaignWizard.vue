<script setup lang="ts">
// Making or changing a campaign in four steps: format, creative (with a live
// preview), where and when, budget. A draft is made after step 1 and saved at
// every step after that, so nothing is lost. A campaign already sent keeps
// its changes until "Save changes": a new image or video, description, link
// or areas sends it back to review, so that step asks first.
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import AdPreview from "./AdPreview.vue";
import AreaPicker from "./AreaPicker.vue";
import FormatPicture from "./FormatPicture.vue";
import TopUpForm from "./TopUpForm.vue";
import TopUpReturn from "./TopUpReturn.vue";
import StateBlock from "../portal/StateBlock.vue";
import { campaigns as campaignsApi, media as mediaApi, wallet as walletApi } from "../../lib/ads/api";
import { loadMarket } from "../../lib/ads/areas";
import {
	amountLike,
	count,
	describe,
	editable,
	errorCode,
	money,
	parseMajor,
	statusLabel,
	submitted as isSubmittedStatus,
	toMinor,
} from "../../lib/ads/format";
import { daysBetween, endDay, marketToday, startDay } from "../../lib/ads/market";
import { session } from "../../lib/ads/session";
import { toast } from "../../lib/ads/toast";
import type { AdFormat, Campaign, CampaignForm, MediaKind, Wallet } from "../../lib/ads/types";
import { confirmAction } from "../../lib/portal/confirm";

const user = session.user;
const pricing = session.pricing;
const termsCurrent = session.termsCurrent;
const suspended = session.suspended;

const STEPS = ["Format", "Creative", "Where and when", "Budget"] as const;
const step = ref(1);
const campaign = ref<Campaign | null>(null);
const wallet = ref<Wallet | null>(null);
const loadError = ref("");
const loading = ref(true);
const busy = ref(false);
const error = ref("");
/** The API's name for the last error. */
const errorName = ref("");
/** The submit failed for want of credit: offer a top-up in place. */
const short = ref(false);

const form = reactive({
	name: "",
	format: "feed" as AdFormat,
	description: "",
	destination_url: "",
	areas: [] as string[],
	starts_on: "",
	ends_on: "",
	budget: "",
	daily: "",
});

const currency = computed(() => user.value?.currency ?? "NGN");
const today = computed(() => marketToday(currency.value));
const status = computed(() => campaign.value?.status ?? "draft");
/** Sent: its budget is held, and some changes send it back to review. */
const isSent = computed(() => isSubmittedStatus(status.value));
const isDraft = computed(() => status.value === "draft" || status.value === "rejected");
/** Live, paused or spent: its start has passed and can't move. */
const startLocked = computed(() => ["live", "paused", "exhausted"].includes(status.value));
const locked = computed(() => !!campaign.value && !editable(campaign.value.status));

// ── Loading ──────────────────────────────────────────────────────────────────
function fill(c: Campaign) {
	campaign.value = c;
	form.name = c.name;
	form.format = c.format;
	form.description = c.creative.description;
	form.destination_url = c.creative.destination_url;
	form.areas = [...c.areas];
	form.starts_on = startDay(c.starts_at, c.currency);
	// A draft's start that has passed moves to today (submitting does the same).
	if ((c.status === "draft" || c.status === "rejected") && form.starts_on < marketToday(c.currency))
		form.starts_on = marketToday(c.currency);
	form.ends_on = endDay(c.ends_at, c.currency) ?? "";
	form.budget = c.budget.amount ? String(c.budget.amount) : "";
	form.daily = c.daily_budget ? String(c.daily_budget.amount) : "";
}

async function loadWallet() {
	try {
		wallet.value = await walletApi.get();
	} catch {
		// The budget step says the balance is unknown; submitting still checks it.
	}
}

function setAddress() {
	const url = new URL(location.href);
	if (campaign.value) url.searchParams.set("id", campaign.value.id);
	url.searchParams.set("step", String(step.value));
	history.replaceState(history.state, "", url.pathname + url.search + url.hash);
}

async function load() {
	loading.value = true;
	loadError.value = "";
	const q = new URLSearchParams(location.search);
	const id = q.get("id");
	const s = Number(q.get("step"));
	try {
		if (id) fill(await campaignsApi.get(id));
		else form.starts_on = today.value;
		step.value = id && s >= 1 && s <= 4 ? s : 1;
	} catch (e) {
		loadError.value = errorCode(e) === "AdsErrorNotFound" ? "We couldn't find that campaign." : describe(e);
	} finally {
		loading.value = false;
	}
}

onMounted(async () => {
	if (!(await session.restore())) return;
	void loadMarket(currency.value);
	void session.loadPricing().catch(() => {});
	void loadWallet();
	await load();
});

// ── Media ────────────────────────────────────────────────────────────────────
const localUrl = ref<string | null>(null);
const localKind = ref<MediaKind>("image");
/** An upload not yet saved on a sent campaign (it goes with "Save changes"). */
const pendingMedia = ref<string | null>(null);
const progress = ref<number | null>(null);
const mediaError = ref("");
const fileInput = ref<HTMLInputElement>();

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-m4v"];
const MB = 1024 * 1024;

function revoke() {
	if (localUrl.value) URL.revokeObjectURL(localUrl.value);
	localUrl.value = null;
}
onBeforeUnmount(revoke);

const imageSize = (url: string) =>
	new Promise<{ w: number; h: number }>((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
		img.onerror = reject;
		img.src = url;
	});

const videoInfo = (url: string) =>
	new Promise<{ w: number; h: number; secs: number }>((resolve, reject) => {
		const v = document.createElement("video");
		v.preload = "metadata";
		v.onloadedmetadata = () => resolve({ w: v.videoWidth, h: v.videoHeight, secs: v.duration });
		v.onerror = reject;
		v.src = url;
	});

/** Checks a file before it's sent: the API checks again. */
async function checkFile(file: File, url: string): Promise<string> {
	const isVideo = VIDEO_TYPES.includes(file.type) || /\.(mp4|mov|m4v)$/i.test(file.name);
	const isImage = IMAGE_TYPES.includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
	if (form.format === "banner" && !isImage) return "Banners take one image: JPG, PNG or WebP.";
	if (!isImage && !isVideo) return "Upload a JPG, PNG or WebP image, or an MP4 or MOV video.";
	if (isImage) {
		if (file.size > 20 * MB) return "Images can be at most 20 MB.";
		try {
			const { w } = await imageSize(url);
			if (w < 1080) return `Images must be at least 1080 pixels wide. This one is ${w}.`;
		} catch {
			return "We couldn't read that image. Try another file.";
		}
		return "";
	}
	if (file.size > 50 * MB) return "Videos can be at most 50 MB.";
	try {
		const { w, h, secs } = await videoInfo(url);
		if (w && h && h <= w) return "Videos must be portrait (9:16), like 1080×1920.";
		if (secs && (secs < 5 || secs > 30.5)) return "Videos must be 5 to 30 seconds long.";
	} catch {
		// Some browsers can't read a MOV; the API checks the shape.
	}
	return "";
}

async function onFile(e: Event) {
	const input = e.target as HTMLInputElement;
	const file = input.files?.[0];
	input.value = "";
	if (!file || !campaign.value || busy.value) return;
	mediaError.value = "";
	const url = URL.createObjectURL(file);
	const problem = await checkFile(file, url);
	if (problem) {
		URL.revokeObjectURL(url);
		mediaError.value = problem;
		return;
	}
	revoke();
	localUrl.value = url;
	const kind: MediaKind = file.type.startsWith("video") || /\.(mp4|mov|m4v)$/i.test(file.name) ? "video" : "image";
	localKind.value = kind;
	busy.value = true;
	progress.value = 0;
	try {
		const up = await mediaApi.upload(file, form.format, (p) => (progress.value = p));
		progress.value = null;
		if (isSent.value) {
			pendingMedia.value = up.id;
		} else {
			// Only the saved campaign moves: text typed but not saved yet stays.
			campaign.value = await campaignsApi.update(campaign.value.id, { media: up.id });
			// The saved image is cropped the way the app shows it: show that one.
			if (kind === "image") revoke();
		}
	} catch (err) {
		revoke();
		pendingMedia.value = null;
		mediaError.value = describe(err);
	} finally {
		busy.value = false;
		progress.value = null;
	}
}

const previewUrl = computed(() => localUrl.value ?? (campaign.value?.creative.media_url || null));
const previewKind = computed<MediaKind>(() => (localUrl.value ? localKind.value : (campaign.value?.creative.media_kind ?? "image")));
const hasMedia = computed(() => !!previewUrl.value);

// ── Changes ──────────────────────────────────────────────────────────────────
const budgetMajor = computed(() => parseMajor(form.budget));
const dailyMajor = computed(() => (form.daily.trim() ? parseMajor(form.daily) : null));

/** What differs from the saved campaign, as the API takes it. */
function changes(): CampaignForm {
	const c = campaign.value;
	if (!c) return {};
	const out: CampaignForm = {};
	const name = form.name.trim();
	if (name && name !== c.name) out.name = name;
	if (pendingMedia.value) out.media = pendingMedia.value;
	const desc = form.description.trim();
	if (form.format === "feed" && desc !== c.creative.description) out.description = desc;
	const link = form.destination_url.trim();
	if (link && link !== c.creative.destination_url) out.destination_url = link;
	const areas = [...form.areas].sort();
	if (areas.join(",") !== [...c.areas].sort().join(",")) out.areas = areas;
	if (form.starts_on && form.starts_on !== startDay(c.starts_at, c.currency) && !startLocked.value)
		out.starts_on = form.starts_on;
	const end = form.ends_on || null;
	if (end !== endDay(c.ends_at, c.currency)) out.ends_on = end;
	if (isDraft.value && budgetMajor.value !== null && toMinor(budgetMajor.value) !== toMinor(c.budget.amount))
		out.budget = toMinor(budgetMajor.value);
	const daily = dailyMajor.value === null ? null : toMinor(dailyMajor.value);
	const had = c.daily_budget ? toMinor(c.daily_budget.amount) : null;
	if (daily !== had && (form.daily.trim() === "" || dailyMajor.value !== null)) out.daily_budget = daily;
	return out;
}

/** Changes a reviewer has to see again. */
const REVIEWED: (keyof CampaignForm)[] = ["media", "description", "destination_url", "areas"];

/** Problems the API would refuse, said before asking it. */
function check(upTo: number): { step: number; text: string } | null {
	if (upTo >= 1 && !form.name.trim()) return { step: 1, text: "Give the campaign a name." };
	if (upTo >= 2) {
		if (form.description.trim().length > 90) return { step: 2, text: "Descriptions can be at most 90 characters." };
		const link = form.destination_url.trim();
		if (link && !/^https:\/\/[^\s/]+\.[^\s]+/i.test(link))
			return { step: 2, text: "Enter a link starting with https://, like https://yourbusiness.com." };
	}
	if (upTo >= 3) {
		if (form.ends_on && form.starts_on && form.ends_on < form.starts_on)
			return { step: 3, text: "The end date can't be before the start date." };
		if (!startLocked.value && form.starts_on && form.starts_on < today.value && changes().starts_on)
			return { step: 3, text: "The start date can't be in the past." };
	}
	if (upTo >= 4) {
		if (form.budget.trim() && budgetMajor.value === null) return { step: 4, text: "Enter the budget as a number, like 20000." };
		if (form.daily.trim() && dailyMajor.value === null) return { step: 4, text: "Enter the daily budget as a number, or leave it empty." };
		if (budgetMajor.value !== null && dailyMajor.value !== null && dailyMajor.value > budgetMajor.value)
			return { step: 4, text: "The daily budget can't be more than the whole budget." };
	}
	return null;
}

/** Which step an API error belongs to. */
const STEP_OF: Record<string, number> = {
	AdsErrorNameRequired: 1,
	AdsErrorMediaRequired: 2,
	AdsErrorMediaNotFound: 2,
	AdsErrorImageTooSmall: 2,
	AdsErrorVideoNotPortrait: 2,
	AdsErrorBannerNeedsImage: 2,
	AdsErrorDescriptionRequired: 2,
	AdsErrorDescriptionTooLong: 2,
	AdsErrorDestinationInvalid: 2,
	AdsErrorDestinationUnreachable: 2,
	AdsErrorAreaOutsideMarket: 3,
	AdsErrorTooManyAreas: 3,
	AdsErrorStartInPast: 3,
	AdsErrorEndBeforeStart: 3,
	AdsErrorBudgetBelowMinimum: 4,
	AdsErrorDailyBudgetBelowMinimum: 4,
	AdsErrorDailyBudgetAboveBudget: 4,
	AdsErrorInsufficientBalance: 4,
};

function fail(e: unknown) {
	const code = errorCode(e);
	errorName.value = code;
	error.value = describe(e);
	if (code === "AdsErrorDestinationUnreachable")
		error.value = "That link doesn't open for us. Check it loads in a browser, then try again.";
	if (STEP_OF[code]) go(STEP_OF[code], false);
	short.value = code === "AdsErrorInsufficientBalance";
	if (short.value) void loadWallet();
}

/** Saves a draft's changes so far (sent campaigns wait for "Save changes"). */
async function saveDraft(): Promise<boolean> {
	if (!campaign.value || isSent.value) return true;
	const body = changes();
	if (!Object.keys(body).length) return true;
	try {
		fill(await campaignsApi.update(campaign.value.id, body));
		return true;
	} catch (e) {
		fail(e);
		return false;
	}
}

function go(n: number, clear = true) {
	step.value = n;
	if (clear) {
		error.value = "";
		errorName.value = "";
	}
	setAddress();
	window.scrollTo({ top: 0, behavior: "smooth" });
}

async function next() {
	if (busy.value) return;
	error.value = "";
	const problem = check(step.value);
	if (problem) {
		error.value = problem.text;
		return;
	}
	busy.value = true;
	try {
		if (!campaign.value) {
			// Step 1 done: the draft is made.
			fill(await campaignsApi.create({ name: form.name.trim(), format: form.format }));
		} else if (!(await saveDraft())) {
			return;
		}
		go(step.value + 1);
	} catch (e) {
		fail(e);
	} finally {
		busy.value = false;
	}
}

async function jump(n: number) {
	if (busy.value || n === step.value) return;
	if (!campaign.value && n > 1) return;
	if (n > step.value) {
		const problem = check(step.value);
		if (problem) {
			error.value = problem.text;
			return;
		}
	}
	busy.value = true;
	const ok = await saveDraft();
	busy.value = false;
	if (ok) go(n);
}

// ── Submit / save ────────────────────────────────────────────────────────────
async function submit() {
	if (busy.value || !campaign.value) return;
	error.value = "";
	short.value = false;
	const problem = check(4);
	if (problem) {
		error.value = problem.text;
		go(problem.step, false);
		return;
	}
	if (!form.budget.trim()) {
		error.value = "Set a budget.";
		return;
	}
	busy.value = true;
	try {
		if (!(await saveDraft())) return;
		const c = await campaignsApi.submit(campaign.value.id);
		toast(`Sent for review. ${money(c.budget)} is held from your ad wallet.`);
		location.assign(`/ads/campaigns/view?id=${c.id}`);
	} catch (e) {
		fail(e);
	} finally {
		busy.value = false;
	}
}

async function saveSent() {
	if (busy.value || !campaign.value) return;
	error.value = "";
	const problem = check(4);
	if (problem) {
		error.value = problem.text;
		go(problem.step, false);
		return;
	}
	const body = changes();
	if (!Object.keys(body).length) {
		location.assign(`/ads/campaigns/view?id=${campaign.value.id}`);
		return;
	}
	if (REVIEWED.some((k) => k in body)) {
		const ok = await confirmAction({
			title: "Send this ad back to review?",
			message:
				status.value === "live"
					? "You changed the image or video, the description, the link or the areas. The ad stops showing until a reviewer approves it again, usually within 24 hours."
					: "You changed the image or video, the description, the link or the areas, so a reviewer looks at it again, usually within 24 hours.",
			confirmText: "Save and send to review",
		});
		if (!ok) return;
	}
	busy.value = true;
	try {
		const c = await campaignsApi.update(campaign.value.id, body);
		pendingMedia.value = null;
		toast(c.status === "in-review" && status.value !== "in-review" ? "Saved. The ad is back in review." : "Saved.");
		location.assign(`/ads/campaigns/view?id=${c.id}`);
	} catch (e) {
		fail(e);
	} finally {
		busy.value = false;
	}
}

// ── Budget figures ───────────────────────────────────────────────────────────
const cpm = computed(() => {
	if (campaign.value && campaign.value.cpm.amount > 0) return campaign.value.cpm;
	const p = pricing.value;
	if (!p) return null;
	return form.format === "feed" ? p.feed_cpm : p.banner_cpm;
});
const impressions = computed(() => {
	const b = isDraft.value ? budgetMajor.value : (campaign.value?.budget.amount ?? null);
	if (b === null || !cpm.value || cpm.value.amount <= 0) return null;
	return Math.floor((b * 1000) / cpm.value.amount);
});
const days = computed(() => (form.starts_on && form.ends_on ? daysBetween(form.starts_on, form.ends_on) : null));
const after = computed(() =>
	wallet.value && budgetMajor.value !== null ? wallet.value.available.amount - budgetMajor.value : null,
);
const shortBy = computed(() => {
	if (after.value === null || after.value >= 0) return null;
	return Math.max(Math.ceil(-after.value), pricing.value?.top_up_min.amount ?? 0);
});
const like = computed(() => campaign.value?.budget ?? wallet.value?.available ?? pricing.value?.min_budget ?? null);
const m = (n: number) => money(amountLike(like.value, n));
const returnPath = computed(() => (campaign.value ? `${location.pathname}?id=${campaign.value.id}&step=4` : "/ads/wallet"));
const descLeft = computed(() => 90 - form.description.length);

const blockedWhy = computed(() => {
	if (suspended.value) return "Your account is suspended, so ads can't be changed or sent right now.";
	return "";
});
</script>

<template>
	<StateBlock v-if="loading || loadError" class="card-box" :loading="loading" :error="loadError || null" @retry="load" />

	<section v-else-if="locked" class="card-box p-state" role="status">
		<p>This campaign has {{ statusLabel[status].toLowerCase() }}, so it can't be changed.</p>
		<a class="p-btn p-btn--sm" :href="`/ads/campaigns/view?id=${campaign?.id}`">See the campaign</a>
	</section>

	<template v-else>
		<TopUpReturn @paid="loadWallet" />

		<nav class="steps" aria-label="Steps">
			<ol>
				<li v-for="(label, i) in STEPS" :key="label">
					<button
						type="button"
						:aria-current="step === i + 1 ? 'step' : undefined"
						:class="{ on: step === i + 1, done: step > i + 1 }"
						:disabled="(!campaign && i > 0) || busy"
						@click="jump(i + 1)"
					>
						<span class="n">{{ i + 1 }}</span>
						<span class="l">{{ label }}</span>
					</button>
				</li>
			</ol>
		</nav>

		<div v-if="blockedWhy" class="p-alert p-alert--warn" role="status">{{ blockedWhy }}</div>
		<div v-if="isSent" class="p-alert p-alert--info" role="status">
			<p>
				<strong>This ad has been sent ({{ statusLabel[status].toLowerCase() }}).</strong>
				Changing the image or video, the description, the link or the areas sends it back to review<template v-if="status === 'live'">, and it stops showing until it's approved</template>.
				The end date and the daily budget don't need a review.
			</p>
		</div>
		<div v-if="error" class="p-alert" role="alert">
			{{ error }}
			<template v-if="errorName === 'AdsErrorTermsOutdated'"> <a href="/ads/account#terms">Read and accept</a></template>
		</div>

		<!-- 1. Format -->
		<section v-if="step === 1" class="card-box p-stack arrive" aria-labelledby="w1-h">
			<div>
				<h2 id="w1-h">Choose a format</h2>
				<p class="p-muted">Where your ad appears in the Mealgro app.</p>
			</div>
			<div class="formats" role="radiogroup" aria-label="Format">
				<label v-for="f in (['feed', 'banner'] as AdFormat[])" :key="f" class="format" :class="{ on: form.format === f, fixed: !!campaign }">
					<input v-model="form.format" type="radio" name="ads-format" :value="f" :disabled="!!campaign" class="sr-only" />
					<FormatPicture :format="f" />
					<span class="format-text">
						<strong>{{ f === "feed" ? "Feed ad" : "Banner" }}</strong>
						<span v-if="f === 'feed'">A full page between the dishes people swipe through. Image or portrait video, with a short line of text.</span>
						<span v-else>A wide image in the carousel at the top of Explore, 120 points tall.</span>
						<span v-if="pricing" class="price">{{ money(f === "feed" ? pricing.feed_cpm : pricing.banner_cpm) }} per 1,000 impressions</span>
					</span>
				</label>
			</div>
			<p v-if="campaign" class="p-hint">The format can't be changed after the draft is made. Start a new campaign for the other one.</p>
			<label class="p-field narrow">
				<span>Campaign name</span>
				<input v-model="form.name" class="p-input" maxlength="60" placeholder="November promo" :disabled="!!blockedWhy" required />
				<small>Only you see this.</small>
			</label>
		</section>

		<!-- 2. Creative -->
		<section v-else-if="step === 2" class="card-box arrive" aria-labelledby="w2-h">
			<div class="creative">
				<div class="p-stack">
					<div>
						<h2 id="w2-h">Your ad</h2>
						<p class="p-muted">
							<template v-if="form.format === 'feed'">An image (at least 1080×1920) or a portrait video (5 to 30 seconds, up to 50 MB, MP4 or MOV). It's cropped to 9:16 from the centre. Videos play muted, with a sound button.</template>
							<template v-else>One image, 1290×360. Keep words and logos in the middle 1080×360: phones cut off the sides.</template>
						</p>
					</div>
					<div class="p-field">
						<span>{{ form.format === "feed" ? "Image or video" : "Image" }}</span>
						<div class="p-row p-wrap">
							<button class="p-btn" type="button" :disabled="busy || !!blockedWhy" @click="fileInput?.click()">
								{{ progress !== null ? `Uploading… ${Math.round(progress * 100)}%` : hasMedia ? "Replace" : "Upload" }}
							</button>
							<span v-if="pendingMedia" class="p-badge p-badge--warn">New file, not saved yet</span>
						</div>
						<input
							ref="fileInput"
							class="sr-only"
							type="file"
							tabindex="-1"
							:accept="form.format === 'feed' ? 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime' : 'image/jpeg,image/png,image/webp'"
							@change="onFile"
						/>
						<small v-if="mediaError" class="err" role="alert">{{ mediaError }}</small>
					</div>
					<label v-if="form.format === 'feed'" class="p-field">
						<span>Description</span>
						<textarea v-model="form.description" class="p-input" rows="2" maxlength="90" :disabled="!!blockedWhy" aria-describedby="w2-desc" />
						<small id="w2-desc">{{ descLeft }} characters left. No links: the whole ad opens your link.</small>
					</label>
					<label class="p-field">
						<span>Link</span>
						<input v-model="form.destination_url" class="p-input" type="url" inputmode="url" maxlength="2048" placeholder="https://yourbusiness.com" :disabled="!!blockedWhy" aria-describedby="w2-link" />
						<small id="w2-link">Opens when someone taps the ad. It must start with https:// and load. We check it when you send the ad.</small>
					</label>
				</div>
				<div class="preview" aria-label="Preview">
					<p class="p-hint">Preview</p>
					<AdPreview
						:format="form.format"
						:media-url="previewUrl"
						:media-kind="previewKind"
						:poster="localUrl ? null : campaign?.creative.thumbnail_url"
						:description="form.description"
						:business-name="user?.business_name ?? ''"
					/>
				</div>
			</div>
		</section>

		<!-- 3. Where and when -->
		<section v-else-if="step === 3" class="card-box p-stack arrive" aria-labelledby="w3-h">
			<div>
				<h2 id="w3-h">Where and when</h2>
				<p class="p-muted">Customers see your ad where their delivery address is.</p>
			</div>
			<AreaPicker v-model="form.areas" :currency="currency" :disabled="!!blockedWhy" />
			<div class="dates">
				<label class="p-field">
					<span>Start date</span>
					<input v-model="form.starts_on" class="p-input" type="date" :min="today" :disabled="startLocked || !!blockedWhy" />
					<small v-if="startLocked">It has started, so the start date stays.</small>
				</label>
				<label class="p-field">
					<span>End date (optional)</span>
					<input v-model="form.ends_on" class="p-input" type="date" :min="form.starts_on || today" :disabled="!!blockedWhy" />
					<small>Leave it empty to run until the budget is spent. Dates are in your market's time.</small>
				</label>
			</div>
		</section>

		<!-- 4. Budget -->
		<section v-else class="card-box p-stack arrive" aria-labelledby="w4-h">
			<div>
				<h2 id="w4-h">Budget</h2>
				<p class="p-muted">You pay per 1,000 impressions, only for what's shown. Clicks are free.</p>
			</div>
			<div class="budget">
				<div class="p-stack-sm">
					<label v-if="isDraft" class="p-field">
						<span>Total budget ({{ like?.symbol ?? "₦" }})</span>
						<input v-model="form.budget" class="p-input" inputmode="decimal" maxlength="14" autocomplete="off" :placeholder="pricing ? String(pricing.min_budget.amount) : ''" :disabled="!!blockedWhy" @input="short = false" />
						<small v-if="pricing">At least {{ money(pricing.min_budget) }}. The whole budget is held when you send the ad.</small>
					</label>
					<div v-else class="p-field">
						<span>Total budget</span>
						<p class="p-big">{{ money(campaign?.budget) }}</p>
						<small>{{ money(campaign?.remaining) }} left. To add more, use Add budget on the <a class="link" :href="`/ads/campaigns/view?id=${campaign?.id}`">campaign page</a>.</small>
					</div>
					<label class="p-field">
						<span>Daily budget (optional, {{ like?.symbol ?? "₦" }})</span>
						<input v-model="form.daily" class="p-input" inputmode="decimal" maxlength="14" autocomplete="off" :disabled="!!blockedWhy" />
						<small>
							<template v-if="pricing">At least {{ money(pricing.min_daily_budget) }} a day. </template>
							<template v-if="days && budgetMajor">Empty spreads it over the {{ days }} days: about {{ m(budgetMajor / days) }} a day.</template>
							<template v-else>Empty spreads it over the days the ad runs.</template>
						</small>
					</label>
				</div>
				<dl class="sum">
					<div>
						<dt>Price per 1,000 impressions</dt>
						<dd>{{ cpm ? money(cpm) : "…" }}<small v-if="campaign && campaign.cpm.amount > 0"> (locked when you sent it)</small><small v-else-if="pricing?.custom_price"> (your own price)</small></dd>
					</div>
					<div>
						<dt>Impressions it buys</dt>
						<dd class="disp big">{{ impressions !== null ? `≈ ${count(impressions)}` : "—" }}</dd>
					</div>
					<template v-if="isDraft">
						<div>
							<dt>Your ad credit</dt>
							<dd>{{ wallet ? money(wallet.available) : "…" }}</dd>
						</div>
						<div>
							<dt>After the hold</dt>
							<dd :class="{ neg: after !== null && after < 0 }">{{ after !== null ? m(after) : "—" }}</dd>
						</div>
					</template>
				</dl>
			</div>

			<div v-if="isDraft && wallet && (short || (after !== null && after < 0))" class="card-box topup p-stack-sm">
				<p>
					<strong>Not enough ad credit.</strong>
					<template v-if="shortBy">You need {{ m(Math.max(0, -(after ?? 0))) }} more.</template>
					Top up, and you'll come back here to send the ad. Your draft is saved.
				</p>
				<TopUpForm :pricing="pricing" :notice="wallet.notice" :return-path="returnPath" :suggested="shortBy" :blocked="blockedWhy || null" id-prefix="w4-topup" />
			</div>

			<div v-if="isDraft && !termsCurrent" class="p-alert p-alert--warn" role="status">
				Accept the updated terms before sending. <a href="/ads/account#terms">Read and accept</a>
			</div>
		</section>

		<div class="nav">
			<button v-if="step > 1" class="p-btn p-btn--ghost" type="button" :disabled="busy" @click="jump(step - 1)">Back</button>
			<span class="grow" />
			<span v-if="campaign && isDraft" class="p-hint saved">Draft saved as you go.</span>
			<button v-if="step < 4" class="p-btn p-btn--primary" type="button" :disabled="busy || !!blockedWhy || (step === 1 && !form.name.trim())" @click="next">
				{{ busy && progress === null ? "Saving…" : "Next" }}
			</button>
			<button v-else-if="isDraft" class="p-btn p-btn--primary" type="button" :disabled="busy || !!blockedWhy || !termsCurrent" @click="submit">
				{{ busy ? "Sending…" : status === "rejected" ? "Resubmit for review" : "Submit for review" }}
			</button>
			<button v-else class="p-btn p-btn--primary" type="button" :disabled="busy || !!blockedWhy" @click="saveSent">
				{{ busy ? "Saving…" : "Save changes" }}
			</button>
		</div>
	</template>
</template>

<style scoped>
.steps ol {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}
.steps button {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	min-height: 44px;
	padding: 0 16px 0 6px;
	border: 2px solid var(--line);
	border-radius: 9999px;
	background: var(--surface);
	color: var(--muted);
	font-weight: 600;
	font-size: 14px;
	cursor: pointer;
}
.steps button:disabled {
	cursor: not-allowed;
	opacity: 0.6;
}
.steps .n {
	display: grid;
	place-items: center;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background: var(--bg);
	color: var(--ink);
	font-family: var(--font-display);
	font-weight: 800;
}
.steps button.on {
	border-color: var(--brand);
	color: var(--ink);
}
.steps button.on .n {
	background: var(--brand);
	color: var(--on-brand);
}
.steps button.done .n {
	background: var(--ok);
	color: var(--on-ok);
}
.formats {
	display: grid;
	gap: 16px;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
.format {
	display: flex;
	gap: 16px;
	align-items: flex-start;
	padding: 18px;
	border: 2px solid var(--line);
	border-radius: 1.5rem;
	cursor: pointer;
}
.format.fixed {
	cursor: default;
}
.format.fixed:not(.on) {
	opacity: 0.5;
}
.format.on {
	border-color: var(--brand);
	background: var(--brand-soft);
}
.format:has(input:focus-visible) {
	outline: 2px solid var(--brand);
	outline-offset: 2px;
}
.format-text {
	display: flex;
	flex-direction: column;
	gap: 6px;
	font-size: 14px;
	line-height: 1.45;
}
.format-text strong {
	font-size: 17px;
}
.price {
	font-weight: 700;
}
.narrow {
	max-width: 420px;
}
.creative {
	display: grid;
	gap: 28px;
	grid-template-columns: minmax(0, 1fr);
}
.preview {
	display: flex;
	flex-direction: column;
	gap: 8px;
	min-width: 0;
}
.dates {
	display: grid;
	gap: 16px;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	max-width: 640px;
}
.budget {
	display: grid;
	gap: 24px;
	grid-template-columns: minmax(0, 1fr);
}
.sum {
	display: flex;
	flex-direction: column;
	gap: 14px;
	padding: 20px;
	border-radius: 1.5rem;
	background: var(--bg);
}
.sum dt {
	font-size: 12px;
	color: var(--muted);
}
.sum dd {
	font-weight: 700;
	font-variant-numeric: tabular-nums;
}
.sum small {
	font-weight: 400;
	color: var(--muted);
}
.big {
	font-size: 32px;
	line-height: 1.1;
}
.neg {
	color: var(--bad);
}
.topup {
	border: 2px solid var(--warn);
}
.nav {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
}
.grow {
	flex: 1;
}
.saved {
	margin-right: 4px;
}
@media (min-width: 1024px) {
	.creative {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	}
	.budget {
		grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
	}
}
</style>

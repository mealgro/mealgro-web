<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import AffiliateShell from "../../../../components/affiliate/AffiliateShell.vue";
import { me } from "../../../../lib/affiliate/api";
import { day, describe, errorCode } from "../../../../lib/affiliate/format";
import { session } from "../../../../lib/affiliate/session";
import { toast } from "../../../../lib/affiliate/toast";

const user = session.user;
const termsCurrent = session.termsCurrent;
const form = reactive({ full_name: "", phone: "" });
const busy = ref(false);
const error = ref("");
const bad = ref<"full_name" | "phone" | null>(null);

onMounted(async () => {
	if (!(await session.restore()) || !user.value) return;
	form.full_name = user.value.full_name;
	form.phone = user.value.phone;
});

const changed = computed(
	() =>
		!!user.value &&
		(form.full_name.trim() !== user.value.full_name || form.phone.trim() !== user.value.phone),
);
const locked = computed(() => !termsCurrent.value || user.value?.status !== "active");

async function save() {
	if (busy.value || !user.value || !changed.value) return;
	busy.value = true;
	error.value = "";
	bad.value = null;
	const body: { full_name?: string; phone?: string } = {};
	if (form.full_name.trim() !== user.value.full_name) body.full_name = form.full_name.trim();
	if (form.phone.trim() !== user.value.phone) body.phone = form.phone.trim();
	try {
		session.setUser(await me.update(body));
		toast("Profile saved.");
	} catch (e) {
		error.value = describe(e);
		const code = errorCode(e);
		bad.value =
			code === "AffiliateErrorFullNameRequired"
				? "full_name"
				: code === "AffiliateErrorPhoneInvalid"
					? "phone"
					: null;
	} finally {
		busy.value = false;
	}
}
</script>

<template>
	<AffiliateShell title="Profile">
		<div class="cols">
			<form v-if="user" class="card-box p-stack-sm arrive" novalidate @submit.prevent="save">
				<div class="card-h">
					<div>
						<h2>Your details</h2>
						<p>Affiliate since {{ day(user.joined_at) }}</p>
					</div>
					<span class="p-badge p-badge--brand">Code {{ user.code }}</span>
				</div>
				<div v-if="error" class="p-alert" role="alert">{{ error }}</div>
				<p v-if="locked" class="p-alert p-alert--warn">
					{{
						!termsCurrent
							? "Accept the updated terms above to change your details."
							: "Your account is suspended, so your details can't be changed right now."
					}}
				</p>
				<label class="p-field">
					<span>Full name</span>
					<input
						v-model="form.full_name"
						class="p-input"
						autocomplete="name"
						maxlength="80"
						:disabled="locked"
						:aria-invalid="bad === 'full_name'"
						required
					/>
				</label>
				<label class="p-field">
					<span>Phone number</span>
					<input
						v-model="form.phone"
						class="p-input"
						type="tel"
						inputmode="tel"
						autocomplete="tel"
						maxlength="20"
						:disabled="locked"
						:aria-invalid="bad === 'phone'"
						required
					/>
				</label>
				<label class="p-field">
					<span>Email</span>
					<input class="p-input" type="email" :value="user.email" readonly aria-describedby="aff-email-fixed" />
					<small id="aff-email-fixed">Your email can't be changed here. Contact support if you need to.</small>
				</label>
				<div class="foot">
					<button class="p-btn p-btn--primary" :disabled="locked || !changed || busy">
						{{ busy ? "Saving…" : "Save" }}
					</button>
				</div>
			</form>
			<div v-else class="p-skeleton p-skeleton--block" aria-hidden="true" />

			<section class="card-box p-stack-sm signout arrive" style="--i: 1">
				<div>
					<h2>Sign out</h2>
					<p class="p-muted">Signs you out of the affiliate area on this browser.</p>
				</div>
				<div><button class="p-btn" type="button" @click="session.signOut()">Sign out</button></div>
			</section>
		</div>
	</AffiliateShell>
</template>

<style scoped>
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

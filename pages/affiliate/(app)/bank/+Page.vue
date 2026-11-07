<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import AffiliateShell from "../../../../components/affiliate/AffiliateShell.vue";
import CodeStep from "../../../../components/affiliate/CodeStep.vue";
import StateBlock from "../../../../components/portal/StateBlock.vue";
import { bank } from "../../../../lib/affiliate/api";
import { dateTime, describe } from "../../../../lib/affiliate/format";
import { session } from "../../../../lib/affiliate/session";
import { toast } from "../../../../lib/affiliate/toast";
import type { BankAccount, BankDirectory } from "../../../../lib/affiliate/types";

const account = ref<BankAccount | null>(null);
const directory = ref<BankDirectory | null>(null);
const loaded = ref(false);
const error = ref("");

const user = session.user;
const termsCurrent = session.termsCurrent;
const locked = computed(() => !termsCurrent.value || user.value?.status !== "active");

async function load() {
	error.value = "";
	const [a, d] = await Promise.allSettled([bank.get(), bank.banks()]);
	if (a.status === "fulfilled") account.value = a.value;
	else error.value = describe(a.reason);
	if (d.status === "fulfilled") directory.value = d.value;
	else error.value ||= describe(d.reason);
	loaded.value = true;
}

onMounted(async () => {
	if (await session.restore()) await load();
});

// ---- Change ----
const editing = ref(false);
const step = ref<"details" | "code">("details");
const bankCode = ref("");
const number = ref("");
const resolved = ref("");
const resolving = ref(false);
const resolveError = ref("");
const busy = ref(false);
const formError = ref("");

const validNumber = computed(() => /^\d{10}$/.test(number.value));
let seq = 0;

watch([bankCode, number], async () => {
	resolved.value = "";
	resolveError.value = "";
	formError.value = "";
	if (!bankCode.value || !validNumber.value) return;
	const mine = ++seq;
	resolving.value = true;
	try {
		const { account_name } = await bank.resolve(bankCode.value, number.value);
		if (mine === seq) resolved.value = account_name;
	} catch (e) {
		if (mine === seq) resolveError.value = describe(e);
	} finally {
		if (mine === seq) resolving.value = false;
	}
});

function onNumber(e: Event) {
	number.value = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 10);
}

function start() {
	editing.value = true;
	step.value = "details";
	bankCode.value = "";
	number.value = "";
	formError.value = "";
}

async function sendCode() {
	if (busy.value || !resolved.value) return;
	busy.value = true;
	formError.value = "";
	try {
		await bank.request(bankCode.value, number.value);
		step.value = "code";
	} catch (e) {
		formError.value = describe(e);
	} finally {
		busy.value = false;
	}
}

const verify = async (otp: string) => {
	account.value = await bank.verify(otp);
};
const resend = () => bank.request(bankCode.value, number.value);

function done() {
	editing.value = false;
	toast("Bank account saved. Withdrawals open again in 24 hours.");
}
</script>

<template>
	<AffiliateShell title="Bank account">
		<div v-if="error" class="p-alert" role="alert">
			{{ error }}
			<button class="p-btn p-btn--sm" type="button" @click="load">Retry</button>
		</div>

		<section class="card-box p-stack-sm arrive" aria-labelledby="aff-bank-h">
			<div class="card-h">
				<div>
					<h2 id="aff-bank-h">Where we pay you</h2>
					<p>Withdrawals go to this account</p>
				</div>
				<button
					v-if="loaded && !editing"
					class="p-btn"
					:class="{ 'p-btn--primary': !account }"
					type="button"
					:disabled="locked"
					@click="start"
				>
					{{ account ? "Change" : "Add bank account" }}
				</button>
			</div>
			<StateBlock :loading="!loaded" :lines="3">
				<dl v-if="account" class="kv">
					<div><dt>Account name</dt><dd>{{ account.account_name }}</dd></div>
					<div><dt>Bank</dt><dd>{{ account.bank_name }}</dd></div>
					<div><dt>Account number</dt><dd class="mono">{{ account.account_number }}</dd></div>
					<div><dt>Last changed</dt><dd>{{ dateTime(account.updated_at) }}</dd></div>
				</dl>
				<p v-else class="p-muted">
					You haven't added a bank account yet. You need one to withdraw your earnings.
				</p>
			</StateBlock>
			<p v-if="locked && loaded" class="p-alert p-alert--warn">
				{{
					!termsCurrent
						? "Accept the updated terms above to change your bank details."
						: "Your account is suspended, so bank details can't be changed right now."
				}}
			</p>
		</section>

		<section v-if="editing" class="card-box p-stack-sm arrive" aria-labelledby="aff-bank-edit-h">
			<h2 id="aff-bank-edit-h">{{ account ? "Change bank account" : "Add a bank account" }}</h2>
			<div class="p-alert p-alert--warn" role="note">
				<strong>Withdrawals pause for 24 hours after a change.</strong>
				This protects your earnings if someone else gets into your email.
			</div>

			<form v-if="step === 'details'" class="p-stack-sm edit" novalidate @submit.prevent="sendCode">
				<div v-if="formError" class="p-alert" role="alert">{{ formError }}</div>
				<label class="p-field">
					<span>Bank</span>
					<select v-model="bankCode" class="p-input" required :disabled="!directory">
						<option value="" disabled>{{ directory ? "Choose your bank" : "Loading banks…" }}</option>
						<template v-if="directory">
							<optgroup label="Banks">
								<option v-for="b in directory.commercial" :key="`c-${b.code}`" :value="b.code">
									{{ b.name }}
								</option>
							</optgroup>
							<optgroup v-if="directory.microfinance.length" label="Microfinance banks">
								<option v-for="b in directory.microfinance" :key="`m-${b.code}`" :value="b.code">
									{{ b.name }}
								</option>
							</optgroup>
						</template>
					</select>
				</label>
				<label class="p-field">
					<span>Account number</span>
					<input
						:value="number"
						class="p-input"
						inputmode="numeric"
						autocomplete="off"
						maxlength="10"
						placeholder="10 digits"
						aria-describedby="aff-acct-name"
						:aria-invalid="!!resolveError"
						required
						@input="onNumber"
					/>
				</label>
				<div id="aff-acct-name" aria-live="polite">
					<p v-if="resolving" class="p-muted">Checking the account…</p>
					<p v-else-if="resolveError" class="p-alert">{{ resolveError }}</p>
					<div v-else-if="resolved" class="p-alert p-alert--ok">
						Account name: <strong>{{ resolved }}</strong>
					</div>
				</div>
				<div class="p-row p-wrap actions">
					<button class="p-btn p-btn--ghost" type="button" @click="editing = false">Cancel</button>
					<button class="p-btn p-btn--primary" :disabled="!resolved || busy">
						{{ busy ? "Sending code…" : "This is my account — send code" }}
					</button>
				</div>
			</form>

			<div v-else class="edit">
				<CodeStep
					:email="user?.email ?? ''"
					:lead="`To confirm the change, enter the 6-digit code we emailed to ${user?.email ?? 'you'}.`"
					:verify="verify"
					:resend="resend"
					submit-label="Save bank account"
					back-label="Change the details"
					@back="step = 'details'"
					@done="done"
				/>
			</div>
		</section>
	</AffiliateShell>
</template>

<style scoped>
.mono {
	font-variant-numeric: tabular-nums;
	letter-spacing: 0.04em;
}
.edit {
	max-width: 520px;
}
.actions {
	justify-content: flex-end;
}
</style>

<template>
	<SitePage>
		<DocHero label="System status" :title="headline" />
		<section class="s-section status">
			<div class="s-wrap">
				<div class="s-card panel">
					<div class="overall" :class="overall">
						<span class="sh" :class="shape" aria-hidden="true" />
						<p>{{ headline }}</p>
					</div>
					<div v-if="down" class="notice">
						<p>Mealgro is closed while we work on it. The apps and portals open again when it's over.</p>
						<p v-if="backAt"><strong>Expected back around {{ backAt }}.</strong></p>
						<p v-if="down.message" class="note">{{ down.message }}</p>
					</div>
					<div v-else-if="planned" class="notice planned">
						<span class="sh sh-cd" aria-hidden="true" />
						<div>
							<p><strong>Planned maintenance {{ plannedAt }}</strong></p>
							<p>Mealgro will be closed then.</p>
							<p v-if="planned.message" class="note">{{ planned.message }}</p>
						</div>
					</div>
					<ul class="checks">
						<li v-for="row in rows" :key="row.name">
							<span class="name">{{ row.name }}</span>
							<span class="state" :class="row.state">{{ label[row.state] }}</span>
							<span class="ms">{{ row.ms !== null ? `${row.ms} ms` : "" }}</span>
						</li>
					</ul>
					<p class="meta s-muted"><template v-if="checkedAt">Checked {{ checkedAt }} · </template>refreshes every 30 seconds</p>
				</div>
			</div>
		</section>
	</SitePage>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { checkStatus, type ServiceState, type StatusData } from "../../lib/site/status";
import { localTime, plannedWhen } from "../../lib/maintenance";
import SitePage from "../../components/site/SitePage.vue";
import DocHero from "../../components/site/DocHero.vue";

/** The latest check; null until the browser's first answer. */
const status = ref<StatusData | null>(null);

type RowState = ServiceState | "maintenance" | "checking";
const label: Record<RowState, string> = {
  operational: "Operational",
  down: "Down",
  unknown: "Unknown",
  maintenance: "Maintenance",
  checking: "Checking",
};

/** Maintenance on now, or planned for later. */
const down = computed(() => (status.value?.maintenance?.active ? status.value.maintenance : null));
const planned = computed(() => {
  const m = status.value?.maintenance;
  return m && !m.active && m.starts_at ? m : null;
});

const rows = computed<{ name: string; state: RowState; ms: number | null }[]>(() => [
  {
    name: "API",
    // Up, but closed to everyone while maintenance is on.
    state: !status.value ? "checking" : down.value ? "maintenance" : status.value.api,
    ms: status.value?.apiMs ?? null,
  },
  { name: "Live updates", state: status.value?.live ?? "checking", ms: null },
]);

const overall = computed(() => {
  const s = status.value;
  if (!s) return "checking";
  if (down.value) return "maintenance";
  if (!s.reachable) return "unreachable";
  return s.api === "operational" && s.live === "operational" ? "ok" : "partial";
});

const shape = computed(
  () => ({ ok: "sh-ci", maintenance: "sh-cd", partial: "sh-di", unreachable: "sh-di", checking: "sh-sq" })[overall.value],
);

const headline = computed(
  () =>
    ({
      ok: "All systems operational",
      partial: "Some systems are down",
      unreachable: "Mealgro is not reachable",
      maintenance: "Down for maintenance",
      checking: "Checking Mealgro…",
    })[overall.value],
);

// Formatted in the browser only: the server's locale and time zone differ from
// the visitor's, and a time rendered on both would not match on hydration.
const checkedAt = ref("");
const backAt = ref("");
const plannedAt = ref("");

// Checked from the browser on arrival and every 30 seconds (the API allows
// mealgro.com); the page itself is prerendered.
let timer: ReturnType<typeof setTimeout> | undefined;
let alive = true;
async function refresh() {
  const next = await checkStatus();
  if (!alive) return;
  status.value = next;
  checkedAt.value = new Date(next.checkedAt).toLocaleTimeString();
  const end = down.value?.ends_at;
  backAt.value = end && Date.parse(end) > Date.now() ? localTime(end) : "";
  plannedAt.value = planned.value?.starts_at ? plannedWhen(planned.value.starts_at, planned.value.ends_at) : "";
  timer = setTimeout(refresh, 30_000);
}
onMounted(refresh);
onUnmounted(() => {
  alive = false;
  clearTimeout(timer);
});
</script>

<style scoped>
.panel {
	max-width: 720px;
	padding: clamp(22px, 4vw, 36px);
	display: grid;
	gap: 20px;
}
.overall {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 16px 20px;
	border-radius: 1.25rem;
	font-family: var(--font-display);
	font-weight: 800;
	font-size: 20px;
	letter-spacing: -0.02em;
}
.overall .sh {
	width: 14px;
	height: 14px;
}
.overall.ok {
	background: color-mix(in srgb, var(--ok) 14%, var(--surface));
	--c: var(--ok);
}
.overall.partial {
	background: color-mix(in srgb, var(--warn) 26%, var(--surface));
	--c: var(--on-warn);
}
.overall.maintenance {
	background: color-mix(in srgb, var(--warn) 26%, var(--surface));
	--c: var(--on-warn);
}
.notice {
	display: grid;
	gap: 6px;
	padding: 0 4px;
}
.notice.planned {
	grid-template-columns: auto 1fr;
	align-items: start;
	gap: 12px;
	padding: 16px 20px;
	border-radius: 1.25rem;
	background: color-mix(in srgb, var(--warn) 18%, var(--surface));
}
.notice.planned .sh {
	--c: var(--on-warn);
	margin-top: 6px;
}
.notice.planned > div {
	display: grid;
	gap: 4px;
}
.note {
	font-style: italic;
}
.overall.unreachable {
	background: color-mix(in srgb, var(--bad) 12%, var(--surface));
	--c: var(--bad);
}
.checks {
	display: grid;
}
.checks li {
	display: grid;
	grid-template-columns: 1fr auto 70px;
	align-items: center;
	gap: 12px;
	padding: 14px 4px;
	border-top: 1px solid var(--line);
}
.name {
	font-weight: 600;
}
.state {
	padding: 4px 12px;
	border-radius: 999px;
	font-size: 14px;
	font-weight: 600;
}
.state.operational {
	background: color-mix(in srgb, var(--ok) 14%, var(--surface));
	color: var(--ok);
}
.state.down {
	background: color-mix(in srgb, var(--bad) 12%, var(--surface));
	color: var(--bad);
}
.state.maintenance {
	background: color-mix(in srgb, var(--warn) 26%, var(--surface));
	color: var(--on-warn);
}
.state.unknown {
	background: var(--bg);
	color: var(--muted);
}
.state.checking {
	background: var(--bg);
	color: var(--muted);
}
.overall.checking {
	background: var(--bg);
	--c: var(--muted);
}
.ms {
	text-align: right;
	font-variant-numeric: tabular-nums;
	color: var(--muted);
	font-size: 14px;
}
.meta {
	font-size: 14px;
}
</style>

<template>
	<SitePage>
		<DocHero label="System status" :title="headline" />
		<section class="s-section status">
			<div class="s-wrap">
				<div class="s-card panel">
					<div class="overall" :class="overall">
						<span class="sh" :class="overall === 'ok' ? 'sh-ci' : 'sh-di'" aria-hidden="true" />
						<p>{{ headline }}</p>
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
import { useData } from "vike-vue/useData";
import type { ServiceState, StatusData } from "./+data";
import SitePage from "../../components/site/SitePage.vue";
import DocHero from "../../components/site/DocHero.vue";

const data = useData<StatusData>();

const label: Record<ServiceState, string> = {
  operational: "Operational",
  down: "Down",
  unknown: "Unknown",
};

const rows = computed(() => [
  {
    name: "API",
    state: data.api,
    ms: data.apiMs,
  },
  { name: "Live updates", state: data.live, ms: null },
]);

const overall = computed(() => {
  if (!data.reachable) return "unreachable";
  return data.api === "operational" && data.live === "operational" ? "ok" : "partial";
});

const headline = computed(
  () =>
    ({
      ok: "All systems operational",
      partial: "Some systems are down",
      unreachable: "Mealgro is not reachable",
    })[overall.value],
);

// Formatted in the browser only: the server's locale and time zone differ from
// the visitor's, and a time rendered on both would not match on hydration.
const checkedAt = ref("");

// Re-render from the server rather than polling the API from the browser, so
// the page needs nothing from the API's CORS rules.
let timer: ReturnType<typeof setTimeout> | undefined;
onMounted(() => {
  checkedAt.value = new Date(data.checkedAt).toLocaleTimeString();
  timer = setTimeout(() => window.location.reload(), 30_000);
});
onUnmounted(() => clearTimeout(timer));
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
.state.unknown {
	background: var(--bg);
	color: var(--muted);
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

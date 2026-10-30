<template>
  <div class="status-page">
    <div class="card">
      <a href="/" class="brand"><img :src="logoImage" alt="Mealgro home" /></a>
      <p class="eyebrow">System status</p>
      <div class="overall" :class="overall">
        <span class="dot" />
        <h1>{{ headline }}</h1>
      </div>

      <ul class="checks">
        <li v-for="row in rows" :key="row.name">
          <span class="name">{{ row.name }}</span>
          <span class="state" :class="row.state">{{ label[row.state] }}</span>
          <span class="ms">{{ row.ms !== null ? `${row.ms} ms` : "" }}</span>
        </li>
      </ul>

      <p class="meta">Checked {{ checkedAt }} · refreshes every 30 seconds</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useData } from "vike-vue/useData";
import type { ServiceState, StatusData } from "./+data";
import logoImage from "../../assets/logo.svg";

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

const checkedAt = computed(() => new Date(data.checkedAt).toLocaleTimeString());

// Re-render from the server rather than polling the API from the browser, so
// the page needs nothing from the API's CORS rules.
let timer: ReturnType<typeof setTimeout> | undefined;
onMounted(() => {
  timer = setTimeout(() => window.location.reload(), 30_000);
});
onUnmounted(() => clearTimeout(timer));
</script>

<style scoped>
/* Brand tokens: see brand.md. */
.status-page {
  --ink: #17130f;
  --muted: #6b635b;
  --line: #e8e2dc;
  --ok: #17803d;
  --warn: #b45309;
  --bad: #b42318;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f6f6;
  color: var(--ink);
  padding: 140px 16px 48px;
}
.card {
  max-width: 480px;
  width: 100%;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 28px;
}
.brand {
  display: none;
}
.brand img {
  display: block;
  width: 72px;
  height: auto;
}
.eyebrow {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #d62300;
}
.overall {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0 20px;
}
.overall h1 {
  font-size: 28px;
  line-height: 1.15;
  font-weight: 800;
  margin: 0;
  color: var(--ink);
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  flex-shrink: 0;
}
.ok .dot {
  background: var(--ok);
}
.partial .dot {
  background: var(--warn);
}
.unreachable .dot {
  background: var(--bad);
}
.checks {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}
.checks li {
  display: grid;
  grid-template-columns: 1fr auto 64px;
  gap: 12px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
  font-size: 16px;
}
.state {
  font-weight: 500;
}
.state.operational {
  color: var(--ok);
}
.state.down {
  color: var(--bad);
}
.state.unknown {
  color: var(--muted);
}
.ms {
  text-align: right;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.meta {
  margin: 16px 0 0;
  font-size: 13px;
  color: var(--muted);
}

/* No desktop nav or global logo below 1024px: the card carries the logo. */
@media (max-width: 1024px) {
  .status-page {
    padding-top: 24px;
    align-items: flex-start;
  }
  .brand {
    display: block;
    margin-bottom: 20px;
  }
}
@media (max-width: 480px) {
  .card {
    padding: 22px;
  }
  .overall h1 {
    font-size: 24px;
  }
}
</style>

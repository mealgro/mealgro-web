<template>
  <div class="status-page">
    <div class="card">
      <a href="/" class="brand">Mealgro</a>
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
.status-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 24px 16px;
}
.card {
  max-width: 460px;
  width: 100%;
  background: #fff;
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}
.brand {
  font-weight: 700;
  color: #1a1a1a;
  text-decoration: none;
}
.overall {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0 16px;
}
.overall h1 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ok .dot {
  background: #16a34a;
}
.partial .dot {
  background: #f59e0b;
}
.unreachable .dot {
  background: #dc2626;
}
.checks {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #eee;
}
.checks li {
  display: grid;
  grid-template-columns: 1fr auto 64px;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
}
.name {
  color: #1a1a1a;
}
.state.operational {
  color: #16a34a;
}
.state.down {
  color: #dc2626;
}
.state.unknown {
  color: #888;
}
.ms {
  text-align: right;
  color: #888;
  font-variant-numeric: tabular-nums;
}
.meta {
  margin: 16px 0 0;
  font-size: 0.8rem;
  color: #888;
}
</style>

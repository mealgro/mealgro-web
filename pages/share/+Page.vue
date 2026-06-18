<template>
  <div class="share-landing">
    <div class="card">
      <img
        v-if="data && data.image"
        :src="data.image"
        :alt="data.title"
        class="thumb"
      />
      <h1 class="title">{{ data ? data.title : "Open in Mealgro" }}</h1>
      <p v-if="data && data.subtitle" class="subtitle">{{ data.subtitle }}</p>
      <p v-else class="subtitle">
        Tap below to open this in the Mealgro app.
      </p>

      <a class="cta" :href="deeplink">Open in Mealgro</a>

      <div class="stores">
        <a
          class="store"
          href="https://apps.apple.com/app/mealgro/id6755588662"
        >App Store</a>
        <a
          class="store"
          href="https://play.google.com/store/apps/details?id=app.mealgro.mobile"
        >Google Play</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useData } from "vike-vue/useData";
import type { ShareData } from "./+data";

const data = useData<ShareData>();

const deeplink = computed(() => (data ? `mealgro://${data.code}` : "#"));

onMounted(() => {
  // Attempt to open the app immediately (no-op if not installed; the universal
  // link is already intercepted by the OS when the app is installed).
  if (data) {
    window.location.href = `mealgro://${data.code}`;
  }
});
</script>

<style scoped>
.share-landing {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 24px;
}
.card {
  max-width: 380px;
  width: 100%;
  text-align: center;
  background: #fff;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}
.thumb {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 16px;
  margin: 0 auto 16px;
  display: block;
}
.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}
.subtitle {
  font-size: 0.95rem;
  color: #666;
  margin: 0 0 24px;
}
.cta {
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  background: #ff5a00;
  color: #fff;
  font-weight: 600;
  padding: 14px 20px;
  border-radius: 12px;
  text-decoration: none;
}
.stores {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}
.store {
  font-size: 0.85rem;
  color: #444;
  text-decoration: underline;
}
</style>

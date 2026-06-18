<!-- OG / Twitter meta for the share unfurl (WhatsApp, etc.) -->
<template>
  <template v-if="data">
    <meta property="og:title" :content="data.title" />
    <meta property="og:description" :content="data.subtitle || 'Open in Mealgro'" />
    <meta v-if="data.image" property="og:image" :content="data.image" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" :content="data.title" />
    <meta v-if="data.image" name="twitter:image" :content="data.image" />
    <link v-if="data.image" rel="icon" :href="data.image" />
  </template>
</template>

<script setup lang="ts">
import { useData } from "vike-vue/useData";
import type { ShareData } from "./+data";

const data = useData<ShareData>();
</script>

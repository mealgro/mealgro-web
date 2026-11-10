<!-- https://vike.dev/Head -->

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <link rel="icon" :href="faviconUrl" type="image/svg+xml" />
  <link rel="manifest" href="/site.webmanifest" />
</template>

<script setup lang="ts">
import "./fonts.css";
import "./tailwind.css";
import faviconUrl from "../assets/favicon.svg";
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4" style="background-color: #F6F6F6;">
    <div class="text-center max-w-md">
      <div class="mb-8">
        <h1 class="text-6xl md:text-8xl font-bold mb-4" style="color: #D62300;">
          {{ is404 ? '404' : '500' }}
        </h1>
        <h2 class="text-3xl md:text-4xl font-semibold mb-4" style="color: #000000;">
          {{ heading }}
        </h2>
        <p class="text-lg mb-8" style="color: #000000;">
          {{ abortReason }}
        </p>
      </div>
      <a
        href="/"
        class="inline-block text-white font-semibold py-3 px-6 rounded-xl transition-opacity duration-200 shadow-lg hover:shadow-xl hover:opacity-90"
        style="background-color: #D62300;"
      >
        Go Home
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePageContext } from "vike-vue/usePageContext";

const pageContext = usePageContext();
let { is404, abortReason } = pageContext;
if (!abortReason) {
  abortReason = is404 ? "This page could not be found." : "Something went wrong.";
}
const heading = is404 ? "Page Not Found" : "Internal Error";
</script>

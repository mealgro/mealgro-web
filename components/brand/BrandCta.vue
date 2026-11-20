<script setup lang="ts">
// The download section (#get-app), the target of every "Get the app": the
// landing page's red band with its sticker. The buttons follow the visitor's
// device (lib/site/stores). Needs a `.brand` ancestor.
import { computed } from "vue";
import { CUSTOMER_APP, RIDER_APP } from "../../lib/site/links";
import { useStores } from "../../lib/site/stores";
import { burst } from "../../lib/site/burst";

const props = withDefaults(defineProps<{ app?: "customer" | "rider" }>(), { app: "customer" });
const isRider = computed(() => props.app === "rider");
const { stores } = useStores(props.app === "rider" ? RIDER_APP : CUSTOMER_APP);

</script>

<template>
  <section id="get-app" class="cta bcta" aria-labelledby="get-app-h">
    <div class="burst spin" :style="burst(16)" aria-hidden="true">FREE<br />TO GET</div>
    <div class="wrap" style="position: relative; z-index: 2">
      <h2 id="get-app-h" class="huge chunk">
        <template v-if="isRider"><span class="lw" data-chars>Ride.</span><span class="lw" data-chars>Get paid.</span></template>
        <template v-else><span class="lw" data-chars>Swipe.</span><span class="lw" data-chars>Tap. Eat.</span></template>
      </h2>
      <p v-if="isRider">Get Mealgro Rider, verify your ID and go online. Delivery requests near you show up as soon as you're on.</p>
      <p v-else>Get Mealgro and see what the kitchens near you are cooking right now.</p>
      <div class="stores">
        <a
          v-for="(s, i) in stores"
          :key="s.key"
          class="btn"
          :class="i === 0 ? 'light' : 'ink'"
          :href="s.href"
          target="_blank"
          rel="noopener"
        >
          <template v-if="s.key === 'android'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 2.5v19l10-9.5L4 2.5Zm11.4 8.2L6.7 2.2l10.6 6.1-1.9 2.4Zm0 2.6 1.9 2.4-10.6 6.1 8.7-8.5Zm2.9-4.3 2.9 1.7c.7.4.7 1.4 0 1.8l-2.9 1.7-2.1-2.6 2.1-2.6Z" /></svg>
            Get it on Google Play
          </template>
          <template v-else>
            <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.6 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1ZM15 4.9c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5Z" /></svg>
            Download on the App Store
          </template>
        </a>
      </div>
    </div>
  </section>
</template>

<!-- https://vike.dev/Layout -->

<template>
  <div id="page-container">
    <Navigation />
    <!-- Global Logo -->
    <a href="/" class="global-logo-link">
      <img 
        :src="logoImage" 
        alt="MealGro Logo" 
        class="global-logo"
        :class="{ 'global-logo--red': isRedLogoPage }"
      />
    </a>
    <div id="page-content" class="page-content-wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePageContext } from 'vike-vue/usePageContext';
import Navigation from "../components/shared/Navigation.vue";
import logoImage from "../assets/logo.svg";

const pageContext = usePageContext();
const isRedLogoPage = computed(() => {
  const path = pageContext.urlPathname;
  return path === '/' || path === '/riders';
});
</script>

<style>
html {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  margin: 0;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  font-family: 'MADE Tommy Soft', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
* {
  box-sizing: border-box;
}
</style>

<style scoped>
/* Page Transition Animation */
#page-container {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

#page-content {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}
body.page-transition #page-content {
  opacity: 0;
}

.page-content-wrapper {
  position: relative;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.global-logo-link {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 100;
  display: block;
  text-decoration: none;
  cursor: pointer;
}

.global-logo {
  width: 110px;
  height: 80px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  display: block;
  pointer-events: none;
}

@media (min-width: 1400px) {
  .global-logo-link {
    left: calc((100vw - 1400px) / 2 + 20px);
  }
}

.global-logo--red {
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
}

@media (max-width: 1024px) {
  .global-logo-link {
    display: none;
  }
}
</style>

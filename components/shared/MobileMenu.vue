<template>
  <button
    ref="button"
    class="mobile-menu__button"
    type="button"
    :aria-expanded="open ? 'true' : 'false'"
    aria-controls="mobile-nav-menu"
    @click="toggle"
  >
    <span class="mobile-menu__sr-only">Toggle navigation menu</span>
    <svg v-if="!open" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </button>

  <transition name="mobile-menu">
    <nav
      v-if="open"
      id="mobile-nav-menu"
      class="mobile-menu__panel"
      :style="{ top: `${panelTop}px` }"
      aria-label="Main"
    >
      <template v-for="link in links" :key="link.href">
        <details v-if="link.children" class="mobile-menu__group">
          <summary class="mobile-menu__link">
            <span>{{ link.label }}</span>
            <svg class="mobile-menu__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </summary>
          <a
            v-for="child in link.children"
            :key="child.href + child.label"
            :href="child.href"
            class="mobile-menu__link mobile-menu__link--child"
            @click="close"
          >
            <span>{{ child.label }}</span>
          </a>
        </details>
        <a v-else :href="link.href" class="mobile-menu__link" @click="close">
          <span>{{ link.label }}</span>
        </a>
      </template>
    </nav>
  </transition>
</template>

<script setup lang="ts">
// The site's phone/tablet menu (≤1024px, where the desktop Navigation is
// hidden): the round toggle button and the sheet of links under it. Each hero
// places this next to its own logo; the links come from navLinks.ts.
import { onMounted, onUnmounted, ref } from 'vue';
import { navLinks } from './navLinks';

const links = navLinks.filter((link) => link.href !== '/');
const open = ref(false);
const button = ref<HTMLButtonElement | null>(null);
// The sheet is fixed to the viewport just under the button, whatever header
// the button sits in.
const panelTop = ref(72);

function toggle() {
  if (!open.value && button.value) {
    panelTop.value = Math.round(button.value.getBoundingClientRect().bottom + 12);
  }
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close();
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.mobile-menu__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #0e172b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.mobile-menu__button:focus-visible {
  outline: 3px solid #d62300;
  outline-offset: 2px;
}

.mobile-menu__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.mobile-menu__panel {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 95;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px;
  background: #ffffff;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 10px 30px rgba(14, 23, 43, 0.12);
}

.mobile-menu__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(14, 23, 43, 0.07);
  font-family: 'MADE Tommy Soft', sans-serif;
  font-size: 15px;
  line-height: 150%;
  color: #0e172b;
  text-decoration: none;
}

.mobile-menu__link:hover {
  color: #d62300;
}

.mobile-menu__panel > .mobile-menu__link:last-child {
  border-bottom: none;
}

.mobile-menu__link--child {
  padding-left: 16px;
  font-size: 14px;
}

/* A link with children (Vendors) opens a group in place. */
.mobile-menu__group > summary {
  list-style: none;
  cursor: pointer;
}

.mobile-menu__group > summary::-webkit-details-marker {
  display: none;
}

.mobile-menu__chevron {
  transition: transform 0.2s ease;
}

.mobile-menu__group[open] .mobile-menu__chevron {
  transform: rotate(180deg);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (min-width: 1025px) {
  .mobile-menu__button,
  .mobile-menu__panel {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu-enter-active,
  .mobile-menu-leave-active,
  .mobile-menu__chevron {
    transition: none;
  }
}
</style>

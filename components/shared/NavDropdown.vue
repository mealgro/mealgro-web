<template>
  <div
    ref="root"
    class="nav-dropdown"
    @mouseenter="openNow"
    @mouseleave="closeSoon"
    @focusin="openNow"
    @focusout="onFocusOut"
  >
    <button
      type="button"
      class="nav-dropdown__trigger"
      :class="{ 'nav-dropdown__trigger--active': active }"
      aria-haspopup="true"
      :aria-expanded="open ? 'true' : 'false'"
      @click="toggle"
      @keydown.escape="close"
    >
      <span class="nav-text">{{ link.label }}</span>
      <svg
        class="nav-dropdown__chevron"
        :class="{ 'nav-dropdown__chevron--open': open }"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <transition name="nav-dropdown">
      <div v-if="open" class="nav-dropdown__menu" role="menu" @keydown.escape="close">
        <a
          v-for="child in link.children"
          :key="child.href + child.label"
          :href="child.href"
          class="nav-dropdown__item"
          role="menuitem"
        >
          {{ child.label }}
        </a>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import type { NavLink } from './navLinks';

defineProps<{ link: NavLink; active: boolean }>();

const root = ref<HTMLElement | null>(null);
const open = ref(false);
let closeTimer: ReturnType<typeof setTimeout> | undefined;

// A short delay before closing, so moving the pointer from the trigger to
// the menu across the gap between them doesn't drop it.
const CLOSE_DELAY_MS = 150;

function openNow() {
  clearTimeout(closeTimer);
  open.value = true;
}

function closeSoon() {
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => (open.value = false), CLOSE_DELAY_MS);
}

function close() {
  clearTimeout(closeTimer);
  open.value = false;
}

// Touch screens have no hover: the first tap opens the menu, a second closes it.
function toggle() {
  if (open.value) close();
  else openNow();
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null;
  if (!next || !root.value?.contains(next)) closeSoon();
}

onUnmounted(() => clearTimeout(closeTimer));
</script>

<style scoped>
.nav-dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.nav-dropdown__trigger {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 150%;
  color: #0E172B;
  transition: color 0.2s;
}

.nav-dropdown__trigger:hover,
.nav-dropdown__trigger--active {
  color: #D62300;
}

.nav-dropdown__chevron {
  color: #667085;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nav-dropdown__trigger--active .nav-dropdown__chevron {
  color: #D62300;
}

.nav-dropdown__chevron--open {
  transform: rotate(180deg);
}

.nav-dropdown__menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 200px;
  display: flex;
  flex-direction: column;
  padding: 8px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(14, 23, 43, 0.12);
  z-index: 110;
}

/* Bridges the gap above the menu so the pointer never leaves the dropdown. */
.nav-dropdown__menu::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 0;
  right: 0;
  height: 12px;
}

.nav-dropdown__item {
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  white-space: nowrap;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-size: 14px;
  line-height: 150%;
  color: #0E172B;
}

.nav-dropdown__item:hover,
.nav-dropdown__item:focus-visible {
  background: #FFF1EE;
  color: #D62300;
  outline: none;
}

.nav-text {
  white-space: nowrap;
}

.nav-dropdown-enter-active,
.nav-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.nav-dropdown-enter-from,
.nav-dropdown-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}
</style>

<script setup lang="ts">
// The floating pill nav of every public page (the landing page's): logo, the
// site's links, Get the app, and under 860px a full-screen red menu. It hides
// while scrolling down and comes back on the way up. Needs a `.brand`
// ancestor (components/brand/brand.css).
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { usePageContext } from "vike-vue/usePageContext";
import logoImage from "../../assets/logo.svg";
import { CUSTOMER_APP, RIDER_APP, SITE_LINKS } from "../../lib/site/links";
import { useStores } from "../../lib/site/stores";
import { burst } from "../../lib/site/burst";

const props = withDefaults(defineProps<{ app?: "customer" | "rider" }>(), { app: "customer" });
const emit = defineEmits<{ menu: [open: boolean] }>();

const pageContext = usePageContext();
const path = computed(() => pageContext.urlPathname);
const { direct } = useStores(props.app === "rider" ? RIDER_APP : CUSTOMER_APP);
// A phone's Get the app goes straight to its store; elsewhere, to the buttons.
const getApp = computed(() => direct.value ?? "#get-app");
const external = computed(() => direct.value !== null);

const SOCIALS = [
	{ href: "https://www.instagram.com/trymealgro", label: "Instagram" },
	{ href: "https://x.com/mealgro", label: "X" },
	{ href: "https://www.facebook.com/share/14VPaxDJVbY/", label: "Facebook" },
	{ href: "https://www.linkedin.com/company/mealgro/", label: "LinkedIn" },
];

const open = ref(false);
const hidden = ref(false);
const menuBtn = ref<HTMLButtonElement | null>(null);

function setMenu(v: boolean, returnFocus = false) {
	open.value = v;
	if (!v && returnFocus) menuBtn.value?.focus();
}
watch(open, (v) => {
	document.documentElement.classList.toggle("brand-menu-open", v);
	if (v) hidden.value = false;
	emit("menu", v);
});
watch(path, () => setMenu(false));


let lastY = 0;
let ticking = false;
function onScroll() {
	if (ticking) return;
	ticking = true;
	requestAnimationFrame(() => {
		const y = window.scrollY;
		hidden.value = y > lastY && y > 300 && !open.value;
		lastY = y;
		ticking = false;
	});
}
function onKey(e: KeyboardEvent) {
	if (e.key === "Escape" && open.value) setMenu(false, true);
}
function onResize() {
	if (open.value && window.innerWidth > 860) setMenu(false);
}
onMounted(() => {
	lastY = window.scrollY;
	window.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener("keydown", onKey);
	window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => {
	window.removeEventListener("scroll", onScroll);
	window.removeEventListener("keydown", onKey);
	window.removeEventListener("resize", onResize);
	document.documentElement.classList.remove("brand-menu-open");
});
</script>

<template>
  <div class="bnav" :class="{ 'menu-open': open }">
    <nav class="nav" :class="{ hide: hidden }" aria-label="Main">
      <a class="logo" href="/" aria-label="Mealgro home"><img :src="logoImage" alt="Mealgro" width="66" height="48" /></a>
      <ul>
        <li v-for="l in SITE_LINKS" :key="l.href">
          <a :href="l.href" :aria-current="path === l.href ? 'page' : undefined">{{ l.label }}</a>
        </li>
      </ul>
      <a class="btn" :href="getApp" :target="external ? '_blank' : undefined" :rel="external ? 'noopener' : undefined">Get the app</a>
      <button
        ref="menuBtn"
        class="menu-btn"
        type="button"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        :aria-expanded="open"
        aria-controls="mnav"
        @click="setMenu(!open)"
      >
        <i /><i />
      </button>
    </nav>

    <div id="mnav" class="mnav" :aria-hidden="!open" :inert="!open || undefined">
      <ul>
        <li v-for="(l, i) in SITE_LINKS" :key="l.href">
          <a :href="l.href" :aria-current="path === l.href ? 'page' : undefined" @click="setMenu(false)">
            {{ l.label }} <small>{{ String(i + 1).padStart(2, "0") }}</small>
          </a>
        </li>
      </ul>
      <div class="burst spin" :style="burst(16)">HUNGRY?</div>
      <div class="mnav-foot">
        <a class="btn yellow" :href="getApp" :target="external ? '_blank' : undefined" :rel="external ? 'noopener' : undefined" @click="setMenu(false)">Get the app →</a>
        <div class="mnav-social">
          <a v-for="s in SOCIALS" :key="s.href" :href="s.href" target="_blank" rel="noopener">{{ s.label }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

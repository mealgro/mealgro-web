<script setup lang="ts">
// The foot of every public page (the landing page's): logo, link columns, the
// big wordmark and the legal line. Needs a `.brand` ancestor.
import logoImage from "../../assets/logo.svg";

const year = new Date().getFullYear();
const COLUMNS = [
	{
		title: "Company",
		links: [
			{ href: "/about", label: "About us" },
			{ href: "/contact", label: "Contact" },
			{ href: "/status", label: "Service status" },
		],
	},
	{
		title: "Join",
		links: [
			{ href: "/vendors", label: "Sell on Mealgro" },
			{ href: "/riders", label: "Ride with Mealgro" },
			{ href: "/affiliate", label: "Affiliate program" },
			{ href: "/account", label: "Vendor portal" },
		],
	},
	{
		title: "Follow",
		links: [
			{ href: "https://www.instagram.com/trymealgro", label: "Instagram" },
			{ href: "https://x.com/mealgro", label: "X" },
			{ href: "https://www.facebook.com/share/14VPaxDJVbY/", label: "Facebook" },
			{ href: "https://www.linkedin.com/company/mealgro/", label: "LinkedIn" },
		],
	},
];
</script>

<template>
  <footer class="bfoot">
    <div class="wrap">
      <div class="foot">
        <div>
          <img :src="logoImage" alt="Mealgro" style="height: 36px; width: auto; margin-bottom: 16px" />
          <p style="max-width: 260px; color: var(--muted)">Order what you just watched.</p>
        </div>
        <nav v-for="c in COLUMNS" :key="c.title" :aria-label="c.title">
          <h4>{{ c.title }}</h4>
          <a
            v-for="l in c.links"
            :key="l.href"
            :href="l.href"
            :target="l.href.startsWith('http') ? '_blank' : undefined"
            :rel="l.href.startsWith('http') ? 'noopener' : undefined"
          >{{ l.label }}</a>
        </nav>
      </div>
      <div class="wordmark chunk" aria-hidden="true"><span class="lw" data-chars>mealgro</span></div>
      <div class="legal">
        <span>© {{ year }} Mealgro</span>
        <span><a href="/terms">Terms of service</a> · <a href="/privacy">Privacy policy</a></span>
      </div>
    </div>
  </footer>
</template>

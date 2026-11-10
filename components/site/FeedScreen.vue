<script setup lang="ts">
// A screen of the customer app's feed, drawn over a food clip: where it
// delivers to, the dish, the store, and Menu / Add to cart, laid out as the app
// lays them out (mealgro-app's feed). Decorative except the Add to cart link,
// which leads to the app downloads.
import FeedClip from "./FeedClip.vue";
import type { Clip } from "../../lib/site/media";

withDefaults(
	defineProps<{
		clip: Clip;
		/** Where Add to cart leads. */
		cartHref?: string;
		/** Load the clip straight away (the first screen of a page). */
		eager?: boolean;
		/** Hide the top bar, for small cards. */
		bare?: boolean;
	}>(),
	{ cartHref: "#get-app", eager: false, bare: false },
);
</script>

<template>
	<div class="screen">
		<FeedClip :id="clip.id" :eager="eager" />
		<div class="scrim" aria-hidden="true" />

		<div v-if="!bare" class="top" aria-hidden="true">
			<div class="where">
				<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10" r="2.3" /></svg>
				<span><small>Delivery to</small>{{ clip.area }}</span>
			</div>
			<div class="tools">
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
			</div>
		</div>

		<div class="rail" aria-hidden="true">
			<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 3.5c4.97 0 9 3.36 9 7.5s-4.03 7.5-9 7.5c-.98 0-1.92-.13-2.8-.37L4.5 20l1.3-3.6C4.07 15.06 3 13.12 3 11c0-4.14 4.03-7.5 9-7.5Z" /></svg>
			<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.2L5 21V4.5a1 1 0 0 1 1-1Z" /></svg>
			<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="m21 3-9.4 18-2.1-7.5L2 11.4 21 3Z" /></svg>
			<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="m16 9.5 5 5M21 9.5l-5 5" /></svg>
		</div>

		<div class="info">
			<p class="dish" aria-hidden="true">{{ clip.dish }}</p>
			<p class="line" aria-hidden="true">{{ clip.line }}</p>
			<p class="meta" aria-hidden="true">
				<span>{{ clip.store }} ({{ clip.area }})</span>
				<span class="dot">{{ clip.minutes }}</span>
			</p>
			<p class="rating" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.7 6.6 19.6l1.1-6L3.2 9.4l6.1-.8Z" /></svg>
				{{ clip.rating }}
			</p>
			<div class="actions">
				<span class="menu" aria-hidden="true">
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1-3 3.5-3 7h3" /></svg>
					Menu
				</span>
				<a class="cart" :href="cartHref" :aria-label="`Add ${clip.dish} to cart — get the app to order`">
					<span class="cart-l">
						<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h18l-2 10H5L3 9Z" /><path d="m8 9 3-5M16 9l-3-5" /></svg>
						Add to cart
					</span>
					<span class="cart-p">{{ clip.price }}</span>
				</a>
			</div>
		</div>
	</div>
</template>

<style scoped>
.screen {
	position: absolute;
	inset: 0;
	overflow: hidden;
	color: #fff;
	background: var(--stage);
	font-family: "Instrument Sans Variable", system-ui, sans-serif;
	container-type: inline-size;
}
.scrim {
	position: absolute;
	inset: 0;
	pointer-events: none;
	background:
		linear-gradient(to bottom, rgb(0 0 0 / 0.45), transparent 18%),
		linear-gradient(to top, rgb(0 0 0 / 0.78), rgb(0 0 0 / 0.35) 32%, transparent 55%);
}
.top {
	position: absolute;
	top: calc(var(--screen-top, 18px));
	left: 16px;
	right: 16px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 13px;
	font-weight: 600;
}
.where {
	display: flex;
	align-items: center;
	gap: 6px;
}
.where span {
	display: flex;
	flex-direction: column;
	line-height: 1.15;
}
.where small {
	font-size: 10px;
	font-weight: 500;
	opacity: 0.8;
}
.tools {
	display: flex;
	gap: 14px;
}
.rail {
	position: absolute;
	right: 12px;
	bottom: calc(var(--screen-bottom, 16px) + 132px);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.4));
}
.info {
	position: absolute;
	left: 14px;
	right: 14px;
	bottom: var(--screen-bottom, 16px);
	text-shadow: 0 1px 3px rgb(0 0 0 / 0.45);
}
.info p {
	margin: 0;
}
.dish {
	font-family: "Bricolage Grotesque Variable", sans-serif;
	font-weight: 800;
	font-size: 21px;
	letter-spacing: -0.02em;
	line-height: 1.1;
	padding-right: 48px;
}
.line {
	font-size: 13px;
	margin-top: 4px !important;
	opacity: 0.92;
}
.meta {
	display: flex;
	flex-wrap: wrap;
	gap: 4px 10px;
	font-size: 12px;
	font-weight: 600;
	margin-top: 8px !important;
}
.dot::before {
	content: "";
	display: inline-block;
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: currentColor;
	margin-right: 8px;
	vertical-align: middle;
	opacity: 0.7;
}
.rating {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	font-weight: 600;
	margin-top: 6px !important;
	padding: 2px 8px;
	border-radius: 999px;
	background: rgb(255 255 255 / 0.18);
	color: var(--cat-3);
	text-shadow: none;
}
.actions {
	display: flex;
	gap: 8px;
	margin-top: 12px;
	text-shadow: none;
}
.menu {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 44px;
	padding: 0 14px;
	border-radius: 999px;
	background: rgb(20 20 28 / 0.55);
	border: 1px solid rgb(255 255 255 / 0.35);
	font-size: 14px;
	font-weight: 600;
	backdrop-filter: blur(8px);
}
.cart {
	flex: 1;
	display: flex;
	align-items: stretch;
	min-width: 0;
	height: 44px;
	border-radius: 999px;
	overflow: hidden;
	background: var(--app-red);
	color: #fff;
	text-decoration: none;
	font-size: 14px;
	font-weight: 600;
	transition: transform 0.15s var(--ease);
}
.cart:hover {
	color: #fff;
}
.cart:active {
	transform: scale(0.97);
}
.cart:focus-visible {
	outline: 3px solid var(--cat-3);
	outline-offset: 3px;
}
.cart-l {
	flex: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	white-space: nowrap;
}
.cart-p {
	display: inline-flex;
	align-items: center;
	padding: 0 12px;
	background: rgb(0 0 0 / 0.16);
	white-space: nowrap;
}
@container (max-width: 290px) {
	.cart-l svg,
	.menu svg {
		display: none;
	}
	.menu {
		padding: 0 12px;
		font-size: 13px;
	}
	.cart {
		font-size: 13px;
	}
	.cart-p {
		padding: 0 10px;
	}
	.dish {
		font-size: 18px;
	}
	.rail {
		gap: 16px;
	}
}
</style>

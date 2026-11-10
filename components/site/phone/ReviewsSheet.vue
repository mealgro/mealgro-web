<script setup lang="ts">
// The reviews sheet (mealgro-app feed_bottom_sheet.dart): "Reviews", the
// store card, the ratings, then one card per review with a score pill.
import { REVIEWS, type Store } from "../../../lib/site/phone";

defineProps<{ store: Store }>();
defineEmits<{ close: [] }>();

const initials = (name: string) =>
	name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2);
const scoreColour = (n: number) => (n <= 3 ? "#F44336" : n <= 5 ? "#FF9800" : "#4CAF50");
</script>

<template>
	<div class="rs" @pointerdown.stop @pointerup.stop>
		<div class="head">
			<p class="h">Reviews</p>
			<button class="rs-close" type="button" tabindex="-1" @click="$emit('close')">
				<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5F5F5F" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
			</button>
		</div>
		<div class="rs-body">
			<div class="store">
				<span class="logo">{{ store.initials }}</span>
				<div class="sinfo">
					<p class="sname">
						{{ store.name }}
						<svg viewBox="0 0 24 24" width="16" height="16" fill="#FF2509"><path d="m12 1.5 2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3-2.6 1.9-1 3.1-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3.1-2.6-1.9 1-3-1-3.1 2.6-1.9 1-3 3.2.1Z" /><path d="m8 12 2.7 2.7L16.2 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" /></svg>
					</p>
					<p class="sdel">
						<img src="/media/app-icons/scooter_icon.svg" alt="" width="14" height="14" class="grey" />
						{{ store.minutes }}
					</p>
				</div>
				<span class="menu">
					<img src="/media/app-icons/menu_fork_knife.svg" alt="" width="13" height="14" class="black" />
					Menu
				</span>
			</div>
			<div class="ratings">
				<div class="rcard">
					<p class="src"><img src="/media/app-icons/mealgro_icon.svg" alt="" width="14" height="14" />Mealgro</p>
					<p class="val"><b>{{ (store.rating * 2).toFixed(1) }}</b> /10</p>
					<p class="cnt">{{ store.reviews }} ratings</p>
				</div>
			</div>
			<div v-for="r in REVIEWS" :key="r.name" class="review">
				<span class="av">{{ initials(r.name) }}</span>
				<div class="rmid">
					<p class="rname">{{ r.name }}</p>
					<p class="rtext">{{ r.text }}</p>
					<p class="rago">{{ r.ago }}</p>
				</div>
				<span class="score" :style="{ background: scoreColour(r.score) }">
					{{ r.score }}
					<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9Z" /></svg>
				</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.rs {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 90%;
	z-index: 20;
	border-radius: 20px 20px 0 0;
	background: #fff;
	color: var(--g1);
	overflow: hidden;
}
.head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 16px 0;
}
.h {
	font-family: var(--lato);
	font-size: 24px;
	font-weight: 700;
}
.rs-close {
	display: grid;
	place-items: center;
	width: 42px;
	height: 42px;
	border-radius: 50% !important;
	background: #fff !important;
	box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
}
.rs-body {
	position: absolute;
	top: 74px;
	left: 0;
	right: 0;
	bottom: 0;
	overflow-y: auto;
	padding: 10px 16px 40px;
	scrollbar-width: none;
}
.rs-body::-webkit-scrollbar {
	display: none;
}
.store {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 16px;
	border-radius: 12px;
	background: #fff;
	box-shadow: 0 0 12px 2px rgb(0 0 0 / 0.05);
}
.logo,
.av {
	flex: none;
	display: grid;
	place-items: center;
	border-radius: 50%;
	font-weight: 700;
}
.logo {
	width: 48px;
	height: 48px;
	background: var(--g5);
	color: var(--g2);
	font-size: 16px;
}
.sinfo {
	flex: 1;
	min-width: 0;
}
.sname {
	display: flex;
	align-items: center;
	gap: 4px;
	font-family: var(--lato);
	font-size: 16px;
	font-weight: 700;
	white-space: nowrap;
}
.sdel {
	display: flex;
	align-items: center;
	gap: 4px;
	margin-top: 4px !important;
	font-size: 12px;
	font-weight: 500;
	color: var(--g3);
}
.grey {
	opacity: 0.6;
}
.black {
	filter: brightness(0);
}
.menu {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	padding: 10px;
	border: 1px solid var(--g4);
	border-radius: 12px;
	font-size: 14px;
	font-weight: 500;
}
.ratings {
	display: flex;
	gap: 8px;
	margin-top: 16px;
}
.rcard {
	width: 120px;
	padding: 5px 10px;
	border-radius: 16px;
	background: #fff;
	box-shadow: 0 0 12px rgb(0 0 0 / 0.05);
	font-size: 10px;
	color: var(--g2);
	line-height: 1.5;
}
.src {
	display: flex;
	align-items: center;
	gap: 3px;
	font-size: 12px;
}
.val b {
	font-size: 14px;
	color: var(--g1);
}
.review {
	display: flex;
	gap: 10px;
	margin: 10px 0;
	padding: 16px;
	border-radius: 24px;
	background: #fff;
	box-shadow: 0 0 12px 2px rgb(0 0 0 / 0.05);
}
.av {
	width: 40px;
	height: 40px;
	background: var(--red-2);
	color: var(--red);
	font-size: 13px;
}
.rmid {
	flex: 1;
	min-width: 0;
}
.rname {
	font-family: var(--lato);
	font-size: 14px;
}
.rtext {
	margin-top: 12px !important;
	font-size: 12px;
	line-height: 16px;
	font-weight: 500;
	color: var(--g2);
}
.rago {
	margin-top: 8px !important;
	font-size: 12px;
	color: var(--g2);
}
.score {
	align-self: flex-start;
	display: inline-flex;
	align-items: center;
	gap: 3px;
	padding: 4px 8px;
	border-radius: 32px;
	color: #fff;
	font-size: 12px;
}
</style>

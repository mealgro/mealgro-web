<script setup lang="ts">
// The cart, in the dish sheet's style: the store, the dish with the options
// that were picked, the totals and "Proceed to checkout". (The demo stops at
// the button: no order is placed from a web page.)
import { naira, type Dish, type Store } from "../../../lib/site/phone";

const props = defineProps<{
	store: Store;
	dish: Dish;
	line: string;
	qty: number;
	unit: number;
	pressed: string | null;
}>();
defineEmits<{ close: [] }>();

const DELIVERY = 1500;
const SERVICE = 200;
const subtotal = () => props.unit * props.qty;
</script>

<template>
	<div class="cs" @pointerdown.stop @pointerup.stop>
		<div class="head">
			<p class="h">Cart</p>
			<button class="cs-close" type="button" tabindex="-1" @click="$emit('close')">
				<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5F5F5F" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
			</button>
		</div>
		<div class="body">
			<div class="store">
				<span class="logo">{{ store.initials }}</span>
				<div>
					<p class="sname">{{ store.name }}</p>
					<p class="sdel">
						<img src="/media/app-icons/scooter_icon.svg" alt="" width="14" height="14" class="grey" />
						{{ store.minutes }} · {{ store.area }}
					</p>
				</div>
			</div>
			<div class="item">
				<img class="thumb" :src="`/media/dish/${dish.video}.webp`" alt="" width="64" height="64" />
				<div class="it">
					<p class="iname">{{ dish.name }}</p>
					<p class="iline">{{ line }}</p>
					<p class="iprice">{{ naira(unit) }}</p>
				</div>
				<span class="iq">× {{ qty }}</span>
			</div>
			<dl class="sum">
				<div><dt>Subtotal</dt><dd>{{ naira(subtotal()) }}</dd></div>
				<div><dt>Delivery fee</dt><dd>{{ naira(DELIVERY) }}</dd></div>
				<div><dt>Service fee</dt><dd>{{ naira(SERVICE) }}</dd></div>
				<div class="total"><dt>Total</dt><dd>{{ naira(subtotal() + DELIVERY + SERVICE) }}</dd></div>
			</dl>
		</div>
		<div class="bar">
			<button type="button" tabindex="-1" class="cs-go" :class="{ press: pressed === '.cs-go' }">Proceed to checkout</button>
		</div>
	</div>
</template>

<style scoped>
.cs {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 74%;
	z-index: 20;
	border-radius: 32px 32px 0 0;
	background: var(--g6);
	color: var(--g1);
	overflow: hidden;
}
.head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 16px 8px;
	background: #fff;
}
.h {
	font-family: var(--lato);
	font-size: 24px;
	font-weight: 700;
}
.cs-close {
	display: grid;
	place-items: center;
	width: 42px;
	height: 42px;
	border-radius: 50% !important;
	background: #fff !important;
	box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
}
.body {
	padding: 10px;
	display: grid;
	gap: 8px;
}
.store,
.item,
.sum {
	padding: 16px;
	border-radius: 16px;
	background: #fff;
}
.store {
	display: flex;
	align-items: center;
	gap: 12px;
}
.logo {
	display: grid;
	place-items: center;
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: var(--g5);
	color: var(--g2);
	font-weight: 700;
}
.sname {
	font-family: var(--lato);
	font-weight: 700;
	font-size: 16px;
}
.sdel {
	display: flex;
	align-items: center;
	gap: 4px;
	margin-top: 4px !important;
	font-size: 12px;
	color: var(--g3);
}
.grey {
	opacity: 0.6;
}
.item {
	display: flex;
	gap: 12px;
	align-items: center;
}
.thumb {
	width: 64px;
	height: 64px;
	border-radius: 12px;
	object-fit: cover;
}
.it {
	flex: 1;
	min-width: 0;
}
.iname {
	font-size: 16px;
	font-weight: 500;
}
.iline {
	margin-top: 4px !important;
	font-size: 12px;
	line-height: 16px;
	color: var(--g2);
}
.iprice {
	margin-top: 6px !important;
	font-size: 14px;
	font-weight: 500;
}
.iq {
	padding: 6px 10px;
	border-radius: 32px;
	background: var(--red-1);
	color: var(--red);
	font-weight: 500;
}
.sum {
	margin: 0;
	display: grid;
	gap: 10px;
	font-size: 14px;
}
.sum div {
	display: flex;
	justify-content: space-between;
}
.sum dt {
	color: var(--g2);
}
.sum dd {
	margin: 0;
}
.sum .total {
	padding-top: 10px;
	border-top: 1px solid var(--g5);
	font-weight: 700;
	font-size: 16px;
}
.sum .total dt {
	color: var(--g1);
}
.bar {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 16px 16px 34px;
	background: #fff;
}
.cs-go {
	width: 100%;
	height: 50px;
	border-radius: 999px;
	background: var(--red) !important;
	color: #fff !important;
	font-family: var(--lato) !important;
	font-weight: 700;
	font-size: 16px;
	transition: transform 0.15s;
}
.cs-go.press {
	transform: scale(0.96);
}
</style>

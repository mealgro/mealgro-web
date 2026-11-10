<script setup lang="ts">
// The dish sheet (mealgro-app store_bottom_sheet.dart, _CatalogueDetailSheet):
// close button, the dish's media, its info card, one card per modifier group
// (required first), then the quantity stepper and "Add {price}".
import PhoneVideo from "./PhoneVideo.vue";
import { naira, type Dish, type ModGroup } from "../../../lib/site/phone";

defineProps<{
	dish: Dish;
	groups: ModGroup[];
	picks: number[][];
	extraQty: Record<string, number>;
	qty: number;
	total: number;
	pressed: string | null;
	playing: boolean;
}>();
defineEmits<{
	close: [];
	toggle: [gi: number, oi: number];
	extra: [gi: number, oi: number, d: number];
	qty: [n: number];
	add: [];
}>();
</script>

<template>
	<div class="ds" @pointerdown.stop @pointerup.stop>
		<button class="ds-close" type="button" tabindex="-1" @click="$emit('close')">
			<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#5F5F5F" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
		</button>
		<div class="ds-body">
			<div class="media">
				<PhoneVideo :id="dish.video" :load="true" :play="playing" />
			</div>
			<div class="card">
				<div class="badges">
					<span v-if="dish.badges?.includes('popular')" class="flame">🔥 POPULAR</span>
					<span v-if="dish.badges?.includes('bogo')" class="bogo">BUY 2, GET ONE FREE</span>
				</div>
				<p class="name">{{ dish.name }}</p>
				<p class="desc">{{ dish.description }}</p>
				<p class="price">{{ naira(dish.price) }}</p>
			</div>
			<div v-for="(g, gi) in groups" :key="g.title" class="card group">
				<p class="req">
					<span :class="g.required ? 'must' : 'may'">{{ g.required ? "Required" : "Optional" }}</span>
					<span class="hint">{{ g.max === 1 ? " (Select 1)" : ` (Select up to ${g.max})` }}</span>
				</p>
				<p class="gtitle">{{ g.title }}</p>
				<div
					v-for="(o, oi) in g.options"
					:key="o.name"
					class="opt"
					:data-opt="`${gi}:${oi}`"
					:class="{ press: pressed === `[data-opt=&quot;${gi}:${oi}&quot;]` }"
					@click="$emit('toggle', gi, oi)"
				>
					<span class="box" :class="{ on: picks[gi]?.includes(oi) }">
						<svg v-if="picks[gi]?.includes(oi)" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
					</span>
					<span class="otext">
						<span class="oname">{{ o.name }}</span>
						<span class="oprice">+{{ naira(o.price) }}</span>
					</span>
					<span v-if="g.quantities && picks[gi]?.includes(oi)" class="counter" @click.stop>
						<button type="button" tabindex="-1" @click="$emit('extra', gi, oi, -1)">−</button>
						<b>{{ extraQty[`${gi}:${oi}`] ?? 1 }}</b>
						<button type="button" tabindex="-1" :data-plus="`${gi}:${oi}`" @click="$emit('extra', gi, oi, 1)">+</button>
					</span>
				</div>
			</div>
		</div>
		<div class="bar">
			<div class="stepper">
				<button type="button" tabindex="-1" class="ds-minus" :class="{ dim: qty < 2 }" @click="$emit('qty', qty - 1)">
					<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M7.5 12h9" stroke="#fff" stroke-width="2" stroke-linecap="round" /></svg>
				</button>
				<b>{{ qty }}</b>
				<button type="button" tabindex="-1" class="ds-plus" :class="{ press: pressed === '.ds-plus' }" @click="$emit('qty', qty + 1)">
					<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M7.5 12h9M12 7.5v9" stroke="#fff" stroke-width="2" stroke-linecap="round" /></svg>
				</button>
			</div>
			<button type="button" tabindex="-1" class="ds-add" :class="{ press: pressed === '.ds-add' }" @click="$emit('add')">
				Add <span :key="total" class="tick">{{ naira(total) }}</span>
			</button>
		</div>
	</div>
</template>

<style scoped>
.ds {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 92%;
	z-index: 20;
	border-radius: 32px 32px 0 0;
	background: #fff;
	color: var(--g1);
	overflow: hidden;
}
.ds-close {
	position: absolute;
	top: 10px;
	left: 10px;
	z-index: 2;
	display: grid;
	place-items: center;
	width: 44px;
	height: 44px;
	border-radius: 50% !important;
	background: #fff !important;
	box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
}
.ds-body {
	position: absolute;
	inset: 0;
	overflow-y: auto;
	padding: 10px 10px 130px;
	background: var(--g6);
	scrollbar-width: none;
}
.ds-body::-webkit-scrollbar {
	display: none;
}
.media {
	position: relative;
	aspect-ratio: 16 / 12;
	border-radius: 16px;
	overflow: hidden;
	background: var(--g5);
}
.card {
	margin-top: 8px;
	padding: 16px;
	border-radius: 16px;
	background: #fff;
}
.badges {
	display: flex;
	gap: 5px;
}
.flame,
.bogo {
	padding: 4px 8px;
	border-radius: 32px;
	font-family: var(--lato);
	font-size: 11px;
	font-weight: 700;
	color: #fff;
	margin-bottom: 6px;
}
.flame {
	background: var(--red);
	padding: 4px 6px;
}
.bogo {
	background: var(--green);
}
.name {
	font-size: 16px;
	line-height: 24px;
	font-weight: 500;
}
.desc {
	margin-top: 8px !important;
	font-size: 12px;
	line-height: 16px;
	font-weight: 500;
	letter-spacing: 0.25px;
	color: var(--g2);
}
.price {
	margin-top: 12px !important;
	font-size: 14px;
	line-height: 20px;
	font-weight: 500;
}
.req {
	font-size: 14px;
	line-height: 18px;
	font-weight: 500;
	letter-spacing: 0.5px;
}
.must {
	color: #a21d1d;
}
.may {
	color: #ff9800;
}
.hint {
	color: var(--g3);
}
.gtitle {
	margin-top: 2px !important;
	font-size: 14px;
	line-height: 18px;
	font-weight: 500;
	letter-spacing: 0.5px;
	color: var(--g2);
}
.opt {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 0;
	cursor: pointer;
	transition: transform 0.15s;
}
.opt.press {
	transform: scale(0.98);
}
.box {
	flex: none;
	display: grid;
	place-items: center;
	width: 22px;
	height: 22px;
	border-radius: 6px;
	border: 1.6px solid var(--g3);
	transition: background 0.15s, border-color 0.15s;
}
.box.on {
	background: var(--red);
	border-color: var(--red);
}
.otext {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
	font-size: 12px;
	line-height: 16px;
	font-weight: 500;
	letter-spacing: 0.25px;
}
.oname {
	color: var(--g2);
}
.oprice {
	color: var(--g3);
}
.counter {
	display: flex;
	align-items: center;
	padding: 4px 8px;
	border: 1px solid #e0e0e0;
	border-radius: 12px;
	background: #fff;
	box-shadow: 0 1px 4px rgb(0 0 0 / 0.06);
}
.counter button {
	display: grid;
	place-items: center;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: var(--g2) !important;
	color: #fff !important;
	font-size: 15px;
	line-height: 1;
}
.counter b {
	width: 24px;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
}
.bar {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	gap: 8px;
	padding: 16px 16px 34px;
	background: #fff;
	border-top: 1px solid var(--g6);
}
.stepper {
	flex: 2;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 8px;
	border-radius: 32px;
	background: var(--red-1);
	color: var(--red);
}
.stepper b {
	font-size: 16px;
	font-weight: 500;
}
.stepper button {
	color: var(--red);
	display: grid;
	transition: transform 0.15s;
}
.stepper button.dim {
	color: var(--red-2);
}
.stepper button.press,
.ds-add.press {
	transform: scale(0.92);
}
.ds-add {
	flex: 3;
	height: 50px;
	border-radius: 999px;
	background: var(--red) !important;
	color: #fff !important;
	font-family: var(--lato) !important;
	font-weight: 700;
	font-size: 16px;
	transition: transform 0.15s;
}
.tick {
	display: inline-block;
	animation: tick 0.35s ease-out;
}
@keyframes tick {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
}
</style>

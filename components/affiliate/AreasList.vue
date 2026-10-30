<script setup lang="ts">
// Where the affiliate program pays: state headings with city chips.
import type { AreaState } from "../../lib/affiliate/types";

defineProps<{ areas: AreaState[] }>();
</script>

<template>
	<ul class="areas">
		<li v-for="a in areas" :key="a.state" class="area">
			<h3>{{ a.state }}</h3>
			<ul class="chips" :aria-label="`Active cities in ${a.state}`">
				<li v-if="a.whole_state" class="chip chip--all">All cities in {{ a.state }}</li>
				<template v-else>
					<li v-for="c in a.cities" :key="c" class="chip">{{ c }}</li>
				</template>
			</ul>
		</li>
	</ul>
</template>

<style scoped>
.areas {
	list-style: none;
	margin: 0;
	padding: 0;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 16px;
}
.area {
	background: #ffffff;
	border: 1px solid #e5e5e5;
	border-radius: 18px;
	padding: 20px;
}
.area h3 {
	margin: 0 0 12px;
	font-family: "MADE Tommy Soft", sans-serif;
	font-size: 20px;
	font-weight: 700;
	color: #121212;
}
.chips {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}
.chip {
	padding: 6px 12px;
	border-radius: 999px;
	background: #fdece8;
	color: #a81c00;
	font-size: 14px;
	line-height: 1.3;
}
.chip--all {
	background: #d62300;
	color: #ffffff;
	font-weight: 600;
}
</style>

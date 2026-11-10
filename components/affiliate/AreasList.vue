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
/* Uses the v2 tokens (components/portal/tokens.css): the public affiliate page
   is a `.site` page. */
.areas {
	list-style: none;
	margin: 0;
	padding: 0;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 16px;
}
.area {
	background: var(--surface);
	border: 1px solid var(--line);
	border-radius: 1.75rem;
	padding: 24px;
}
.area h3 {
	margin: 0 0 14px;
	font-size: 22px;
	color: var(--ink);
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
	background: var(--brand-soft);
	color: var(--ink);
	font-size: 14px;
	line-height: 1.3;
}
.chip--all {
	background: var(--brand);
	color: var(--on-brand);
	font-weight: 600;
}
</style>

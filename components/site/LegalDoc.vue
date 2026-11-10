<script setup lang="ts">
// A numbered legal document (terms, privacy): the page passes the markdown
// as written; this renders it, numbers the sections and builds the contents
// (components/shared/legalDocumentParser.ts), highlights the section in view,
// and offers back-to-top. Rendering happens in the browser, as before.
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { marked } from "marked";
import DocHero from "./DocHero.vue";
import { padSectionNumber, parseLegalDocument, type TocItem } from "../shared/legalDocumentParser";

const props = defineProps<{
	label: string;
	title: string;
	meta: { label: string; value: string }[];
	markdown: string;
}>();

const html = ref("");
const toc = ref<TocItem[]>([]);
const activeId = ref("");
const showTop = ref(false);
let spy: IntersectionObserver | null = null;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const goTo = (id: string) => {
	document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
	history.replaceState(null, "", `#${id}`);
};
const toTop = () => window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
const onScroll = () => {
	showTop.value = window.scrollY > 640;
};

onMounted(async () => {
	window.addEventListener("scroll", onScroll, { passive: true });
	marked.setOptions({ breaks: true, gfm: true });
	const parsed = parseLegalDocument(await marked.parse(props.markdown));
	toc.value = parsed.toc;
	html.value = parsed.html;
	await nextTick();
	const headings = document.querySelectorAll(".legal-body h2[id]");
	spy = new IntersectionObserver(
		(entries) => {
			for (const e of entries) if (e.isIntersecting) activeId.value = e.target.id;
		},
		{ rootMargin: "-15% 0px -75% 0px", threshold: 0 },
	);
	headings.forEach((h) => spy?.observe(h));
	// A link straight to a section (#section-5) lands once the text exists.
	if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
});
onUnmounted(() => {
	window.removeEventListener("scroll", onScroll);
	spy?.disconnect();
});
</script>

<template>
	<DocHero
		:label="label"
		:title="title"
		:meta="[...meta, { label: 'Sections', value: toc.length ? String(toc.length) : '—' }]"
	/>
	<section class="s-section legal">
		<div class="s-wrap legal-grid">
			<details class="toc-m s-card">
				<summary>
					Contents
					<span class="s-muted">{{ toc.length }} sections</span>
				</summary>
				<nav aria-label="Table of contents">
					<a v-for="t in toc" :key="t.id" :href="`#${t.id}`" @click.prevent="goTo(t.id)">
						<span class="n">{{ padSectionNumber(t.num) }}</span>{{ t.title }}
					</a>
				</nav>
			</details>
			<aside class="toc" aria-label="Table of contents">
				<p class="toc-h">Contents</p>
				<nav>
					<a
						v-for="t in toc"
						:key="t.id"
						:href="`#${t.id}`"
						:class="{ on: activeId === t.id }"
						:aria-current="activeId === t.id ? 'location' : undefined"
						@click.prevent="goTo(t.id)"
					>
						<span class="n">{{ padSectionNumber(t.num) }}</span>{{ t.title }}
					</a>
				</nav>
			</aside>
			<article class="s-card sheet">
				<!-- eslint-disable-next-line vue/no-v-html -- our own markdown, written in the page -->
				<div class="s-prose legal-body" v-html="html" />
				<p v-if="!html" class="s-muted" role="status">Loading…</p>
			</article>
		</div>
	</section>
	<button v-show="showTop" class="to-top" type="button" aria-label="Back to top" @click="toTop">
		<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
	</button>
</template>

<style scoped>
.legal-grid {
	display: grid;
	grid-template-columns: 260px minmax(0, 1fr);
	gap: 32px;
	align-items: start;
}
.toc {
	position: sticky;
	top: 100px;
	max-height: calc(100vh - 124px);
	overflow-y: auto;
	padding-right: 4px;
}
.toc-h {
	font-family: var(--font-display);
	font-weight: 800;
	font-size: 18px;
	margin-bottom: 10px !important;
}
.toc nav,
.toc-m nav {
	display: grid;
	gap: 2px;
}
.toc a,
.toc-m a {
	display: flex;
	gap: 10px;
	padding: 8px 12px;
	border-radius: 0.9rem;
	font-size: 14px;
	line-height: 1.35;
	text-decoration: none;
	color: var(--muted);
}
.toc a:hover,
.toc-m a:hover {
	background: var(--surface);
	color: var(--ink);
}
.toc a.on {
	background: var(--surface);
	color: var(--ink);
	font-weight: 600;
	box-shadow: inset 3px 0 0 var(--brand);
}
.n {
	flex: none;
	min-width: 1.6em;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
	color: var(--brand);
}
.toc-m {
	display: none;
	padding: 0;
}
.toc-m summary {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 20px;
	font-family: var(--font-display);
	font-weight: 800;
	font-size: 18px;
	cursor: pointer;
	list-style: none;
}
.toc-m summary::-webkit-details-marker {
	display: none;
}
.toc-m summary .s-muted {
	font-family: var(--font-body, inherit);
	font-weight: 500;
	font-size: 14px;
}
.toc-m nav {
	padding: 0 8px 12px;
}
.sheet {
	padding: clamp(24px, 5vw, 64px);
}
.to-top {
	position: fixed;
	right: 20px;
	bottom: 20px;
	z-index: 50;
	display: grid;
	place-items: center;
	width: 48px;
	height: 48px;
	border: 0;
	border-radius: 50%;
	background: var(--ink);
	color: var(--surface);
	cursor: pointer;
	box-shadow: 0 10px 24px -8px color-mix(in srgb, var(--ink) 50%, transparent);
}
@media (max-width: 1023px) {
	.legal-grid {
		grid-template-columns: minmax(0, 1fr);
		gap: 16px;
	}
	.toc {
		display: none;
	}
	.toc-m {
		display: block;
	}
}
@media (max-width: 560px) {
	.legal {
		padding-top: 24px;
	}
	.sheet {
		padding: 22px 18px;
		border-radius: 1.5rem;
	}
}
</style>

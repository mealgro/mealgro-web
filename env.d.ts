/// <reference types="vite/client" />

// Lets TypeScript import single-file components (the +Layout.ts files do).
declare module "*.vue" {
	import type { DefineComponent } from "vue";
	const component: DefineComponent<object, object, unknown>;
	export default component;
}

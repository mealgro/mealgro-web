import type { Config } from "vike/types";

// Share codes are dynamic — resolve at request time (SSR), never prerender.
export default {
	prerender: false,
} as Config;

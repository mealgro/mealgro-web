import type { Config } from "vike/types";

// Live status — read from the API at request time (SSR), never prerendered.
export default {
	prerender: false,
} as Config;

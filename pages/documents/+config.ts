import type { Config } from "vike/types";

// The page a document request email links to. Rendered in the browser: the
// token is in the link's fragment, which only the browser sees.
export default {
	title: "Send your documents — Mealgro",
	description: "Send the documents Mealgro asked for",
	ssr: false,
} as Config;

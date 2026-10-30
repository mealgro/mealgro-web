import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [vike(), tailwindcss(), vue()],
	server: {
		allowedHosts:
			process.env.NODE_ENV == "development"
				? ["mealgro.local"]
				: ["mealgro.com"],
		// The vendor portal talks to the API through the dev server, so it
		// needs no CORS and works from any host name the browser can reach
		// (`api.mealgro.local` is not one in every browser).
		proxy: {
			"/api": {
				target: "http://api.mealgro.local:5801",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
});

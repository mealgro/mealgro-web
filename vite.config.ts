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
	},
});

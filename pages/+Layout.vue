<!-- https://vike.dev/Layout -->

<template>
	<!-- Every public page brings its own header and footer
	     (components/site/SitePage.vue); the vendor portal (/account) brings its
	     own chrome. The signed-in affiliate area doesn't use this layout. -->
	<slot />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { usePageContext } from "vike-vue/usePageContext";
import "../lib/theme";
import { initWebkitVideo } from "../lib/site/webkitVideo";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const pageContext = usePageContext();
// The vendor portal (/account) is an app, not a page of the public site.
const isPortal = () =>
	pageContext.urlPathname === "/account" || pageContext.urlPathname.startsWith("/account/");

onMounted(() => {
	if (isPortal()) return;
	initWebkitVideo();
	const firebaseConfig = {
		apiKey: "AIzaSyDkL_P3BwyvYc3QJC3uGPajn29LZwBf_wc",
		authDomain: "mealgro-logistics.firebaseapp.com",
		projectId: "mealgro-logistics",
		storageBucket: "mealgro-logistics.firebasestorage.app",
		messagingSenderId: "527667832209",
		appId: "1:527667832209:web:e6a0db4c37eabacb80e630",
		measurementId: "G-SVDWRYGK43",
	};
	getAnalytics(initializeApp(firebaseConfig));
});
</script>

<style>
html {
	width: 100%;
	max-width: 100vw;
	overflow-x: hidden;
	touch-action: pan-x pan-y;
	-ms-touch-action: pan-x pan-y;
}

body {
	margin: 0;
	width: 100%;
	max-width: 100vw;
	overflow-x: hidden;
	font-family:
		"MADE Tommy Soft",
		-apple-system,
		BlinkMacSystemFont,
		"Segoe UI",
		"Roboto",
		"Oxygen",
		"Ubuntu",
		"Cantarell",
		"Fira Sans",
		"Droid Sans",
		"Helvetica Neue",
		sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	touch-action: pan-x pan-y;
	-ms-touch-action: pan-x pan-y;
}

* {
	box-sizing: border-box;
	-webkit-tap-highlight-color: transparent;
}

/* Prevent zoom on double tap - use manipulation to disable pinch zoom */
* {
	touch-action: manipulation;
}

/* Allow text selection and normal touch behavior for interactive elements */
input,
textarea,
[contenteditable],
a,
button {
	touch-action: auto;
}
</style>

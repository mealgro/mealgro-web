<!-- https://vike.dev/Layout -->

<template>
	<div id="page-container">
		<Navigation />
		<!-- Global Logo -->
		<a href="/" class="global-logo-link">
			<img
				:src="logoImage"
				alt="MealGro Logo"
				class="global-logo"
				:class="{ 'global-logo--red': isRedLogoPage }"
			/>
		</a>
		<div id="page-content" class="page-content-wrapper">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { usePageContext } from "vike-vue/usePageContext";
import Navigation from "../components/shared/Navigation.vue";
import logoImage from "../assets/logo.svg";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const pageContext = usePageContext();
const isRedLogoPage = computed(() => {
	const path = pageContext.urlPathname;
	return path === "/" || path === "/riders";
});

// Prevent zoom via keyboard shortcuts (Ctrl/Cmd + Plus/Minus/0)
const preventZoomKeyboard = (e: KeyboardEvent) => {
	if (
		(e.ctrlKey || e.metaKey) &&
		(e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")
	) {
		e.preventDefault();
		return false;
	}
};

// Prevent zoom via mouse wheel with Ctrl/Cmd
const preventZoomWheel = (e: WheelEvent) => {
	if (e.ctrlKey || e.metaKey) {
		e.preventDefault();
		return false;
	}
};

// Prevent pinch zoom gestures
const preventZoomTouch = (e: TouchEvent) => {
	if (e.touches.length > 1) {
		e.preventDefault();
		return false;
	}
};

onMounted(() => {
	document.addEventListener("keydown", preventZoomKeyboard);
	document.addEventListener("wheel", preventZoomWheel, { passive: false });
	document.addEventListener("touchstart", preventZoomTouch, {
		passive: false,
	});
	document.addEventListener("touchmove", preventZoomTouch, {
		passive: false,
	});
	document.addEventListener("gesturestart", (e) => e.preventDefault());
	document.addEventListener("gesturechange", (e) => e.preventDefault());
	document.addEventListener("gestureend", (e) => e.preventDefault());

	const firebaseConfig = {
		apiKey: "AIzaSyDkL_P3BwyvYc3QJC3uGPajn29LZwBf_wc",
		authDomain: "mealgro-logistics.firebaseapp.com",
		projectId: "mealgro-logistics",
		storageBucket: "mealgro-logistics.firebasestorage.app",
		messagingSenderId: "527667832209",
		appId: "1:527667832209:web:e6a0db4c37eabacb80e630",
		measurementId: "G-SVDWRYGK43",
	};

	// Initialize Firebase
	const app = initializeApp(firebaseConfig);
	const analytics = getAnalytics(app);
});

onUnmounted(() => {
	document.removeEventListener("keydown", preventZoomKeyboard);
	document.removeEventListener("wheel", preventZoomWheel);
	document.removeEventListener("touchstart", preventZoomTouch);
	document.removeEventListener("touchmove", preventZoomTouch);
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

<style scoped>
/* Page Transition Animation */
#page-container {
	width: 100%;
	max-width: 100vw;
	overflow-x: hidden;
}

#page-content {
	opacity: 1;
	transition: opacity 0.3s ease-in-out;
	width: 100%;
	max-width: 100vw;
	overflow-x: hidden;
}
body.page-transition #page-content {
	opacity: 0;
}

.page-content-wrapper {
	position: relative;
	width: 100%;
	max-width: 100vw;
	overflow-x: hidden;
}

.global-logo-link {
	position: absolute;
	left: 20px;
	top: 20px;
	z-index: 100;
	display: block;
	text-decoration: none;
	cursor: pointer;
}

.global-logo {
	width: 110px;
	height: 80px;
	object-fit: contain;
	filter: brightness(0) invert(1);
	display: block;
	pointer-events: none;
}

@media (min-width: 1400px) {
	.global-logo-link {
		left: calc((100vw - 1400px) / 2 + 20px);
	}
}

.global-logo--red {
	filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%)
		hue-rotate(346deg) brightness(104%) contrast(97%);
}

@media (max-width: 1024px) {
	.global-logo-link {
		display: none;
	}
}
</style>

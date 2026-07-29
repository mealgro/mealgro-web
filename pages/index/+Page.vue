<template>
	<div class="min-h-screen">
		<!-- Import and use components from /components/home/ -->
		<HeroSection />
		<DownloadNowSection />
		<FindWhatYouCraveSection />
		<GetStartedSection />
		<TryYoursNowSection />
		<FAQSection />
		<Footer />
	</div>
</template>

<script setup lang="ts">
import HeroSection from "../../components/home/HeroSection.vue";
import DownloadNowSection from "../../components/home/DownloadNowSection.vue";
import FindWhatYouCraveSection from "../../components/home/FindWhatYouCraveSection.vue";
import GetStartedSection from "../../components/home/GetStartedSection.vue";
import TryYoursNowSection from "../../components/home/TryYoursNowSection.vue";
import FAQSection from "../../components/home/FAQSection.vue";
import Footer from "../../components/shared/Footer.vue";
</script>

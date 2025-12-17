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
    
    <!-- Add more sections as components -->
    <!-- Example: <FeaturesSection /> -->
    <!-- Example: <TestimonialsSection /> -->
  </div>
</template>

<script setup lang="ts">
// Import components from /components/home/
import HeroSection from "../../components/home/HeroSection.vue";
// import LocationSection from "../../components/home/LocationSection.vue";
import DownloadNowSection from "../../components/home/DownloadNowSection.vue";
import FindWhatYouCraveSection from "../../components/home/FindWhatYouCraveSection.vue";
import GetStartedSection from "../../components/home/GetStartedSection.vue";
import TryYoursNowSection from "../../components/home/TryYoursNowSection.vue";
import FAQSection from "../../components/home/FAQSection.vue";
import Footer from "../../components/shared/Footer.vue";

// Add more imports as you create components:
// import FeaturesSection from "../../components/home/FeaturesSection.vue";
// import TestimonialsSection from "../../components/home/TestimonialsSection.vue";
</script>

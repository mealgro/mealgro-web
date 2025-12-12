<template>
  <div class="min-h-screen">
    <RidersHero />
    <VehicleSection />
    <DeliverToAnywhereSection />
    <SeamlessExperienceSection />
    <JoinUsSection />
    <DownloadForRidersSection />
    <FAQSection />
    <Footer />
    <!-- Add more riders-specific sections below -->
  </div>
</template>

<script setup lang="ts">
import RidersHero from '../../components/riders/RidersHero.vue';
import VehicleSection from '../../components/riders/VehicleSection.vue';
import DeliverToAnywhereSection from '../../components/riders/DeliverToAnywhereSection.vue';
import SeamlessExperienceSection from '../../components/riders/SeamlessExperienceSection.vue';
import JoinUsSection from '../../components/riders/JoinUsSection.vue';
import DownloadForRidersSection from '../../components/riders/DownloadForRidersSection.vue';
import FAQSection from '../../components/home/FAQSection.vue';
import Footer from "../../components/shared/Footer.vue";
</script>


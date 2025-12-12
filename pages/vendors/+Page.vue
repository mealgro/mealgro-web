<template>
  <div class="min-h-screen">
    <VendorsHero />
    <SmartBusinessSection />
    <FeaturesCardsSection />
    <RecordSalesSection />
    <ConnectVendorsSection />
    <JoinUsSection />
    <FAQSection />
    <Footer />
    <!-- Add more vendor sections here -->
  </div>
</template>

<script setup lang="ts">
import VendorsHero from '../../components/vendors/VendorsHero.vue';
import SmartBusinessSection from '../../components/vendors/SmartBusinessSection.vue';
import FeaturesCardsSection from '../../components/vendors/FeaturesCardsSection.vue';
import RecordSalesSection from '../../components/vendors/RecordSalesSection.vue';
import ConnectVendorsSection from '../../components/vendors/ConnectVendorsSection.vue';
import JoinUsSection from '../../components/vendors/JoinUsSection.vue';
import FAQSection from '../../components/vendors/FAQSection.vue';
import Footer from '../../components/shared/Footer.vue';
</script>


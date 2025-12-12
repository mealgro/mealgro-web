<template>
  <footer class="w-full bg-black text-white">
    <!-- Desktop Top Section: Logo and Links -->
    <div class="hidden md:block">
      <div class="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-8">
          <!-- Logo and Brand -->
          <div class="w-full lg:w-[30vw] flex-shrink-0">
            <a href="/" class="inline-block mb-4">
              <img :src="logoImage" alt="Mealgro Logo" class="h-auto w-auto" />
            </a>
          </div>

          <!-- Information Columns -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full lg:w-[70vw]">
            <!-- Find us near you -->
            <!-- <div>
              <h4 class="font-bold text-[24px] leading-[68px] tracking-[-0.25px] text-white mb-4">Find us near you</h4>
              <ul class="space-y-0 list-none">
                <li><a href="#" class="text-[24px] leading-[68px] tracking-[-0.25px] text-white font-normal hover:opacity-70 transition-opacity block">Lagos</a></li>
                <li><a href="#" class="text-[24px] leading-[68px] tracking-[-0.25px] text-white font-normal hover:opacity-70 transition-opacity block">Benin City</a></li>
                <li><a href="#" class="text-[24px] leading-[68px] tracking-[-0.25px] text-white font-normal hover:opacity-70 transition-opacity block">Abeokuta</a></li>
                <li><a href="#" class="text-[24px] leading-[68px] tracking-[-0.25px] text-white font-normal hover:opacity-70 transition-opacity block">Asaba</a></li>
              </ul>
            </div> -->

            <!-- Enquires -->
            <div>
              <ul class="space-y-0 list-none">
                <li class="font-bold text-[24px] leading-[68px] tracking-[-0.25px] text-white">Enquires</li>
                <li><a href="/contact" class="text-[24px] leading-[68px] tracking-[-0.25px] text-white font-normal hover:opacity-70 transition-opacity block">Contact us</a></li>
              </ul>
            </div>

            <!-- About us -->
            <div>
              <ul class="space-y-0 list-none">
                <li class="font-bold text-[24px] leading-[68px] tracking-[-0.25px] text-white">About us</li>
                <li><a href="/about" class="text-[24px] leading-[68px] tracking-[-0.25px] text-white font-normal hover:opacity-70 transition-opacity block">Who we are</a></li>
                <li><a href="/about" class="text-[24px] leading-[68px] tracking-[-0.25px] text-white font-normal hover:opacity-70 transition-opacity block">Our core values</a></li>
                <li><a href="/help" class="text-[24px] leading-[68px] tracking-[-0.25px] text-white font-normal hover:opacity-70 transition-opacity block">Privacy policies</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Top Section -->
    <div class="md:hidden px-5 py-16 space-y-12 style=
    padding-right: 50px;
    padding-bottom: 20px;
">
      <div class="grid grid-cols-2 gap-8 items-start text-white">
        <div>
          <ul class="space-y-3 list-none">
            <li class="text-base font-semibold tracking-tight text-white">About us</li>
            <li v-for="link in mobileAbout" :key="link.label">
              <a :href="link.href" class="text-base leading-6 text-white">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
        <div class="text-center flex flex-col items-end">
          <ul class="space-y-3 list-none">
            <li class="text-base font-semibold tracking-tight text-white">Enquiries</li>
            <li v-for="link in mobileEnquiries" :key="link.label">
              <a :href="link.href" class="text-base leading-6 text-white">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex justify-end">
        <a href="/" aria-label="Mealgro home">
          <img :src="logoImage" alt="Mealgro Logo" class="h-16 w-auto" />
        </a>
      </div>
    </div>

    <!-- Call to Action Banner -->
    <div class="w-full flex justify-center py-6 md:py-6">
      <div class="w-full md:w-[90%] bg-[#D62300] py-6 md:py-6">
        <div class="px-5 md:px-8 md:container md:mx-auto">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <h3 class="hidden md:block text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center md:text-left">
              Your next food journey starts here.
            </h3>
            <button class="flex items-center justify-center gap-4 bg-black text-white font-medium px-10 py-6 rounded-xl transition-opacity duration-200 hover:opacity-90 whitespace-nowrap text-lg md:text-xl">
              <span>Download now</span>
              <div class="flex items-center gap-3">
                <img :src="appStoreIcon" alt="App Store" class="w-7 h-8 object-contain" style="filter: brightness(0) invert(1);" />
                <img :src="playStoreIcon" alt="Google Play" class="w-7 h-8 object-contain" style="filter: brightness(0) invert(1);" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Footer -->
    <div class="container mx-auto px-4 md:px-8 py-6 md:py-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Social Media Icons (mobile first) -->
        <div class="flex items-center gap-4 md:order-2">
          <a href="#" @click.prevent="scrollToTop" class="hover:opacity-70 transition-opacity">
            <img :src="facebookIcon" alt="Facebook" class="w-7 h-7 object-contain" />
          </a>
          <a href="#" @click.prevent="scrollToTop" class="hover:opacity-70 transition-opacity">
            <img :src="instagramIcon" alt="Instagram" class="w-7 h-8 object-contain" />
          </a>
          <a href="#" @click.prevent="scrollToTop" class="hover:opacity-70 transition-opacity">
            <img :src="linkedInIcon" alt="LinkedIn" class="w-6 h-6 object-contain" />
          </a>
        </div>

        <!-- Copyright and Legal Links -->
        <div class="flex flex-col md:flex-row items-center gap-2 md:gap-4 md:order-1 text-center md:text-left">
          <p class="text-sm text-white">
            All rights reserved, 2025, Meal Gro.
          </p>
          <div class="hidden md:flex items-center gap-4 text-sm">
            <a href="/help" class="text-white hover:opacity-70 transition-opacity">Privacy Policy</a>
            <span class="text-white">•</span>
            <a href="/help" class="text-white hover:opacity-70 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import logoImage from '../../assets/footer/mealgro.svg';
import appStoreIcon from '../../assets/download/appstore.svg';
import playStoreIcon from '../../assets/download/playstore.svg';
import facebookIcon from '../../assets/footer/Vector (1).svg';
import instagramIcon from '../../assets/footer/Vector (2).svg';
import linkedInIcon from '../../assets/footer/Vector (3).svg';

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const mobileLocations = [
  { label: 'Lagos', href: '#' },
  { label: 'Benin City', href: '#' },
  { label: 'Abeokuta', href: '#' },
  { label: 'Asaba', href: '#' },
  { label: 'See more', href: '#', emphasis: true },
];

const mobileEnquiries = [
  { label: 'Contact us', href: '/contact' },
];

const mobileAbout = [
  { label: 'Who we are', href: '/about' },
  { label: 'Our core values', href: '/about' },
  { label: 'Privacy policies', href: '/help' },
];
</script>


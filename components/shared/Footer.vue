<template>
  <footer class="w-full bg-black text-white">
    <!-- Desktop Top Section: Logo and Links -->
    <div class="hidden lg:block">
      <div class="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-8">
          <!-- Logo and Brand -->
          <div class="w-full lg:w-[30vw] flex-shrink-0">
            <a href="/" class="inline-block mb-4">
              <img :src="logoImage" alt="Mealgro Logo" class="h-auto w-auto" />
            </a>
          </div>

          <!-- Information Columns -->
          <div class="grid grid-cols-2 gap-12 w-full lg:w-[70vw]">
            <!-- Enquiries -->
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#D62300] mb-4">
                Enquiries
              </p>
              <ul class="space-y-1 list-none">
                <li>
                  <a
                    href="/contact"
                    class="text-lg leading-[1.9] text-white font-normal hover:text-[#D62300] transition-colors duration-200 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]"
                  >
                    Contact us
                  </a>
                </li>
              </ul>
            </div>

            <!-- About us -->
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#D62300] mb-4">
                About us
              </p>
              <ul class="space-y-1 list-none">
                <li>
                  <a
                    href="/about"
                    class="text-lg leading-[1.9] text-white font-normal hover:text-[#D62300] transition-colors duration-200 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]"
                  >
                    Who we are
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    class="text-lg leading-[1.9] text-white font-normal hover:text-[#D62300] transition-colors duration-200 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]"
                  >
                    Our core values
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    class="text-lg leading-[1.9] text-white font-normal hover:text-[#D62300] transition-colors duration-200 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]"
                  >
                    Privacy policies
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Top Section -->
    <div class="lg:hidden pl-5 pr-[50px] pt-16 pb-5 space-y-12">
      <div class="grid grid-cols-2 gap-8 items-start text-white">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#D62300] mb-3">
            About us
          </p>
          <ul class="space-y-3 list-none">
            <li v-for="link in mobileAbout" :key="link.label">
              <a
                :href="link.href"
                class="text-base leading-6 text-white hover:text-[#D62300] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
        <div class="text-center flex flex-col items-end">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#D62300] mb-3">
            Enquiries
          </p>
          <ul class="space-y-3 list-none">
            <li v-for="link in mobileEnquiries" :key="link.label">
              <a
                :href="link.href"
                class="text-base leading-6 text-white hover:text-[#D62300] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]"
              >
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
            <h3 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center md:text-left">
              Your next food journey starts here.
            </h3>
            <button class="flex items-center justify-center gap-4 bg-black text-white font-medium px-10 py-6 rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-[1.02] whitespace-nowrap text-lg md:text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
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
          <a href="https://www.facebook.com/share/14VPaxDJVbY/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" class="hover:opacity-70 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]">
            <img :src="facebookIcon" alt="Facebook" class="w-7 h-7 object-contain" />
          </a>
          <a href="https://www.instagram.com/trymealgro?igsh=Y2R4YXRjYnBhbjV5&utm_source=qr" target="_blank" rel="noopener noreferrer" class="hover:opacity-70 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]">
            <img :src="instagramIcon" alt="Instagram" class="w-7 h-8 object-contain" />
          </a>
          <a href="https://www.linkedin.com/company/mealgro/" target="_blank" rel="noopener noreferrer" class="hover:opacity-70 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]">
            <img :src="linkedInIcon" alt="LinkedIn" class="w-6 h-6 object-contain" />
          </a>
          <a href="https://x.com/mealgro?s=21&t=DqLhe4jYMReTjpiqvefrMQ" target="_blank" rel="noopener noreferrer" class="hover:opacity-70 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]">
            <img :src="twitterIcon" alt="Twitter" class="w-7 h-7 object-contain" style="filter: brightness(0) invert(1);" />
          </a>
        </div>

        <!-- Copyright and Legal Links -->
        <div class="flex flex-col md:flex-row items-center gap-2 md:gap-4 md:order-1 text-center md:text-left">
          <p class="text-sm text-white">
            All rights reserved, {{ currentYear }}, MealGro.
          </p>
          <div class="flex items-center gap-3 text-sm">
            <a href="/privacy" class="text-white hover:text-[#D62300] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]">Privacy Policy</a>
            <span class="text-white/40">•</span>
            <a href="/terms" class="text-white hover:text-[#D62300] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62300]">Terms of Service</a>
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
import twitterIcon from '../../assets/footer/twitter-alt-square.svg';

const currentYear = new Date().getFullYear();

const mobileEnquiries = [
  { label: 'Contact us', href: '/contact' },
];

const mobileAbout = [
  { label: 'Who we are', href: '/about' },
  { label: 'Our core values', href: '/about' },
  { label: 'Privacy policies', href: '/privacy' },
];
</script>


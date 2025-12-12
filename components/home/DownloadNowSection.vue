<template>
  <section class="w-full bg-white py-16 md:py-24 mt-16 md:mt-24 download-section">
    <div class="container mx-auto px-8 md:px-12 lg:px-16 xl:px-20">
      <!-- Desktop Layout -->
      <div class="download-desktop-layout flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <!-- Left: Burger Image Carousel -->
        <div class="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div class="relative w-full max-w-[608px]">
            <!-- Carousel Image -->
            <div class="relative overflow-hidden rounded-[64px] w-full max-w-[608px] aspect-[608/501]">
              <div
                v-for="(image, index) in carouselImages"
                :key="index"
                class="absolute inset-0 transition-opacity duration-500 ease-in-out"
                :class="currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'"
              >
                <img 
                  :src="image" 
                  alt="Gourmet Burger" 
                  class="w-full h-full object-cover rounded-[64px]"
                />
              </div>
            </div>
            
            <!-- Progress Indicators -->
            <div class="flex flex-row items-center gap-0.5 mt-6 w-full max-w-[400px] mx-auto">
              <div 
                v-for="(image, index) in carouselImages"
                :key="index"
                @click="goToSlide(index)"
                class="flex flex-col items-start gap-1 flex-1 cursor-pointer"
              >
                <div 
                  class="w-full h-1 rounded-full transition-colors duration-300"
                  :class="currentSlide === index ? 'bg-[#FF2509]' : 'bg-[#FFE0DC]'"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Text and CTA -->
        <div class="w-full lg:w-1/2 flex flex-col justify-center items-end lg:items-end">
          <h2 class="font-extrabold text-[60px] leading-[68px] text-right tracking-[-0.25px] text-[#121212] mb-6">
            Satisfy your<br>
            immediate<br>
            cravings
          </h2>
          
          <p class="font-normal text-[32px] leading-[34px] text-right tracking-[-0.25px] text-[#8D8A8A] mb-8">
            Mealgro has all the food<br>
            you can eat
          </p>

          <!-- Download Button -->
          <button class="flex items-center justify-center gap-3 bg-[#FF2509] hover:opacity-90 text-white font-medium text-base md:text-lg rounded-[16px] transition-opacity duration-200 w-[280px] h-[72px] max-w-full">
            <span>Download now</span>
            <div class="flex items-center justify-center gap-2">
              <!-- Apple App Store Icon -->
              <img :src="appStoreIcon" alt="App Store" class="w-5 h-6 object-contain" />
              <!-- Google Play Icon -->
              <img :src="playStoreIcon" alt="Google Play" class="w-5 h-6 object-contain" />
            </div>
          </button>
        </div>
      </div>

      <!-- Mobile/Tablet Layout -->
      <div class="download-mobile-layout">
        <!-- Background Box -->
        <div class="mobile-bg-box"></div>
        
        <!-- Burger Image -->
        <div class="mobile-image-container">
          <div class="relative overflow-hidden rounded-[50px] w-full">
            <div
              v-for="(image, index) in carouselImages"
              :key="index"
              class="absolute inset-0 transition-opacity duration-500 ease-in-out"
              :class="currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'"
            >
              <img 
                :src="image" 
                alt="Gourmet Burger" 
                class="w-full h-full object-cover rounded-[32px]"
              />
            </div>
          </div>
          
          <!-- Progress Indicators -->
          <div class="flex flex-row items-center gap-0.5 mt-4 w-full max-w-[300px] mx-auto">
            <div 
              v-for="(image, index) in carouselImages"
              :key="index"
              @click="goToSlide(index)"
              class="flex flex-col items-start gap-1 flex-1 cursor-pointer"
            >
              <div 
                class="w-full h-1 rounded-full transition-colors duration-300"
                :class="currentSlide === index ? 'bg-[#FF2509]' : 'bg-[#FFE0DC]'"
              ></div>
            </div>
          </div>
        </div>

        <!-- Text Content -->
        <div class="mobile-text-content">
          <h2 class="mobile-heading">
            Satisfy your<br>
            immediate<br>
            cravings
          </h2>
        </div>

        <!-- Download Button -->
        <button class="mobile-download-btn">
          <span>Download now</span>
          <div class="flex items-center gap-2">
            <img :src="appStoreIcon" alt="App Store" class="w-5 h-6 object-contain" style="filter: brightness(0);" />
            <img :src="playStoreIcon" alt="Google Play" class="w-5 h-6 object-contain" style="filter: brightness(0);" />
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import foodImage from '../../assets/download/food.jpg';
import appStoreIcon from '../../assets/download/appstore.svg';
import playStoreIcon from '../../assets/download/playstore.svg';

const currentSlide = ref(0);
const carouselImages = [foodImage, foodImage, foodImage, foodImage, foodImage]; // Add more images here

let autoSlideInterval: ReturnType<typeof setInterval> | null = null;

const goToSlide = (index: number) => {
  currentSlide.value = index;
  resetAutoSlide();
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % carouselImages.length;
};

const resetAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
  autoSlideInterval = setInterval(nextSlide, 5000); // Auto-rotate every 5 seconds
};

onMounted(() => {
  resetAutoSlide();
});

onUnmounted(() => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
});
</script>

<style scoped>
/* Hide mobile layout on desktop */
.download-mobile-layout {
  display: none;
}

/* Hide desktop layout on mobile/tablet */
@media (max-width: 1024px) {
  .download-section {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    padding-left: 0;
    padding-right: 0;
  }

  .download-section .container {
    padding-left: 0;
    padding-right: 0;
    max-width: 100vw;
  }

  .download-desktop-layout {
    display: none;
  }

  .download-mobile-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 100%;
    position: relative;
    min-height: 600px;
    padding: 20px;
  }

  .mobile-bg-box {
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    bottom: 0;
    background: #F8F3F3;
    border-radius: 63px;
    z-index: 0;
  }

  .mobile-image-container {
    width: 100%;
    max-width: 100%;
    aspect-ratio: 4/3;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }

  .mobile-image-container .relative {
    width: 100%;
    height: 100%;
  }

  .mobile-text-content {
    text-align: center;
    margin: 24px 0 32px 0;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .mobile-heading {
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 800;
    font-size: 44px;
    line-height: 52px;
    letter-spacing: -0.25px;
    color: #121212;
    text-align: center;
    margin: 0;
  }

  .mobile-download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: #FF2509;
    color: white;
    border: none;
    border-radius: 32px;
    padding: 24px 32px;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    max-width: 380px;
    margin-top: 24px;
    transition: opacity 0.2s;
    position: relative;
    z-index: 1;
  }

  .mobile-download-btn:hover {
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .mobile-bg-box {
    width: 100%;
    left: 0;
    transform: none;
  }

  .mobile-heading {
    font-size: 46px;
    line-height: 44px;
  }

  .mobile-download-btn {
    padding: 22px 28px;
    font-size: 16px;
    max-width: 340px;
    border-radius: 28px;
  }
}
</style>


<template>
  <section class="w-full bg-[#F6F6F6] py-16 md:py-24 crave-section">
    <div class="container mx-auto px-4 md:px-8">
      <div class="text-center mb-12">
        <h2 class="text-4xl md:text-5xl lg:text-6xl text-black mb-4">
          <span class="font-[400]">Find what you </span><span class="font-extrabold">crave</span>
        </h2>
      </div>
      
      <!-- Desktop: Grid Layout -->
      <div class="desktop-grid grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
        <!-- Quick Takeouts Card -->
        <div class="rounded-2xl p-6 md:p-8 flex flex-col items-center relative">
          <img :src="takeoutsImage" alt="Quick Takeouts" class="w-full h-auto object-contain mb-2 flex-1 scale-110 md:scale-125 relative z-0" />
          <button class="w-full bg-gray-200 hover:bg-gray-300 text-black font-normal text-2xl md:text-3xl py-4 md:py-5 px-6 md:px-8 rounded-[16px] transition-colors duration-200 flex items-center justify-center relative z-10">
            <span class="text-center">Explore</span>
            <div class="absolute right-6 md:right-8 bg-white rounded-full p-2 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </button>
        </div>

        <!-- Easy Meals Card -->
        <div class="rounded-2xl p-6 md:p-8 flex flex-col items-center relative">
          <img :src="mealsImage" alt="Easy Meals" class="w-full h-auto object-contain mb-2 flex-1 scale-110 md:scale-125 relative z-0" />
          <button class="w-full bg-gray-200 hover:bg-gray-300 text-black font-normal text-2xl md:text-3xl py-4 md:py-5 px-6 md:px-8 rounded-[16px] transition-colors duration-200 flex items-center justify-center relative z-10">
            <span class="text-center">Explore</span>
            <div class="absolute right-6 md:right-8 bg-white rounded-full p-2 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </button>
        </div>

        <!-- Heavy Loaders Card -->
        <div class="rounded-2xl p-6 md:p-8 flex flex-col items-center relative">
          <img :src="loadersImage" alt="Heavy Loaders" class="w-full h-auto object-contain mb-2 flex-1 scale-110 md:scale-125 relative z-0" />
          <button class="w-full bg-gray-200 hover:bg-gray-300 text-black font-normal text-2xl md:text-3xl py-4 md:py-5 px-6 md:px-8 rounded-[16px] transition-colors duration-200 flex items-center justify-center relative z-10">
            <span class="text-center">Explore</span>
            <div class="absolute right-6 md:right-8 bg-white rounded-full p-2 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Mobile: Carousel Layout -->
      <div class="mobile-carousel">
        <div class="carousel-container relative overflow-hidden">
          <div 
            class="carousel-track flex transition-transform duration-300 ease-in-out"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <div 
              v-for="(card, index) in cards" 
              :key="index"
              class="carousel-slide flex-shrink-0 w-full"
            >
              <div class="rounded-2xl p-6 md:p-8 flex flex-col items-center relative w-full mobile-card-container">
                <img :src="card.image" :alt="card.title" class="w-full h-auto object-contain mb-0 flex-1 relative z-0 mobile-carousel-image" />
                <button class="w-full bg-gray-200 hover:bg-gray-300 text-black font-normal text-2xl py-6 px-8 rounded-[16px] transition-colors duration-200 flex items-center justify-center relative z-10 -mt-8">
                  <span class="text-center">Explore</span>
                  <div class="absolute right-8 bg-white rounded-full p-3 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Page Indicators -->
        <div class="mobile-progress-bar">
          <div 
            v-for="(card, index) in cards"
            :key="index"
            class="mobile-stepper"
          >
            <div 
              class="mobile-progress-bg"
              :class="currentSlide === index ? 'bg-[#FF2509]' : 'bg-[#FFE0DC]'"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import takeoutsImage from '../../assets/crave/takeouts.svg';
import mealsImage from '../../assets/crave/meals.svg';
import loadersImage from '../../assets/crave/loaders.svg';

const currentSlide = ref(0);

const cards = [
  { image: takeoutsImage, title: 'Quick Takeouts' },
  { image: mealsImage, title: 'Easy Meals' },
  { image: loadersImage, title: 'Heavy Loaders' }
];

let autoSlideInterval: ReturnType<typeof setInterval> | null = null;

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % cards.length;
};

const goToSlide = (index: number) => {
  currentSlide.value = index;
  resetAutoSlide();
};

const resetAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
  autoSlideInterval = setInterval(nextSlide, 5000);
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
/* Hide mobile carousel on desktop */
.mobile-carousel {
  display: none;
}

/* Hide desktop grid on mobile/tablet */
@media (max-width: 1024px) {
  .desktop-grid {
    display: none !important;
  }

  .mobile-carousel {
    display: block;
  }
}

@media (max-width: 768px) {
  .crave-section {
    background: white !important;
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .crave-section .container {
    padding-left: 0;
    padding-right: 0;
    max-width: 100vw;
  }

  .desktop-grid {
    display: none;
  }

  .mobile-carousel {
    display: block;
    width: 100%;
    max-width: 100vw;
  }

  .carousel-container {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .carousel-track {
    display: flex;
    width: 100%;
  }

  .carousel-slide {
    min-width: 100%;
    width: 100%;
    flex-shrink: 0;
  }

  .carousel-slide > div {
    width: 100%;
    max-width: 100%;
  }

  .mobile-card-container {
    width: 100vw;
    max-width: 100vw;
    padding: 0 !important;
    padding-bottom: 1rem !important;
  }

  .mobile-carousel-image {
    width: 100vw !important;
    max-width: 100vw !important;
    height: auto;
    object-fit: contain;
    display: block;
  }

  .mobile-card-container button {
    margin-left: 1rem;
    margin-right: 1rem;
    width: calc(100vw - 2rem);
  }

  .mobile-progress-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0;
    gap: 2px;
    width: 306px;
    height: 28px;
    margin: 24px auto 0;
  }

  .mobile-stepper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    gap: 4px;
    width: 100.67px;
    height: 25px;
    flex: none;
    flex-grow: 1;
  }

  .mobile-progress-bg {
    width: 100.67px;
    height: 4px;
    border-radius: 100px;
    flex: none;
    align-self: stretch;
    flex-grow: 0;
    transition: background-color 0.3s ease;
  }
}
</style>


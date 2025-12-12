<template>
  <section class="w-full bg-white py-16 md:py-24 get-started-section">
    <div class="container mx-auto px-8 md:px-12 lg:px-16 xl:px-20">
      <!-- Desktop Layout -->
      <div class="get-started-desktop flex flex-col lg:flex-row items-end gap-8 lg:gap-12">
        <!-- Left: Delivery Person Image -->
        <div class="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div class="relative w-full max-w-md">
            <img 
              :src="pizzaGuyImage" 
              alt="Delivery Person" 
              class="w-full h-auto object-contain scale-[1.2]"
            />
          </div>
        </div>

        <!-- Right: Text and CTA -->
        <div class="w-full lg:w-1/2 flex flex-col justify-between items-end lg:items-end min-h-full">
          <div>
            <h2 class="font-extrabold text-[60px] leading-[68px] text-right tracking-[-0.25px] text-[#121212] mb-6">
              Delivery made<br>
              easy for <span class="text-[#D62300]">Vendors</span><br>
              all in One app<br>
            </h2>
            
            <p class="font-normal text-[32px] leading-[41px] text-right tracking-[-0.25px] text-[#8D8A8A] mb-8">
              Get a rider assigned to your<br>
              delivery in minutes, one click and<br>
              your order has gotten to its<br>
              destination
            </p>
          </div>

          <!-- Get Started Button -->
          <button class="w-1/2 bg-gray-200 hover:bg-gray-300 text-black font-normal text-xl md:text-2xl py-4 md:py-5 px-6 md:px-8 rounded-[16px] transition-colors duration-200 flex items-center justify-center relative z-10 mt-auto scale-[1.2] origin-right">
            <span class="text-center">Get started</span>
            <div class="absolute right-6 md:right-8 bg-white rounded-full p-2 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Mobile/Tablet Layout -->
      <div class="get-started-mobile">
        <!-- Background Box -->
        <div class="mobile-bg-box"></div>

        <!-- Delivery Person Image -->
        <div class="mobile-image-container">
          <img 
            :src="pizzaGuyImage" 
            alt="Delivery Person" 
            class="mobile-image"
          />
        </div>

        <!-- Text Content -->
        <div class="mobile-text-content">
          <h2 class="mobile-heading">
            Delivery made<br>
            easy for <span class="text-[#D62300]">Vendors</span><br>
            all in One app
          </h2>
        </div>

        <!-- Explore Button -->
        <button class="mobile-explore-btn">
          <span>Explore</span>
          <div class="absolute right-6 bg-white rounded-full p-2 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import pizzaGuyImage from '../../assets/get-started/pizzaguy.png';
</script>

<style scoped>
/* Hide mobile layout on desktop */
.get-started-mobile {
  display: none;
}

/* Hide desktop layout on mobile/tablet */
@media (max-width: 1024px) {
  .get-started-section {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    padding-left: 0;
    padding-right: 0;
  }

  .get-started-section .container {
    padding-left: 0;
    padding-right: 0;
    max-width: 100vw;
  }

  .get-started-desktop {
    display: none;
  }

  .get-started-mobile {
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
    height: auto;
    position: relative;
    z-index: 1;
    margin-bottom: 24px;
    overflow: visible;
  }

  .mobile-image {
    width: 100%;
    height: auto;
    object-fit: contain;
    display: block;
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

  .mobile-explore-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #E5E5E5;
    color: black;
    border: none;
    border-radius: 16px;
    padding: 20px 32px;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-size: 20px;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    max-width: 380px;
    margin-top: 24px;
    transition: opacity 0.2s;
    position: relative;
    z-index: 1;
  }

  .mobile-explore-btn:hover {
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .mobile-heading {
    font-size: 40px;
    line-height: 48px;
  }

  .mobile-explore-btn {
    padding: 18px 28px;
    font-size: 18px;
    max-width: 340px;
  }
}
</style>


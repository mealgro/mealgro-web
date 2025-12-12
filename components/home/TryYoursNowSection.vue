<template>
  <section class="w-full try-yours-section">
    <!-- Desktop Layout -->
    <div class="try-yours-desktop bg-[#F6F6F6] pt-16 md:pt-24 pb-8 md:pb-12 relative overflow-hidden">
      <div class="container mx-auto px-8 md:px-12 lg:px-16 xl:px-20">
        <div class="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 min-h-[600px]">
          <!-- Left: Text Content -->
          <div class="w-full lg:w-1/2 flex flex-col justify-center">
            <h2 class="font-extrabold text-[60px] leading-[68px] tracking-[-0.25px] text-[#121212] mb-4">
              Watch in - app<br>
              short Food<br>
              video reels<br>
            </h2>
            
            <p class="font-normal text-[32px] leading-[41px] tracking-[-0.25px] text-[#8D8A8A] mb-8">
              Stay connected and engaged<br>
              with mouth watery short reels.
            </p>

            <p class="font-medium text-[32px] leading-[68px] tracking-[-0.25px] text-[#121212] mb-2">
              Try yours now
            </p>

            <!-- Download Buttons -->
            <div class="flex flex-col sm:flex-row gap-4">
              <button class="flex items-center justify-center gap-3 bg-white border border-black text-black font-medium px-6 py-3 rounded-[50px] transition-colors duration-200 hover:bg-gray-50">
                <img :src="appStoreIcon" alt="App Store" class="w-6 h-6 object-contain" />
                <span>Apple</span>
              </button>
              <button class="flex items-center justify-center gap-3 bg-white border border-black text-black font-medium px-6 py-3 rounded-[50px] transition-colors duration-200 hover:bg-gray-50">
                <img :src="playStoreIcon" alt="Google Play" class="w-6 h-6 object-contain" />
                <span>Google</span>
              </button>
            </div>
          </div>

          <!-- Right: Phone Images -->
          <div class="w-full lg:w-1/2 flex justify-center lg:justify-end self-end">
            <div class="relative w-full max-w-lg">
              <img 
                :src="phonesImage" 
                alt="App Screenshots" 
                class="w-full h-auto object-contain scale-[1.2]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile/Tablet Layout -->
    <div class="try-yours-mobile">
      <!-- Phone Images (Above) -->
      <div class="mobile-phones-section">
        <img 
          :src="phonesImage" 
          alt="App Screenshots" 
          class="mobile-phones-image"
        />
      </div>

      <!-- Red Card (Below) -->
      <div class="mobile-red-card">
        <div class="mobile-text-section">
          <h2 class="mobile-headline">
            Watch in - app<br>
            short Food<br>
            video reels
          </h2>
          
          <p class="mobile-subheadline">
            Stay connected and engaged with mouth<br>
            watery short reels.
          </p>

          <!-- Download Buttons -->
          <div class="mobile-buttons">
            <button class="mobile-apple-btn">
              <img :src="appStoreIcon" alt="App Store" class="mobile-btn-icon" style="filter: brightness(0);" />
              <span>Apple</span>
            </button>
            <button class="mobile-google-btn">
              <img :src="playStoreIcon" alt="Google Play" class="mobile-btn-icon" />
              <span>Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import phonesImage from '../../assets/try/phones.svg';
import appStoreIcon from '../../assets/download/appstore.svg';
import playStoreIcon from '../../assets/download/playstore.svg';
</script>

<style scoped>
/* Hide mobile layout on desktop */
.try-yours-mobile {
  display: none;
}

/* Hide desktop layout on mobile/tablet */
@media (max-width: 1024px) {
  .try-yours-section {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .try-yours-desktop {
    display: none;
  }

  .try-yours-mobile {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .mobile-phones-section {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 20px 0 20px;
    background: transparent;
    z-index: 0;
    margin-bottom: -60px;
  }

  .mobile-phones-image {
    width: 100%;
    max-width: 400px;
    height: auto;
    object-fit: contain;
    display: block;
  }

  .mobile-red-card {
    width: 100%;
    background: #D62300;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    border-bottom-left-radius: 40px;
    border-bottom-right-radius: 40px;
    padding: 100px 20px 60px 20px;
    position: relative;
    z-index: 1;
    min-height: 500px;
  }

  .mobile-text-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 100%;
    text-align: center;
    align-items: center;
  }

  .mobile-headline {
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 800;
    font-size: 44px;
    line-height: 52px;
    letter-spacing: -0.25px;
    color: #121212;
    margin: 0;
    text-align: center;
  }

  .mobile-subheadline {
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 22px;
    line-height: 28px;
    letter-spacing: -0.25px;
    color: #FFFFFF;
    margin: 0;
    text-align: center;
  }

  .mobile-buttons {
    display: flex;
    flex-direction: row;
    gap: 12px;
    margin-top: 8px;
    width: 100%;
    max-width: 100%;
  }

  .mobile-apple-btn,
  .mobile-google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #FFFFFF;
    border: 1px solid #000000;
    border-radius: 50px;
    padding: 18px 24px;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #000000;
    cursor: pointer;
    transition: opacity 0.2s;
    flex: 1;
    min-height: 56px;
  }

  .mobile-apple-btn:hover,
  .mobile-google-btn:hover {
    opacity: 0.9;
  }

  .mobile-btn-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
}

@media (max-width: 768px) {
  .mobile-phones-section {
    padding: 16px 16px 0 16px;
    margin-bottom: -50px;
  }

  .mobile-red-card {
    padding: 90px 16px 50px 16px;
    min-height: 450px;
  }

  .mobile-headline {
    font-size: 40px;
    line-height: 48px;
  }

  .mobile-subheadline {
    font-size: 20px;
    line-height: 26px;
  }

  .mobile-buttons {
    gap: 10px;
  }

  .mobile-apple-btn,
  .mobile-google-btn {
    padding: 16px 20px;
    font-size: 14px;
    min-height: 52px;
  }

  .mobile-btn-icon {
    width: 18px;
    height: 18px;
  }
}
</style>


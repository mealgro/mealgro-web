<template>
  <section class="w-full relative -mt-[100px] md:-mt-36 -mb-16 md:-mb-24">
    <div class="container mx-auto px-4">
      <div class="flex justify-center">
        <!-- Desktop View -->
        <div class="location-container-desktop w-full max-w-[1221.46px] h-auto md:h-[160px] bg-white rounded-[43px] shadow-[0px_7px_10.7px_1px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-between px-8 md:px-12 lg:px-16 py-6 md:py-0">
          <!-- Left: Text -->
          <div class="flex-shrink-0 mb-4 md:mb-0">
            <p class="text-black font-[400] text-2xl md:text-3xl whitespace-nowrap">Find us in</p>
          </div>
          
          <!-- Right: Location Buttons -->
          <div class="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4 lg:gap-6 w-full md:w-[80%]">
            <button
              v-for="location in locations"
              :key="location"
              @click="selectLocation(location)"
              class="flex items-center justify-start gap-3 bg-[#D62300] hover:bg-[#B81D00] text-white font-medium text-2xl md:text-3xl px-10 md:px-12 py-7 md:py-8 rounded-[20px] transition-colors duration-200 whitespace-nowrap flex-1 min-w-0 relative"
            >
              <!-- Location Pin Icon -->
              <img :src="mapPointIcon" alt="Location" class="w-8 h-8 md:w-9 md:h-9 flex-shrink-0" style="filter: brightness(0);" />
              <span class="flex-1 text-center">{{ location }}</span>
            </button>
          </div>
        </div>

        <!-- Mobile View -->
        <div class="location-container-mobile">
          <!-- Left: Text -->
          <p class="mobile-find-text">Find us in</p>
          
          <!-- Center: Lagos Button -->
          <button
            @click="selectLocation('Lagos')"
            class="mobile-lagos-btn"
          >
            <img :src="mapPointIcon" alt="Location" class="mobile-location-icon" />
            <span>Lagos</span>
          </button>

          <!-- Right: See Others Button -->
          <button
            @click="seeOthers"
            class="mobile-see-others-btn"
          >
            <span class="whitespace-nowrap">See others</span>
            <svg class="mobile-chevron-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import mapPointIcon from '../../assets/location/Map Point.svg';

const locations = ['Lagos', 'Abeokuta', 'Benin-city'];

const selectLocation = (location: string) => {
  console.log('Selected location:', location);
  // Add location selection logic here
};

const seeOthers = () => {
  console.log('See others clicked');
  // Add see others logic here
};
</script>

<style scoped>
/* Hide mobile container on desktop */
.location-container-mobile {
  display: none;
}

/* Hide desktop container on mobile/tablet */
@media (max-width: 1024px) {
  .location-container-desktop {
    display: none;
  }

  .location-container-mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 369.43px;
    height: 78.83px;
    background: #FFFFFF;
    box-shadow: 0px 7px 10.7px 1px rgba(0, 0, 0, 0.1);
    border-radius: 26px;
    padding: 0 16px;
    position: relative;
  }

  .mobile-find-text {
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: normal;
    letter-spacing: -0.25px;
    color: #121212;
    white-space: nowrap;
    margin: 0;
  }

  .mobile-lagos-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 102px;
    height: 47px;
    background: #FF2509;
    border-radius: 23px;
    border: none;
    color: white;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: normal;
    letter-spacing: -0.25px;
    padding: 0 12px;
    cursor: pointer;
  }

  .mobile-lagos-btn span {
    line-height: normal;
  }

  .mobile-location-icon {
    width: 24px;
    height: 22px;
    flex-shrink: 0;
    filter: brightness(0) invert(1);
  }

  .mobile-see-others-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 140.67px;
    height: 47px;
    background: #FF2509;
    border-radius: 23px;
    border: none;
    color: white;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: normal;
    letter-spacing: -0.25px;
    padding: 0 12px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .mobile-see-others-btn span {
    line-height: normal;
    white-space: nowrap;
  }

  .mobile-chevron-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: white;
  }
}
</style>


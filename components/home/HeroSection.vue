<template>
  <section class="hero-section mb-16 md:mb-24">
    <!-- Mobile/Tablet Header -->
    <div class="mobile-header">
      <div class="mobile-logo-container">
        <img :src="logoImage" alt="Mealgro Logo" class="mobile-logo" />
      </div>
      <button
        class="mobile-menu-button"
        type="button"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="mobile-nav-menu"
        @click="toggleMobileMenu"
      >
        <span class="sr-only">Toggle navigation menu</span>
        <svg
          v-if="!isMobileMenuOpen"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg
          v-else
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <transition name="mobile-menu">
      <nav
        v-if="isMobileMenuOpen"
        id="mobile-nav-menu"
        class="mobile-menu-panel"
      >
        <a
          v-for="link in mobileNavLinks"
          :key="link.href"
          :href="link.href"
          class="mobile-menu-link"
          @click="closeMobileMenu"
        >
          <span>{{ link.label }}</span>
          <svg
            v-if="link.hasDropdown"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </nav>
    </transition>

    <div class="hero-container">
      <!-- Left Food Images -->
      <div class="hero-images-left">
        <div class="food-image pizza-slice">
          <img :src="pizzaImage" alt="Pizza slice" class="food-img" />
        </div>
        <div class="food-image burger-small">
          <img :src="burgerSmallImage" alt="Burger" class="food-img" />
        </div>
      </div>

      <!-- Center Content -->
      <div class="hero-content">
        <h1 class="hero-title">
          Your food at<br>
          your doorstep<br>
          in <span class="hero-title-accent">minutes</span>
        </h1>
        
        <!-- Mobile Download Button -->
        <div class="mobile-download-button">
          <button class="download-btn">
            <span>Download now</span>
            <div class="download-icons">
              <img :src="appStoreIcon" alt="App Store" class="download-icon" />
              <img :src="playStoreIcon" alt="Google Play" class="download-icon" />
            </div>
          </button>
        </div>
      </div>

      <!-- Right Food Image -->
      <div class="hero-images-right">
        <div class="food-image burger-large">
          <img :src="burgerBigImage" alt="Burger" class="food-img" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { navLinks } from '../shared/navLinks';
import pizzaImage from '../../assets/hero-section/pizza.png';
import burgerSmallImage from '../../assets/hero-section/burgersmall.png';
import burgerBigImage from '../../assets/hero-section/burgerbig.png';
import logoImage from '../../assets/logo.svg';
import appStoreIcon from '../../assets/download/appstore.svg';
import playStoreIcon from '../../assets/download/playstore.svg';

const isMobileMenuOpen = ref(false);

const mobileNavLinks = computed(() => {
  return navLinks.filter(link => link.href !== '/');
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<style scoped>
.hero-section {
  width: 100%;
  min-height: 600px;
  background-color: #F6F6F6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  position: relative;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .hero-section {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    padding-left: 0;
    padding-right: 0;
  }
}

.hero-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 40px;
}

.hero-title {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 800;
  font-size: 96px;
  line-height: 76px;
  text-align: center;
  letter-spacing: -0.25px;
  color: #121212;
  margin: 0;
  position: relative;
  z-index: 1;
}

.hero-title-accent {
  color: #D62300;
}

/* Left Side Images */
.hero-images-left {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.pizza-slice {
  position: relative;
  width: 400px;
  height: 400px;
  transform: rotate(3deg) translateX(-20px);
  z-index: 4;
  top: 40px;
  left: 40px;
}

.burger-small {
  position: relative;
  width: 280px;
  height: 280px;
  transform: translateX(40px) translateY(-30px);
  z-index: 4;
  bottom: 20px;
  left: 80px;
}

/* Right Side Image */
.hero-images-right {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.burger-large {
  position: relative;
  width: 450px;
  height: 450px;
  transform: rotate(0deg) translateX(20px);
  z-index: 4;
}

.food-image {
  position: relative;
}

.food-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
  animation: float 4s linear infinite;
}

.pizza-slice .food-img {
  animation-delay: 0s;
}

.burger-small .food-img {
  animation-delay: 1.3s;
}

.burger-large .food-img {
  animation-delay: 0.7s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive Design */
@media (max-width: 1400px) {
  .pizza-slice {
    width: 360px;
    height: 360px;
  }
  
  .burger-small {
    width: 240px;
    height: 240px;
  }
  
  .burger-large {
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 1200px) {
  .hero-title {
    font-size: 72px;
    line-height: 57px;
  }
  
  .pizza-slice {
    width: 300px;
    height: 300px;
    transform: rotate(12deg) translateX(-30px);
  }
  
  .burger-small {
    width: 200px;
    height: 200px;
    transform: translateX(20px) translateY(-20px);
  }
  
  .burger-large {
    width: 350px;
    height: 350px;
    transform: rotate(-10deg) translateX(10px);
  }
}

@media (max-width: 1024px) {
  .hero-section {
    padding: 60px 16px;
    min-height: 420px;
  }
  
  .hero-title {
    font-size: 64px;
    line-height: 72px;
  }
  
  .pizza-slice {
    width: 260px;
    height: 260px;
    transform: rotate(10deg) translateX(-40px);
  }
  
  .burger-small {
    width: 180px;
    height: 180px;
    transform: translateX(10px) translateY(-15px);
  }
  
  .burger-large {
    width: 280px;
    height: 280px;
    transform: rotate(-8deg) translateX(5px);
  }
}

/* Mobile/Tablet Header */
.mobile-header {
  display: none;
}

.mobile-logo-container {
  display: none;
}

.mobile-menu-button {
  display: none;
}

.mobile-menu-panel {
  display: none;
}

.mobile-download-button {
  display: none;
}

@media (max-width: 1024px) {
  /* Show mobile header */
  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    width: 100vw;
    box-sizing: border-box;
  }

  .mobile-logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
    background: white;
    border-radius: 50px;
    padding: 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .mobile-logo {
    height: 24px;
    width: auto;
  }

  .mobile-menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: white;
    border-radius: 50%;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    color: #0E172B;
  }

  .mobile-menu-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 20px;
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    background: #FFFFFF;
    border-radius: 0 0 24px 24px;
    box-shadow: 0 10px 30px rgba(14, 23, 43, 0.12);
    z-index: 95;
  }

  .mobile-menu-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-decoration: none;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-size: 15px;
    line-height: 150%;
    color: #0E172B;
    padding: 10px 0;
    border-bottom: 1px solid rgba(14, 23, 43, 0.07);
  }

  .mobile-menu-link:last-of-type {
    border-bottom: none;
  }

  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .mobile-menu-enter-from,
  .mobile-menu-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .hero-section {
    padding-top: 80px;
    padding-bottom: 40px;
    min-height: auto;
  }

  .hero-container {
    position: relative;
    min-height: 420px;
    padding: 16px;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    padding: 0;
    margin-bottom: 40px;
  }

  .hero-content .hero-title {
    font-size: 60px !important;
    line-height: 68px !important;
    margin-bottom: 32px;
  }

  /* Mobile Download Button */
  .mobile-download-button {
    display: block;
    margin-top: 24px;
    position: relative;
    z-index: 3;
  }

  .download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #000000;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 18px 24px;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }

  .download-icons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .download-icon {
    width: 20px;
    height: 24px;
    object-fit: contain;
    filter: invert(15%) sepia(96%) saturate(7465%) hue-rotate(-2deg) brightness(99%) contrast(105%);
  }

  /* Food Images Positioning for Mobile/Tablet */
  .hero-images-left {
    position: absolute;
    left: 0;
    top: auto;
    bottom: 80px;
    transform: none;
    z-index: 2;
    flex-direction: column;
    gap: 0;
  }

  .pizza-slice {
    width: 90px;
    height: 90px;
    transform: rotate(-15deg);
    position: relative;
    left: -20px;
    top: 0;
  }

  .burger-small {
    width: 80px;
    height: 80px;
    transform: none;
    position: relative;
    left: 20px;
    top: -40px;
  }

  .hero-images-right {
    position: absolute;
    right: 0;
    top: auto;
    bottom: 60px;
    transform: none;
    z-index: 2;
  }

  .burger-large {
    width: 110px;
    height: 110px;
    transform: rotate(10deg);
    position: relative;
    right: -10px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding-top: 50px;
    padding-bottom: 24px;
    min-height: 360px;
  }

  .hero-container {
    min-height: 360px;
    padding: 12px;
  }

  .hero-content .hero-title {
    font-size: 48px !important;
    line-height: 56px !important;
    margin-bottom: 24px;
  }

  .mobile-download-button {
    margin-top: 20px;
  }

  .download-btn {
    padding: 18px 20px;
    font-size: 18px;
    max-width: 240px;
  }

  .pizza-slice {
    width: 100px;
    height: 100px;
    left: -15px;
  }

  .burger-small {
    width: 80px;
    height: 80px;
    left: 15px;
    top: -30px;
  }

  .burger-large {
    width: 120px;
    height: 120px;
    right: -5px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 29px;
    line-height: 23px;
  }
  
  .pizza-slice,
  .burger-small,
  .burger-large {
    width: 120px;
    height: 120px;
  }
}
</style>

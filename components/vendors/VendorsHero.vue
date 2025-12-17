<template>
  <section class="vendors-hero">
    <div class="vendors-hero__container">
      <div class="vendors-hero__topbar">
        <a href="/">
          <img :src="logoImage" alt="MealGro logo" class="vendors-hero__logo" />
        </a>
        <button
          class="vendors-hero__menu"
          type="button"
          :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
          aria-controls="vendors-hero-mobile-menu"
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

      <transition name="vendors-hero-mobile-menu">
        <nav
          v-if="isMobileMenuOpen"
          id="vendors-hero-mobile-menu"
          class="vendors-hero__mobile-menu"
        >
          <a
            v-for="link in mobileNavLinks"
            :key="link.href"
            :href="link.href"
            class="vendors-hero__mobile-link"
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

      <!-- Left Column: Text and Button -->
      <div class="vendors-hero__left">
        <!-- Headline Text -->
        <h1 class="vendors-hero__headline">
          Easy to use food<br />
          service app for<br />
          vendors
        </h1>

        <!-- Desktop CTA Button -->
        <div class="vendors-hero__cta vendors-hero__cta--desktop">
          <div class="vendors-hero__button-bg"></div>
          <span class="vendors-hero__button-text">
            Get started now
            <img :src="appStoreIcon" alt="App Store" class="vendors-hero__app-icon" />
            <img :src="playStoreIcon" alt="Google Play" class="vendors-hero__play-icon" />
          </span>
        </div>
      </div>

      <!-- Right Column: Image -->
      <div class="vendors-hero__image-wrapper">
        <img :src="vendorImage" alt="Happy vendor with shopping bags" class="vendors-hero__image" />
      </div>

      <!-- Mobile/Tablet CTA Button -->
      <div class="vendors-hero__cta vendors-hero__cta--mobile">
        <div class="vendors-hero__button-bg"></div>
        <span class="vendors-hero__button-text">
          Get started now
          <img :src="appStoreIcon" alt="App Store" class="vendors-hero__app-icon" />
          <img :src="playStoreIcon" alt="Google Play" class="vendors-hero__play-icon" />
        </span>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import vendorImage from '../../assets/vendors/vendor.png';
import appStoreIcon from '../../assets/download/appstore.svg';
import playStoreIcon from '../../assets/download/playstore.svg';
import logoImage from '../../assets/logo.svg';
import { navLinks } from '../shared/navLinks';

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

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMobileMenu();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.vendors-hero {
  width: 100%;
  background: #D62300;
  color: #ffffff;
  padding: 0;
  overflow: hidden;
  position: relative;
  min-height: 720px;
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

.vendors-hero__container {
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  width: 100%;
  min-height: 720px;
  padding: 0 clamp(16px, 5vw, 72px);
  padding-bottom: 0;
  padding-left: 200px;
  padding-right: 200px;
}

.vendors-hero__topbar {
  display: none;
}

.vendors-hero__left {
  display: flex;
  flex-direction: column;
  gap: 40px;
  justify-content: flex-center;
  align-items: flex-center;
  align-self: flex-center;
  padding-top: clamp(60px, 8vw, 120px);
}

.vendors-hero__headline {
  position: relative;
  width: 100%;
  max-width: 480px;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 800;
  font-size: 56px;
  line-height: 55px;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0;
}

.vendors-hero__cta--desktop {
  position: relative;
  width: 370px;
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vendors-hero__cta--mobile {
  display: none;
}

.vendors-hero__button-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: #121212;
  border-radius: 18px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.vendors-hero__button-bg:hover {
  opacity: 0.9;
}

.vendors-hero__button-text {
  position: relative;
  z-index: 2;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 26px;
  line-height: 1;
  text-align: center;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  pointer-events: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
}

.vendors-hero__app-icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  pointer-events: none;
  flex-shrink: 0;
  display: block;
}

.vendors-hero__play-icon {
  width: 42px;
  height: 42px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  pointer-events: none;
  flex-shrink: 0;
  display: block;
}

.vendors-hero__image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.vendors-hero__image {
  width: 180%;
  max-width: 1400px;
  height: auto;
  object-fit: contain;
  object-position: center;
}

@media (max-width: 1200px) {
  .vendors-hero__headline {
    font-size: clamp(40px, 5vw, 56px);
    line-height: clamp(40px, 5vw, 55px);
  }

  .vendors-hero__cta--desktop {
    width: clamp(240px, 32vw, 370px);
    height: clamp(64px, 8vw, 92px);
  }
}

@media (max-width: 768px) {
  .vendors-hero {
    padding: 20px 16px 0;
    overflow: hidden;
    min-height: auto;
    background: #D62300;
    position: relative;
  }

  .vendors-hero__container {
    position: relative;
    width: 100%;
    min-height: auto;
    padding: 0;
    transform: none;
    padding-bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .vendors-hero__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 16px;
    margin-bottom: 40px;
    position: relative;
    z-index: 10;
  }

  .vendors-hero__topbar a {
    display: inline-block;
    text-decoration: none;
  }

  .vendors-hero__logo {
    height: 44px;
    width: auto;
    filter: brightness(0) invert(1);
  }

  .vendors-hero__menu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: #ffffff;
    color: #000000;
    cursor: pointer;
    padding: 0;
  }

  .vendors-hero__menu svg {
    stroke: #000000;
  }

  .vendors-hero__mobile-menu {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 20px;
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    background: #ffffff;
    border-radius: 0 0 24px 24px;
    box-shadow: 0 10px 30px rgba(14, 23, 43, 0.12);
    z-index: 95;
  }

  .vendors-hero__mobile-link {
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

  .vendors-hero__mobile-link:last-of-type {
    border-bottom: none;
  }

  .vendors-hero__mobile-menu-enter-active,
  .vendors-hero__mobile-menu-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .vendors-hero__mobile-menu-enter-from,
  .vendors-hero__mobile-menu-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .vendors-hero__content {
    align-items: center;
    text-align: center;
    gap: 24px;
  }

  .vendors-hero__headline {
    position: relative;
    width: 100%;
    height: auto;
    left: auto;
    top: auto;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 800;
    font-size: clamp(32px, 8vw, 48px);
    line-height: 1.2;
    text-align: center;
    letter-spacing: -0.25px;
    color: #FFFFFF;
    margin: 0 0 40px 0;
    padding: 0 16px;
  }

  .vendors-hero__image-wrapper {
    position: relative;
    width: 100%;
    height: auto;
    left: auto;
    top: auto;
    max-width: 100%;
    margin: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 0;
  }

  .vendors-hero__image {
    width: 130%;
    max-width: 130%;
    height: auto;
    object-fit: cover;
    object-position: bottom;
    position: relative;
    z-index: 1;
    display: block;
    transform: translateX(-8.33%);
  }

  .vendors-hero__cta--desktop {
    display: none;
  }

  .vendors-hero__cta--mobile {
    position: absolute;
    width: 100%;
    max-width: 90%;
    height: 60px;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    cursor: pointer;
    z-index: 5;
  }

  .vendors-hero__button-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    border-radius: 16px;
    z-index: 1;
  }

  .vendors-hero__button-text {
    position: relative;
    width: auto;
    height: auto;
    left: auto;
    top: auto;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 1.2;
    text-align: center;
    color: #FFFFFF;
    z-index: 2;
    pointer-events: none;
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }

  .vendors-hero__app-icon {
    position: relative;
    width: 32px;
    height: 32px;
    left: auto;
    top: auto;
    filter: brightness(0) invert(1);
    z-index: 2;
    pointer-events: none;
    flex-shrink: 0;
  }

  .vendors-hero__play-icon {
    position: relative;
    width: 28px;
    height: 28px;
    left: auto;
    top: auto;
    filter: brightness(0) invert(1);
    z-index: 2;
    pointer-events: none;
    flex-shrink: 0;
  }

}

@media (min-width: 1200px) {
  .vendors-hero {
    padding-bottom: 0;
    overflow: visible;
    display: flex;
    align-items: flex-end;
  }

  .vendors-hero__container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
    padding-bottom: 0;
    min-height: 100%;
    height: 100%;
  }

  .vendors-hero__left {
    padding-top: 0;
    align-self: center;
    justify-content: center;
  }

  .vendors-hero__content {
    margin-top: 0;
  }

  .vendors-hero__headline {
    margin-bottom: 0;
  }

  .vendors-hero__image-wrapper {
    align-self: end;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 0;
    margin-bottom: 0;
    position: relative;
  }

  .vendors-hero__image {
    object-position: bottom;
    align-self: flex-end;
    margin-bottom: 0;
    padding-bottom: 0;
    position: relative;
    bottom: 0;
  }
}

@media (min-width: 1400px) {
  .vendors-hero__container {
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }
}
</style>


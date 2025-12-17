<template>
  <section class="riders-hero">
    <div class="riders-hero__container">
      <div class="riders-hero__topbar">
        <a href="/">
          <img :src="logoImage" alt="MealGro logo" class="riders-hero__logo" />
        </a>
        <button
          class="riders-hero__menu"
          type="button"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="riders-hero-mobile-menu"
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

      <transition name="riders-hero-mobile-menu">
        <nav
          v-if="isMobileMenuOpen"
          id="riders-hero-mobile-menu"
          class="riders-hero__mobile-menu"
        >
          <a
            v-for="link in mobileNavLinks"
            :key="link.href"
            :href="link.href"
            class="riders-hero__mobile-link"
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

      <div class="riders-hero__copy">
        <h1 class="riders-hero__headline">
          Food delivery<br />
          at your<br />
          convenience
        </h1>
      </div>

      <div class="riders-hero__visual">
        <img :src="pizzaguyImage" alt="Happy rider carrying pizzas" class="riders-hero__image" />
      </div>

      <div class="riders-hero__cta">
        <span>Available in stores</span>
        <div class="riders-hero__store-icons">
          <img :src="appStoreIcon" alt="Download on the App Store" />
          <img :src="playStoreIcon" alt="Get it on Google Play" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import pizzaguyImage from '../../assets/riders/pizzaguy.svg';
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
.riders-hero {
  width: 100%;
  background: #050505;
  color: #ffffff;
  padding: clamp(80px, 10vw, 140px) 24px 0;
  overflow: hidden;
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

.riders-hero__container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
  grid-template-areas:
    'copy visual'
    'cta visual';
  gap: 48px;
  align-items: stretch;
  min-height: clamp(420px, 60vw, 620px);
}

.riders-hero__topbar {
  display: none;
}

.riders-hero__copy {
  grid-area: copy;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: center;
}

.riders-hero__eyebrow {
  font-size: 16px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.riders-hero__headline {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 800;
  margin: 0;
  font-size: 64px;
  line-height: 1.05;
  color: #ffffff;
}

.riders-hero__cta {
  grid-area: cta;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: #d62300;
  border-radius: 20px;
  padding: 24px 32px;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 500;
  font-size: 24px;
  color: #ffffff;
  width: fit-content;
  align-self: flex-start;
  position: relative;
  z-index: 2;
}

.riders-hero__store-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.riders-hero__store-icons img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.riders-hero__visual {
  grid-area: visual;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  align-self: stretch;
  height: 100%;
}

.riders-hero__image {
  width: min(640px, 110vw);
  height: 100%;
  max-height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .riders-hero {
    padding: 40px 16px 20px;
    overflow: visible;
  }

  .riders-hero__container {
    position: relative;
    display: flex;
    flex-direction: column;
    grid-template-columns: 1fr;
    grid-template-areas:
      'copy'
      'visual'
      'cta';
    gap: 20px;
    min-height: auto;
    padding-bottom: 120px;
  }

  .riders-hero__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .riders-hero__topbar a {
    display: inline-block;
    text-decoration: none;
  }

  .riders-hero__logo {
    height: 44px;
    width: auto;
    filter: brightness(0) invert(1);
  }

  .riders-hero__menu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 24px;
    border: none;
    background: #ffffff;
    color: #0E172B;
    cursor: pointer;
  }

  .riders-hero__mobile-menu {
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

  .riders-hero__mobile-link {
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

  .riders-hero__mobile-link:last-of-type {
    border-bottom: none;
  }

  .riders-hero__mobile-menu-enter-active,
  .riders-hero__mobile-menu-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .riders-hero__mobile-menu-enter-from,
  .riders-hero__mobile-menu-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .riders-hero__copy {
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  .riders-hero__headline {
    font-size: clamp(44px, 12vw, 56px);
    line-height: 1.1;
  }

  .riders-hero__visual {
    justify-content: center;
    align-items: flex-end;
    min-height: 400px;
    margin-top: -100px;
  }

  .riders-hero__image {
    width: min(360px, 94vw);
    transform: translateY(118px);
  }

  .riders-hero__cta {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    width: min(280px, 82vw);
    justify-content: center;
    gap: 12px;
    padding: 24px 24px;
    font-size: 18px;
  }

  .riders-hero__store-icons img {
    width: 24px;
    height: 24px;
  }
}

@media (min-width: 769px) {
  .riders-hero__copy {
    margin-top: clamp(40px, 6vw, 120px);
  }

  .riders-hero__headline {
    margin-bottom: -80px;
  }
}
</style>

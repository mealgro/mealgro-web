<template>
  <div class="about-page-wrapper">
    <!-- Mobile/Tablet Header -->
    <div class="mobile-header">
      <div class="mobile-logo-container">
        <a href="/">
          <img :src="logoImage" alt="Mealgro Logo" class="mobile-logo" />
        </a>
      </div>
      <button
        class="mobile-menu-button"
        type="button"
        :aria-expanded="isMobileMenuOpen.toString()"
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

    <div class="min-h-screen about-page">
      <div class="about-container">
        <div class="about-content">
          <h1 class="about-title">Who We Are</h1>
          <div class="about-section">
            <h2 class="about-subtitle">Our Mission</h2>
            <p class="about-text">
              MealGro is dedicated to revolutionizing the food delivery experience by connecting customers with their favorite local vendors and restaurants. We believe that great food should be accessible to everyone, delivered quickly and efficiently to your doorstep.
            </p>
          </div>
          <div class="about-section">
            <h2 class="about-subtitle">Our Core Values</h2>
            <ul class="about-list">
              <li><strong>Quality First:</strong> We partner only with trusted vendors who maintain the highest standards of food quality and safety.</li>
              <li><strong>Customer Satisfaction:</strong> Your satisfaction is our top priority. We work tirelessly to ensure every order exceeds your expectations.</li>
              <li><strong>Community Support:</strong> We're committed to supporting local businesses and helping them grow in the digital marketplace.</li>
              <li><strong>Innovation:</strong> We continuously improve our platform to provide the best possible experience for customers, vendors, and delivery partners.</li>
              <li><strong>Reliability:</strong> You can count on us to deliver your meals on time, every time.</li>
            </ul>
          </div>
          <div class="about-section">
            <h2 class="about-subtitle">Our Story</h2>
            <p class="about-text">
              Founded with a vision to make food delivery seamless and accessible, MealGro has grown from a small startup to a trusted platform serving thousands of customers across multiple cities. We've built strong relationships with local vendors and created opportunities for delivery partners to earn while helping their communities.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-spacer"></div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Footer from '../../components/shared/Footer.vue';
import { navLinks } from '../../components/shared/navLinks';
import logoImage from '../../assets/logo.svg';

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
.about-page-wrapper {
  background: #000000;
}

.about-page {
  background: #D62300;
  color: #FFFFFF;
  padding: clamp(120px, 15vw, 180px) 0 clamp(80px, 10vw, 120px);
  min-height: 100vh;
}

.footer-spacer {
  background: #000000;
  height: clamp(60px, 8vw, 100px);
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(24px, 5vw, 72px);
}

.about-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 40px;
  padding: clamp(40px, 6vw, 80px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.about-title {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 800;
  font-size: clamp(48px, 6vw, 72px);
  line-height: 1.2;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0 0 clamp(40px, 6vw, 60px);
  text-align: center;
}

.about-section {
  margin-bottom: clamp(32px, 5vw, 48px);
}

.about-subtitle {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 700;
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.3;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0 0 clamp(20px, 3vw, 24px);
}

.about-text {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: clamp(18px, 2.5vw, 22px);
  line-height: 1.6;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0;
  opacity: 0.95;
}

.about-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.about-list li {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: clamp(18px, 2.5vw, 22px);
  line-height: 1.8;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin-bottom: clamp(16px, 2.5vw, 20px);
  padding-left: clamp(24px, 4vw, 32px);
  position: relative;
  opacity: 0.95;
}

.about-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #FFE100;
  font-size: 1.5em;
  line-height: 1;
}

.about-list li strong {
  color: #FFE100;
  font-weight: 600;
}

/* Mobile Header */
.mobile-header {
  display: none;
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

@media (max-width: 1024px) {
  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    width: 100vw;
    box-sizing: border-box;
    background: rgba(214, 35, 0, 0.95);
    backdrop-filter: blur(10px);
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

  .mobile-logo-container a {
    display: flex;
    align-items: center;
    text-decoration: none;
    cursor: pointer;
  }

  .mobile-logo {
    height: 24px;
    width: auto;
    pointer-events: none;
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
    position: fixed;
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

  .about-page {
    padding-top: clamp(100px, 15vw, 180px);
  }
}
</style>


<template>
  <div class="help-page-wrapper">
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

    <div class="min-h-screen help-page">
      <div class="help-container">
        <div class="help-content">
          <h1 class="help-title">Privacy Policy & Terms of Service</h1>
          
          <div class="help-section">
            <h2 class="help-subtitle">Privacy Policy</h2>
            <div class="help-text-content">
              <p>
                At MealGro, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our food delivery platform.
              </p>
              <h3 class="help-subsection-title">Information We Collect</h3>
              <p>
                We collect information that you provide directly to us, including your name, email address, phone number, delivery address, and payment information. We also automatically collect certain information about your device and how you interact with our service.
              </p>
              <h3 class="help-subsection-title">How We Use Your Information</h3>
              <p>
                We use the information we collect to process your orders, communicate with you about your account and orders, improve our services, and send you promotional communications (with your consent).
              </p>
              <h3 class="help-subsection-title">Data Security</h3>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <h3 class="help-subsection-title">Your Rights</h3>
              <p>
                You have the right to access, update, or delete your personal information at any time. You can also opt-out of marketing communications by updating your preferences in your account settings.
              </p>
            </div>
          </div>

          <div class="help-section">
            <h2 class="help-subtitle">Terms of Service</h2>
            <div class="help-text-content">
              <p>
                By using MealGro's services, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.
              </p>
              <h3 class="help-subsection-title">Service Description</h3>
              <p>
                MealGro provides a platform that connects customers with food vendors and delivery partners. We facilitate transactions but are not responsible for the quality, safety, or delivery of the food items.
              </p>
              <h3 class="help-subsection-title">User Responsibilities</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate information and to use our service only for lawful purposes.
              </p>
              <h3 class="help-subsection-title">Payment Terms</h3>
              <p>
                All payments are processed securely through our payment partners. Prices are set by vendors and may vary. Delivery fees are calculated based on distance and are clearly displayed before you confirm your order.
              </p>
              <h3 class="help-subsection-title">Cancellation and Refunds</h3>
              <p>
                Orders can be cancelled within a specified time frame. Refund policies vary by vendor and are subject to our refund policy. Contact customer support for assistance with cancellations or refunds.
              </p>
              <h3 class="help-subsection-title">Limitation of Liability</h3>
              <p>
                MealGro acts as an intermediary platform. We are not liable for any issues arising from the quality of food, delivery delays, or vendor-related problems. However, we are committed to resolving disputes fairly.
              </p>
            </div>
          </div>

          <div class="help-contact">
            <p>If you have questions about our Privacy Policy or Terms of Service, please contact us at <strong>legal@mealgro.com</strong></p>
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
.help-page-wrapper {
  background: #000000;
}

.help-page {
  background: #D62300;
  color: #FFFFFF;
  padding: clamp(120px, 15vw, 180px) 0 clamp(80px, 10vw, 120px);
  min-height: 100vh;
}

.footer-spacer {
  background: #000000;
  height: clamp(60px, 8vw, 100px);
}

.help-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 clamp(24px, 5vw, 72px);
}

.help-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 40px;
  padding: clamp(40px, 6vw, 80px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.help-title {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 800;
  font-size: clamp(48px, 6vw, 72px);
  line-height: 1.2;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0 0 clamp(48px, 6vw, 64px);
  text-align: center;
}

.help-section {
  margin-bottom: clamp(48px, 6vw, 64px);
}

.help-section:last-of-type {
  margin-bottom: 0;
}

.help-subtitle {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 700;
  font-size: clamp(32px, 4vw, 40px);
  line-height: 1.3;
  letter-spacing: -0.25px;
  color: #FFE100;
  margin: 0 0 clamp(24px, 4vw, 32px);
  padding-bottom: clamp(16px, 2.5vw, 20px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.help-text-content {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: clamp(16px, 2vw, 18px);
  line-height: 1.7;
  letter-spacing: -0.25px;
  color: #FFFFFF;
}

.help-text-content p {
  margin: 0 0 clamp(20px, 3vw, 24px);
  opacity: 0.95;
}

.help-subsection-title {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 600;
  font-size: clamp(20px, 2.5vw, 24px);
  line-height: 1.4;
  letter-spacing: -0.25px;
  color: #FFE100;
  margin: clamp(24px, 4vw, 32px) 0 clamp(12px, 2vw, 16px);
}

.help-contact {
  margin-top: clamp(48px, 6vw, 64px);
  padding-top: clamp(32px, 5vw, 48px);
  border-top: 2px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.help-contact p {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: clamp(18px, 2.5vw, 20px);
  line-height: 1.6;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0;
  opacity: 0.95;
}

.help-contact strong {
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

  .help-page {
    padding-top: clamp(100px, 15vw, 180px);
  }
}
</style>


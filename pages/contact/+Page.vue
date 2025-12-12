<template>
  <div class="contact-page-wrapper">
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

    <div class="min-h-screen contact-page">
      <div class="contact-container">
        <div class="contact-content">
          <h1 class="contact-title">Contact Us</h1>
          <p class="contact-intro">
            We'd love to hear from you! Whether you have a question, feedback, or need support, our team is here to help.
          </p>
          <div class="contact-grid">
            <div class="contact-card">
              <h2 class="contact-card-title">Customer Support</h2>
              <p class="contact-card-text">
                For order inquiries, delivery issues, or general questions about our service.
              </p>
              <div class="contact-info">
                <p><strong>Email:</strong> support@mealgro.com</p>
                <p><strong>Phone:</strong> +234 800 MEALGRO</p>
                <p><strong>Hours:</strong> 24/7 Support</p>
              </div>
            </div>
            <div class="contact-card">
              <h2 class="contact-card-title">Business Inquiries</h2>
              <p class="contact-card-text">
                Interested in partnering with us? Let's discuss how we can work together.
              </p>
              <div class="contact-info">
                <p><strong>Email:</strong> business@mealgro.com</p>
                <p><strong>Phone:</strong> +234 800 BUSINESS</p>
                <p><strong>Hours:</strong> Mon-Fri, 9AM-6PM</p>
              </div>
            </div>
            <div class="contact-card">
              <h2 class="contact-card-title">Vendor Support</h2>
              <p class="contact-card-text">
                For vendors who want to join our platform or need assistance with their account.
              </p>
              <div class="contact-info">
                <p><strong>Email:</strong> vendors@mealgro.com</p>
                <p><strong>Phone:</strong> +234 800 VENDORS</p>
                <p><strong>Hours:</strong> Mon-Sat, 8AM-8PM</p>
              </div>
            </div>
          </div>
          <div class="contact-note">
            <p>You can also reach us through our social media channels for quick updates and announcements.</p>
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
.contact-page-wrapper {
  background: #000000;
}

.contact-page {
  background: #D62300;
  color: #FFFFFF;
  padding: clamp(120px, 15vw, 180px) 0 clamp(80px, 10vw, 120px);
  min-height: 100vh;
}

.footer-spacer {
  background: #000000;
  height: clamp(60px, 8vw, 100px);
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(24px, 5vw, 72px);
}

.contact-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 40px;
  padding: clamp(40px, 6vw, 80px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.contact-title {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 800;
  font-size: clamp(48px, 6vw, 72px);
  line-height: 1.2;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0 0 clamp(24px, 4vw, 32px);
  text-align: center;
}

.contact-intro {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: clamp(20px, 3vw, 24px);
  line-height: 1.6;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  text-align: center;
  margin: 0 0 clamp(48px, 6vw, 64px);
  opacity: 0.95;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(24px, 4vw, 32px);
  margin-bottom: clamp(32px, 5vw, 48px);
}

.contact-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: clamp(24px, 4vw, 32px);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.contact-card-title {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 700;
  font-size: clamp(24px, 3vw, 28px);
  line-height: 1.3;
  letter-spacing: -0.25px;
  color: #FFE100;
  margin: 0 0 clamp(16px, 2.5vw, 20px);
}

.contact-card-text {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: clamp(16px, 2vw, 18px);
  line-height: 1.6;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0 0 clamp(20px, 3vw, 24px);
  opacity: 0.9;
}

.contact-info {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: clamp(16px, 2vw, 18px);
  line-height: 1.8;
  letter-spacing: -0.25px;
  color: #FFFFFF;
}

.contact-info p {
  margin: 0 0 clamp(8px, 1.5vw, 12px);
  opacity: 0.95;
}

.contact-info strong {
  color: #FFE100;
  font-weight: 600;
}

.contact-note {
  text-align: center;
  padding-top: clamp(24px, 4vw, 32px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.contact-note p {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: clamp(16px, 2vw, 18px);
  line-height: 1.6;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
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

  .contact-page {
    padding-top: clamp(100px, 15vw, 180px);
  }
}
</style>


<template>
  <section class="seamless-section">
    <div class="seamless-container">
      <div class="seamless-media">
        <img :src="handphoneImage" alt="Delivery app interface on smartphone" />
      </div>
      <div class="seamless-content">
        <h2 class="seamless-title">
          Easy to use app<br />
          Accurate location<br />
          <span class="seamless-title__accent">Seamless<span class="seamless-title__break" aria-hidden="true"><br /></span> Experience</span>
        </h2>
        <p class="seamless-subtitle">
          Satisfy customer needs in minutes with an easy-to-use mapping system.
        </p>
        <button class="cta-button">
          <span class="cta-button__label">Get started</span>
          <span class="cta-button__icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import handphoneImage from '../../assets/riders/handphone.svg';
</script>

<style scoped>
.seamless-section {
  width: 100%;
  min-height: 100vh;
  background: #0b0b0b;
  padding: clamp(72px, 12vw, 140px) clamp(16px, 6vw, 72px) 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.seamless-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(32px, 6vw, 64px);
  align-items: stretch;
  height: 100%;
  justify-items: center;
}

.seamless-media {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 800px;
  width: 800px;
}

.seamless-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seamless-content {
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 4vw, 32px);
  justify-content: center;
  align-items: flex-end;
  text-align: right;
  color: #ffffff;
}

.seamless-title {
  margin: 0;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 800;
  font-size: clamp(36px, 4vw, 64px);
  line-height: clamp(42px, 4.6vw, 72px);
  letter-spacing: -0.25px;
  text-align: inherit;
}

.seamless-title__accent {
  color: #ffffff;
}

.seamless-title__break {
  display: none;
}

.seamless-subtitle {
  margin: 0;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: clamp(18px, 2.6vw, 28px);
  line-height: clamp(26px, 3vw, 40px);
  letter-spacing: -0.25px;
  color: #ffffff;
  text-align: inherit;
}

.cta-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #d9d9d9;
  color: #121212;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 400;
  font-size: clamp(20px, 2.4vw, 24px);
  line-height: 1.1;
  padding: clamp(20px, 2.6vw, 25px) clamp(36px, 6vw, 48px);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.cta-button:hover {
  background: #e7e7e7;
  transform: translateY(-2px);
}

.cta-button__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 999px;
  padding: 10px;
  color: #121212;
}

.cta-button:focus-visible {
  outline: 2px solid rgba(214, 35, 0, 0.5);
  outline-offset: 4px;
}

@media (max-width: 768px) {
  .seamless-section {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background: #000000;
    padding: clamp(72px, 12vw, 140px) clamp(16px, 6vw, 72px) 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    margin-top: -50px;
    padding-bottom: 50px;
    margin-bottom: -50px;
    z-index: 5;
  }

  .seamless-title__break {
    display: inline;
  }

  .seamless-content {
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .cta-button {
    width: 100%;
    justify-content: center;
    padding: 25px 32px;
  }

  .seamless-media {
    height: auto;
  }

  .seamless-media img {
    width: min(600px, 140%);
    height: auto;
    object-fit: contain;
    margin-left: 100px;
  }
}
</style>

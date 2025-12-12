<template>
  <section class="download-riders-section">
    <div class="download-riders-container">
      <h2 class="download-riders-heading">
        Mealgro app, the smartest
        <br class="download-heading-break" />
        way to satisfy your cravings
      </h2>
      <div class="download-riders-actions">
        <span class="download-now-label">Download now</span>
        <div class="store-buttons">
          <button type="button" class="store-button">
            <span class="store-label">Apple</span>
            <img :src="appStoreIcon" alt="Apple App Store" class="store-icon" />
          </button>
          <button type="button" class="store-button">
            <span class="store-label">Play store</span>
            <img :src="playStoreIcon" alt="Google Play Store" class="store-icon" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import appStoreIcon from '../../assets/download/appstore.svg';
import playStoreIcon from '../../assets/download/playstore.svg';
</script>

<style scoped>
.download-riders-section {
  width: 100%;
  background: #000000;
  padding: clamp(72px, 12vw, 140px) clamp(16px, 6vw, 72px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.download-riders-container {
  max-width: 1140px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(40px, 7vw, 56px);
  text-align: center;
}

.download-riders-heading {
  margin: 0;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 800;
  font-size: clamp(40px, 6vw, 72px);
  line-height: clamp(44px, 6vw, 71px);
  letter-spacing: -0.25px;
  color: #ffffff;
}

.download-heading-break {
  display: none;
}

.download-riders-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.download-now-label {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 700;
  font-size: clamp(24px, 3vw, 32px);
  color: #f7fafb;
}

.store-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.store-button {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 18px 26px;
  min-width: 200px;
  background: #383636;
  border: none;
  border-radius: 23px;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.store-button:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

.store-label {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 500;
  font-size: clamp(18px, 2.5vw, 24px);
  line-height: 1;
  color: #ffffff;
  white-space: nowrap;
}

.store-icon {
  width: clamp(28px, 5vw, 40px);
  height: clamp(28px, 5vw, 40px);
  object-fit: contain;
  filter: brightness(0) invert(1);
}

@media (max-width: 768px) {
  .store-buttons {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .store-button {
    width: 100%;
    min-width: 0;
    justify-content: center;
  }

  .download-riders-actions {
    width: 100%;
  }
}

@media (min-width: 769px) {
  .download-heading-break {
    display: block;
  }

  .download-riders-actions {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 32px;
  }

  .download-now-label {
    display: inline-flex;
    align-items: center;
  }
}
</style>

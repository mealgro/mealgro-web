<template>
  <section class="record-sales-section">
    <div class="record-sales-section__container">
      <!-- Left: Text Content -->
      <div class="record-sales-section__content">
        <h2 class="record-sales-section__headline">
          Record more<br />
          sales and reach<br />
          in a short period
        </h2>
        
        <p class="record-sales-section__paragraph">
          MealGro offers are secure and reliable system which helps boost sales and offers a wider reach across locaions
        </p>

        <!-- CTA Buttons -->
        <div class="record-sales-section__buttons">
          <button class="record-sales-section__button">
            <span>Apple</span>
            <img :src="appStoreIcon" alt="App Store" class="record-sales-section__button-icon" />
          </button>
          <button class="record-sales-section__button">
            <span>Play store</span>
            <img :src="playStoreIcon" alt="Google Play" class="record-sales-section__button-icon" />
          </button>
        </div>
      </div>

      <!-- Right: Image with Checkmark Overlay -->
      <div class="record-sales-section__image-wrapper">
        <img :src="recordImage" alt="Record sales" class="record-sales-section__image" />
        <img :src="checkIcon" alt="Check" class="record-sales-section__check-icon" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import recordImage from '../../assets/vendors/record.jpg';
import checkIcon from '../../assets/vendors/check.svg';
import appStoreIcon from '../../assets/download/appstore.svg';
import playStoreIcon from '../../assets/download/playstore.svg';
</script>

<style scoped>
.record-sales-section {
  width: 100%;
  background: #FFFFFF;
  padding: clamp(60px, 8vw, 120px) clamp(16px, 3vw, 24px) clamp(100px, 12vw, 180px) clamp(16px, 3vw, 24px);
  margin-top: -300px;
  margin-bottom: -60px;
  position: relative;
  z-index: 20;
  border-radius: 40px;
  overflow: hidden;
}

.record-sales-section__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(40px, 6vw, 80px);
  align-items: center;
}

/* Left Content */
.record-sales-section__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.record-sales-section__headline {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 800;
  font-size: clamp(36px, 5vw, 72px);
  line-height: 1.1;
  letter-spacing: -0.25px;
  color: #121212;
  margin: 0 0 clamp(24px, 3vw, 40px) 0;
}

.record-sales-section__paragraph {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: clamp(18px, 2.5vw, 32px);
  line-height: 1.4;
  letter-spacing: -0.25px;
  color: #8D8A8A;
  margin: 0 0 clamp(32px, 4vw, 48px) 0;
}

/* Buttons */
.record-sales-section__buttons {
  display: flex;
  gap: clamp(16px, 2vw, 24px);
  flex-wrap: wrap;
}

.record-sales-section__button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #121212;
  color: #FFFFFF;
  border: none;
  border-radius: 16px;
  padding: clamp(14px, 2vw, 18px) clamp(24px, 3vw, 32px);
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: clamp(16px, 2vw, 20px);
  line-height: 1.2;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.record-sales-section__button:hover {
  opacity: 0.9;
}

.record-sales-section__button-icon {
  width: clamp(20px, 2.5vw, 28px);
  height: clamp(20px, 2.5vw, 28px);
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
}

/* Right Image */
.record-sales-section__image-wrapper {
  position: relative;
  width: 100%;
  max-width: 700px;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 40px;
  margin: 0 auto;
}

.record-sales-section__image {
  width: 150%;
  height: 150%;
  object-fit: cover;
  object-position: 40% center;
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.record-sales-section__check-icon {
  position: absolute;
  width: clamp(80px, 10vw, 109px);
  height: clamp(80px, 10vw, 108px);
  bottom: clamp(20px, 3vw, 40px);
  right: clamp(20px, 3vw, 40px);
  z-index: 2;
}

@media (max-width: 1199px) {
  .record-sales-section {
    margin-bottom: -40px;
    margin-top: 100px;
  }

  .record-sales-section__container {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .record-sales-section__image-wrapper {
    order: -1;
    width: 100%;
    max-width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    margin: 0 auto;
  }

  .record-sales-section__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    position: relative;
    top: auto;
    left: auto;
    transform: none;
  }

  .record-sales-section__content {
    text-align: center;
    order: 1;
  }

  .record-sales-section__buttons {
    justify-content: center;
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .record-sales-section__button {
    padding: clamp(18px, 3vw, 24px) clamp(32px, 5vw, 48px);
    font-size: clamp(18px, 3vw, 24px);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .record-sales-section__button-icon {
    width: clamp(24px, 3.5vw, 32px);
    height: clamp(24px, 3.5vw, 32px);
  }
}
</style>


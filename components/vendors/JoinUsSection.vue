<template>
  <section class="joinus-section">
    <div class="joinus-container">
      <div class="joinus-media">
        <div class="media-wrapper">
          <div
            v-for="(image, index) in carouselImages"
            :key="index"
            class="media-slide"
            :class="{ 'is-active': currentSlide === index }"
          >
            <img :src="image" alt="Become a vendor" />
          </div>
        </div>
        <!-- Progress Bar -->
        <div class="progress-bar">
          <button
            v-for="(image, index) in carouselImages"
            :key="index"
            type="button"
            class="stepper"
            :class="{ 'stepper--active': currentSlide === index }"
            @click="goToSlide(index)"
            :aria-label="`Go to slide ${index + 1}`"
          ></button>
          <div class="stepper stepper--last"></div>
        </div>
      </div>
      <div class="joinus-form-wrapper">
        <h2 class="form-title">Become a MealGro Vendor today</h2>
        <div class="joinus-form-card">
          <form class="form-grid" @submit.prevent>
            <label class="form-field">
              <span>Full name</span>
              <input type="text" class="form-input" />
            </label>
            <label class="form-field">
              <span>Business name</span>
              <input type="text" class="form-input" />
            </label>
            <label class="form-field">
              <span>Phone number</span>
              <input type="tel" class="form-input" />
            </label>
            <label class="form-field">
              <span>Email</span>
              <input type="email" class="form-input" />
            </label>
            <label class="form-field">
              <span>State</span>
              <input type="text" class="form-input" />
            </label>
            <label class="form-field">
              <span>City</span>
              <input type="text" class="form-input" />
            </label>
            <button type="submit" class="form-submit" disabled>
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import becomeAVendorImage from '../../assets/vendors/becomeavendor.png';
import foodViewImage from '../../assets/vendors/foodview.png';
import vendorImage from '../../assets/vendors/vendor.png';

const carouselImages = [becomeAVendorImage, foodViewImage, vendorImage, becomeAVendorImage, foodViewImage];
const currentSlide = ref(0);

let autoSlideInterval: ReturnType<typeof setInterval> | null = null;

const goToSlide = (index: number) => {
  currentSlide.value = index;
  resetAutoSlide();
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % carouselImages.length;
};

const resetAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
  autoSlideInterval = setInterval(nextSlide, 5000);
};

onMounted(() => {
  resetAutoSlide();
});

onUnmounted(() => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
});
</script>

<style scoped>
.joinus-section {
  width: 100%;
  padding: clamp(72px, 10vw, 120px) clamp(16px, 5vw, 72px);
  background: #F6F6F6;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 6;
}

.joinus-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: clamp(40px, 6vw, 80px);
  align-items: start;
  position: relative;
  justify-items: center;
}

.joinus-media {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

.media-wrapper {
  position: relative;
  width: 510px;
  height: 670px;
  border-radius: 54px;
  overflow: hidden;
  background: #D9D9D9;
}

.media-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  z-index: 0;
}

.media-slide.is-active {
  opacity: 1;
  z-index: 1;
}

.media-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Progress Bar */
.progress-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 2px;
  width: 560px;
  height: 50px;
}

.stepper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: 4px;
  width: 92px;
  height: 20px;
  flex: none;
  flex-grow: 1;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stepper--last {
  width: 114px;
  height: 4px;
  pointer-events: none;
}

.stepper::before {
  content: '';
  width: 100%;
  height: 4px;
  background: #FFE0DC;
  border-radius: 100px;
  flex: none;
  align-self: stretch;
  flex-grow: 0;
  transition: background 0.3s ease;
}

.stepper--active::before {
  background: #FF2509;
}

.stepper--last::before {
  display: none;
}

.stepper:hover:not(.stepper--last)::before {
  background: #FFB8B0;
}

.joinus-form-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 463px;
}

.form-title {
  margin: 0 0 clamp(24px, 4vw, 32px);
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 50px;
  line-height: 54px;
  letter-spacing: -0.25px;
  text-align: left;
  color: #000000;
  width: 455px;
  height: 110px;
}

.joinus-form-card {
  position: relative;
  width: 463px;
  height: auto;
  min-height: 482px;
  background: #FFFFFF;
  border-radius: 43px;
  padding: 24px 38px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  flex: 1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  letter-spacing: -0.25px;
  color: #000000;
  margin-bottom: 14px;
  width: 100%;
  position: relative;
}

.form-field span {
  display: block;
  line-height: 1.2;
  font-size: 16px;
  color: #000000;
}

.form-input {
  width: 100%;
  max-width: 422px;
  border: none;
  border-bottom: 1.93px solid #B2ACAC;
  padding: 8px 0;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.4;
  letter-spacing: -0.25px;
  background: transparent;
  color: #000000;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-bottom-color: #FF2509;
}

.form-submit {
  margin-top: auto;
  width: 100%;
  max-width: 357px;
  height: 52px;
  border: none;
  border-radius: 26px;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.2;
  text-align: center;
  letter-spacing: -0.25px;
  color: #B2ACAC;
  background: #D9D9D9;
  cursor: not-allowed;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  align-self: center;
}

@media (max-width: 1200px) {
  .media-wrapper {
    width: clamp(400px, 45vw, 510px);
    height: clamp(525px, 58vw, 670px);
  }

  .progress-bar {
    width: clamp(450px, 50vw, 560px);
  }

  .form-title {
    font-size: clamp(36px, 5vw, 50px);
    line-height: clamp(40px, 5.5vw, 54px);
    width: clamp(320px, 40vw, 455px);
  }

  .joinus-form-card {
    width: clamp(370px, 42vw, 463px);
    height: clamp(385px, 45vw, 482px);
  }

  .form-input {
    max-width: 100%;
  }

  .form-submit {
    max-width: clamp(285px, 32vw, 357px);
    height: clamp(50px, 6vw, 64px);
    font-size: clamp(20px, 2.5vw, 24px);
  }
}

@media (max-width: 1199px) {
  .joinus-section {
    margin-top: -40px;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    overflow: hidden;
  }

  .joinus-container {
    justify-items: center;
    transform: none;
    width: 100%;
    grid-template-columns: 1fr;
    justify-content: center;
    align-items: center;
  }

  .joinus-media {
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
  }

  .media-wrapper {
    width: min(510px, 90%);
    height: auto;
    aspect-ratio: 510 / 670;
  }

  .progress-bar {
    width: min(560px, 90%);
    margin: 0 auto;
  }

  .joinus-form-wrapper {
    max-width: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .form-title {
    width: auto;
    height: auto;
    font-size: clamp(36px, 5vw, 50px);
    line-height: clamp(40px, 5.5vw, 54px);
    text-align: center;
  }

  .joinus-form-card {
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 482px;
    margin: 0;
    border-radius: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .form-grid {
    width: 100%;
    max-width: 100%;
    height: auto;
    margin: 0 auto;
  }

  .form-field {
    font-size: clamp(18px, 2.5vw, 20px);
    line-height: clamp(48px, 8vw, 96px);
  }

  .form-underline {
    width: 100%;
    max-width: 422px;
  }

  .form-submit {
    width: 100%;
    max-width: 100%;
    height: clamp(64px, 10vw, 80px);
    font-size: clamp(20px, 3vw, 24px);
  }
}

@media (max-width: 768px) {
  .joinus-section {
    padding: clamp(60px, 10vw, 96px) 0 56px;
  }

  .joinus-container {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  .joinus-media {
    order: -1;
  }

  .media-wrapper {
    border-radius: 40px;
  }

  .joinus-form-card {
    border-radius: 40px 40px 0 0;
    margin-bottom: -70px;
    z-index: 0;
    padding: 26px 20px;
  }
}
</style>


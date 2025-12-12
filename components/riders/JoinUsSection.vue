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
            <img :src="image" alt="Happy delivery partner" />
          </div>
        </div>
        <div class="media-indicators">
          <button
            v-for="(image, index) in carouselImages"
            :key="index"
            type="button"
            class="indicator"
            :class="{ 'indicator--active': currentSlide === index }"
            @click="goToSlide(index)"
            aria-label="Show partner photo"
          />
        </div>
      </div>
      <div class="joinus-form-card">
        <h2 class="form-title">Join us today!</h2>
        <form class="form-grid" @submit.prevent>
          <label class="form-field">
            <span>Full name</span>
            <input type="text" placeholder="" />
          </label>
          <label class="form-field">
            <span>Phone number</span>
            <input type="tel" placeholder="" />
          </label>
          <label class="form-field">
            <span>Email</span>
            <input type="email" placeholder="" />
          </label>
          <button type="submit" class="form-submit" disabled>
            Submit
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import workingManImage from '../../assets/riders/workingman.jpg';

const carouselImages = [workingManImage, workingManImage, workingManImage];
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
  autoSlideInterval = setInterval(nextSlide, 6000);
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
  background: #f4f4f4;
  display: flex;
  justify-content: center;
}

.joinus-container {
  width: 100%;
  max-width: 1180px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(32px, 6vw, 72px);
  align-items: center;
}

.joinus-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  
}

.media-wrapper {
  position: relative;
  width: min(520px, 90%);
  height: 630px;
  border-radius: 54px;
  overflow: hidden;
}

.media-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
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

.media-indicators {
  width: min(340px, 90%);
  display: flex;
  align-items: center;
  gap: 4px;
}

.indicator {
  flex: 1;
  height: 4px;
  border: none;
  border-radius: 999px;
  background: #ffe0dc;
  cursor: pointer;
  transition: background 0.3s ease;
}

.indicator--active {
  background: #ff2509;
}

.joinus-form-card {
  position: relative;
  width: 100%;
  max-width: 580px;
  background: #ffffff;
  border-radius: 40px;
  padding: clamp(32px, 5vw, 48px);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.05);
}

.form-title {
  margin: 0 0 32px;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 700;
  font-size: clamp(28px, 3vw, 36px);
  line-height: clamp(34px, 3.6vw, 44px);
  text-align: center;
  color: #121212;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 3vw, 28px);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-size: 18px;
  color: #121212;
}

.form-field span {
  opacity: 0.7;
}

.form-field input {
  border: none;
  border-bottom: 1px solid #c8c8c8;
  padding: 8px 0;
  font-size: 18px;
  font-family: inherit;
  background: transparent;
  color: #121212;
}

.form-field input:focus {
  outline: none;
  border-bottom-color: #ff2509;
}

.form-submit {
  margin-top: clamp(24px, 3vw, 40px);
  width: 100%;
  padding: clamp(20px, 3vw, 28px);
  border: none;
  border-radius: 32px;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: rgba(18, 18, 18, 0.4);
  background: #ebebeb;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .joinus-container {
    justify-items: center;
  }
}

@media (max-width: 768px) {
  .joinus-section {
    padding: clamp(96px, 22vw, 140px) 24px 56px;
  }

  .joinus-container {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  .joinus-media {
    width: 100%;
    order: -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .media-wrapper {
    border-radius: 40px;
    height: clamp(360px, 70vw, 520px);
    width: min(420px, 100%);
  }

  .joinus-form-card {
    
    padding: 28px;
    width: 420px;
    border-radius: 40px 40px 0 0;
    margin-bottom: -70px;
    z-index: 0;
  }
}
</style>

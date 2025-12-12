<template>
  <section class="connect-vendors-section">
    <!-- Top Black Section with Text -->
    <div class="connect-vendors-section__header">
      <h2 class="connect-vendors-section__headline">
        See how MealGro connects<br />
        <span class="connect-vendors-section__headline--red">Vendors to their customers</span>
      </h2>
    </div>

    <!-- Food Image -->
    <div class="connect-vendors-section__image-wrapper">
      <img :src="foodViewImage" alt="Food view" class="connect-vendors-section__image" />
    </div>

    <!-- Get Started Button -->
    <div class="connect-vendors-section__button-wrapper">
      <button class="connect-vendors-section__button">
        <span>Get started</span>
        <div class="connect-vendors-section__button-icon">
          <svg width="26.66" height="26.66" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import foodViewImage from '../../assets/vendors/foodview.png';
</script>

<style scoped>
.connect-vendors-section {
  width: 100%;
  background: #FFFFFF;
  position: relative;
  overflow: hidden;
}

@media (min-width: 1200px) {
  .connect-vendors-section {
    border-bottom-left-radius: 50px;
    border-bottom-right-radius: 50px;
    margin-bottom: -80px;
    z-index: 15;
  }
}

/* Header Section */
.connect-vendors-section__header {
  width: 100%;
  background: #000000;
  padding: clamp(100px, 12vw, 180px) 0;
  text-align: center;
}

.connect-vendors-section__headline {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 800;
  font-size: clamp(36px, 5vw, 72px);
  line-height: 1.2;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0;
}

.connect-vendors-section__headline--red {
  color: #D62300;
}

/* Image Section */
.connect-vendors-section__image-wrapper {
  width: 100%;
  overflow: hidden;
}

.connect-vendors-section__image {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}

/* Button Section */
.connect-vendors-section__button-wrapper {
  width: 100%;
  background: #000000;
  padding: clamp(40px, 6vw, 60px) 0;
  padding-bottom: clamp(60px, 8vw, 100px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.connect-vendors-section__button {
  position: relative;
  width: 490.17px;
  height: 90.05px;
  background: #D9D9D9;
  border: none;
  border-radius: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.connect-vendors-section__button:hover {
  opacity: 0.9;
}

.connect-vendors-section__button span {
  position: absolute;
  width: 252.73px;
  height: 58.27px;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 32px;
  line-height: 68px;
  text-align: center;
  letter-spacing: -0.25px;
  color: #121212;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.connect-vendors-section__button-icon {
  position: absolute;
  width: 36.1px;
  height: 36.1px;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: #FFFFFF;
  border: 1px solid #D9D9D9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.connect-vendors-section__button-icon svg {
  width: 26.66px;
  height: 26.66px;
  transform: rotate(0deg);
  color: #000000;
}

.connect-vendors-section__button-icon svg path {
  stroke: #000000;
  stroke-width: 1.5px;
}

@media (max-width: 1199px) {
  .connect-vendors-section {
    margin-bottom: 0;
  }

  .connect-vendors-section__header {
    padding: clamp(60px, 8vw, 120px) 0;
  }

  .connect-vendors-section__button-wrapper {
    padding: clamp(30px, 5vw, 50px) 0;
    padding-bottom: clamp(60px, 8vw, 100px);
  }

  .connect-vendors-section__button {
    width: min(490.17px, 90vw);
    height: clamp(70px, 12vw, 90.05px);
  }

  .connect-vendors-section__button span {
    width: auto;
    font-size: clamp(24px, 4vw, 32px);
    line-height: clamp(50px, 10vw, 68px);
  }

  .connect-vendors-section__button-icon {
    width: clamp(28px, 5vw, 36.1px);
    height: clamp(28px, 5vw, 36.1px);
    right: clamp(15px, 3vw, 20px);
  }

  .connect-vendors-section__button-icon svg {
    width: clamp(20px, 4vw, 26.66px);
    height: clamp(20px, 4vw, 26.66px);
  }
}
</style>


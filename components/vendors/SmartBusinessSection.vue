<template>
  <section class="smart-business-section">
    <div class="smart-business-section__overlay">
      <img :src="foodBusinessImage" alt="Food business illustrations" class="smart-business-section__bg-image" />
    </div>
    <div class="smart-business-section__content">
      <h2 class="smart-business-section__headline smart-business-section__headline--desktop">
        Make your food business smart<br />
        with the Mealgro app
      </h2>
      <h2 class="smart-business-section__headline smart-business-section__headline--mobile">
        Make your<br />
        food business<br />
        smart with the<br />
        Mealgro app
      </h2>
    </div>
  </section>
</template>

<script setup lang="ts">
import foodBusinessImage from '../../assets/vendors/foodbusiness.svg';
</script>

<style scoped>
.smart-business-section {
  width: 100%;
  background: #000000;
  color: #ffffff;
  position: relative;
  overflow: visible;
  padding: clamp(80px, 12vw, 140px) 0;
  min-height: 516px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.smart-business-section__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  z-index: 1;
}

.smart-business-section__bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.smart-business-section__content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
}

.smart-business-section__headline {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 800;
  font-size: clamp(36px, 6vw, 72px);
  line-height: 1.2;
  letter-spacing: -0.25px;
  color: #FFFFFF;
  margin: 0;
}

.smart-business-section__headline--mobile {
  display: none;
}

@media (max-width: 1199px) {
  .smart-business-section {
    padding: clamp(60px, 10vw, 100px) 0;
    min-height: 400px;
  }

  .smart-business-section__content {
    padding: 0 20px;
  }

  .smart-business-section__headline {
    font-size: clamp(28px, 8vw, 48px);
  }

  .smart-business-section__headline--desktop {
    display: none;
  }

  .smart-business-section__headline--mobile {
    display: block;
    padding-bottom: 200px;
  }
}
</style>


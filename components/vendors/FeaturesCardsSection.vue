<template>
  <section class="features-cards-section">
    <!-- Card 1: Display your Creations as reels -->
    <div class="features-cards-section__mobile-image-wrapper">
      <img :src="reelsImage" alt="Display your Creations as reels" class="features-cards-section__mobile-image" />
    </div>
    <div class="features-cards-section__card features-cards-section__card--left">
      <h3 class="features-cards-section__label features-cards-section__label--desktop">Create your<br />catalogue</h3>
      <h3 class="features-cards-section__label features-cards-section__label--mobile">Create your<br />own catalogue</h3>
      <div class="features-cards-section__image-wrapper">
        <img :src="reelsImage" alt="Display your Creations as reels" class="features-cards-section__image" />
      </div>
    </div>
    
    <!-- Card 2: Create your catalogue -->
    <div class="features-cards-section__mobile-image-wrapper">
      <img :src="catalogueImage" alt="Create your catalogue" class="features-cards-section__mobile-image" />
    </div>
    <div class="features-cards-section__card features-cards-section__card--center">
      <h3 class="features-cards-section__label features-cards-section__label--desktop">Display your<br />Creations as reels</h3>
      <h3 class="features-cards-section__label features-cards-section__label--mobile">Display your<br />creations as<br />reels</h3>
      <div class="features-cards-section__image-wrapper">
        <img :src="catalogueImage" alt="Create your catalogue" class="features-cards-section__image" />
      </div>
    </div>
    
    <!-- Card 3: Stay updated with your order history -->
    <div class="features-cards-section__mobile-image-wrapper">
      <img :src="historyImage" alt="Stay updated with your order history" class="features-cards-section__mobile-image" />
    </div>
    <div class="features-cards-section__card features-cards-section__card--right">
      <h3 class="features-cards-section__label features-cards-section__label--desktop">Stay updated<br />with your order<br />history</h3>
      <h3 class="features-cards-section__label features-cards-section__label--mobile">Stay updated<br />with your<br />order history</h3>
      <div class="features-cards-section__image-wrapper">
        <img :src="historyImage" alt="Stay updated with your order history" class="features-cards-section__image" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import catalogueImage from '../../assets/vendors/X - 6.png';
import reelsImage from '../../assets/vendors/X - 5.png';
import historyImage from '../../assets/vendors/X - 7.png';
</script>

<style scoped>
.features-cards-section {
  width: 100vw;
  max-width: 100vw;
  background: #FFFFFF;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  margin-top: 0;
  padding-top: 0;
  overflow: hidden;
  position: relative;
}

/* Cards */
.features-cards-section__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(40px, 5vw, 90px) clamp(20px, 3vw, 60px);
  min-height: 1121.51px;
  position: relative;
}

.features-cards-section__card--left {
  background: #F6F6F6;
}

.features-cards-section__card--center {
  background: #FF0000;
  border-radius: 77px;
  position: relative;
  z-index: 2;
}

.features-cards-section__card--right {
  background: #FFE100;
}

/* Text Labels */
.features-cards-section__label {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: clamp(32px, 3vw, 48px);
  line-height: 46px;
  text-align: center;
  letter-spacing: -0.25px;
  color: #121212;
  margin: 0 0 clamp(30px, 4vw, 60px) 0;
  width: 100%;
}

.features-cards-section__card--center .features-cards-section__label {
  color: #FFFFFF;
}

.features-cards-section__label--mobile {
  display: none;
}

.features-cards-section__label--mobile {
  display: none;
}

/* Image Wrapper */
.features-cards-section__image-wrapper {
  width: 100%;
  max-width: 393.65px;
  height: auto;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.features-cards-section__image {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}

/* Mobile/Tablet Images (above cards) */
.features-cards-section__mobile-image-wrapper {
  display: none;
}


@media (min-width: 1200px) {
  .features-cards-section {
    position: relative;
  }

  .features-cards-section__card--left {
    position: relative;
    z-index: 1;
    width: calc(100% + 15%);
    margin-right: -15%;
  }

  .features-cards-section__card--right {
    position: relative;
    z-index: 1;
    width: calc(100% + 15%);
    margin-left: -15%;
  }

  .features-cards-section__card--center {
    z-index: 2;
  }
}

@media (min-width: 1200px) and (max-width: 1400px) {
  .features-cards-section__card {
    padding: clamp(30px, 4vw, 60px) clamp(15px, 2.5vw, 40px);
    min-height: 900px;
  }

  .features-cards-section__label {
    font-size: clamp(28px, 2.5vw, 40px);
    margin-bottom: clamp(20px, 3vw, 40px);
  }

  .features-cards-section__image-wrapper {
    max-width: 320px;
  }
}

@media (max-width: 1199px) {
  .features-cards-section {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 15;
    overflow: visible;
  }

  /* Show mobile images above cards */
  .features-cards-section__mobile-image-wrapper {
    display: block;
    width: 100%;
    padding: 40px 20px 20px;
    background: #FFFFFF;
    position: relative;
    margin-top: -50%;
  }

  .features-cards-section__mobile-image-wrapper:first-child {
    margin-top: -100px;
    z-index: 20;
    position: relative;
  }

  .features-cards-section__mobile-image-wrapper:first-child .features-cards-section__mobile-image {
    margin-top: -180px;
  }

  .features-cards-section__mobile-image-wrapper:nth-child(4) {
    z-index: 30;
    margin-top: -50%;
  }

  .features-cards-section__mobile-image-wrapper:nth-child(4) .features-cards-section__mobile-image {
    margin-top: -180px;
  }

  .features-cards-section__mobile-image-wrapper:nth-child(7) {
    z-index: 40;
    position: relative;
  }

  .features-cards-section__mobile-image {
    width: 100%;
    max-width: 300px;
    height: auto;
    object-fit: contain;
    display: block;
    margin: 0 auto;
    position: relative;
    z-index: 35;
  }

  /* Hide images inside cards */
  .features-cards-section__image-wrapper {
    display: none;
  }

  .features-cards-section__card {
    min-height: 400px;
    padding: 80px 20px 40px;
    margin-top: -70%;
    position: relative;
    margin-bottom: -80%;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    padding-bottom: 550px;
  }

  .features-cards-section__card--left {
    z-index: 25;
  }

  .features-cards-section__card--center {
    z-index: 35;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    padding-bottom: 550px;
  }

  .features-cards-section__card--right {
    z-index: 45;
    padding-bottom: 300px;
  }

  .features-cards-section__card--center {
    border-radius: 0;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
  }

  .features-cards-section__label {
    margin-bottom: -50px;
    font-weight: 700;
  }

  .features-cards-section__label--desktop {
    display: none;
  }

  .features-cards-section__label--mobile {
    display: block;
  }
}
</style>


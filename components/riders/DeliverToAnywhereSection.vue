<template>
  <section class="deliver-section">
    <div class="deliver-content">
      <h2 class="deliver-title">
        Deliver to anywhere in the city,<br />
        <span class="deliver-title__accent">with Mealgro</span>
      </h2>
    </div>
    <div class="deliver-illustration-wrapper">
      <img :src="deliverIllustration" alt="City skyline illustration" class="deliver-illustration" />
    </div>
  </section>
</template>

<script setup lang="ts">
import deliverIllustration from '../../assets/riders/deliver.svg';
</script>

<style scoped>
.deliver-section {
  position: relative;
  width: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f6f6f6 100%);
  padding: clamp(160px, 18vw, 220px) 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}

.deliver-content {
  text-align: center;
  width: 100%;
  max-width: 1141.22px;
  margin-bottom: clamp(32px, 6vw, 56px);
  padding: 0 clamp(16px, 6vw, 72px);
  margin-left: auto;
  margin-right: auto;
}

.deliver-title {
  margin: 0;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 800;
  font-size: clamp(40px, 5vw, 72px);
  line-height: clamp(44px, 5.5vw, 71px);
  color: #0b0b0b;
  letter-spacing: -0.25px;
}

.deliver-title__accent {
  color: #ff2509;
}

.deliver-illustration-wrapper {
  width: 100%;
}

.deliver-illustration {
  width: 100%;
  max-width: none;
  height: auto;
  display: block;
}

@media (min-width: 1280px) {
  .deliver-illustration-wrapper {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
  }
}

@media (max-width: 768px) {
  .deliver-content {
    padding: 0 24px;
    margin-bottom: 32px;
  }

  .deliver-title {
    font-size: clamp(40px, 10vw, 48px);
    line-height: 1.05;
  }

  .deliver-section {
    padding-top: clamp(120px, 24vw, 180px);
    padding-bottom: 0;
  }

  .deliver-illustration-wrapper {
    margin-top: 12px;
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .deliver-illustration {
    width: 220%;
    max-width: none;
    margin-left: 24%;
  }
}
</style>

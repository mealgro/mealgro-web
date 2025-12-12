<template>
  <section class="vehicle-section">
    
      <div class="vehicle-card">
        <div class="vehicle-options">
          <template v-for="(vehicle, index) in vehicles" :key="vehicle.value">
            <div
              class="vehicle-option"
              :class="{ 'vehicle-option--active': index === 0 }"
            >
              <span class="vehicle-option__icon">
                <img :src="vehicleIcon" :alt="`${vehicle.label} icon`" />
              </span>
              <span class="vehicle-option__copy">
                <span class="vehicle-option__label">{{ vehicle.label }}</span>
                <span class="vehicle-option__underline" aria-hidden="true"></span>
              </span>
            </div>
            <span
              v-if="index < vehicles.length - 1"
              class="vehicle-divider"
              aria-hidden="true"
            ></span>
          </template>
        </div>
        <button class="vehicle-option__more" type="button" aria-label="View more vehicle options">
          <span class="vehicle-option__more-label">More</span>
          
        </button>
      </div>
  </section>
</template>

<script setup lang="ts">
import vehicleIcon from '../../assets/vehicle/bike.svg';

type VehicleOption = {
  label: string;
  value: string;
};

const vehicles: VehicleOption[] = [
  { label: 'Motorcycle', value: 'motorcycle' },
  { label: 'Bicycle', value: 'bicycle' },
  { label: 'Vehicle', value: 'vehicle' }
];
</script>

<style scoped>
.vehicle-section {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: clamp(36px, 6vw, 80px) clamp(16px, 4vw, 48px);
  margin: clamp(-160px, -12vw, -110px) auto clamp(-64px, -6vw, -40px);
  position: relative;
  z-index: 5;
}


.vehicle-card {
  width: 100%;
  max-width: 1152.67px;
  min-height: 160px;
  background: #ffffff;
  border-radius: 43px;
  box-shadow: 0px 7px 10.7px 1px rgba(0, 0, 0, 0.1);
  padding: clamp(28px, 4vw, 40px) clamp(24px, 5vw, 64px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vehicle-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(18px, 4vw, 48px);
  flex-wrap: wrap;
}

.vehicle-option {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: transparent;
  border: none;
  padding: 16px 20px;
  border-radius: 0;
}

.vehicle-option__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vehicle-option__label {
  font-family: 'MADE Tommy Soft', sans-serif;
  font-weight: 500;
  font-size: 28px;
  line-height: 1.3;
  letter-spacing: -0.25px;
  color: #000000;
}

.vehicle-option__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
}

.vehicle-option__icon img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.vehicle-option__underline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 6px;
  border-radius: 999px;
  background: #ffc727;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.2s ease;
}

.vehicle-option--active .vehicle-option__underline {
  transform: scaleX(1);
}

.vehicle-divider {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #000000;
}

@media (max-width: 600px) {
  .vehicle-section {
    padding: 24px 0 28px;
    margin-top: -64px;
    margin-bottom: -16px;
  }

  .vehicle-card {
    width: min(392px, 94vw);
    min-height: 62px;
    padding: 12px 12px;
    flex-direction: row;
    gap: 10px;
    justify-content: center;
    box-shadow: 0 7px 10.7px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
  }

  .vehicle-options {
    flex: 1;
    justify-content: center;
    gap: 10px;
    flex-wrap: nowrap;
  }

  .vehicle-option {
    flex: 0 0 auto;
    padding: 10px 16px;
    gap: 8px;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
  }

  .vehicle-option__icon {
    width: 36px;
    height: 36px;
  }

  .vehicle-option__icon img {
    width: 36px;
    height: 36px;
  }

  .vehicle-divider {
    display: none;
  }

  .vehicle-option__label {
    font-size: 15px;
    line-height: 22px;
  }

  .vehicle-option__underline {
    height: 3px;
    display: none;
  }

  .vehicle-option__more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 0 18px;
    height: 42px;
    border-radius: 30px;
    border: none;
    background: #ff2509;
    color: #ffffff;
    font-family: 'MADE Tommy Soft', sans-serif;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.25px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .vehicle-option__more-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .vehicle-option__more-icon svg {
    color: #ffffff;
  }

  .vehicle-option:nth-of-type(n + 3) {
    display: none;
  }
}

@media (min-width: 601px) {
  .vehicle-option__more {
    display: none;
  }
}
</style>

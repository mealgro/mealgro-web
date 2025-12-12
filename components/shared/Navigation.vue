<template>
  <nav class="nav-container">
    <!-- Navigation Bar -->
    <div class="nav-wrapper">
      <!-- Navigation Links -->
      <div class="nav-links">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="nav-link"
          :class="{ 'nav-link-active': isActive(link.href) }"
        >
          <span class="nav-text">{{ link.label }}</span>
          <svg 
            v-if="link.hasDropdown" 
            class="chevron-icon" 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none"
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { usePageContext } from 'vike-vue/usePageContext';
import { navLinks } from './navLinks';

const pageContext = usePageContext();

const isActive = (href: string) => {
  const { urlPathname } = pageContext;
  if (href === '/') {
    return urlPathname === href;
  }
  return urlPathname.startsWith(href);
};
</script>

<style scoped>
.nav-container {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 100;
  padding: 0 20px;
}

/* Hide desktop navigation on mobile/tablet */
@media (max-width: 1024px) {
  .nav-container {
    display: none;
  }
}

.nav-wrapper {
  position: relative;
  width: 801px;
  height: 83px;
  background: #FFFFFF;
  border-radius: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  gap: 20px;
  order: 2;
}

.nav-links {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  gap: 0;
  flex: 1;
  width: 100%;
}

.nav-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  transition: color 0.2s;
  font-family: 'MADE Tommy Soft', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 150%;
  color: #0E172B;
}

.nav-link-active {
  color: #D62300;
}

.nav-link:hover {
  color: #D62300;
}

.nav-link-active:hover {
  color: #D62300;
}

.nav-text {
  white-space: nowrap;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: #667085;
  flex-shrink: 0;
}

.nav-link-active .chevron-icon {
  color: #D62300;
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .nav-container {
    padding: 0 10px;
    gap: 15px;
  }
  
  .nav-wrapper {
    width: 95%;
    max-width: 801px;
    padding: 0 15px;
    gap: 15px;
  }
  
  .nav-links {
    gap: 20px;
    overflow-x: auto;
  }
  
  .nav-link {
    font-size: 12px;
  }
  
  .chevron-icon {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 768px) {
  .nav-container {
    top: 10px;
    padding: 0 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-wrapper {
    width: 100%;
    height: auto;
    padding: 12px 10px;
    border-radius: 16px;
    flex-wrap: wrap;
    order: 2;
  }
  
  .nav-links {
    flex-wrap: wrap;
    gap: 15px;
    height: auto;
    justify-content: center;
    flex: 1 1 100%;
  }
  
  .nav-link {
    font-size: 12px;
  }
  
  .chevron-icon {
    width: 12px;
    height: 12px;
  }
}
</style>

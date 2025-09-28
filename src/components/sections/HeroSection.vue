<template>
  <section class="hero-section" @mouseenter="showArrows = true" @mouseleave="showArrows = false">
    <div class="carousel-container">
      <!-- 桌面端轮播图 -->
      <div class="carousel-images desktop-carousel">
        <div 
          v-for="(image, index) in desktopImages" 
          :key="'desktop-' + index"
          class="carousel-slide"
          :class="{ active: currentSlide === index }"
        >
          <img :src="image.url" :alt="image.alt" class="hero-background-image"/>
        </div>
      </div>
      
      <!-- 移动端图片 -->
      <div class="mobile-image-container">
        <img :src="mobileImageUrl" alt="Ackoray Logo" class="hero-background-image mobile-image"/>
      </div>

      <!-- 轮播箭头 -->
      <div class="carousel-arrows" v-show="showArrows">
        <button class="arrow-btn arrow-left" @click="prevSlide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="arrow-btn arrow-right" @click="nextSlide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 轮播指示点 -->
      <div class="carousel-indicators">
        <button 
          v-for="(image, index) in desktopImages" 
          :key="'indicator-' + index"
          class="indicator-dot"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
        ></button>
      </div>
    </div>

    <!-- 右上角导航按钮 -->
    <div class="hero-navigation">
      <div class="hero-actions">
        <div class="user-action-container">
          <img 
            src="../../assets/icons/icons8-male-user-32.png" 
            alt="User" 
            class="icon user-icon" 
            @click="handleUserIconClick" 
          />
          <UserActionsDropdown 
            :show="showUserDropdown" 
            @close="showUserDropdown = false"
            @logout="handleUserLogout" 
          />
        </div>
        <div class="cart-icon-container">
          <img 
            src="../../assets/icons/icons8-shopping-cart-32.png" 
            alt="Cart" 
            class="icon cart-icon" 
            @click="handleCartIconClick" 
          />
          <span v-if="cartItemCount > 0" class="cart-count-badge">{{ cartItemCount }}</span>
        </div>
        <div class="settings-container">
          <img 
            src="../../assets/icons/icons8-gear-32.png" 
            alt="Settings" 
            class="icon settings-icon" 
            @click="handleSettingsIconClick" 
          />
          <SettingsDropdown
            :show="showSettingsDropdown"
            @close="showSettingsDropdown = false"
          />
        </div>
      </div>
    </div>

    <div class="content-overlay">
      <div class="main-info">
        <h1 class="hero-title">
          <img :src="logoImageUrl" alt="Ackoray Logo" class="hero-logo-image"/>
          {{ $t('heroSection.title') }}
        </h1>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import VerifiedIcon from '../../assets/icons/VerifiedIcon.vue';
import heroImage1 from '../../assets/images/1.png';
import heroImage2 from '../../assets/images/2.png';
import mobileImage from '../../assets/images/ackoray.png';
import logoImage from '../../assets/images/ackoray.png';
import UserActionsDropdown from '../common/UserActionsDropdown.vue';
import SettingsDropdown from '../common/SettingsDropdown.vue';

const { t } = useI18n();
const router = useRouter();

// 导航相关的inject
const isLoggedIn = inject('isLoggedIn');
const toggleCart = inject('toggleCart');
const cartItems = inject('cartItems');

// 导航状态
const showUserDropdown = ref(false);
const showSettingsDropdown = ref(false);

// 购物车数量计算
const cartItemCount = computed(() => {
  if (!cartItems || !cartItems.value) return 0;
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

// 导航事件处理
const handleUserIconClick = () => {
  if (isLoggedIn.value) {
    showUserDropdown.value = !showUserDropdown.value;
    if (showUserDropdown.value) {
      showSettingsDropdown.value = false;
    }
  } else {
    router.push('/login');
  }
};

const handleUserLogout = () => {
  console.log('User logged out from HeroSection perspective.');
};

const handleCartIconClick = () => {
  if (toggleCart) {
    toggleCart();
  } else {
    console.warn('toggleCart function not provided to HeroSection');
    alert(t('cart.unavailable', 'Cart functionality is currently unavailable.'));
  }
};

const handleSettingsIconClick = () => {
  showSettingsDropdown.value = !showSettingsDropdown.value;
  if (showSettingsDropdown.value) {
    showUserDropdown.value = false;
  }
};

// 轮播数据
const desktopImages = [
  { url: heroImage1, alt: 'Hero background image 1' },
  { url: heroImage2, alt: 'Hero background image 2' }
];

const mobileImageUrl = mobileImage;
const logoImageUrl = logoImage;

// 轮播状态
const currentSlide = ref(0);
const showArrows = ref(false);
let autoPlayTimer = null;

// 轮播方法
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % desktopImages.length;
  resetAutoPlay();
};

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0 ? desktopImages.length - 1 : currentSlide.value - 1;
  resetAutoPlay();
};

const goToSlide = (index) => {
  currentSlide.value = index;
  resetAutoPlay();
};

// 自动轮播
const startAutoPlay = () => {
  autoPlayTimer = setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
};

const resetAutoPlay = () => {
  stopAutoPlay();
  startAutoPlay();
};

// 生命周期
onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.hero-section {
  position: relative;
  aspect-ratio: 16/9;
  max-height: 70vh;
  background-color: var(--color-surface);
  display: flex;
  border-radius: var(--border-radius-large);
  overflow: hidden;
  margin: 20px 80px 0px 80px;
}

.carousel-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
}

.carousel-images {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.mobile-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
}

/* 删除底部渐变效果 */
.hero-logo-image {
  height: clamp(2.5rem, 4vw, 3.5rem);
  width: auto;
  margin-left: 6px;
  margin-right: 12px;
  border-radius: var(--border-radius-medium);
}

.hero-background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  /* 如果问题仍然存在，下一步可以尝试在这里也添加 border-radius: inherit; */
}

/* 默认显示桌面轮播，隐藏移动端图片 */
.desktop-carousel {
  display: block;
}

.mobile-image-container {
  display: none;
}

/* 轮播箭头 */
.carousel-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  pointer-events: none;
  z-index: 10;
}

.arrow-btn {
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 8px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.arrow-btn:hover {
  transform: scale(1.05);
}

.arrow-btn svg {
  color: #fff;
  width: 24px;
  height: 24px;
}

/* 轮播指示点 */
.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.9);
}

.indicator-dot:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.8);
}

/* 右上角导航样式 */
.hero-navigation {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 15;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-actions .icon {
  color: var(--color-icon);
  cursor: pointer;
  width: 24px;
  height: 24px;
  padding: 8px;
  background: var(--color-bg);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  box-sizing: content-box;
}

.hero-actions .icon:hover {
  color: var(--color-primary);
  transform: scale(1.05);
}

.hero-actions .settings-icon {
  width: 20px;
  height: 20px;
  padding: 8px;
}

.hero-actions .cart-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-bg);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.hero-actions .cart-icon-container:hover {
  background: var(--color-bg);
  transform: scale(1.05);
}

.hero-actions .cart-icon-container .cart-icon {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.hero-actions .cart-count-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
  border-radius: 50%;
  padding: 0;
  font-size: 0.7rem;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.hero-actions .user-action-container, 
.hero-actions .settings-container {
  position: relative;
  background: var(--color-bg);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.hero-actions .user-action-container:hover,
.hero-actions .settings-container:hover {
  background: var(--color-bg);
  transform: scale(1.05);
}

.hero-actions .user-action-container .user-icon,
.hero-actions .settings-container .settings-icon {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.content-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 25px var(--container-padding);
  background: transparent;
  color: white;
  z-index: 5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
.main-info {
  max-width: 800px;
  text-align: center;
}

.hero-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.2rem, 4vw, 2.2rem); /* Increased size */
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  line-height: 1.2;
  white-space: nowrap;
}
.verified-icon-title {
  width: clamp(22px, 3.2vw, 30px);
  height: clamp(22px, 3.2vw, 30px);
  color: var(--color-accent);
  margin-left: 8px;
  flex-shrink: 0;
}
.hero-subtitle {
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  color: var(--color-text-secondary);
  margin-bottom: 25px;
}
.stats-row {
  display: flex;
  gap: 0;
  flex-wrap: nowrap;
  background-color: var(--color-card);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: var(--border-radius-medium);
  padding: 6px;
  border: 1px solid var(--color-border-subtle);
  overflow: hidden;
  width: fit-content;
  margin-left: 0;
  margin-right: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 20px;
  border-right: 1px solid var(--color-border-subtle);
}
.stat-item:last-child {
  border-right: none;
}
.stat-label {
  font-size: clamp(0.75rem, 1.7vw, 0.85rem);
  color: var(--color-text-muted);
  margin-bottom: 4px;
}
.stat-value {
  font-size: clamp(0.95rem, 2.1vw, 1.05rem);
  color: var(--color-text);
  font-weight: 500;
}

@media (max-aspect-ratio: 1/1) {
    /* 移动端完全隐藏整个 Hero 组件 */
    .hero-section {
      display: none;
    }
    
    /* 如果需要在移动端显示，可以使用以下样式替代上面的隐藏 */
    /*
    .desktop-carousel {
      display: none;
    }
    
    .mobile-image-container {
      display: block;
    }
    
    .carousel-arrows,
    .carousel-indicators {
      display: none;
    }
    */
}
</style>
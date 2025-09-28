<template>
  <div class="home-page">
    <HeroSection />
    <!-- <FeaturedCollections /> -->
    <section class="home-product-grid-section">
      <div class="products-header">
        <h2 class="products-section-title">All products</h2>
        <!-- 移动端导航按钮 -->
        <div class="mobile-navigation">
          <div class="user-action-container">
            <img 
              :src="userIcon" 
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
              :src="cartIcon" 
              alt="Cart" 
              class="icon cart-icon" 
              @click="handleCartIconClick" 
            />
            <span v-if="cartItemCount > 0" class="cart-count-badge">{{ cartItemCount }}</span>
          </div>
          <div class="settings-container">
            <img 
              :src="settingsIcon" 
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
      <ProductGrid :products="homePageProducts" />
    </section>
    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import HeroSection from '../components/sections/HeroSection.vue';
// import FeaturedCollections from '../components/sections/FeaturedCollections.vue';
import ProductGrid from '../components/sections/ProductGrid.vue'; // Import ProductGrid
import SiteFooter from '../components/layout/Footer.vue'; // Import the Footer component
import UserActionsDropdown from '../components/common/UserActionsDropdown.vue';
import SettingsDropdown from '../components/common/SettingsDropdown.vue';
import { getAllProductsNoPagination } from '../api/productApi';
import userIcon from '../assets/icons/icons8-male-user-32.png';
import cartIcon from '../assets/icons/icons8-shopping-cart-32.png';
import settingsIcon from '../assets/icons/icons8-gear-32.png';

const { t } = useI18n();
const router = useRouter();

const homePageProducts = ref([]);
const loading = ref(true);

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
  console.log('User logged out from HomePage perspective.');
};

const handleCartIconClick = () => {
  if (toggleCart) {
    toggleCart();
  } else {
    console.warn('toggleCart function not provided to HomePage');
    alert(t('cart.unavailable', 'Cart functionality is currently unavailable.'));
  }
};

const handleSettingsIconClick = () => {
  showSettingsDropdown.value = !showSettingsDropdown.value;
  if (showSettingsDropdown.value) {
    showUserDropdown.value = false;
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    const allProducts = await getAllProductsNoPagination();
    if (allProducts && Array.isArray(allProducts)) {
      homePageProducts.value = allProducts
        .filter(product => product.onShelves === true)
        .map(product => ({
          id: product.id, // Backend: id
          imageUrl: product.mainImageUrl || '/src/assets/images/placeholder-default.png', // Backend: mainImageUrl
          productNameId: product.name || t('products.defaultName'), // Backend: name
          priceEth: product.priceR !== undefined && product.priceR !== null ? Math.round(product.priceR) : 'N/A', // Backend: priceR, for main display
          // Ensure buyNowPriceEth also gets a value to trigger the overlay
          // If backend has a specific buy_now_price field, use that. Otherwise, use priceR.
          buyNowPriceEth: product.priceR !== undefined && product.priceR !== null ? Math.round(product.priceR) : 'N/A', // Backend: priceR (or a specific buy_now_price field)
          // lastSaleInfo is not currently used based on the screenshot, can be added if needed
        }));
    } else {
      homePageProducts.value = [];
      console.warn('getAllProductsNoPagination did not return a valid array:', allProducts);
    }
  } catch (error) {
    console.error('获取首页产品列表失败:', error);
    homePageProducts.value = [];
  } finally {
    loading.value = false;
  }
});

</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: var(--section-spacing);
  padding-top: 2rem;
  background-color: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
}

.home-product-grid-section {
  margin-left: 80px;
  margin-right: 80px;
  margin-top: 2rem;
  background-color: var(--color-bg);
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* 移动端导航按钮 - 默认隐藏 */
.mobile-navigation {
  display: none;
}

/* 桌面端标题样式 */
.products-section-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  margin-top: -2rem;
  margin-bottom: 1rem;
  font-weight: 500;
  text-align: left;
  color: var(--color-text);
}

/* 移动端样式优化 */
@media (max-aspect-ratio: 1/1) {
  .home-product-grid-section {
    margin-left: 15px;
    margin-right: 15px;
    margin-top: -0.5rem;
    margin-bottom: 1rem;
  }
  
  .products-section-title {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--color-text);
    margin: 0;
    padding: 0;
    text-align: left;
  }

  .products-header {
    margin-bottom: 1rem;
  }

  /* 移动端显示导航按钮 */
  .mobile-navigation {
    display: flex !important;
    gap: 0.8rem;
    align-items: center;
  }

  /* 导航按钮样式 */
  .mobile-navigation .user-action-container,
  .mobile-navigation .cart-icon-container,
  .mobile-navigation .settings-container {
    position: relative;
  }

  .mobile-navigation .icon {
    width: 32px;
    height: 32px;
    cursor: pointer;
    padding: 0.3rem;
    border-radius: var(--border-radius-medium);
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    transition: all 0.2s ease;
    object-fit: contain;
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .mobile-navigation .icon:hover {
    background-color: var(--color-surface);
    border-color: var(--color-primary);
  }

  /* 购物车数量标记 */
  .mobile-navigation .cart-count-badge {
    position: absolute;
    top: -0.5rem;
    right: -0.45rem;
    background-color: var(--color-primary);
    color: white;
    border-radius: 50%;
    width: 1rem;
    height: 1rem;
    font-size: 0.6rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 1rem;
    line-height: 1;
  }
}
</style>
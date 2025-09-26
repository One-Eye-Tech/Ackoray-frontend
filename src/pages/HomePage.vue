<template>
  <div class="home-page">
    <TopNavigationBar />
    <HeroSection />
    <!-- <FeaturedCollections /> -->
    <section class="home-product-grid-section">
      <h2 class="products-section-title">All products</h2>
      <ProductGrid :products="homePageProducts" />
    </section>
    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TopNavigationBar from '../components/layout/TopNavigationBar.vue';
import HeroSection from '../components/sections/HeroSection.vue';
// import FeaturedCollections from '../components/sections/FeaturedCollections.vue';
import ProductGrid from '../components/sections/ProductGrid.vue'; // Import ProductGrid
import SiteFooter from '../components/layout/Footer.vue'; // Import the Footer component
import { getAllProductsNoPagination } from '../api/productApi';

const { t } = useI18n();

const homePageProducts = ref([]);
const loading = ref(true);

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
          priceEth: product.priceR !== undefined && product.priceR !== null ? product.priceR.toFixed(2) : 'N/A', // Backend: priceR, for main display
          // Ensure buyNowPriceEth also gets a value to trigger the overlay
          // If backend has a specific buy_now_price field, use that. Otherwise, use priceR.
          buyNowPriceEth: product.priceR !== undefined && product.priceR !== null ? product.priceR.toFixed(2) : 'N/A', // Backend: priceR (or a specific buy_now_price field)
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
  padding-top: var(--navbar-height);
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

/* 桌面端标题样式 */
.products-section-title {
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
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  
  .products-section-title {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--color-text);
    margin: -2.8rem 0 1rem 0;
    padding: 0;
    text-align: left;
  }
}
</style>
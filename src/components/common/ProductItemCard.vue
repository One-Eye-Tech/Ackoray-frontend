<template>
  <router-link :to="{ name: 'ProductDetail', params: { id: productId } }" class="product-item-card-link">
    <div class="product-item-card">
      <div class="card-content-wrapper">
        <div class="image-container">
          <img :src="getFullImageUrl(imageUrl) || defaultImage" :alt="productNameId" class="product-image" />
        </div>
        <div class="info-container">
          <h4 class="product-name-id">{{ productNameId }}</h4>
          <p class="price-eth">{{ priceEth }} RMB</p>
        </div>
        <div v-if="buyNowPriceEth" class="buy-now-overlay">
          <span class="buy-now-text">{{ $t('products.buyNow') }}</span>
          <span class="buy-now-price">{{ buyNowPriceEth }} RMB</span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getFullImageUrl } from '../../api/apiConfig.js';

const { t } = useI18n();

const props = defineProps({
  id: [String, Number],
  imageUrl: String,
  productNameId: {
    type: String,
    required: true
  },
  priceEth: {
    type: [String, Number],
    required: true
  },
  lastSaleInfo: String,
  buyNowPriceEth: [String, Number]
});

const productId = computed(() => {
  return props.id ? String(props.id) : 'unknown';
});

const defaultImage = 'https://via.placeholder.com/200x200.png?text=Product';
</script>

<style scoped>
.product-item-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.product-item-card {
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s ease;
}

.card-content-wrapper {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-large);
  background-color: var(--color-card);
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
  z-index: 1;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-item-card:hover .card-content-wrapper {
  transform: translateY(-0.2rem);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-item-card:hover .price-eth {
  opacity: 0;
  visibility: hidden;
}

.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  position: relative;
  background-color: var(--color-card);
  border-bottom-left-radius: var(--border-radius-large);
  border-bottom-right-radius: var(--border-radius-large);
  height: 4.8rem;
}

.product-name-id {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  line-height: 1.2;
}

.price-eth {
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  transition: opacity 0.1s ease-out, visibility 0.1s ease-out;
}

.buy-now-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom-left-radius: var(--border-radius-large);
  border-bottom-right-radius: var(--border-radius-large);
  transform: translateY(100%);
  opacity: 0;
  visibility: hidden;
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s ease-out, visibility 0.3s ease-out;
  z-index: 5;
  box-sizing: border-box;
}

.product-item-card:hover .buy-now-overlay {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.buy-now-text {
  font-size: 0.95rem;
  font-weight: 500;
}

.buy-now-price {
  font-size: 1rem;
  font-weight: 500;
}

/* 移动端样式优化 */
@media (max-aspect-ratio: 1/1) {
  .info-container {
    padding: 0.7rem 0.5rem 0.5rem 0.5rem;
    height: 3.1rem;
  }
  
  .product-name-id {
    font-size: 0.7rem;
    line-height: 1;
    margin-bottom: 0.1rem;
    font-weight: 500;
  }
  
  .price-eth {
    font-size: 0.7rem;
    font-weight: 600;
    margin-top: 0;
  }
  
  .card-content-wrapper {
    box-shadow: none;
    border-radius: var(--border-radius-medium);
    width: 100%;
    margin-right: -1rem;
  }
  
  /* 移动端禁用悬浮效果 */
  .product-item-card:hover .card-content-wrapper {
    transform: none;
    box-shadow: none;
  }
  
  .product-item-card:hover .price-eth {
    opacity: 1;
    visibility: visible;
  }
  
  .product-item-card:hover .buy-now-overlay {
    transform: translateY(100%);
    opacity: 0;
    visibility: hidden;
  }
  
  .buy-now-overlay {
    display: none;
  }
}
</style> 
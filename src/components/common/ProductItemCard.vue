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
  lastSaleInfo: String
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


.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden; /* 防止图片内容超出容器 */
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持图片比例，填充整个容器 */
  object-position: center; /* 图片居中显示 */
  display: block; /* 移除默认的inline间距 */
}

.info-container {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  position: relative;
  background-color: var(--color-card);
  border-bottom-left-radius: var(--border-radius-large);
  border-bottom-right-radius: var(--border-radius-large);
  height: 7rem;
}

.product-name-id {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  line-height: 1.2;
  padding-top: 0.5rem;
}

.price-eth {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  color: var(--color-text);
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}


/* 移动端样式优化 */
@media (max-aspect-ratio: 1/1) {
  .info-container {
    padding: 0.8rem 0.2rem 0.5rem 0.2rem; /* 缩小左右内边距 */
    height: 3.3rem; /* 增加高度避免文字重叠 */
  }
  
  .product-name-id {
    font-size: 0.7rem;
    line-height: 1; /* 增加行高 */
    font-weight: 400;
    padding-top: 0; /* 移除桌面端的顶部内边距 */
  }
  
  .price-eth {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: -0.03rem;
    margin-top: auto; /* 将价格推到底部 */
    margin-bottom: 0; /* 移除桌面端的底部边距 */
  }
  
  .card-content-wrapper {
    box-shadow: none;
    border-radius: var(--border-radius-medium);
    border: none; /* 移除移动端描边 */
    width: 100%;
    margin-right: -1rem;
  }
  
  /* 移动端图片添加底部圆角 */
  .product-image {
    border-radius: var(--border-radius-medium);
  }
  
  /* 移动端禁用悬浮效果 */
  .product-item-card:hover .card-content-wrapper {
    transform: none;
    box-shadow: none;
  }
}
</style> 
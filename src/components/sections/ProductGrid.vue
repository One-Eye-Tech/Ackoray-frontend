<template>
  <div class="product-grid-container">
    <ProductItemCard
      v-for="product in products"
      :key="product.id"
      :id="product.id"
      :image-url="product.imageUrl"
      :product-name-id="product.productNameId"
      :price-eth="product.priceEth"
      :last-sale-info="product.lastSaleInfo"
      :buy-now-price-eth="product.buyNowPriceEth"
    />
  </div>
</template>

<script setup>
import ProductItemCard from '../common/ProductItemCard.vue';

defineProps({
  products: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped>
.product-grid-container {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(4, 1fr);
  background-color: var(--color-bg);
}

@media (max-aspect-ratio: 1/1) {
  .product-grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem; /* 缩小产品卡片之间的间距 */
    margin-top: -0.2rem;
  }
}
</style>
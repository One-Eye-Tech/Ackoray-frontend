<template>
  <div class="product-list-page">
    <FilterSidebar class="sidebar" />
    <div class="main-content">
      <ProductGrid />
    </div>
    <BatchActionBar />
  </div>
</template>

<script setup>
import FilterSidebar from '../components/layout/FilterSidebar.vue';
import ProductGrid from '../components/sections/ProductGrid.vue';
import BatchActionBar from '../components/sections/BatchActionBar.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.product-list-page {
  display: grid;
  grid-template-columns: 250px 1fr; /* Sidebar and main content */
  gap: 20px;
  padding: var(--container-padding);
  position: relative; /* For BatchActionBar positioning context */
  padding-bottom: 100px; /* Space for the fixed BatchActionBar */
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Responsive: Single column layout for smaller screens */
@media (max-aspect-ratio: 1/1) {
  .product-list-page {
    grid-template-columns: 1fr;
  }
  .sidebar {
    /* On small screens, sidebar might be a drawer or hidden by default */
    /* For now, let's assume it stacks or needs a toggle */
    display: none; /* Placeholder - real implementation would have a toggle */
  }
}
</style> 
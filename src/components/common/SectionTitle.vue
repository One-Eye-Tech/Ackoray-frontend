<template>
  <div class="section-title-container">
    <h2 class="main-title">{{ title }}</h2>
    <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.section-title-container {
  margin-bottom: 20px; /* 标题和内容之间的间距 */
  /* 根据需要可以添加 margin-top */
}

.main-title {
  font-size: 1.8rem; /* 示例大小，根据实际视觉调整 */
  color: var(--color-text-primary);
  font-weight: bold;
  margin-bottom: 4px; /* 主标题和副标题之间的间距 */
}

.subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-title {
    font-size: 1.5rem;
  }
  .subtitle {
    font-size: 0.9rem;
  }
}
</style> 
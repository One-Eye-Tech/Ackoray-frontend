<template>
  <footer class="site-footer">
    <p class="copyright-text">&copy; 2025 Ackoray. {{ $t('common.copyright') }}</p>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
// No additional script logic needed for this simple component
</script>

<style scoped>
.site-footer {
  width: 100%;
  padding: 20px var(--container-padding) 20px;
  text-align: center;
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border-subtle);
}

.copyright-text {
  color: var(--color-text);
  font-size: 0.875rem;
  margin: 0;
}

@media (max-aspect-ratio: 1/1) {
  .site-footer {
    display: none;
  }
}
</style> 
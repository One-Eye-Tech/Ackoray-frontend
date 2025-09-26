<template>
  <section class="hero-section">
    <div class="static-image-container">
      <img :src="heroImageUrl" alt="Hero background image" class="hero-background-image desktop-image"/>
      <img :src="mobileImageUrl" alt="Ackoray Logo" class="hero-background-image mobile-image"/>
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
import { useI18n } from 'vue-i18n';
import VerifiedIcon from '../../assets/icons/VerifiedIcon.vue';
import heroImage from '../../assets/images/1.png';
import mobileImage from '../../assets/images/ackoray.png';
import logoImage from '../../assets/images/ackoray.png';

const { t } = useI18n();
const heroImageUrl = heroImage;
const mobileImageUrl = mobileImage;
const logoImageUrl = logoImage;
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

.static-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 裁剪其子元素，包括 ::after */
  border-radius: inherit; /* 继承 .hero-section 的圆角 */
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

/* 默认显示桌面图片，隐藏移动端图片 */
.desktop-image {
  display: block;
}

.mobile-image {
  display: none;
}

.content-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 25px var(--container-padding) 25px 22px;
  background: transparent;
  color: white;
  z-index: 5;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  box-sizing: border-box;
  min-height: 60%;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
}
.main-info {
  max-width: 800px;
  margin-bottom: clamp(40px, 8vh, 80px);
}

.hero-title {
  font-size: clamp(1.2rem, 4vw, 2.2rem); /* Increased size */
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
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
    .hero-section {
      aspect-ratio: 1/1;
      max-height: 50vh;
      margin: 15px 15px;
      border-radius: 0.5rem;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
      
    }
    
    /* 移动端隐藏桌面图片，显示移动端图片 */
    .desktop-image {
      display: none;
    }
    
    .mobile-image {
      display: block;
    }
    
    /* 移动端隐藏内容覆盖层 */
    .content-overlay {
      display: none;
    }
}
</style>
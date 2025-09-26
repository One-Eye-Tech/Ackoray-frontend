<template>
  <div class="collection-card" @click="navigateToProduct">
    <img :src="collection.imageUrl" :alt="collection.name" class="card-image" />
    <div class="card-info-overlay">
      <div class="title-line">
        <h3 class="collection-name">{{ collection.name }}</h3>
        <!-- VerifiedIcon v-if="collection.isVerified" class="verified-icon" / --> <!-- 移除了 VerifiedIcon -->
      </div>
      <div class="stats-line">
        <span class="floor-price-value">{{ collection.floorPrice }} ￥</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'; // Import useRouter
import { useI18n } from 'vue-i18n';
// import VerifiedIcon from '../../assets/icons/VerifiedIcon.vue'; // VerifiedIcon 的导入可以注释掉或删除

const { t } = useI18n();

const props = defineProps({
  collection: {
    type: Object,
    required: true,
    default: () => ({
      name: t('common.unknown'),
      imageUrl: '/src/assets/images/placeholder-default.png',
      floorPrice: '--',
      priceChange: null, // priceChange 不再使用
      isVerified: false, // isVerified 属性仍然存在，但图标不再显示
    })
  }
});

const router = useRouter(); // Initialize router

const navigateToProduct = () => {
  if (props.collection && props.collection.id) {
    router.push({ name: 'ProductDetail', params: { id: props.collection.id.toString() } });
  } else {
    console.warn(t('errors.navigationMissing'), props.collection);
  }
};
</script>

<style scoped>
.collection-card {
  width: 270px; /* 调整宽度以配合3:4比例 */
  height: 360px; /* 调整高度 (270 * 4/3 = 360) */
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background-color: var(--color-surface-card, #2c2c2c);
  /* 移除 box-shadow */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); */
  transition: transform 0.25s ease-in-out; /* 移除了 box-shadow from transition */
  flex-shrink: 0;
  cursor: pointer;
}

.collection-card:hover {
  transform: translateY(-6px);
  /* 移除 hover 状态下的 box-shadow */
  /* box-shadow: 0 5px 15px rgba(0, 0, 0, 0.18); */
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片覆盖整个卡片区域 */
  display: block;
}

.card-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  /* padding: 16px; */ /* 原来的 padding */
  padding: 20px 16px 5px 16px; /* 修改后：上20px，左右16px，下10px */
  /* 修改背景渐变以移除底部阴影效果，使其更柔和或透明 */
  background: linear-gradient(to top, 
    rgba(0, 0, 0, 0.4) 0%,  /* 底部稍微暗一点以确保文字可读 */
    transparent 50%         /* 快速过渡到透明 */
  );
  color: var(--color-text-on-dark-primary, #ffffff);
}

.title-line {
  display: flex;
  align-items: center;
  gap: 8px;
  /* margin-bottom: 8px; */ /* 原来的 margin-bottom */
  margin-bottom: 1px; /* 修改后：缩小与价格的间距 */
}

.collection-name {
  font-size: 1rem; /* 修改字体大小，例如 16px */
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 超长时显示省略号 */
  flex-grow: 1;
}

/* .verified-icon 样式规则已移除，因为图标不再显示 */
/*
.verified-icon {
  width: 20px;
  height: 20px;
  color: var(--color-accent, #4dabf7); 
  flex-shrink: 0;
}
*/

.stats-line {
  display: flex;
  align-items: baseline;
  font-size: 0.95rem; /* 可以适当调整价格字体大小 */
  color: var(--color-text-on-dark-secondary, #e0e0e0);
  /* margin-top: 6px; */ /* 原来的 margin-top */
  margin-top: 0; /* 修改后：进一步缩小与名称的间距 */
}

/* 移除了 .floor-price-label 和 .price-change 相关样式 */

.floor-price-value {
  font-weight: 500;
  color: var(--color-text-on-dark-primary, #ffffff);
  /* 移除了 margin-right，因为现在只有价格 */
}

/* 确保 price-change.positive 和 price-change.negative 样式如果不再需要可以移除 */
.price-change.positive {
  color: var(--color-success, #69f0ae);
}

.price-change.negative {
  color: var(--color-error, #ff6b6b);
}
</style>
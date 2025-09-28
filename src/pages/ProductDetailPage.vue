<template>
  <div class="product-detail-page">
    <div v-if="loading" class="loading-indicator">
      <p>正在加载产品详情...</p>
    </div>
    <div v-else-if="error" class="error-indicator">
      <p>{{ error }}</p>
      <router-link to="/">返回首页</router-link>
    </div>
    <div v-else-if="product && product.id" class="detail-layout-container">
      <!-- Main content -->
      <div class="main-content">
        <!-- Left Column: Main Image -->
        <div class="product-image-gallery-section">
          <!-- 返回按钮和预览图在同一行 -->
          <div class="header-controls-row">
            <!-- 返回按钮 -->
            <button @click="$router.back()" class="back-btn-header">
              <svg viewBox="0 0 24 24" class="back-icon">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            
            <!-- 预览图条 -->
            <div class="thumbnail-strip-inline" v-if="product.images && product.images.length > 1">
              <div class="thumbnail-viewport" ref="viewportRef">
                <div class="thumbnail-content" :style="contentStyle" ref="contentRef">
                  <img
                    v-for="image in product.images"
                     :key="image.id"
                     :src="getFullImageUrl(image.imageUrl)"
                     :alt="`${product.name} thumbnail`"
                     class="thumbnail-image"
                     :class="{ active: product.images[currentImageIndex]?.id === image.id }"
                    @click="handleThumbnailClick(image)"
                  />
                </div>  
              </div>
            </div>
          </div>
          
          <!-- 主图片容器 -->
          <div 
            class="main-image-container"
            ref="imageContainerRef"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"
          >
            <img :src="getFullImageUrl(currentSelectedImageUrl) || defaultImageUrl" :alt="product.name || '产品图片'" class="main-product-image" @click="openImageZoom"/>
          </div>
        </div>

        <!-- Right Column: Product Info & Actions -->
<div class="product-info-section">
    <!-- 产品名称和价格 - 水平布局，同一行 -->
    <div class="title-price-section">
      <h1 class="product-title">{{ product.name }}</h1>
      <span class="current-price">{{ product.priceR ? Math.round(product.priceR) : 'N/A' }} RMB</span>
    </div>

    <!-- Box 5: Selectors -->
  <div class="info-section-box">
    <div class="color-selector section">
      <span class="selector-label">{{ t('product.colorLabel', '颜色') }} - {{ selectedColor ? selectedColor.name : t('product.selectColorPrompt', '请选择颜色') }}</span>
    </div>
    
    <hr class="card-divider">

    <div class="size-selector section">
      <span class="selector-label">{{ t('product.sizeLabel', '尺码') }} - {{ selectedSize ? selectedSize.name : t('product.selectSizePrompt', '请选择尺码') }}</span>
      
      <!-- 尺码选择和数量控制容器 -->
      <div class="size-selection-row">
        <!-- 减号按钮 -->
        <button 
          class="step-btn decrease-btn" 
          @click="decreaseSizeQuantity(selectedSize?.id)" 
          :disabled="!selectedSize || getSizeQuantity(selectedSize?.id) <= 0"
        >
          <img :src="jianIcon" alt="-" class="step-icon" />
        </button>
        
        <!-- 尺码按钮组 -->
        <div class="size-options">
          <button 
            v-for="size in availableSizes" 
            :key="size.id"
            :class="['size-btn', { active: selectedSize && selectedSize.id === size.id }]"
            @click="selectSize(size)"
            :disabled="!getVariantStock(size.id).available"
          >
            {{ size.name }}
            <span 
              v-if="getSizeQuantity(size.id) > 0" 
              class="size-quantity-badge"
            >
              {{ getSizeQuantity(size.id) }}
            </span>
          </button>
        </div>
        
        <!-- 加号按钮 -->
        <button 
          class="step-btn increase-btn" 
          @click="increaseSizeQuantity(selectedSize?.id)"
          :disabled="!selectedSize"
        >
          <img :src="addIcon" alt="+" class="step-icon" />
        </button>
      </div>
    </div>
  </div>


  <!-- Box 3: Collapsible Fabric Information -->
  <div class="info-section-box">
    <!-- 可点击的头部，用于展开/折叠 -->
    <div class="collapsible-header" @click="toggleFabricInfo">
      <span class="selector-label">{{ t('products.description', '产品介绍') }}</span>
      <!-- 箭头图标，会根据状态旋转 -->
      <div class="chevron-icon" :class="{ 'expanded': isFabricInfoExpanded }">
        <ArrowRightIcon />
      </div>
    </div>
    <!-- 可折叠的内容，使用 v-if 控制显示 -->
    <div v-if="isFabricInfoExpanded" class="fabric-info-content">
      <img :src="productInfoImage" alt="产品介绍" class="fabric-image"/>
    </div>
  </div>

    <!-- Box 4: Collapsible Fabric Information -->
  <div class="info-section-box">
    <!-- 可点击的头部，用于展开/折叠 -->
    <div class="collapsible-header" @click="toggleCareInstructions">
      <span class="selector-label">{{ t('products.fabric', '面料介绍') }}</span>
      <!-- 箭头图标，会根据状态旋转 -->
      <div class="chevron-icon" :class="{ 'expanded': isCareInstructionsExpanded }">
        <ArrowRightIcon />
      </div>
    </div>
    <!-- 可折叠的内容，使用 v-if 控制显示 -->
    <div v-if="isCareInstructionsExpanded" class="fabric-info-content">
      <img :src="fabricInfoImage" alt="面料介绍" class="fabric-image"/>
    </div>
  </div>

    <!-- 新增：尺码参考边框 -->
  <div class="info-section-box">
    <div class="collapsible-header" @click="toggleSizeGuide">
      <span class="selector-label">{{ t('product.sizeGuideLabel', '尺码参考') }}</span>
      <div class="chevron-icon" :class="{ 'expanded': isSizeGuideExpanded }">
        <ArrowRightIcon />
      </div>
    </div>
    <div v-if="isSizeGuideExpanded" class="fabric-info-content">
      <!-- 这里我们直接使用了您代码中已有的 sizeChartImageUrl 变量 -->
      <img :src="sizeChartImageUrl" alt="尺码参考" class="fabric-image"/>
    </div>
  </div>
  

  <!-- Box 6: Actions & Price -->
  <div class="actions-box">
    <div class="action-buttons-container">
      <button 
        class="btn btn-primary"
        @click="handleBuyNow"
        :disabled="!selectedColor || !selectedSize || !getVariantStock(selectedSize?.id).available"
      >
        {{ t('product.buyNow', '立即购买') }}
      </button>
      <button 
        class="btn btn-secondary"
        @click="handleAddToCart"
        :disabled="!selectedColor || !selectedSize || !getVariantStock(selectedSize?.id).available"
      >
        {{ t('product.addToCart', '加入购物车') }}
      </button>
    </div>
    <p v-if="selectedColor && selectedSize && getVariantStock(selectedSize.id).stock === 0" class="out-of-stock-message">
        抱歉，该颜色尺码组合当前无货。
    </p>
  </div>

</div>

      </div>
    </div>
    <div v-else class="empty-product-indicator">
      <p>未能加载产品信息。</p>
      <router-link to="/">返回首页</router-link>
    </div>

    <div v-if="isSizeGuideModalOpen" class="modal-overlay" @click.stop="closeSizeGuideModal">
      <div class="modal-panel" @click.stop>
        <button class="modal-close-btn" @click="closeSizeGuideModal" aria-label="Close size guide">
          &times;
        </button>
        <h3 class="modal-title">尺码指南</h3>
        <div class="modal-content">
          <img :src="sizeChartImageUrl" alt="Size chart" class="size-chart-image" />
          <p>请参考具体产品说明或联系客服获取更准确的尺码信息。</p>
        </div>
      </div>
    </div>

    <!-- 图片放大层 -->
    <div v-if="isImageZoomed" class="image-zoom-overlay" @click="closeImageZoom">
      <img :src="currentSelectedImageUrl" :alt="product.name" class="zoomed-image" @click.stop />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject, watch, nextTick, onUnmounted, onUpdated} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ArrowLeftIcon from '../assets/icons/ArrowLeftIcon.vue';
import ArrowRightIcon from '../assets/icons/ArrowRightIcon.vue';
import { getProductByIdApi } from '../api/productApi';
import { isLoggedIn } from '../api/authApi';
import { getFullImageUrl } from '../api/apiConfig.js';

// 静态资源导入
import productInfoImage from '../assets/images/cp1.png';
import fabricInfoImage from '../assets/images/cp2.png';
import menSizeChartImage from '../assets/images/men.png';
import womenSizeChartImage from '../assets/images/women.png';
import addIcon from '../assets/icons/add.png';
import jianIcon from '../assets/icons/jian.png';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const isFabricInfoExpanded = ref(false); // 第一个折叠框的状态
const isCareInstructionsExpanded = ref(false); // 新增：第二个折叠框的状态
const isSizeGuideExpanded = ref(false);

const toggleFabricInfo = () => {
  isFabricInfoExpanded.value = !isFabricInfoExpanded.value;
};

const toggleCareInstructions = () => { // 新增：第二个折叠框的开关函数
  isCareInstructionsExpanded.value = !isCareInstructionsExpanded.value;
};

const toggleSizeGuide = () => { // 新增：尺码参考的开关函数
  isSizeGuideExpanded.value = !isSizeGuideExpanded.value;
};

const product = ref(null);
const loading = ref(true);
const error = ref(null);

const currentSelectedImageUrl = ref('');
const currentImageIndex = ref(0);
const isSizeGuideModalOpen = ref(false);

const isImageZoomed = ref(false);

const openImageZoom = () => {
  isImageZoomed.value = true;
};

const closeImageZoom = () => {
  isImageZoomed.value = false;
};

const selectedColor = ref(null);
const selectedSize = ref(null);
const availableColors = ref([]);
const availableSizes = ref([]);
// 尺码数量状态管理
const sizeQuantities = ref({}); // 存储每个尺码的数量，格式：{ sizeId: quantity }

const defaultImageUrl = 'https://via.placeholder.com/700x700.png?text=Product+Not+Found';

// --- Final & Correct Scroller Logic ---
const viewportRef = ref(null);
const contentRef = ref(null);
const scrollPosition = ref(0);
const viewportWidth = ref(0);
const contentWidth = ref(0);

// 滑动切换图片相关的变量
const imageContainerRef = ref(null);
const startX = ref(0);
const endX = ref(0);
const isDragging = ref(false);
const minSwipeDistance = ref(50); // 最小滑动距离阈值

// --- 动态尺码表逻辑 ---
const sizeChartImageUrl = computed(() => {
  
  const id = product.value.id;
  if (id === 1 || id === 4) {
    return menSizeChartImage;
  }
  if (id === 2 || id === 3) {
    return womenSizeChartImage;
  }

  // 如果 id 不是1, 2, 3, 4，则返回女性尺码表作为默认
  return womenSizeChartImage;
});

// 这个计算属性根据滚动位置来移动图片容器
const contentStyle = computed(() => ({
  transform: `translateX(${scrollPosition.value}px)`,
  transition: 'transform 0.4s ease-in-out'
}));

// 定义一个函数，用于测量视口和内容的总宽度
const updateWidths = () => {
  if (viewportRef.value && contentRef.value) {
    viewportWidth.value = viewportRef.value.clientWidth;
    contentWidth.value = contentRef.value.scrollWidth;
  }
};

// 这是最关键的修复：我们侦听产品图片列表的变化
watch(() => product.value?.images, (newImages) => {
  // 当图片列表加载或变化后...
  if (newImages && newImages.length > 0) {
    // 1. 先重置滚动位置
    scrollPosition.value = 0;
    
    // 2. 使用 nextTick 等待 Vue 完成 DOM 的更新（即等待图片被渲染出来）
    nextTick(() => {
      // 3. 在 DOM 更新后，我们才去测量新的、正确的宽度
      updateWidths();
    });
  }
}, { 
  deep: true,       // 深度侦听，确保内部变化也能被捕获
  immediate: true   // 立即执行一次，确保组件初次加载时就能正确测量
});

// 让滚动条在窗口大小变化时也能自适应
onMounted(() => {

  window.addEventListener('resize', updateWidths);
});

onUnmounted(() => {

  window.removeEventListener('resize', updateWidths);
});
// --- End of Final & Correct Scroller Logic ---


// 从产品变体中提取唯一的颜色和尺码
const extractColorsAndSizes = (variants) => {
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    availableColors.value = [];
    availableSizes.value = [];
    return;
  }
  
  // 提取颜色
  const colorMap = new Map();
  variants.forEach(variant => {
    if (variant.colorId && !colorMap.has(variant.colorId)) {
      colorMap.set(variant.colorId, {
        id: variant.colorId,
        name: variant.colorName || `颜色 ${variant.colorId}`,
        value: '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase() // 生成随机颜色，因为后端没有提供 colorValue
      });
    }
  });
  availableColors.value = Array.from(colorMap.values());
  
  // 提取尺码
  const sizeMap = new Map();
  variants.forEach(variant => {
    if (variant.sizeId && !sizeMap.has(variant.sizeId)) {
      sizeMap.set(variant.sizeId, {
        id: variant.sizeId,
        name: variant.sizeName || `尺码 ${variant.sizeId}`,
        orderIndex: variant.sizeId // 使用 ID 作为排序索引，因为后端没有提供 orderIndex
      });
    }
  });
  availableSizes.value = Array.from(sizeMap.values())
    .sort((a, b) => a.orderIndex - b.orderIndex);
};

const fetchProductDetails = async (id) => {
  const productIdNumber = Number(id);
  if (!id || isNaN(productIdNumber) || productIdNumber <= 0) {
    error.value = t('product.invalidId', '无效的产品ID。');
    loading.value = false;
    product.value = null;
    console.error('无效的产品 ID:', id);
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const data = await getProductByIdApi(productIdNumber.toString());
    product.value = data;

    if (data) {
      // 从变体中提取颜色和尺码
      extractColorsAndSizes(data.variants);
      
      // 默认选择第一个颜色和尺码
      if (availableColors.value.length > 0) {
        selectedColor.value = availableColors.value[0];
      } else {
        selectedColor.value = null;
      }
      
      if (availableSizes.value.length > 0) {
        // 尝试找到有库存的尺码
        const availableSize = availableSizes.value.find(size => 
          getVariantStock(size.id).available);
        selectedSize.value = availableSize || availableSizes.value[0];
      } else {
        selectedSize.value = null;
      }
      
      currentImageIndex.value = 0; 
      updateCurrentImage(); 
    } else {
      error.value = t('product.notFound', '产品未找到。');
      product.value = null;
    }
  } catch (err) {
    console.error(`获取产品详情失败 (ID: ${productIdNumber}):`, err);
    error.value = err.message || t('product.loadError', '加载产品详情时出错。');
    product.value = null;
  } finally {
    loading.value = false;
  }
};

const updateCurrentImage = () => {
  if (product.value && product.value.images && product.value.images.length > 0) {
    const imageObject = product.value.images[currentImageIndex.value];
    currentSelectedImageUrl.value = imageObject?.imageUrl || product.value.mainImageUrl || defaultImageUrl;
  } else if (product.value && product.value.mainImageUrl) {
    currentSelectedImageUrl.value = product.value.mainImageUrl;
  } else {
    currentSelectedImageUrl.value = defaultImageUrl;
  }
};

const nextImage = () => {
  if (product.value && product.value.images && product.value.images.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % product.value.images.length;
    updateCurrentImage();
  }
};

const previousImage = () => {
  if (product.value && product.value.images && product.value.images.length > 1) {
    currentImageIndex.value = (currentImageIndex.value - 1 + product.value.images.length) % product.value.images.length;
    updateCurrentImage();
  }
};

const handleThumbnailClick = (image) => {
  const originalIndex = product.value.images.findIndex(img => img.id === image.id);
  if (originalIndex !== -1) {
    currentImageIndex.value = originalIndex;
    updateCurrentImage();
  }
};

// 触摸事件处理 (移动端)
const handleTouchStart = (event) => {
  startX.value = event.touches[0].clientX;
  isDragging.value = true;
};

const handleTouchMove = (event) => {
  if (!isDragging.value) return;
  // 阻止页面滚动
  event.preventDefault();
};

const handleTouchEnd = (event) => {
  if (!isDragging.value) return;
  endX.value = event.changedTouches[0].clientX;
  handleSwipe();
  isDragging.value = false;
};

// 鼠标事件处理 (桌面端)
const handleMouseDown = (event) => {
  startX.value = event.clientX;
  isDragging.value = true;
  // 阻止图片被拖拽
  event.preventDefault();
};

const handleMouseMove = (event) => {
  if (!isDragging.value) return;
  // 可以在这里添加视觉反馈，比如改变光标样式
  event.preventDefault();
};

const handleMouseUp = (event) => {
  if (!isDragging.value) return;
  endX.value = event.clientX;
  handleSwipe();
  isDragging.value = false;
};

const handleMouseLeave = () => {
  // 如果鼠标离开容器，停止拖拽
  isDragging.value = false;
};

// 处理滑动逻辑
const handleSwipe = () => {
  if (!product.value?.images || product.value.images.length <= 1) return;
  
  const swipeDistance = startX.value - endX.value;
  const absSwipeDistance = Math.abs(swipeDistance);
  
  // 只有滑动距离超过最小值才触发切换
  if (absSwipeDistance > minSwipeDistance.value) {
    if (swipeDistance > 0) {
      // 向左滑动，显示下一张图片
      nextImage();
    } else {
      // 向右滑动，显示上一张图片
      previousImage();
    }
  }
};

const selectColor = (color) => {
  selectedColor.value = color;
  // 重新检查当前选择的尺码在新颜色下是否可用
  if (selectedSize.value && !getVariantStock(selectedSize.value.id).available) {
    // 如果当前尺码不可用，尝试选择一个可用的尺码
    const availableSize = availableSizes.value.find(size => getVariantStock(size.id).available);
    selectedSize.value = availableSize || selectedSize.value; // 如果没有可用尺码，保持当前选择
  }
};

const selectSize = (size) => {
  if (getVariantStock(size.id).available) {
    selectedSize.value = size;
    // 如果该尺码还没有数量记录，初始化为0
    if (!sizeQuantities.value[size.id]) {
      sizeQuantities.value[size.id] = 0;
    }
  }
};

// 增加尺码数量
const increaseSizeQuantity = (sizeId) => {
  if (!sizeId) return; // 如果没有选中尺码，直接返回
  if (!sizeQuantities.value[sizeId]) {
    sizeQuantities.value[sizeId] = 0;
  }
  sizeQuantities.value[sizeId]++;
};

// 减少尺码数量
const decreaseSizeQuantity = (sizeId) => {
  if (!sizeId) return; // 如果没有选中尺码，直接返回
  if (sizeQuantities.value[sizeId] && sizeQuantities.value[sizeId] > 0) {
    sizeQuantities.value[sizeId]--;
  }
};

// 获取尺码数量
const getSizeQuantity = (sizeId) => {
  return sizeQuantities.value[sizeId] || 0;
};

// 获取特定尺码的库存信息
const getVariantStock = (sizeId) => {
  if (!product.value || !product.value.variants || !selectedColor.value || !sizeId) {
    return { available: false, stock: 0 };
  }
  const variant = product.value.variants.find(v => 
    v.colorId === selectedColor.value.id && v.sizeId === sizeId && v.isActive);
  if (variant) {
    // 确保 stockQuantity 是数字
    const stock = typeof variant.stockQuantity === 'number' ? variant.stockQuantity : 
                 (parseInt(variant.stockQuantity, 10) || 0);
    return { available: stock > 0, stock: stock };
  }
  return { available: false, stock: 0 };
};

const openSizeGuideModal = () => { isSizeGuideModalOpen.value = true; };
const closeSizeGuideModal = () => { isSizeGuideModalOpen.value = false; };

const addToCart = inject('addToCart');
const toggleCart = inject('toggleCart');

// 查找产品变体ID
const findProductVariantId = (colorId, sizeId) => {
  if (!product.value || !product.value.variants || !colorId || !sizeId) {
    return null;
  }
  const variant = product.value.variants.find(v => v.colorId === colorId && v.sizeId === sizeId && v.isActive);
  return variant ? variant.id : null;
};

const handleAddToCart = () => {
  // 1. 判断用户是否登录
  if (!isLoggedIn()) {
    alert('请先登录后再添加商品到购物车');
    return;
  }

  // 2. 判断是否选择了尺码
  if (!selectedSize.value) { 
    alert('请选择尺码');
    return;
  }

  // 3. 判断是否选择了数量
  const currentQuantity = getSizeQuantity(selectedSize.value.id);
  if (currentQuantity <= 0) {
    alert('请选择数量');
    return;
  }

  if (!product.value || !product.value.id) {
    alert(t('product.dataError', '产品数据不完整。'));
    return;
  }
  if (!selectedColor.value) {
    alert(t('product.selectColorPrompt', '请选择颜色。'));
    return;
  }
  
  // 检查库存
  if (!getVariantStock(selectedSize.value.id).available) {
    alert(t('product.outOfStock', '抱歉，此颜色尺码组合无库存。'));
    return;
  }
  
  // 查找变体ID
  const variantId = findProductVariantId(selectedColor.value.id, selectedSize.value.id);
  
  const itemToAdd = {
    id: product.value.id,
    name: product.value.name,
    price: product.value.priceR,
    imageUrl: currentSelectedImageUrl.value,
    color: selectedColor.value ? selectedColor.value.name : undefined, 
    size: selectedSize.value ? selectedSize.value.name : undefined,
    productVariantId: variantId,
    quantity: currentQuantity, // 添加数量
    permalink: `/product/${product.value.id}`
  };
  addToCart(itemToAdd);
  if (toggleCart) {
    toggleCart();
  }
};

const handleBuyNow = () => {
  // 1. 判断用户是否登录
  if (!isLoggedIn()) {
    alert('请先登录后再进行购买');
    return;
  }

  // 2. 判断是否选择了尺码
  if (!selectedSize.value) {
    alert('请选择尺码');
    return;
  }

  // 3. 判断是否选择了数量
  const currentQuantity = getSizeQuantity(selectedSize.value.id);
  if (currentQuantity <= 0) {
    alert('请选择数量');
    return;
  }

  if (!product.value || !product.value.id) {
    alert(t('product.dataError', '产品数据不完整。'));
    return;
  }
  if (!selectedColor.value) {
    alert(t('product.selectColorPrompt', '请选择颜色。'));
    return;
  }
  
  // 检查库存
  if (!getVariantStock(selectedSize.value.id).available) {
    alert(t('product.outOfStock', '抱歉，此颜色尺码组合无库存。'));
    return;
  }
  
  // 查找变体ID
  const variantId = findProductVariantId(selectedColor.value.id, selectedSize.value.id);
  
  const itemToBuy = {
    id: product.value.id,
    name: product.value.name,
    price: product.value.priceR,
    imageUrl: currentSelectedImageUrl.value,
    color: selectedColor.value ? selectedColor.value.name : undefined,
    size: selectedSize.value ? selectedSize.value.name : undefined,
    productVariantId: variantId,
    quantity: currentQuantity, // 使用实际选择的数量
    permalink: `/product/${product.value.id}`
  };
  sessionStorage.setItem('directBuyItem', JSON.stringify(itemToBuy));
  router.push({ name: 'Checkout' });
};

onMounted(() => {
  const currentRouteId = route.params.id;
  const productIdNumber = Number(currentRouteId);

  if (currentRouteId && !isNaN(productIdNumber) && productIdNumber > 0) {
    fetchProductDetails(productIdNumber.toString());
  } else {
    error.value = t('product.noIdInRoute', '未在路由中找到有效的产品ID。');
    console.error('路由中未找到有效的产品 ID:', currentRouteId);
    loading.value = false;
    product.value = null; 
  }
});

watch(() => route.params.id, (newRouteId, oldRouteId) => {
  if (newRouteId && newRouteId !== oldRouteId) {
    const newProductIdNumber = Number(newRouteId);
    if (newRouteId && !isNaN(newProductIdNumber) && newProductIdNumber > 0) {
        fetchProductDetails(newProductIdNumber.toString());
    } else {
        error.value = t('product.invalidIdOnChange', '路由参数中的产品ID无效。');
        console.error('路由参数中的产品 ID 无效:', newRouteId);
        loading.value = false;
        product.value = null; 
    }
  }
});
</script>

<style scoped>
.product-detail-page {
  background-color: var(--color-bg);
  min-height: 100vh;
  color: var(--color-text);
}

.loading-indicator,
.error-indicator,
.empty-product-indicator {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}
.error-indicator p,
.empty-product-indicator p {
  margin-bottom: 1rem;
}
.error-indicator a,
.empty-product-indicator a {
  color: var(--color-primary);
  text-decoration: underline;
}

.detail-layout-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}
/* --- 头部控制行样式（返回按钮+预览图同一行）--- */
.header-controls-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
  margin-top: -1.5rem;
  padding: 0rem;
}

/* --- 内联预览图条样式 --- */
.thumbnail-strip-inline {
  flex: 1;
  display: flex;
  justify-content: center;
  margin-left: -8rem; /* 抵消返回按钮的宽度，实现真正居中 */
  position: relative;
  z-index: 1; /* 确保预览图在按钮下层 */
}

.thumbnail-viewport {
  overflow: hidden;
  min-width: 0;
}

.thumbnail-content {
  display: flex;
  gap: 0.5rem;
}

.thumbnail-image {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 6px;
  background-color: var(--color-border);
  cursor: pointer;
  transition: opacity 0.2s ease;
  background-image: url(addIcon);
  flex-shrink: 0;
  opacity: 0.6;
}

.thumbnail-image:hover {
  opacity: 1;
}

.thumbnail-image.active {
  opacity: 1;
}

.thumb-nav-btn {
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.thumb-nav-btn:hover {
  background-color: var(--color-surface);
}

.thumb-nav-btn svg {
  width: 16px;
  height: 16px;
}
.thumbnail-strip::-webkit-scrollbar {
  display: none;
}
.thumbnail-strip::-webkit-scrollbar-thumb {
  background-color: var(--color-primary);
  border-radius: 3px;
}
.thumbnail-strip::-webkit-scrollbar-track {
  background: transparent;
}

.main-content {
  display: flex;
  flex: 1;
  /* 这是修复 Flexbox 布局下子元素无法滚动的最关键属性 */
  min-height: 0;
  /* 确保主内容区域占满整个视口高度，让分隔线延长到底部 */
  min-height: 100vh;
}

.product-image-gallery-section {
  flex: 1 1 50%;
  min-width: 320px;
  background-color: var(--color-card);
  padding: 1rem 2.5rem;
  display: flex;
  flex-direction: column; /* 改为垂直布局 */
  box-sizing: border-box;
  position: relative; /* 改为relative，以便返回按钮可以绝对定位 */
  /* --- 新增：粘性定位逻辑 --- */
  position: sticky;
  /* 它的顶部会粘在导航栏的下方 */
  top: var(--navbar-height, 50px);
  /* 它的高度将占满视口的剩余空间 */
  height: calc(93vh - var(--navbar-height, 50px));
  /* 移除粘性定位，使用正常布局 */
}

.main-image-container {
  width: 100%;
  position: relative;
  box-sizing: border-box;
  max-width: 100%; 
  margin: 0 auto;
  aspect-ratio: 1 / 1; /* 创建一个方形的约束框 */
  display: flex;         /* 使用flex布局来居中内部的图片 */
  align-items: center;
  justify-content: center;
  height: 92%;
}
.main-product-image {
  max-width: 100%; 
  max-height: 100%;
  object-fit: contain; /* 让图片等比缩放以适应容器 */
  border-radius: var(--border-radius-medium);
  background-color: var(--color-border);
}

/* 图片容器滑动切换样式 */
.main-image-container {
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.main-image-container:active {
  cursor: grabbing;
}

.main-image-container .main-product-image {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  cursor: zoom-in;
  transition: transform 0.2s ease;
}

/* Back button header styles */
.back-btn-header {
  width: 42px;
  height: 42px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  flex-shrink: 0;
  margin-left: 4.2rem;
  position: relative;
  z-index: 10; /* 确保按钮在最上层 */
}

.back-btn-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.back-btn-header .back-icon {
  width: 24px;
  height: 24px;
  color: var(--color-text);
}
.product-info-section {
  flex: 1 1 50%;
  padding: 7.4rem 5rem 2.5rem 4rem; /* 进一步增大顶部间距，将信息部分整体向下移动 */
  box-sizing: border-box;
  border-left: 1px solid var(--color-border); /* 分隔线 */

  display: flex;
  flex-direction: column;
  gap: 1rem;

  /* --- 核心：只保留这一行来实现带滚动条的滚动 --- */
  overflow-y: auto;
  
  /* 将所有文字设置为Poppins字体 */
  font-family: 'Poppins', sans-serif;
  
  /* 确保信息区域至少占满视口高度，让分隔线延长到底部 */
  min-height: 100vh;
}

/* 保持这个独立的规则，以兼容 Chrome/Safari */
.product-info-section::-webkit-scrollbar {
  display: none;
}

.product-title {
  font-size: 2rem;
  font-weight: 600; 
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
}

.product-description {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}
.description-section { 
  display: flex; 
  flex-direction: column; 
  gap: 0.8rem; 
}

.section { 
  display: flex; 
  flex-direction: column; 
  gap: 0.8rem; 
}

.selector-label {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
}

/* New styles for text-based color options */
.color-options-text {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem; /* Wider gap for text */
}

.color-option {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.2s ease;
  position: relative;
  padding-bottom: 4px;
}
.color-option::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-primary);
  transform: scaleX(0);
  transition: transform 0.2s ease-in-out;
}
.color-option.selected {
  color: var(--color-primary);
}
.color-option.selected::after {
  transform: scaleX(1);
}


/* 尺码选择行：左右+-按钮 + 中间尺码 - 靠左对齐 */
.size-selection-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: flex-start; /* 靠左对齐 */
  width: fit-content; /* 不占满整个宽度 */
}

.size-options {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.step-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-card);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.step-btn:hover, .step-btn:active, .step-btn:focus {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary), transparent 95%);
  outline: none;
}

.step-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0); /* 将图标变为黑色 */
}

/* 尺码按钮样式 */
.size-btn {
  position: relative;
  width: 45px;
  height: 45px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium);
  background: var(--color-card);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.size-btn:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary), transparent 95%);
}

.size-btn.active {
  border-color: var(--color-primary);
  background: var(--color-card);
  color: var(--color-text);
}

.size-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 尺码数量标记 */
.size-quantity-badge {
  position: absolute;
  top: -0.4rem;
  right: -0.4rem;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  width: 1.2rem;
  height: 1.2rem;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.2rem;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
  padding-top: 1px;
}

.card-divider {
  border: none;
  height: 1px;
  background-color: var(--color-border-subtle);
  margin: 1.2rem 0;
}

.price-section { 
  text-align: center; /* 价格左右居中 */
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.current-price {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--color-primary);
}

.actions-box {
  border: none; /* 删除外层边框 */
  background-color: transparent;
  padding: 0;
  margin: 1.5rem 0;
}

.action-buttons-container {
  display: flex;
  flex-direction: column; /* 上下布局 */
  gap: 1.5rem; /* 增大两个按钮间距 */
}
.btn {
  padding: 1rem 1.2rem;
  border-radius: var(--border-radius-medium);
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  font-size: 1rem;
  width: 100%; /* 让按钮占满容器宽度 */
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

/* 新增：次要按钮样式 */
.btn-secondary {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.out-of-stock-message {
  color: var(--color-negative);
  font-size: 0.9em;
  text-align: right;
  margin-top: -0.5rem; /* Pull it closer to the button */
}

/* Remove previously added styles that are no longer needed */
.info-sections-wrapper,
.info-section-header,
.info-section-content,
.header-icon,
.chevron-icon {
  display: none;
}

@media (max-width: 992px) { 
  .main-content {
    flex-direction: column;
    padding-top: 0;
  }
  .product-info-section { 
    flex: 1 1 100%;
    max-width: none;
    /* 新增：在小屏幕上重置粘性和高度，恢复正常滚动 */
    position: static;
    height: auto;
    overflow-y: visible;
  }
  .product-info-section {
    border-left: none;
    border-top: 1px solid var(--color-border-subtle, #303133);
  }
}
@media (max-width: 767px) {

  .product-info-section { 
    gap: 0.7rem; 
    padding: 1.5rem;
  }
  .product-title { font-size: 1.5rem; }
  .current-price { font-size: 1.3rem; }
  .action-buttons-container { flex-direction: column; gap: 1.2rem; }
  .modal-panel { width: 85vw; max-width: none; padding: 1rem; }
  .size-buttons, .color-buttons { gap: 0.5rem; }
  .size-btn, .color-btn { padding: 0.5rem 0.8rem; font-size: 0.8rem; }
  .thumbnail-image {
    width: 60px;
    height: 60px;
  }
}

.combined-btn {
  display: flex;
  padding: 0;
  overflow: hidden;
  width: 100%;
  max-width: 700px;
}

.buy-now-part {
  flex: 9;
  padding: 0.85rem 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  transition: background-color 0.2s ease;
}

.buy-now-part:hover {
  background-color: var(--color-accent-hover);
}

.divider-line {
  width: 1px;
  background-color: var(--color-surface);
}

.add-cart-part {
  flex: 1;
  padding: 0.85rem 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  transition: background-color 0.2s ease;
}

.add-cart-part:hover {
  background-color: var(--color-accent-hover);
}
   .add-cart-part svg {
     width: 20px;
     height: 20px;
   }

   @media (max-width: 768px) {
     .buy-now-part {
       padding: 0.75rem 1rem;
     }
     .add-cart-part {
       padding: 0.75rem;
     }
   }

/* --- Styles for Image Zoom --- */
.image-zoom-overlay {
  position: fixed; /* 使用 fixed 定位来覆盖整个浏览器窗口 */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85); /* 深色半透明的遮罩层 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000; /* 设置一个非常高的层级，确保它在所有内容的上方 */
  cursor: pointer; /* 提示用户遮罩层是可点击的（用于关闭） */
}

.zoomed-image {
  max-width: 90vw;   /* 限制放大后图片的最大宽度为屏幕宽度的90% */
  max-height: 90vh;  /* 限制放大后图片的最大高度为屏幕高度的90% */
  object-fit: contain; /* 确保图片等比缩放，不变形 */
  border-radius: var(--border-radius-medium, 8px);
  cursor: default; /* 恢复图片的默认鼠标样式 */
}

/* --- Styles for Info Section Boxes --- */
.info-sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 1.5rem 0;
}

.info-section-box {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--border-radius-medium, 6px);
  background-color: var(--color-card);
  padding: 1.2rem 1rem;
  margin: 0.5rem 0; /* 增加统一的上下间距 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
}

.header-icon, .chevron-icon {
  color: var(--color-text-secondary);
}

.info-section-content {
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--color-border-subtle);
}

/* For the selectors box, create a gap between color and size */
.info-section-content .color-selector + .size-selector {
  margin-top: 1.5rem;
}

/* Remove default margin from the description paragraph */
.info-section-content .product-description {
  margin: 0;
}

/* We don't need the default <hr> dividers anymore */
.product-info-section > .divider.tight-divider {
  display: none;
}

.collapsible-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;
}

.fabric-info-content {
  margin-top: 1.2rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--color-border-subtle);
}

.fabric-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--border-radius-small); /* 给图片一个轻微的圆角 */
}

/* 确保箭头图标显示出来 */
.chevron-icon {
  color: var(--color-text-secondary);
  transition: transform 0.3s ease-in-out;
  display: flex; /* 确保图标正确渲染 */
  align-items: center;
}

/* 展开时旋转箭头 */
.chevron-icon.expanded {
  transform: rotate(90deg);
}

/* 产品名称和价格垂直布局 */
.title-price-section {
  display: flex;
  flex-direction: row; /* 水平布局 */
  justify-content: space-between; /* 名称靠左，价格靠右 */
  align-items: center; /* 垂直居中对齐 */
  gap: 1rem;
  margin-bottom: 1rem;
}

.title-price-section .product-title {
  font-size: 2rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
  font-family: 'Poppins', sans-serif;
}

.title-price-section .current-price {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-primary); /* 使用主题紫色 */
  font-family: 'Poppins', sans-serif;
  flex-shrink: 0; /* 防止价格被压缩 */
}

/* 移动端样式优化 */
@media (max-aspect-ratio: 1/1) {

  .product-image-gallery-section {
    flex: none;
    width: 100%;
    padding: 0.6rem 1rem 0.6rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    position: relative;
    background-color: var(--color-bg);
    position: sticky;
    /* 它的顶部会粘在导航栏的下方 */
    top: var(--navbar-height) - var(--navbar-height);
    /* 它的高度将占满视口的剩余空间 */
    height: calc(93vh - var(--navbar-height)) - calc(93vh - var(--navbar-height));
  }
  .header-controls-row {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    margin-top: 0.1rem;
    margin-left: -4.3rem;
    padding: 0 0.1rem;
    justify-content: flex-start;
  }
  
  .thumbnail-strip-inline {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    margin-left: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0;
    gap: 0.5rem;
  }
  
  .thumbnail-strip-inline::-webkit-scrollbar {
    display: none;
  }
  
  .thumbnail-image {
    width: 34px;
    height: 34px;
    border-radius: 7px;
    flex-shrink: 0;
    cursor: pointer;
  }
  
  .back-btn-header {
    width: 34px;
    height: 34px;
    border-radius: 7px;
  }
  
  .back-btn-header .back-icon {
    width: 20px;
    height: 20px;
  }
  
  .back-btn-header:hover {
    transform: none;
    box-shadow: none;
  }
  
  /* 移动端图片展示区域限制 */
  .main-image-container {
    width: 100%;
    height: 50vh;
    margin: 0 auto;
    border-radius: var(--border-radius-medium);
    overflow: hidden;
    background-color: var(--color-card);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 移动端图片尺寸约束，防止超出边框 */
  .main-product-image {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: center;
    display: block;
  }
  
  /* 移动端产品信息区域 */
  .product-info-section {
    flex: none;
    width: 100%;
    padding: 1.2rem 1rem;
    background-color: var(--color-bg);
    border-top: 1px solid var(--color-border);
  }
  
  /* 移动端主内容容器 */
  .main-content {
    flex-direction: column;
    min-height: auto;
  }
  
  /* 移动端移除按钮容器的外层边框 */
  .actions-box {
    border: none;
    border-radius: 0;
    background-color: transparent;
    padding: 1rem 0rem;
    margin: -0.7rem 0;
  }
  
  /* 移动端增大按钮间距 */
  .action-buttons-container {
    gap: 0.8rem;
  }
  
  /* 移动端产品名称和价格样式 */
  .title-price-section {
    margin-bottom: 0.3rem;
    gap: 0.3rem;
  }
  
  .title-price-section .product-title {
    font-size: 1.1rem;
    font-weight: 500;
    text-align: left;
    font-family: 'Poppins', sans-serif;
  }
  
  .title-price-section .current-price {
    font-size: 1.45rem;
    font-weight: 600;
    letter-spacing: -0.1rem;
    color: var(--color-primary); /* 使用主题紫色 */
    font-family: 'Poppins', sans-serif;
  }

    /* 移动端按钮高度与尺码选择器保持一致 */
  .btn {
    padding: 0.9rem 0.8rem; /* 与尺码按钮相同的高度 */
    font-size: 1rem;
  }

  /* 移动端信息边框样式优化 */
  .info-section-box {
    padding: 0.8rem 0.8rem; /* 缩小内边距 */
    margin: 0.1rem 0; /* 缩小边框间距 */
  }

}
</style>
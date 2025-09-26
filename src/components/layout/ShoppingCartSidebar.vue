<template>
  <transition name="slide-fade">
    <aside v-if="isOpen" class="shopping-cart-sidebar">
      <div class="cart-header">
        <h3 class="cart-title">{{ $t('cart.yourCart') }}</h3>
        <button @click="toggleCart" class="close-cart-btn" aria-label="Close cart">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
        <div class="cart-content">
        <div v-if="!cartItems || cartItems.length === 0" class="empty-cart-message">
          <p class="empty-cart-text">暂无商品</p>
        </div>
        <ul v-else class="cart-item-list">
          <li v-for="item in cartItems" :key="`${item.id}-${item.color}-${item.size}`" class="cart-item">
            <img :src="item.imageUrl || '/src/assets/images/placeholder-product.png'" :alt="item.name" class="cart-item-image" />
            <div class="cart-item-details">
              <router-link :to="item.permalink" class="item-name">{{ item.name }}</router-link>
              <div class="item-attributes">
                <span v-if="item.color || item.size">
                  <span v-if="item.color">{{ item.color }}</span>
                  <span v-if="item.color && item.size"> / </span>
                  <span v-if="item.size">{{ item.size }}</span>
                </span>
              </div>
              <span class="item-price">{{ Math.round(item.price) }} RMB</span>
            </div>
            <div class="cart-item-actions">
            <button @click="removeItem(item)" class="remove-item-btn" aria-label="Remove item">
              <img src="../../assets/icons/icons8-delete-32.png" alt="Remove" />
            </button>
              <div class="quantity-control">
                <button @click="decreaseQuantity(item)" class="quantity-btn" aria-label="Decrease quantity">
                  -
                </button>
                <span class="item-quantity">{{ item.quantity }}</span>
                <button @click="increaseQuantity(item)" class="quantity-btn" aria-label="Increase quantity">
                  +
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="cart-footer">
        <div class="subtotal">
          <span>{{ $t('cart.subtotal') }}</span>
          <span>{{ subtotal.toFixed(2) }} RMB</span>
        </div>
        <button 
          class="btn btn-primary checkout-btn" 
          :disabled="!cartItems || cartItems.length === 0"
          @click="handleCheckout"
        >
          {{ $t('cart.proceedToCheckout') }}
        </button>
      </div>
    </aside>
  </transition>
</template>

<script setup>
import { inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
// import CloseIcon from '../../assets/icons/CloseIcon.vue';

const router = useRouter();
const { t } = useI18n();

const isOpen = inject('isCartOpen');
const toggleCart = inject('toggleCart');
const cartItems = inject('cartItems');
const removeFromCart = inject('removeFromCart');
const updateCartItemQuantity = inject('updateCartItemQuantity');

const subtotal = computed(() => {
  if (!cartItems || !cartItems.value) return 0;
  return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0);
});

const increaseQuantity = (item) => {
  updateCartItemQuantity(item, item.quantity + 1);
};

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    updateCartItemQuantity(item, item.quantity - 1);
  } else {
    // 当数量减到0时，弹出确认框
    if (confirm(t('cart.confirmRemove'))) {
      updateCartItemQuantity(item, 0); 
    }
  }
};

const removeItem = (item) => {
  // 删除商品时弹出确认框
  if (confirm(t('cart.confirmRemove'))) {
    removeFromCart(item);
  }
};

const handleCheckout = () => {
  if (cartItems.value && cartItems.value.length > 0) {
    // 清除直接购买商品，确保显示购物车商品
    sessionStorage.removeItem('directBuyItem');
    if (toggleCart) toggleCart(); // Close cart before navigating
    router.push('/checkout');
  } else {
    alert(t('cart.empty'));
  }
};

</script>

<style scoped>
.shopping-cart-sidebar {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: clamp(320px, 30vw, 450px); 
  height: calc(100vh - 2rem);
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 1010;
  padding: 0;
  box-sizing: border-box;
  color: var(--color-text);
}

.cart-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: center; /* 改为居中布局 */
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-subtle);
  position: relative; /* 为绝对定位的关闭按钮提供参考 */
}

.cart-title {
  font-size: 1.15rem; /* Slightly smaller */
  font-weight: 600;
  margin: 0;
}

.close-cart-btn {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-cart-btn:hover {
  transform: translateY(-52%);
  box-shadow: 0 0px 4px rgba(0, 0, 0, 0.1);
}

.cart-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 1.5rem; /* Padding for content area */
  margin-bottom: 0;
}

.empty-cart-message {
  padding-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--color-text-muted);
}

.empty-cart-text {
  font-size: 1rem; /* 16px */
  margin: 0;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.cart-item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border-subtle);
}
.cart-item:last-child {
  border-bottom: none;
  padding-bottom: 1.5rem; /* More space for last item before footer */
}

.cart-item-image {
  width: 70px; 
  height: 70px;
  object-fit: cover;
  border-radius: var(--border-radius-medium);
  background-color: var(--color-surface);
  flex-shrink: 0;
}

.cart-item-image-placeholder {
  width: 70px;
  height: 70px;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  border: 1px dashed var(--color-border-subtle);
  flex-shrink: 0;
}

.cart-item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

.item-attributes {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  margin-top: auto;
}

.cart-item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
  width: 80px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium);
  padding: 0.15rem 0.4rem;
  height: 32px;
}

.quantity-btn,
.remove-item-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  min-width: 20px;
  min-height: 20px;
  line-height: 1;
}

.quantity-btn:hover,
.remove-item-btn:hover {
  color: var(--color-text);
}

.quantity-btn svg {
  width: 16px;
  height: 16px;
} /* Keep for future if icons are re-added */
.remove-item-btn img {
  width: 20px;
  height: 20px;
}

.item-quantity {
  font-size: 0.85rem;
  font-weight: 500;
  min-width: 20px;
  text-align: center;
  padding: 0 0.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}


.cart-footer {
  padding: 1.25rem 1.5rem;
  margin-top: auto;
  border-top: 1px solid var(--color-border-subtle);
}

.subtotal {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.25rem;
}
.subtotal span:last-child {
  font-weight: 600;
}

.btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: var(--border-radius-medium);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}
.btn:disabled {
  background-color: var(--color-surface);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

/* 移动端优化样式 */
@media (max-aspect-ratio: 1/1) {
  .shopping-cart-sidebar {
    width: clamp(85vw, 90vw, 95vw); /* 移动端增大宽度 */
    left: 50%; /* 从左边50%开始 */
    right: unset; /* 取消右边定位 */
    transform: translateX(-50%); /* 向左偏移自身宽度的50%实现居中 */
    top: 0.5rem;
    height: calc(100vh - 1rem);
  }

  .cart-header {
    padding: 1rem 1.25rem;
  }

  .close-cart-btn {
    right: 1.25rem; /* 移动端调整右边距 */
    transform: translateY(-50%) !important; /* 确保默认状态 */
    box-shadow: none !important; /* 确保默认状态无阴影 */
    padding: 0.375rem !important; /* 缩小移动端按钮大小 */
    width: auto !important;
    height: auto !important;
  }

  .close-cart-btn svg {
    width: 16px !important; /* 缩小图标大小 */
    height: 16px !important;
  }

  /* 移动端关闭按钮移除hover效果 */
  .close-cart-btn:hover {
    transform: translateY(-50%) !important;
    box-shadow: none !important;
  }

  /* 移动端禁用所有hover效果 */
  .quantity-btn:hover,
  .remove-item-btn:hover {
    color: var(--color-text-muted) !important; /* 保持默认颜色 */
  }

  .btn-primary:hover:not(:disabled) {
    background-color: var(--color-primary) !important; /* 保持默认背景色 */
  }

  .cart-content {
    padding: 0 1.25rem;
  }

  .cart-footer {
    padding: 1rem 1.25rem;
  }

  /* 优化商品项布局 */
  .cart-item {
    gap: 0.5rem; /* 减少间距 */
    padding: 0.75rem 0; /* 减少上下间距 */
  }

  .cart-item-image {
    width: 50px; /* 缩小图片 */
    height: 50px;
    align-self: flex-end; /* 将图片对齐到底部 */
    margin-bottom: 0.3rem; /* 添加一些底部间距 */
  }

  .cart-item-details {
    gap: 0.2rem; /* 减少内部间距 */
    min-width: 0; /* 允许文本压缩 */
  }

  .item-name {
    font-size: 0.85rem; /* 稍微缩小字体 */
  }

  .item-attributes {
    font-size: 0.7rem; /* 缩小属性字体 */
  }

  .item-price {
    font-size: 0.8rem; /* 缩小价格字体 */
  }

  .cart-item-actions {
    width: 70px; /* 稍微缩小操作区域宽度 */
    gap: 0.4rem;
  }

  .quantity-control {
    padding: 0.1rem 0.3rem; /* 缩小数量控制器 */
    height: 28px; /* 减少高度 */
  }

  .remove-item-btn img {
    width: 18px; /* 缩小删除按钮图标 */
    height: 18px;
  }

  .item-quantity {
    font-size: 0.8rem; /* 缩小数量字体 */
  }

  .quantity-btn {
    font-size: 0.85rem; /* 缩小加减按钮字体 */
    min-width: 18px;
    min-height: 18px;
  }
}

/* Ensure transition still works with new padding setup */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateX(0);
}

/* 移动端过渡动画调整 */
@media (max-aspect-ratio: 1/1) {
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(50%); /* 从右侧滑入，配合居中定位 */
  }
  .slide-fade-enter-to,
  .slide-fade-leave-from {
    transform: translateX(-50%); /* 居中位置 */
  }
}
</style> 
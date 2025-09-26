<template>
  <div class="user-orders-page-container">
    <TopNavigationBar />
    <main class="orders-main-content">
      <div class="orders-header">
        <button @click="$router.back()" class="back-btn">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="page-title">{{ $t('userOrders.myOrders') }}</h1>
      </div>

      <div class="order-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
          <span v-if="tab.id !== 'all' && tab.count > 0" class="order-count">{{ tab.count }}</span>
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <p>{{ $t('userOrders.loading') }}</p>
      </div>
      <div v-else-if="filteredOrders.length === 0" class="empty-state-card">
        <p>{{ $t('userOrders.noOrders') }}</p>
        <router-link v-if="activeTab === 'all'" to="/" class="btn btn-primary">{{ $t('userOrders.startShopping') }}</router-link>
      </div>
      <div v-else class="orders-list-container">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-card-header">
            <div class="order-info">
              <span class="order-id">{{ $t('order.orderNumber') }}：{{ order.orderNumber }}</span>
              <span class="order-date">{{ $t('userOrders.placedOn') }}: {{ formatDate(order.orderedTime) }}</span>
            </div>
            <!-- 将状态和倒计时包裹在一个新的容器中 -->
            <div class="status-and-countdown">
              <span class="order-status">{{ $t('order.status.' + order.status.toLowerCase()) }}</span>
              <!-- 待付款订单的倒计时 -->
<!--               <div v-if="order.status === 'PENDING' && countdownDisplays.get(order.id)" class="payment-countdown-small">
                {{ countdownDisplays.get(order.id) }}
              </div> -->
            </div>
          </div>
          <div class="order-card-body">
            <div class="order-items-preview">
              <img v-for="item in order.orderItems.slice(0, 3)" :key="item.productId" :src="getFullImageUrl(item.productImageUrl) || '/src/assets/images/placeholder-product.png'" :alt="item.productName" class="item-thumbnail">
              <span v-if="order.orderItems.length > 3" class="more-items-indicator">+{{ order.orderItems.length - 3 }} {{ $t('userOrders.moreItems') }}</span>
            </div>
            <div class="order-summary">
               <span class="order-total">{{ order.totalAmount.toFixed(2) }}RMB</span>
               <router-link :to="{ name: 'OrderDetailPage', params: { orderId: order.id } }" class="btn btn-secondary btn-sm">{{ $t('userOrders.viewDetails') }}</router-link>
               <!-- 修改"取消退款"按钮，调用自定义模态框 -->
               <button v-if="order.status === 'REFUND_IN_PROGRESS'" @click="openCancelRefundModal(order.id)" class="btn btn-secondary btn-sm">{{ $t('common.cancel') }}</button>
               <!-- 新增"取消订单"按钮，仅在待付款状态下显示 -->
               <button v-if="order.status === 'PENDING'" @click="openCancelOrderModal(order.id)" class="btn btn-secondary btn-sm">{{ $t('userOrders.cancelOrder') }}</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Cancel Refund Confirmation Modal -->
    <div v-if="showCancelRefundModal" class="modal-overlay" @click.self="closeCancelRefundModal">
      <div class="modal-panel confirmation-modal-panel">
        <h3 class="modal-title">{{ $t('userOrders.confirmRefundCancellationPrompt') }}</h3>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="closeCancelRefundModal">{{ $t('common.cancel') }}</button>
          <button type="button" class="btn btn-primary" @click="confirmCancelRefundAction">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- Cancel Order Confirmation Modal -->
    <div v-if="showCancelOrderModal" class="modal-overlay" @click.self="closeCancelOrderModal">
      <div class="modal-panel confirmation-modal-panel">
        <h3 class="modal-title">{{ $t('userOrders.confirmCancelOrderPrompt') }}</h3>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="closeCancelOrderModal">{{ $t('common.cancel') }}</button>
          <button type="button" class="btn btn-primary" @click="confirmCancelOrderAction">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- <Footer /> -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject, onUnmounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import TopNavigationBar from '../components/layout/TopNavigationBar.vue';
import Footer from '../components/layout/Footer.vue';
import { useRouter } from 'vue-router';
import { getOrdersByUserId, updateOrderStatus } from '../api/orderApi';
import { getFullImageUrl } from '../api/apiConfig.js';

const router = useRouter();
const { t } = useI18n();
const loading = ref(true);
const orders = ref([]);
const activeTab = ref('all');
const countdownTimers = ref(new Map()); // <--- 修改：使用 Map 存储计时器
const countdownDisplays = reactive(new Map()); // <--- 新增：使用 reactive Map 存储倒计时显示值

const loggedInUser = inject('currentUser');

// 新增：计算每个状态的订单数量
const orderCounts = computed(() => {
  if (!orders.value) return { all: 0, pending_payment: 0, to_ship: 0, to_receive: 0, refunds: 0 };
  return {
    all: orders.value.length,
    pending_payment: orders.value.filter(o => o.status === 'PENDING').length,
    to_ship: orders.value.filter(o => o.status === 'PROCESSING').length,
    to_receive: orders.value.filter(o => o.status === 'SHIPPED').length,
    refunds: orders.value.filter(o => ['REFUND_PROCESSING', 'REFUNDED', 'REFUND_IN_PROGRESS'].includes(o.status)).length,
  };
});

const tabs = computed(() => [
  { id: 'all', name: t('userOrders.filterAll'), count: orderCounts.value.all },
  { id: 'to_ship', name: t('userOrders.filterToShip'), count: orderCounts.value.to_ship },
  { id: 'to_receive', name: t('userOrders.filterToReceive'), count: orderCounts.value.to_receive },
  { id: 'refunds', name: t('userOrders.filterRefunds'), count: orderCounts.value.refunds },
]);

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value;
  }
  if (activeTab.value === 'to_ship') {
    return orders.value.filter(order => order.status === 'PROCESSING');
  }
  if (activeTab.value === 'to_receive') {
    return orders.value.filter(order => order.status === 'SHIPPED');
  }
  if (activeTab.value === 'refunds') {
    return orders.value.filter(order => ['REFUND_PROCESSING', 'REFUNDED', 'REFUND_IN_PROGRESS'].includes(order.status));
  }
  return [];
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// 计算并格式化剩余时间
const formatCountdown = (expirationTime) => {
  if (!expirationTime) return '';
  const expirationDate = new Date(expirationTime);
  const now = new Date();
  const diffSeconds = Math.max(0, Math.floor((expirationDate.getTime() - now.getTime()) / 1000));

  if (diffSeconds <= 0) {
    return ''; // 倒计时结束时返回空字符串
  }

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// 启动所有待付款订单的倒计时
const startOrderCountdowns = () => {
      console.log('--- startOrderCountdowns called (UserOrdersPage) ---'); // <--- 新增此行
      // 清除所有现有计时器和倒计时显示，以避免重复
      for (const orderId of countdownDisplays.keys()) {
        const timer = countdownTimers.value.get(orderId);
        if (timer) {
          clearInterval(timer);
        }
        countdownTimers.value.delete(orderId);
        countdownDisplays.delete(orderId);
      }

      orders.value.forEach(order => {
        console.log(`Processing order ${order.id} - Status: ${order.status}, ExpirationTime: ${order.expirationTime}`); // <--- 新增此行
        if (order.status === 'PENDING' && order.expirationTime) {
          const expirationDate = new Date(order.expirationTime);
          const now = new Date();
          let initialRemainingSeconds = Math.max(0, Math.floor((expirationDate.getTime() - now.getTime()) / 1000));

          if (initialRemainingSeconds > 0) {
            // 设置初始倒计时显示值
            countdownDisplays.set(order.id, formatCountdown(order.expirationTime));
            console.log(`Order ${order.id} - Initial countdown: ${countdownDisplays.get(order.id)}`); // <--- 新增此行

            // 启动计时器
            const timer = setInterval(() => {
              initialRemainingSeconds--;
              const currentCountdown = formatCountdown(order.expirationTime); // 重新计算
              countdownDisplays.set(order.id, currentCountdown);
              console.log(`Order ${order.id} - Current countdown: ${currentCountdown}, remaining seconds: ${initialRemainingSeconds}`); // <--- 新增此行

              if (initialRemainingSeconds <= 0) {
                clearInterval(timer);
                countdownTimers.value.delete(order.id);
                countdownDisplays.set(order.id, ''); // 倒计时结束时设置为空字符串
                console.log(`Order ${order.id} - Countdown finished, fetching orders.`); // <--- 新增此行
                fetchOrders(); // 刷新订单列表，以便后端状态更新
              }
            }, 1000);
            countdownTimers.value.set(order.id, timer); // 将计时器存储在 Map 中
          } else {
             // 如果初始时间 <= 0，直接显示为空，并刷新订单以获取最新状态
            countdownDisplays.set(order.id, '');
            console.log(`Order ${order.id} - Initial time <= 0, setting display to empty, fetching orders.`); // <--- 新增此行
            if (order.status === 'PENDING') {
                fetchOrders();
            }
          }
        }
      });
};

const fetchOrders = async () => {
  loading.value = true;
  const userId = loggedInUser.value?.id;

  if (userId) {
    try {
      const userOrders = await getOrdersByUserId(userId);
      orders.value = userOrders;
      console.log('Fetched user orders:', orders.value);
      startOrderCountdowns(); // <--- 确保在这里调用
    } catch (error) {
      console.error('Error fetching user orders:', error);
      console.error('General error fetching orders:', error.response?.data?.message || error.message);
    } finally {
      loading.value = false;
    }
  } else {
    console.warn('User not logged in or userId is missing. Cannot fetch orders.');
    loading.value = false;
  }
};

// 在组件卸载时清除所有计时器和响应式 Map
onUnmounted(() => {
  for (const timer of countdownTimers.value.values()) {
    clearInterval(timer);
  }
  countdownTimers.value.clear();
  countdownDisplays.clear(); // 清除响应式 Map
});


onMounted(fetchOrders);

// Custom modal for cancel refund
const showCancelRefundModal = ref(false);
const orderIdToCancel = ref(null); // To store the order ID for the modal

const openCancelRefundModal = (orderId) => {
  orderIdToCancel.value = orderId;
  showCancelRefundModal.value = true;
};

const closeCancelRefundModal = () => {
  showCancelRefundModal.value = false;
  orderIdToCancel.value = null;
};

const confirmCancelRefundAction = async () => {
  if (!orderIdToCancel.value) return;

  try {
    const updatedOrder = await updateOrderStatus(orderIdToCancel.value, { status: 'SHIPPED' });
    alert(t('userOrders.refundCancellationSuccess'));
    closeCancelRefundModal();
    await fetchOrders();
  } catch (error) {
    console.error('Error cancelling refund:', error);
    alert(t('errors.generalError') + (error.response?.data?.message || error.message));
  }
};

// New: Custom modal for cancel order
const showCancelOrderModal = ref(false);
const orderIdToCancelOrder = ref(null);

const openCancelOrderModal = (orderId) => {
  orderIdToCancelOrder.value = orderId;
  showCancelOrderModal.value = true;
};

const closeCancelOrderModal = () => {
  showCancelOrderModal.value = false;
  orderIdToCancelOrder.value = null;
};

const confirmCancelOrderAction = async () => {
  if (!orderIdToCancelOrder.value) return;

  try {
    const updatedOrder = await updateOrderStatus(orderIdToCancelOrder.value, { status: 'CANCELED' });
    alert(t('userOrders.orderCancellationSuccess')); // New i18n key for success
    closeCancelOrderModal();
    await fetchOrders();
  } catch (error) {
    console.error('Error cancelling order:', error);
    alert(t('errors.generalError') + (error.response?.data?.message || error.message));
  }
};
</script>

<style scoped>
.user-orders-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg);
}

.orders-main-content {
  padding-top: calc(var(--navbar-height, 60px) + 2rem);
  padding-bottom: 4rem;
  flex-grow: 1;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding-left: var(--container-padding, 1rem);
  padding-right: var(--container-padding, 1rem);
}

.orders-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 1.5rem;
  margin-top: -0.1rem;
}

/* Back button styles */
.back-btn {
  position: absolute;
  left: 0;
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-icon {
  width: 24px;
  height: 24px;
  color: var(--color-text);
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  text-align: center;
}

.order-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.tab-button {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  background-color: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
  margin-bottom: -1px;
  position: relative;
  outline: none; /* 移除焦点时的轮廓 */
  -webkit-tap-highlight-color: transparent; /* 移除移动端触摸高亮 */
  -webkit-touch-callout: none; /* 移除长按弹出菜单 */
  -webkit-user-select: none; /* 移除文本选择 */
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.tab-button:focus {
  outline: none; /* 移除焦点时的轮廓 */
  box-shadow: none; /* 移除可能的阴影效果 */
}

.tab-button:active {
  outline: none; /* 移除点击时的轮廓 */
  box-shadow: none; /* 移除点击时的阴影效果 */
}

.tab-button:hover {
  color: var(--color-text);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

/* 新增：订单数量角标样式 */
.order-count {
  position: absolute;
  top: 1.5px;
  right: 10px;
  background-color: var(--color-primary) !important; /* 使用主题紫色 */
  color: var(--color-button-primary-text) !important; /* 使用主题按钮文字颜色 */
  border-radius: 50%; /* 使其完全圆形 */
  width: 18px;
  height: 18px;
  font-size: 11px;
  line-height: 18px; /* 略小于height来视觉上居中 */
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 0.5px; /* 向上微调 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box; /* 确保padding不影响尺寸 */
  transition: none; /* 确保角标颜色不会跟随父元素变化 */
}

.loading-state, .empty-state-card {
  background-color: var(--color-card);
  padding: 2.5rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  text-align: center;
  color: var(--color-text-secondary);
  margin-top: 1rem;
}
.empty-state-card p {
  margin-bottom: 1.5rem;
  font-size: 1.05rem;
}

.orders-list-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background-color: var(--color-card);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  padding: 1.25rem;
  transition: box-shadow 0.2s ease-in-out;
}
.order-card:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-subtle);
}
.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.order-id {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}
.order-date {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}
/* 调整订单状态和倒计时容器的布局 */
.status-and-countdown {
  display: flex;
  flex-direction: column; /* 垂直排列子元素 */
  align-items: center; /* 将子元素居中对齐 */
  margin-left: auto; /* 确保这个容器在 order-card-header 的右侧 */
  gap: 0.2rem; /* 状态和倒计时之间的间距 */
}

/* 调整倒计时文本的样式 */
.payment-countdown-small {
  font-size: 0.8rem;
  color: var(--color-text-secondary); /* 调整颜色使其更柔和，或者保持您的accent色 */
  font-weight: 500;
  /* text-align: right; 这一行可以删除，因为父容器已经 align-items: flex-end; */
}
.order-status {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-primary);
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  background-color: var(--color-surface);
}
.order-card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order-items-preview {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.item-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}
.more-items-indicator {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}
.order-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.order-total {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.btn-sm {
  padding: 0.6rem 1.2rem; /* <-- 修改这里，增大内边距 */
  font-size: 0.8rem;     /* <-- 修改这里，缩小文字 */
  min-width: 90px;      /* <-- 修改这里，可以适当加宽 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px; 
  font-weight: 500;
}

/* 针对订单卡片中的按钮样式 */
.order-summary .btn-primary {
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
  border: 1px solid var(--color-primary);
}
.order-summary .btn-primary:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.order-summary .btn-secondary {
  background-color: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  text-decoration: none;
}
.order-summary .btn-secondary:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-secondary);
  color: var(--color-text);
}

/* Modal styles (shared and adapted) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-panel {
  background-color: var(--color-card);
  border-radius: 10px;
  padding: 2.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
  position: relative;
}

.modal-panel.confirmation-modal-panel {
  max-width: 300px; /* 调整宽度，使其更紧凑 */
  padding: 2rem;
  text-align: center; /* 确认模态框内容居中 */
  border: 1px solid var(--color-border-subtle);
  background-color: var(--color-card);
}

.modal-title {
  font-size: 1.2rem; /* 调整字体大小，使其更像提示信息 */
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 2rem; /* 增加与按钮的间距 */
  text-align: center;
  justify-content: center;
}

.modal-message {
  display: none; /* 隐藏原始的消息行 */
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  text-align: left;
}

.modal-actions {
  display: flex;
  justify-content: center; /* 按钮左右对齐 */
  gap: 4rem;
  margin-top: 2rem;
  padding-top: 0; 
  border-top: none;
}

.modal-actions .btn {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border-radius: 6px;
  font-weight: 600;
  min-width: 70px; /* 进一步缩短按钮长度 */
  transition: background-color 0.2s ease, border-color 0.2s ease, filter 0.2s ease; /* 添加过渡效果 */
}

.modal-actions .btn-primary {
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
  border: 1px solid var(--color-primary);
}

/* 新增：确认按钮悬停效果 */
.modal-actions .btn-primary:hover {
  filter: brightness(0.9);
}

.modal-actions .btn-secondary {
  background-color: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.modal-actions .btn-secondary:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-secondary);
  color: var(--color-text);
}

/* Mobile responsive adjustments - equivalent to web scaled down */
@media (max-aspect-ratio: 1/1) {
  .orders-main-content {
    padding-top: calc(var(--navbar-height, 60px) + 2rem);
    padding-bottom: 2rem;
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .orders-header {
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .back-btn {
    width: 36px;
    height: 36px;
    transform: none !important; /* 确保默认状态无变换 */
    box-shadow: none !important; /* 确保默认状态无阴影 */
  }

  /* 移动端返回按钮移除上移效果 */
  .back-btn:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .back-icon {
    width: 20px;
    height: 20px;
  }

  .order-tabs {
    margin-bottom: 1.5rem;
    gap: 0.5rem;
  }

  .tab-button {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    border-radius: 0px;
    outline: none; /* 移除焦点时的轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端触摸高亮 */
    -webkit-touch-callout: none; /* 移除长按弹出菜单 */
    -webkit-user-select: none; /* 移除文本选择 */
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .tab-button:focus {
    outline: none; /* 移除焦点时的轮廓 */
    box-shadow: none; /* 移除可能的阴影效果 */
  }

  .tab-button:active {
    outline: none; /* 移除点击时的轮廓 */
    box-shadow: none; /* 移除点击时的阴影效果 */
  }

  .order-count {
    top: -1px;
    right: 1px;
    width: 16px;
    height: 16px;
    font-size: 9px;
    line-height: 14px; /* 略小于height */
    padding-top: 0.5px; /* 向上微调 */
    border-radius: 50%; /* 确保移动端也是圆形 */
  }

  .orders-list-container {
    gap: 1rem;
  }

  .order-card {
    padding: 1rem;
    border-radius: 8px;
  }

  .order-card-header {
    margin-bottom: 1rem;
    padding-bottom: 0.8rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .order-info {
    width: 100%;
  }

  .order-id {
    font-size: 0.9rem;
  }

  .order-date {
    font-size: 0.8rem;
  }

  .status-and-countdown {
    display: none; /* 在移动端隐藏订单状态显示 */
  }

  .order-status {
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
  }

  .order-card-body {
    flex-direction: row; /* 保持水平布局 */
    align-items: center;
    gap: 1rem;
    justify-content: space-between;
  }

  .order-items-preview {
    flex-shrink: 0; /* 防止图片被压缩 */
    gap: 0.4rem;
  }

  .item-thumbnail {
    width: 50px;
    height: 50px;
    border-radius: 6px;
  }

  .more-items-indicator {
    font-size: 0.8rem;
  }

  .order-summary {
    margin-top: -0.1rem;
    margin-bottom: -0.5rem;
    flex-direction: column-reverse; /* 价格在下，按钮在上 */
    align-items: flex-end; /* 右对齐 */
    gap: 0.4rem; /* 缩小间距 */
    flex-shrink: 0; /* 防止被压缩 */
  }

  .order-total {
    font-size: 0.9rem;
    font-weight: 500;
    text-align: right; /* 价格右对齐 */
  }

  .btn-sm {
    padding: 0.5rem 0.8rem;
    font-size: 0.75rem;
    min-width: 70px;
    border-radius: 6px;
  }

  /* Modal adjustments for mobile */
  .modal-panel {
    margin: 1rem;
    max-width: calc(100% - 2rem);
    border-radius: 8px;
  }

  .modal-title {
    font-size: 1.1rem;
  }

  .modal-actions {
    gap: 2rem;
    margin-top: 1.5rem;
  }

  .modal-actions .btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
    min-width: 80px;
  }

  /* Empty state adjustments */
  .empty-state-card {
    padding: 1.5rem;
    border-radius: 8px;
  }

  .empty-state-card p {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .empty-state-card .btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
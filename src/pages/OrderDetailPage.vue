<template>
  <div class="order-detail-page-container">
    <TopNavigationBar />
    <main class="order-detail-main-content">
      <div v-if="loading" class="loading-state">
        <p>{{ $t('orderDetail.loading') }}</p>
      </div>
      <div v-else-if="!order" class="not-found-state">
        <p>{{ $t('orderDetail.notFound') }}</p>
        <router-link to="/orders" class="btn btn-primary">{{ $t('orderDetail.backToOrders') }}</router-link>
      </div>
      <div v-else class="order-detail-layout">
        <div class="order-detail-header">
          <button @click="$router.push('/orders')" class="back-btn">
            <svg viewBox="0 0 24 24" class="back-icon">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h1 class="page-title">{{ $t('orderDetail.orderDetails') }}</h1>
          <div class="header-actions">
            <!-- Refund/Return Button -->
            <button v-if="order.status === 'SHIPPED' || order.status === 'DELIVERED'" @click="handleRefundRequest" class="btn btn-secondary">{{ $t('userOrders.requestRefundReturn') }}</button>
          </div>
        </div>

        <div class="order-meta-info card">
          <div class="meta-item">
            <span class="meta-label">{{ $t('orderDetail.orderId') }}:</span>
            <span class="meta-value">{{ order.orderNumber }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ $t('orderDetail.orderDate') }}:</span>
            <span class="meta-value">{{ formatDate(order.orderedTime) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ $t('orderDetail.orderStatus') }}:</span>
            <span class="meta-value">{{ $t('order.status.' + order.status.toLowerCase()) }}</span>
          </div>
          <div class="meta-item" v-if="order.paymentMethod">
            <span class="meta-label">{{ $t('orderDetail.paymentMethod') }}:</span>
            <span class="meta-value">{{ $t('checkout.paymentMethods.' + order.paymentMethod.toLowerCase()) }}</span>
          </div>
        <div class="meta-item" v-if="order.paidTime">
          <span class="meta-label">{{ $t('orderDetail.paidTime') }}:</span>
          <span class="meta-value">{{ formatDate(order.paidTime) }}</span>
        </div>
        <div class="meta-item" v-if="order.shippedTime">
          <span class="meta-label">{{ $t('orderDetail.shippedTime') }}:</span>
          <span class="meta-value">{{ formatDate(order.shippedTime) }}</span>
        </div>
        <div class="meta-item" v-if="order.deliveredTime">
          <span class="meta-label">{{ $t('orderDetail.deliveredTime') }}:</span>
          <span class="meta-value">{{ formatDate(order.deliveredTime) }}</span>
        </div>

        <!-- New Tracking Information -->
        <div class="meta-item" v-if="order.trackingNumber">
          <span class="meta-label">{{ $t('orderDetail.trackingNumber') }}:</span>
          <span class="meta-value">{{ order.trackingNumber }}</span>
        </div>
        <div class="meta-item" v-if="order.shippingCarrier">
          <span class="meta-label">{{ $t('orderDetail.shippingCarrier') }}:</span>
          <span class="meta-value">{{ order.shippingCarrier }}</span>
        </div>
        </div>

        <div class="order-contents-grid">
          <section class="shipping-address-section card">
            <h2>{{ $t('orderDetail.shippingAddress') }}</h2>
            <!-- 优先使用地址快照信息 -->
            <div v-if="order.shippingRecipientName">
              <p class="name-phone-row"><strong>{{ order.shippingRecipientName }}</strong> <span class="phone-number">{{ order.shippingPhoneNumber }}</span></p>
              <p>{{ order.shippingProvince }}{{ order.shippingCity }}{{ order.shippingArea }}{{ order.shippingDetailedAddress }}</p>
            </div>
            <!-- 兜底：使用原地址信息（适用于旧订单） -->
            <div v-else-if="order.shippingAddress">
              <p class="name-phone-row"><strong>{{ order.shippingAddress.recipientName }}</strong> <span class="phone-number">{{ order.shippingAddress.phoneNumber }}</span></p>
              <p>{{ order.shippingAddress.province }}{{ order.shippingAddress.city }}{{ order.shippingAddress.area }}{{ order.shippingAddress.detailedAddress }}</p>
            </div>
            <div v-else><p>{{ $t('orderDetail.addressNotAvailable') }}</p></div>
          </section>

          <section class="order-summary-section card">
            <h2>{{ $t('orderDetail.orderSummary') }}</h2>
            <div class="summary-item">
              <span>{{ $t('orderDetail.subtotal') }}</span>
              <span>{{ order.itemsSubtotal.toFixed(2) }} RMB</span>
            </div>
            <div class="summary-item">
              <span>{{ $t('orderDetail.shipping') }}</span>
              <span>{{ shippingCost.toFixed(2) }} RMB</span>
            </div>
            <div v-if="discount > 0" class="summary-item">
              <span>{{ $t('orderDetail.discount') }}</span>
              <span>-{{ discount.toFixed(2) }} RMB</span>
            </div>
            <div class="summary-item total-line">
              <span>{{ $t('orderDetail.total') }}</span>
              <span>{{ order.totalAmount.toFixed(2) }} RMB</span>
            </div>
          </section>

          <!-- Mobile Action Buttons -->
          <section class="action-buttons">
            <button v-if="order.status === 'SHIPPED'" @click="handleConfirmReceipt" class="btn btn-primary receipt-btn">{{ $t('userOrders.confirmReceipt') }}</button>
            <button v-if="order.status === 'SHIPPED' || order.status === 'DELIVERED'" @click="handleRefundRequest" class="btn btn-secondary refund-btn">{{ $t('userOrders.requestRefundReturn') }}</button>
          </section>
        </div>

        <section class="order-items-section card">
          <h2>{{ $t('orderDetail.itemsInOrder') }}</h2>
          <ul class="order-items-list">
            <li v-for="item in order.orderItems" :key="item.productId" class="order-item">
              <img :src="item.productImageUrl || '/src/assets/images/placeholder-product.png'" :alt="item.productName" class="item-image">
              <div class="item-info">
                <p class="item-name">{{ item.productName }}</p>
                <p class="item-qty-price">{{ item.color || '默认' }} / {{ item.size || '默认' }} / x{{ item.quantity }}</p>
                <p class="item-total-price-mobile">{{ (item.quantity * item.priceAtPurchase).toFixed(2) }}RMB</p>
              </div>
              <p class="item-total-price">{{ (item.quantity * item.priceAtPurchase).toFixed(2) }} RMB</p>
            </li>
          </ul>
        </section>

        <!-- Web Action Buttons (bottom) -->
        <section class="web-action-buttons">
          <button v-if="order.status === 'SHIPPED'" @click="handleConfirmReceipt" class="btn btn-primary receipt-btn">{{ $t('userOrders.confirmReceipt') }}</button>
          <button v-if="order.status === 'SHIPPED' || order.status === 'DELIVERED'" @click="handleRefundRequest" class="btn btn-secondary refund-btn">{{ $t('userOrders.requestRefundReturn') }}</button>
        </section>

      </div>
    </main>

    <!-- Refund/Return Info Modal -->
    <div v-if="showRefundModal" class="modal-overlay" @click.self="closeRefundModal">
      <div class="modal-panel refund-modal-panel">
        <h3 class="modal-title">{{ $t('userOrders.merchantReturnInfoTitle') }}</h3>
        
        <!-- New: Refund Reason Textarea -->
        <div class="form-group-refund">
          <label for="refund-reason" class="form-label">{{ $t('userOrders.refundReasonLabel', '退货/退款原因') }}</label>
          <textarea
            id="refund-reason"
            v-model="refundReason"
            class="form-input-textarea"
            :placeholder="$t('userOrders.refundReasonPlaceholder', '请填写申请退货/退款的原因')"
            maxlength="100"
          ></textarea>
        </div>

        <div class="refund-info-content">
          <p><strong>{{ $t('userOrders.merchantName') }}:</strong> {{ merchantReturnInfo.name }}</p>
          <p><strong>{{ $t('userOrders.merchantAddress') }}:</strong> {{ merchantReturnInfo.address }}</p>
          <p><strong>{{ $t('userOrders.merchantContact') }}:</strong> {{ merchantReturnInfo.contact }}</p>
          <p class="info-note">{{ $t('userOrders.refundReturnNote') }}</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-primary" @click="handleRefundShipped">{{ $t('userOrders.shippedRefund') }}</button>
          <button type="button" class="btn btn-secondary" @click="closeRefundModal">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- <Footer /> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TopNavigationBar from '../components/layout/TopNavigationBar.vue';
import Footer from '../components/layout/Footer.vue';
import { getOrderById, updateOrderStatus } from '../api/orderApi';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const loading = ref(true);
const order = ref(null);
const refundReason = ref('');

const itemsSubtotal = computed(() => {
  if (!order.value || !order.value.orderItems) return 0;
  return order.value.orderItems.reduce((sum, item) => sum + (item.quantity * item.priceAtPurchase), 0);
});

const shippingCost = ref(0.00); // 暂定免运费
const discount = ref(0.00);    // 暂无折扣

// 退款/退货模态框状态和数据
const showRefundModal = ref(false);
const merchantReturnInfo = ref({
  name: '示例商家',
  address: '北京市朝阳区某某路123号某某大厦B座808室',
  contact: '13888888888' // 示例联系电话
});

const handleRefundRequest = () => {
  refundReason.value = ''; // Clear reason on open
  showRefundModal.value = true;
};

const closeRefundModal = () => {
  showRefundModal.value = false;
  refundReason.value = ''; // Clear reason on close
};

const handleRefundShipped = async () => {
  if (!order.value) return;

  if (!refundReason.value.trim()) {
    alert(t('userOrders.refundReasonRequired', '请输入退货退款原因。'));
    return;
  }
    try {
      // Update order status to REFUND_IN_PROGRESS
      const updatedOrder = await updateOrderStatus(order.value.id, { 
        status: 'REFUND_IN_PROGRESS',
        reason: refundReason.value // Pass the reason to the API
      });
      order.value = updatedOrder; // Update local order data
      alert(t('userOrders.refundShippedSuccess')); // New i18n key for success
      closeRefundModal(); // Close the modal
    } catch (error) {
      console.error('Error confirming refund shipped:', error);
      alert(t('errors.generalError') + (error.response?.data?.message || error.message));
    }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const handleConfirmReceipt = async () => {
  if (!order.value) return; // 确保订单数据已加载

  if (confirm(t('userOrders.confirmReceiptPrompt'))) { // 国际化提示
    try {
      const updatedOrder = await updateOrderStatus(order.value.id, { status: 'DELIVERED' });
      order.value = updatedOrder; // 更新本地订单数据以刷新UI
      alert(t('userOrders.receiptConfirmedSuccess')); // 国际化成功提示
      // 可以选择刷新整个页面，或者导航回订单列表
      // fetchOrderDetails(); // 重新获取订单详情
      // router.push({ name: 'Orders' }); // 导航回我的订单列表
    } catch (error) {
      console.error('Error confirming receipt:', error);
      alert(t('errors.generalError') + (error.response?.data?.message || error.message)); // 国际化错误提示
    }
  }
};

onMounted(async () => {
  loading.value = true;
  const orderId = route.params.orderId;

  if (orderId) {
    try {
      const fetchedOrder = await getOrderById(orderId);
      order.value = fetchedOrder;
      console.log('Fetched order details:', order.value);
    } catch (error) {
      console.error('Error fetching order details:', error);
      // 根据错误类型显示不同的消息
      if (error.response && error.response.status === 404) {
        alert(t('orderDetail.notFound'));
      } else {
        alert(t('errors.generalError') + (error.response?.data?.message || error.message));
      }
    } finally {
      loading.value = false;
    }
  } else {
    console.warn('Order ID is missing from route params.');
    loading.value = false;
    // 可以选择重定向到订单列表页
    router.push({ name: 'UserOrdersPage' });
  }
});
</script>

<style scoped>
.order-detail-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg);
}

.order-detail-main-content {
  padding-top: calc(var(--navbar-height, 60px) + 2rem);
  padding-bottom: 4rem;
  flex-grow: 1;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding-left: var(--container-padding, 1rem);
  padding-right: var(--container-padding, 1rem);
}

.order-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.header-actions {
  display: flex;
  gap: 0.75rem; /* 调整按钮之间的间距，略微缩小 */
  align-items: center;
  justify-content: flex-end; /* 确保内部元素靠右对齐 */
  flex-grow: 1; /* 允许其占据可用空间 */
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
}

.back-btn {
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.back-icon {
  width: 24px;
  height: 24px;
  color: var(--color-text);
}

/* Base button styles */
.btn {
  padding: 0.5rem 1rem; /* 缩小内边距 */
  border-radius: 8px; /* 增加圆角 */
  cursor: pointer;
  font-size: 0.9rem; /* 缩小字体大小 */
  font-weight: 500;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  text-decoration: none; /* For router-link */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap; /* Prevent text wrapping */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
}

/* Primary button styles */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
  border: 1px solid var(--color-primary);
}
.btn-primary:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

/* Secondary button styles (for Refund/Return button and Close button) */
.btn-secondary {
  background-color: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
}
.btn-secondary:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-secondary);
  color: var(--color-text);
}

/* Warning button styles (if needed for other actions) */
.btn-warning {
  background-color: var(--color-warning-button, #ffc107);
  color: var(--color-button-text-dark, #333);
  border: 1px solid var(--color-warning-button, #ffc107);
}
.btn-warning:hover {
  background-color: var(--color-warning-button-hover, #e0a800);
  border-color: var(--color-warning-button-hover, #e0a800);
}


.order-meta-info.card {
  margin-bottom: 2rem;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 500;
}

.meta-value {
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 500;
}

.status-text {
  padding: 0.3rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-primary);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  display: inline-block; /* To make padding effective */
  width: fit-content;
}

.order-contents-grid {
  display: grid;
  grid-template-columns: 1fr; /* Default to single column */
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .order-contents-grid {
    grid-template-columns: 1fr 1fr; /* Two columns on larger screens */
  }

  /* Web端进一步减小卡片高度和调整内部间距 */
  .shipping-address-section.card,
  .order-summary-section.card {
    padding: 0.75rem 1.25rem !important; /* 进一步缩小内边距 */
  }

  .shipping-address-section.card h2,
  .order-summary-section.card h2 {
    margin-bottom: 0.5rem !important; /* 进一步缩小标题下方间距 */
    padding-bottom: 0.375rem !important; /* 进一步缩小标题下方填充 */
    font-size: 1.1rem !important; /* 稍微缩小标题字体 */
  }

  .shipping-address-section.card > div:first-child {
    margin-top: 0 !important; /* 重置移动端的负边距 */
  }

  .shipping-address-section.card > div:last-child {
    margin-bottom: 0 !important; /* 重置移动端的负边距 */
  }

  .order-summary-section.card .summary-item:first-child {
    margin-top: 0 !important; /* 重置移动端的负边距 */
  }

  /* 优化订单汇总内部间距 */
  .order-summary-section .summary-item {
    padding: 0.4rem 0 !important; /* 增大内容与分隔线的间距 */
    border-bottom: none !important; /* 移除所有项目的分隔线 */
  }

  .order-summary-section .summary-item:first-child {
    padding-top: 0.2rem !important; /* 缩小商品小计与上方分隔线的间距 */
  }

  .order-summary-section .summary-item:last-of-type {
    margin-bottom: 0rem !important; /* 保持最后项间距 */
  }

  /* 进一步优化收货地址间距 */
  .shipping-address-section p {
    margin-bottom: 0.25rem !important; /* 进一步缩小段落间距 */
  }

  .shipping-address-section p:last-child {
    margin-bottom: 0 !important;
  }

  /* 让总计行与其他项目保持一致的样式 */
  .order-summary-section .total-line {
    font-size: 0.95rem !important; /* 与其他项目相同的字体大小 */
    font-weight: 500 !important; /* 与其他项目相同的字重 */
    color: var(--color-text) !important; /* 使用标准文字颜色 */
    padding: 0.4rem 0 0.2rem 0 !important; /* 上方与分隔线间距正常，下方与底部边框间距缩小 */
    margin-top: 0 !important; /* 移除额外的上边距 */
    margin-bottom: 0.2rem !important; /* 缩小与底部边框的间距 */
  }

  .order-summary-section .total-line span:last-child {
    color: var(--color-primary) !important; /* 价格也使用标准文字颜色 */
    font-weight: 500 !important; /* 与其他项目相同的字重 */
  }
}

.phone-number{
  color: var(--color-text);
  font-weight: 500;
  font-size: 1rem;
}

.card {
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem 1.5rem; /* 缩小上下内边距，从1.5rem改为1rem */
}

.card h2 {
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 0.75rem; /* 缩小标题下方间距 */
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 0.5rem; /* 缩小标题下方填充 */
}

.shipping-address-section p {
  margin-bottom: 0.375rem; /* 缩小段落间距 */
  color: var(--color-text-secondary);
}
.shipping-address-section p strong {
  color: var(--color-text);
}

.shipping-address-section p:last-child {
  margin-bottom: 0; /* 最后一段无下边距 */
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.375rem 0; /* 缩小每项的上下间距 */
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-text);
  font-size: 0.95rem;
}
.summary-item:last-of-type {
  border-bottom: none;
  margin-bottom: 0.75rem; /* 缩小最后一项的下方间距 */
}
.summary-item span:first-child {
  font-weight: 500;
}
.summary-item span:last-child {
  font-weight: 600;
  color: var(--color-text);
}

.total-line {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary) !important;
  padding-top: 1rem !important;
  margin-top: 1rem;
}
.total-line span:last-child {
  color: var(--color-primary) !important;
}

.order-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.item-total-price-mobile {
  display: none;
}
.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.item-info {
  flex-grow: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.item-qty-price {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.item-total-price {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
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
  max-width: 550px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
  position: relative;
  text-align: left;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
  text-align: center;
}

.form-group-refund {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--color-text);
}

.form-input-textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 12px; /* Rounded corners as per image */
  border: 1px solid var(--color-border);
  background-color: var(--color-card);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
}

.form-input-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.char-counter {
  text-align: right;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

.refund-info-content {
  line-height: 1.8;
  font-size: 0.95rem;
  padding-top: 0.5rem;
  margin-top: 0rem;
}

.refund-info-content p {
  margin-bottom: 0.5rem;
}

.refund-info-content strong {
  color: var(--color-text);
  font-weight: 600;
}

.info-note {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: center; /* 居中对齐，与订单详情按钮一致 */
  gap: 1rem; /* 与订单详情按钮间距一致 */
  margin-top: 2rem;
  margin-left: 2.5rem; /* 抵消modal-panel的左padding */
  margin-right: 2.5rem; /* 抵消modal-panel的右padding */
  border-top: none; /* 移除分割线 */
}

.modal-actions .btn {
  min-width: 225px; /* 与订单详情按钮宽度一致 */
  padding: 0.6rem 2rem; /* 缩小高度 */
  font-size: 1rem; /* 与订单详情按钮字体大小一致 */
  font-weight: 500; /* 与订单详情按钮字体粗细一致 */
  border-radius: 8px; /* 统一圆角 */
  cursor: pointer;
  transition: transform 0.2s ease; /* 与订单详情按钮过渡效果一致 */
}

.modal-actions .btn-primary {
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
  border: 1px solid var(--color-primary);
}
.modal-actions .btn-primary:hover {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  transform: translateY(-2px);
}

.modal-actions .btn-secondary {
  background-color: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.modal-actions .btn-secondary:hover {
  background-color: var(--color-card) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
  transform: translateY(-2px);
}

/* Hide header action buttons on desktop */
.header-actions {
  display: none;
}

/* Hide original action buttons on desktop */
.action-buttons {
  display: none;
}

/* Web Action Buttons (bottom) */
.web-action-buttons {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  padding: 0 1.5rem;
  justify-content: center;
}

.receipt-btn,
.refund-btn {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
  min-width: 418px;
}

.receipt-btn {
  background-color: var(--color-primary);
  color: white;
}

.receipt-btn:hover {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  transform: translateY(-2px);
}

.refund-btn {
  background-color: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.refund-btn:hover {
  background-color: var(--color-card) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
  transform: translateY(-2px);
}

/* Mobile responsive adjustments - reorder sections */
@media (max-aspect-ratio: 1/1) {
  .order-detail-main-content {
    padding-top: calc(var(--navbar-height, 60px) + 2rem);
    padding-bottom: 2rem;
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .order-detail-header {
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

  /* Hide header action buttons on mobile */
  .header-actions {
    display: none;
  }

  /* Reorder layout sections using flexbox order */
  .order-detail-layout {
    display: flex;
    flex-direction: column;
  }

  .order-meta-info.card {
    order: 2; /* 订单信息移到第二位 */
    margin-bottom: 1.5rem;
    padding: 1rem;
    display: block;
  }

  .order-meta-info.card > div:first-child {
    margin-top: -1rem;
  }

  .order-meta-info.card > div:last-child {
    margin-bottom: -1rem;
  }

  .order-contents-grid {
    order: 3; /* 地址和摘要移到第三位 */
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .order-items-section.card {
    order: 1; /* 订单商品移到第一位 */
    margin-bottom: 1.5rem;
    padding: 1rem;
  }

  .card h2 {
    font-size: 1rem;
    margin-bottom: 0.8rem;
    padding-bottom: 0.5rem;
  }

  .order-items-section.card h2 {
    display: none;
  }

  .meta-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .meta-item:last-child {
    border-bottom: none;
  }

  .meta-label {
    font-size: 0.9rem;
  }

  .meta-value {
    font-size: 0.9rem;
  }

  .order-items-list {
    margin: -1rem 0;
  }

  .order-item {
    padding: 0.8rem 0;
    gap: 0.8rem;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-name {
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-qty-price {
    font-size: 0.8rem;
  }

  .item-total-price {
    display: none;
  }

  .item-total-price-mobile {
    display: block;
    font-size: 0.8rem;
    margin-top: 0.2rem;
    font-weight: 600;
  }

  .summary-item {
    padding: 0.8rem 0;
    font-size: 0.9rem;
  }

  .summary-item span:first-child,
  .summary-item span:last-child {
    color: var(--color-text);
    font-weight: 500;
  }

  .total-line {
    font-size: 0.9rem;
  }

  .order-contents-grid {
    display: block;
  }

  .shipping-address-section.card {
    margin-bottom: 1.5rem;
    padding: 0.8rem 1rem;
  }

  .order-summary-section.card {
    margin-bottom: 1.5rem;
    padding: 0.8rem 1rem 0.1rem 1rem; /* 缩小下内边距从0.8rem到0.4rem */
  }

  .shipping-address-section.card > div:first-child {
    margin-top: -1rem;
  }

  .shipping-address-section.card > div:last-child {
    margin-bottom: -0.3rem;
  }

  .order-summary-section.card .summary-item:first-child {
    margin-top: -1rem;
    padding-top: 0.4rem;
  }

  .order-summary-section .summary-item:last-of-type {
    margin-bottom: 0 !important;
  }

  .order-summary-section .total-line {
    padding-top: 0.4rem !important;
    margin-top: 0.4rem !important;
    margin-bottom: 0rem !important; /* 配合缩小的card padding，不需要负margin */
  }

  .shipping-address-section h2 {
    font-size: 1rem;
    margin-bottom: 0.8rem;
    padding-bottom: 0.5rem;
  }

  .order-summary-section h2 {
    font-size: 1rem;
    margin-bottom: 0rem;
    padding-bottom: 0.5rem;
  }

  .name-phone-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .phone-number {
    color: var(--color-text);
    font-weight: normal;
  }

  .shipping-address-section p {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }

  /* Hide web action buttons on mobile */
  .web-action-buttons {
    display: none !important;
  }

  /* Mobile Action Buttons */
  .action-buttons {
    display: flex !important; /* Override desktop display: none */
    flex-direction: column !important;
    gap: 0.8rem;
    margin-top: 1rem;
    padding: 0;
    justify-content: stretch;
  }

  .receipt-btn,
  .refund-btn {
    width: 100%;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease;
    min-width: auto;
  }

  .receipt-btn {
    background-color: var(--color-primary);
    color: white;
  }

  .receipt-btn:hover {
    background-color: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    transform: translateY(-2px);
  }

  .refund-btn {
    background-color: var(--color-card);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .refund-btn:hover {
    background-color: var(--color-card) !important;
    border-color: var(--color-border) !important;
    color: var(--color-text) !important;
    transform: translateY(-2px);
  }

  /* Mobile Refund Modal Optimizations */
  .modal-panel {
    padding: 1.5rem; /* 缩小移动端左右边距 */
    width: 95%;
    max-width: none;
  }

  /* 缩小大标题与小标题间距 */
  .modal-title {
    margin-bottom: 1rem !important; /* 从2rem缩小到1rem */
  }

  /* 缩小商家信息与输入框间距 */
  .refund-info-content {
    padding-top: 0.1rem !important; /* 从1.5rem缩小到0.8rem */
  }

  .modal-actions {
    flex-direction: column !important; /* 按钮上下布局 */
    gap: 0.8rem !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding: 0;
    margin-top: 1rem;
  }

  .modal-actions .btn {
    width: 100%;
    min-width: auto !important;
  }
}
</style>
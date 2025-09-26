<template>
  <div class="admin-order-detail-page-container">
    <main class="order-detail-main-content">
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>
      <div v-else-if="!order" class="not-found-state">
        <p>未找到订单</p>
        <router-link to="/admin/orders" class="btn btn-primary">返回订单管理</router-link>
      </div>
      <div v-else class="order-detail-layout">
        <div class="order-detail-header">
          <router-link to="/admin/orders" class="btn btn-outline back-to-orders-btn">&larr; 返回订单管理</router-link>
        </div>

        <!-- 管理员操作按钮 -->
        <div v-if="['REFUND_IN_PROGRESS','PROCESSING', 'SHIPPED', 'REFUND_FAILED'].includes(order.status)" class="admin-actions card">
          <h3>管理员操作</h3>
          <div class="action-buttons">
            <button v-if="order.status === 'PROCESSING'" @click="handleShipOrder" class="btn btn-primary">发货</button>
            <button v-if="order.status === 'SHIPPED'" @click="handleUpdateShippingInfo" class="btn btn-outline">更新物流信息</button>
            <button v-if="['REFUND_IN_PROGRESS', 'REFUND_FAILED'].includes(order.status)" @click="handleInitiateRefund" class="btn btn-danger">发起退款</button>
          </div>
        </div>

        <div class="order-meta-info card">
          <div class="meta-item">
            <span class="meta-label">订单ID:</span>
            <span class="meta-value">{{ order.id }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">订单号:</span>
            <span class="meta-value">{{ order.orderNumber }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">下单时间:</span>
            <span class="meta-value">{{ formatDate(order.orderedTime) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">订单状态:</span>
            <span class="meta-value status-text">{{ getStatusText(order.status) }}</span>
          </div>
          <div class="meta-item" v-if="order.paymentMethod">
            <span class="meta-label">支付方式:</span>
            <span class="meta-value">{{ order.paymentMethod }}</span>
          </div>
          <div class="meta-item" v-if="order.userEmail">
            <span class="meta-label">用户邮箱:</span>
            <span class="meta-value">{{ order.userEmail }}</span>
          </div>
          <div class="meta-item" v-if="order.paidTime">
            <span class="meta-label">支付时间:</span>
            <span class="meta-value">{{ formatDate(order.paidTime) }}</span>
          </div>
          <div class="meta-item" v-if="order.shippedTime">
            <span class="meta-label">发货时间:</span>
            <span class="meta-value">{{ formatDate(order.shippedTime) }}</span>
          </div>
          <div class="meta-item" v-if="order.deliveredTime">
            <span class="meta-label">送达时间:</span>
            <span class="meta-value">{{ formatDate(order.deliveredTime) }}</span>
          </div>

          <!-- Tracking Information -->
          <div class="meta-item" v-if="order.trackingNumber">
            <span class="meta-label">物流单号:</span>
            <span class="meta-value">{{ order.trackingNumber }}</span>
          </div>
          <div class="meta-item" v-if="order.shippingCarrier">
            <span class="meta-label">物流公司:</span>
            <span class="meta-value">{{ order.shippingCarrier }}</span>
          </div>
          <div class="meta-item" v-if="order.customerNotes">
            <span class="meta-label">客户备注:</span>
            <span class="meta-value">{{ order.customerNotes }}</span>
          </div>
        </div>

        <div class="order-contents-grid">
          <section class="shipping-address-section card">
            <h2>收货地址</h2>
            <!-- 优先使用地址快照信息 -->
            <div v-if="order.shippingRecipientName">
              <p><strong>{{ order.shippingRecipientName }}</strong></p>
              <p>{{ order.shippingPhoneNumber }}</p>
              <p>{{ order.shippingProvince }}{{ order.shippingCity }}{{ order.shippingArea }}{{ order.shippingDetailedAddress }}</p>
            </div>
            <!-- 兜底：使用原地址信息（适用于旧订单） -->
            <div v-else-if="order.shippingAddress">
              <p><strong>{{ order.shippingAddress.recipientName }}</strong></p>
              <p>{{ order.shippingAddress.phoneNumber }}</p>
              <p>{{ order.shippingAddress.province }}{{ order.shippingAddress.city }}{{ order.shippingAddress.area }}{{ order.shippingAddress.detailedAddress }}</p>
            </div>
            <div v-else><p>地址不可用</p></div>
          </section>

          <section class="order-summary-section card">
            <h2>订单总览</h2>
            <div class="summary-item">
              <span>商品小计 ({{ order.orderItems.length }} 件)</span>
              <span>{{ order.itemsSubtotal.toFixed(2) }}￥</span>
            </div>
            <div class="summary-item">
              <span>运费</span>
              <span>0.00￥</span> <!-- Admin side might also have fixed shipping cost or display 0 -->
            </div>
            <div v-if="discount > 0" class="summary-item">
              <span>折扣</span>
              <span>-{{ discount.toFixed(2) }}￥</span>
            </div>
            <div class="summary-item total-line">
              <span>订单总计</span>
              <span>{{ order.totalAmount.toFixed(2) }}￥</span>
            </div>
          </section>
        </div>

        <section class="order-items-section card">
          <h2>订单商品</h2>
          <ul class="order-items-list">
            <li v-for="item in order.orderItems" :key="item.productId" class="order-item">
              <img :src="item.productImageUrl || '/src/assets/images/placeholder-product.png'" :alt="item.productName" class="item-image">
              <div class="item-info">
                <p class="item-name">{{ item.productName }}</p>
                <p class="item-qty-price">{{ item.color || '默认' }} / {{ item.size || '默认' }} / x{{ item.quantity }}</p>
              </div>
              <p class="item-total-price">{{ (item.quantity * item.priceAtPurchase).toFixed(2) }}￥</p>
            </li>
          </ul>
        </section>
      </div>
    </main>

    <!-- Logistics Info Modal -->
    <ShippingInfoModal
      v-model="showShippingModal"
      :title="modalTitle"
      :initialTrackingNumber="currentTrackingNumber"
      :initialShippingCarrier="currentShippingCarrier"
      @confirm="handleShippingInfoConfirmed"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import { useI18n } from 'vue-i18n'; // 暂时移除国际化
import { getOrderById, updateOrderStatus, initiateRefund } from '../../api/orderApi'; // 导入API
import ShippingInfoModal from '../../components/admin/ShippingInfoModal.vue'; // 导入物流信息模态框组件

const route = useRoute();
const router = useRouter();
// const { t } = useI18n(); // 暂时移除国际化
const loading = ref(true);
const order = ref(null);

const shippingCost = ref(0.00); // 暂定免运费
const discount = ref(0.00);    // 暂无折扣

// 控制物流信息模态框显示
const showShippingModal = ref(false);
const modalTitle = ref('');
const currentTrackingNumber = ref('');
const currentShippingCarrier = ref('');

const orderStatusMap = {
  PENDING: '待支付',
  PROCESSING: '处理中/待发货',
  SHIPPED: '已发货',
  DELIVERED: '已送达/已完成',
  CANCELED: '已取消',
  REFUNDED: '已退款',
  REFUND_FAILED: '退款失败',
  REFUND_IN_PROGRESS: '退款中'
};

const getStatusText = (statusKey) => {
  return orderStatusMap[statusKey] || statusKey;
};


const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const fetchOrderDetails = async () => {
  loading.value = true;
  const orderId = route.params.orderId; // 确保路由参数名正确

  if (orderId) {
    try {
      const fetchedOrder = await getOrderById(orderId);
      order.value = fetchedOrder;
      console.log('Fetched admin order details:', order.value);
    } catch (error) {
      console.error('Error fetching admin order details:', error);
      alert('获取订单详情失败: ' + (error.response?.data?.message || error.message));
      // 如果未找到订单，可以重定向
      // router.push({ name: 'AdminOrderManagement' });
    } finally {
      loading.value = false;
    }
  } else {
    console.warn('Order ID is missing from route params for admin order detail.');
    loading.value = false;
    router.push({ name: 'AdminOrderManagement' }); // 重定向回订单管理列表
  }
};

// 管理员操作方法
const handleShipOrder = async () => {
  // if (confirm('确认发货？')) {
  modalTitle.value = '填写发货信息';
  currentTrackingNumber.value = '';
  currentShippingCarrier.value = '';
  showShippingModal.value = true;
  // }
};

const handleDeliverOrder = async () => {
  if (confirm('确认标记为已送达？')) {
    try {
      const updatedOrder = await updateOrderStatus(order.value.id, { status: 'DELIVERED' });
      order.value = updatedOrder;
      alert('订单已成功标记为已送达！');
    } catch (error) {
      console.error('标记为已送达失败:', error);
      alert('标记为已送达失败: ' + (error.response?.data?.message || error.message));
    }
  }
};

const handleCancelOrder = async () => {
  if (confirm('确认取消订单？此操作不可撤销！')) {
    try {
      const updatedOrder = await updateOrderStatus(order.value.id, { status: 'CANCELED' });
      order.value = updatedOrder;
      alert('订单已成功取消！');
    } catch (error) {
      console.error('取消订单失败:', error);
      alert('取消订单失败: ' + (error.response?.data?.message || error.message));
    }
  }
};

const handleInitiateRefund = async () => {
  if (confirm('确认要为该订单发起退款吗？此操作会立即向支付网关提交请求。')) {
    try {
      await initiateRefund(order.value.id);
      alert('退款请求已成功提交！订单状态将很快更新为"退款中"。');
      // 刷新订单详情以显示最新状态
      fetchOrderDetails();
    } catch (error) {
      console.error('发起退款失败:', error);
      alert('发起退款失败: ' + (error.response?.data?.message || error.message));
    }
  }
};

// Handle Update Shipping Info (原有逻辑已修改)
const handleUpdateShippingInfo = async () => {
  // if (confirm('确认更新物流信息？')) {
  modalTitle.value = '更新物流信息';
  currentTrackingNumber.value = order.value.trackingNumber || '';
  currentShippingCarrier.value = order.value.shippingCarrier || '';
  showShippingModal.value = true;
  // }
};

// New: Handle Shipping Info Confirmed from modal
const handleShippingInfoConfirmed = async ({ trackingNumber, shippingCarrier }) => {
  if (!order.value) return;

  try {
    const updatedOrder = await updateOrderStatus(order.value.id, {
      status: 'SHIPPED',
      trackingNumber: trackingNumber,
      shippingCarrier: shippingCarrier
    });
    order.value = updatedOrder;
    alert('物流信息已成功更新！');
  } catch (error) {
    console.error('更新物流信息失败:', error);
    alert('更新物流信息失败: ' + (error.response?.data?.message || error.message));
  }
};

onMounted(() => {
  fetchOrderDetails();
});
</script>

<style scoped>
.admin-order-detail-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: transparent; /* 将背景色设置为透明 */
  color: var(--color-text);
}

.order-detail-main-content {
  padding-top: calc(var(--admin-navbar-height, 60px) + 2rem); /* Adjust based on admin layout */
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: clamp(1.8rem, 4.5vw, 2.4rem);
  font-weight: 600;
  color: var(--color-text);
}

.card {
  background-color: var(--color-card);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-text-secondary);
  color: var(--color-text-secondary);
}
.btn-outline:hover {
  background-color: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-text-secondary);
}

.order-meta-info {
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
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.meta-value {
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 600;
}

.status-text {
  padding: 0.3rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  display: inline-block;
  width: fit-content;
}

.order-contents-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .order-contents-grid {
    grid-template-columns: 1fr 1fr; /* Two columns on larger screens */
  }
}

.shipping-address-section h2,
.order-summary-section h2,
.order-items-section h2 {
  font-size: 1.25rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.order-summary-section .summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--color-border);
  font-size: 0.95rem;
}

.order-summary-section .summary-item:last-of-type {
  border-bottom: none;
}

.order-summary-section .total-line {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-text);
  border-top: none; /* Already handled by explicit removal in user OrderDetailPage */
}
/* Ensure there's no border-top for .total-line here if it was present in source */


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
  border-bottom: 1px solid var(--color-border);
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.item-info {
  flex-grow: 1;
}

.item-name {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.item-qty-price {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.item-total-price {
  font-weight: 600;
  color: var(--color-text);
  font-size: 1rem;
  min-width: 80px; /* Adjust as needed for alignment */
  text-align: right;
}

/* Admin Actions Section */
.admin-actions {
  margin-bottom: 2rem;
}

.admin-actions h3 {
  font-size: 1.25rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.admin-actions .action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Base button styles - ensure they match admin theme */
.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-primary { background-color: var(--color-primary); color: #fff; }
.btn-primary:hover { background-color: var(--color-primary-hover); }
.btn-success { background-color: #10B981; color: #fff; } /* Emerald 500 */
.btn-success:hover { background-color: #059669; } /* Emerald 600 */
.btn-danger { background-color: #EF4444; color: #fff; } /* Red 500 */
.btn-danger:hover { background-color: #DC2626; } /* Red 600 */
.btn-warning { background-color: #F59E0B; color: #fff; } /* Amber 500 */
.btn-warning:hover { background-color: #D97706; } /* Amber 600 */

/* 移动端响应式布局 */
@media (max-aspect-ratio: 1/1) {
  .admin-order-detail-page-container {
    padding: 0;
  }
  
  .order-detail-main-content {
    padding: 1rem;
  }
  
  .order-detail-layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .order-detail-header {
    margin-bottom: 0.5rem;
  }
  
  .back-to-orders-btn {
    font-size: 0.85rem;
    padding: 0.6rem 1rem;
  }
  
  /* 管理员操作区域 */
  .admin-actions {
    margin-bottom: 1rem;
    padding: 1rem;
  }
  
  .admin-actions h3 {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
    padding-bottom: 0.5rem;
  }
  
  .admin-actions .action-buttons {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .admin-actions .btn {
    width: 100%;
    justify-content: center;
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
  
  /* 订单信息区域 */
  .order-meta-info.card {
    padding: 1rem;
    display: block;
  }
  
  .meta-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--color-border-subtle);
  }
  
  .meta-item:last-child {
    border-bottom: none;
  }
  
  .meta-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text);
  }
  
  .meta-value {
    font-size: 0.9rem;
    color: var(--color-text);
    text-align: right;
    max-width: 60%;
    word-break: break-word;
  }
  
  .status-text {
    font-weight: 600;
  }
  
  /* 订单商品区域 */
  .order-items-section.card {
    padding: 1rem;
  }
  
  .order-items-section h2 {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
    padding-bottom: 0.5rem;
  }
  
  .order-items-list {
    margin: -0.5rem 0;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 1rem 0;
  }
  
  .item-image {
    width: 60px;
    height: 60px;
    align-self: center;
  }
  
  .item-info {
    width: 100%;
    text-align: center;
  }
  
  .item-name {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .item-qty-price {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }
  
  .item-total-price {
    font-size: 0.9rem;
    text-align: center;
    min-width: auto;
  }
  
  /* 收货地址区域 */
  .shipping-address-section.card,
  .order-summary-section.card {
    padding: 1rem;
  }
  
  .shipping-address-section h2,
  .order-summary-section h2 {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
    padding-bottom: 0.5rem;
  }
  
  .address-info p {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  /* 订单汇总区域 */
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    font-size: 0.9rem;
  }
  
  .total-line {
    border-top: 1px solid var(--color-border-subtle);
    padding-top: 0.8rem;
    margin-top: 0.5rem;
    font-weight: 600;
  }
}
</style>
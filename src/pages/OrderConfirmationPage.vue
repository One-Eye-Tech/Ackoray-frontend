<template>
  <div class="order-confirmation-page-container">
    <TopNavigationBar />
    <main class="confirmation-main-content">
      <div v-if="loading" class="loading-message">
        <p>{{ $t('orderConfirmation.loading') }}</p>
      </div>
      <div v-else-if="!orderDetails" class="error-message">
        <p>{{ $t('orderConfirmation.loadError') }}</p>
        <router-link to="/" class="btn btn-primary">{{ $t('orderConfirmation.backToHome') }}</router-link>
      </div>
      <div v-else class="confirmation-details-card">
        <div class="success-icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="success-icon">
            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
          </svg>
        </div>
        <h1 class="page-title">{{ $t('orderConfirmation.thankYou') }}</h1>
        <p class="sub-message">{{ $t('orderConfirmation.orderSuccessMessage') }}</p>

        <div class="order-meta-confirmation">
          <p><strong>{{ $t('orderConfirmation.orderId') }}:</strong> {{ orderDetails.id }}</p>
          <p><strong>{{ $t('orderConfirmation.orderDate') }}:</strong> {{ orderDetails.date }}</p>
        </div>

        <section class="confirmation-section">
          <h2>{{ $t('orderConfirmation.productInfo') }}</h2>
          <div class="summary-items-list-confirmation">
            <div v-for="item in orderDetails.items" :key="`${item.id}-${item.color}-${item.size}`" class="summary-item-confirmation">
              <img :src="item.imageUrl || '/src/assets/images/placeholder-product.png'" :alt="item.name" class="summary-item-image-confirmation">
              <div class="summary-item-details-confirmation">
                <p class="summary-item-name-confirmation">{{ item.name }}</p>
                <p class="summary-item-attributes-confirmation" v-if="item.color || item.size">
                  <span v-if="item.color">{{ item.color }}</span>
                  <span v-if="item.color && item.size"> / </span>
                  <span v-if="item.size">{{ item.size }}</span>
                </p>
                <p class="summary-item-quantity-confirmation">{{ $t('orderConfirmation.quantity') }}: {{ item.quantity }}</p>
              </div>
              <p class="summary-item-price-confirmation">${{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>
            <div v-if="!orderDetails.items || orderDetails.items.length === 0" class="empty-summary-items">
              <p>{{ $t('orderConfirmation.noItems') }}</p>
            </div>
          </div>
        </section>

        <section class="confirmation-section">
          <h2>{{ $t('orderConfirmation.orderTotal') }}</h2>
          <div class="summary-totals-confirmation">
            <div class="summary-row-confirmation">
              <span>{{ $t('orderConfirmation.subtotal') }}</span>
              <span>${{ orderDetails.subtotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row-confirmation">
              <span>{{ $t('orderConfirmation.shipping') }}</span>
              <span>{{ orderDetails.shipping > 0 ? '$' + orderDetails.shipping.toFixed(2) : $t('orderConfirmation.free') }}</span>
            </div>
            <div class="summary-row-confirmation total bold">
              <span>{{ $t('orderConfirmation.total') }}</span>
              <span>${{ orderDetails.total.toFixed(2) }}</span>
            </div>
          </div>
        </section>
        
        <section class="confirmation-section" v-if="orderDetails.shippingAddress">
          <h2>{{ $t('orderConfirmation.shippingAddress') }}</h2>
          <div class="shipping-address-summary-confirmation">
            <p>{{ orderDetails.shippingAddress.name }}</p>
            <p>{{ orderDetails.shippingAddress.phone }}</p>
            <p>{{ orderDetails.shippingAddress.province }}{{ orderDetails.shippingAddress.city }}{{ orderDetails.shippingAddress.area }}</p>
            <p>{{ orderDetails.shippingAddress.detailedAddress }}</p>
          </div>
        </section>

        <section class="confirmation-section">
          <h2>{{ $t('orderConfirmation.paymentMethod') }}</h2>
          <p class="payment-method-summary-confirmation">
            {{ orderDetails.paymentMethod === 'wechat' ? $t('orderConfirmation.wechatPay') : 
               (orderDetails.paymentMethod === 'alipay' ? $t('orderConfirmation.alipay') : 
               $t('orderConfirmation.unspecified')) }}
          </p>
        </section>
        
        <div class="actions-footer">
          <button type="button" class="btn btn-primary btn-continue-shopping" @click="handleContinueShopping">
            {{ $t('orderConfirmation.continueShopping') }}
          </button>
          <!-- <button type="button" class="btn btn-secondary" @click="viewOrderHistory">查看订单历史</button> -->
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TopNavigationBar from '../components/layout/TopNavigationBar.vue';
import Footer from '../components/layout/Footer.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const orderDetails = ref(null);
const loading = ref(true);

onMounted(() => {
  const orderId = route.params.orderId;
  if (orderId) {
    try {
      const storedOrderData = sessionStorage.getItem(`order_${orderId}`);
      if (storedOrderData) {
        orderDetails.value = JSON.parse(storedOrderData);
        // Optional: Remove item after retrieval to prevent re-use if the page is revisited via history
        // sessionStorage.removeItem(`order_${orderId}`); 
      } else {
        console.warn(`No order data found in sessionStorage for orderId: ${orderId}`);
      }
    } catch (error) {
      console.error('Error parsing order data from sessionStorage:', error);
    }
  } else {
    console.error('No orderId found in route params.');
  }
  loading.value = false;
});

const handleContinueShopping = () => {
  router.push('/');
};

// const viewOrderHistory = () => {
//   router.push('/account/orders'); // Example route
// };
</script>

<style scoped>
.order-confirmation-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background);
}

.confirmation-main-content {
  padding-top: calc(var(--navbar-height, 60px) + 2rem);
  padding-bottom: 4rem;
  flex-grow: 1;
  max-width: 700px; /* Slightly narrower for focused content */
  margin: 0 auto;
  width: 100%;
  padding-left: var(--container-padding, 1rem);
  padding-right: var(--container-padding, 1rem);
}

.loading-message, .error-message {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
  background-color: var(--color-card-background, #1A1A1B);
  border-radius: 12px;
  border: 1px solid var(--color-border-subtle, #2C2C2E);
}
.error-message .btn {
  margin-top: 1.5rem;
}

.confirmation-details-card {
  background-color: var(--color-card-background, #1A1A1B);
  padding: 2.5rem; /* More padding */
  border-radius: 12px;
  border: 1px solid var(--color-border-subtle, #2C2C2E);
  text-align: center; /* Center title and sub-message */
}

.success-icon-container {
  margin-bottom: 1rem;
}
.success-icon {
  width: 60px; /* Larger icon */
  height: 60px;
  color: var(--color-success, #2ECC71); /* A success green */
}

.page-title {
  font-size: clamp(1.8rem, 4.5vw, 2.4rem); /* Slightly larger */
  font-weight: 600;
  color: var(--color-text-primary);
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.sub-message {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2.5rem;
}

.order-meta-confirmation {
  text-align: left;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--color-input-background, #232326);
  border-radius: 8px;
}
.order-meta-confirmation p {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.4rem;
}
.order-meta-confirmation p strong {
  color: var(--color-text-primary);
}

.confirmation-section {
  margin-bottom: 2rem;
  text-align: left;
}
.confirmation-section:last-of-type {
    margin-bottom: 0;
}

.confirmation-section h2 {
  font-size: 1.15rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-input, #3F3F46);
}

/* Re-using and adapting styles from CheckoutPage for consistency */
.summary-items-list-confirmation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 20rem; 
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-bottom: 1rem;
}
.summary-items-list-confirmation::-webkit-scrollbar { width: 6px; }
.summary-items-list-confirmation::-webkit-scrollbar-track { background: var(--color-input-background); border-radius: 3px; }
.summary-items-list-confirmation::-webkit-scrollbar-thumb { background: var(--color-border-input); border-radius: 3px; }
.summary-items-list-confirmation::-webkit-scrollbar-thumb:hover { background: var(--color-accent-focus); }

.summary-item-confirmation {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--color-border-input);
}
.summary-item-confirmation:last-child { border-bottom: none; padding-bottom: 0.2rem; }

.summary-item-image-confirmation { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--color-border-subtle); }
.summary-item-details-confirmation { flex-grow: 1; text-align: left; }
.summary-item-name-confirmation { font-weight: 500; color: var(--color-text-primary); margin: 0 0 0.2rem 0; font-size: 0.9rem; }
.summary-item-attributes-confirmation,
.summary-item-quantity-confirmation { font-size: 0.75rem; color: var(--color-text-secondary); margin: 0 0 0.2rem 0; }
.summary-item-price-confirmation { font-weight: 500; color: var(--color-text-primary); font-size: 0.85rem; margin-left: auto; white-space: nowrap; }

.empty-summary-items p { color: var(--color-text-secondary); text-align: center; padding: 1rem 0; }

.summary-totals-confirmation { margin-top: 0.5rem; padding-top: 0.8rem; border-top: 1px solid var(--color-border-subtle); }
.summary-row-confirmation { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem; }
.summary-row-confirmation span:first-child { color: var(--color-text-secondary); }
.summary-row-confirmation span:last-child { color: var(--color-text-primary); font-weight: 500; }
.summary-row-confirmation.total span { font-size: 1.1rem; font-weight: 600; }
.summary-row-confirmation.total.bold span { color: var(--color-accent); }


.shipping-address-summary-confirmation p,
.payment-method-summary-confirmation {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 0.3rem;
}
.shipping-address-summary-confirmation p:first-child {
  color: var(--color-text-primary);
  font-weight: 500;
}

.actions-footer {
  margin-top: 2.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.actions-footer .btn {
  padding: 0.75rem 2rem; /* Generous padding */
  font-size: 1rem;
}
.btn-primary { /* Assuming default btn styles are available or defined globally */
  background: var(--color-accent); color: #fff; border: none; border-radius: 7px; cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover { background: var(--color-accent-hover); }

.btn-secondary {
  background: none; color: #aaa; border: 1.5px solid #444; border-radius: 7px; cursor: pointer;
  font-weight: 500;
  transition: border-color 0.2s, color 0.2s;
}
.btn-secondary:hover { color: #fff; border-color: var(--color-accent); }

</style> 
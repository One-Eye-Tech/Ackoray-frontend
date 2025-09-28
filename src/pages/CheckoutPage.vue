<template>
  <div class="checkout-page-container">
    <TopNavigationBar />
    <main class="checkout-main-content">
      <div class="checkout-header">
        <button @click="$router.back()" class="back-btn">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="page-title">{{ $t('checkout.title') }}</h1>
      </div>
      <div class="checkout-form-layout">
        <form @submit.prevent="handlePayNow">
          <!-- Product Information -->
          <section class="form-section product-info-section">
            <h2>{{ $t('checkout.productInfo') }}</h2>
            <div class="info-card">
              <div v-if="displayItems.length === 0" class="empty-checkout-message">
                {{ $t('checkout.noItems') }} <router-link to="/">{{ $t('checkout.continueShopping') }}</router-link>.
              </div>
              <div v-else class="checkout-items-list">
                <div v-for="item in displayItems" :key="`${item.id}-${item.color}-${item.size}`" class="checkout-item">
                  <img :src="getFullImageUrl(item.imageUrl) || '/src/assets/images/placeholder-product.png'" :alt="item.name" class="item-image">
                  <div class="item-details">
                    <p class="item-name">{{ item.name }}</p>
                    <p class="item-attributes" v-if="item.color || item.size">
                      <span v-if="item.color">{{ item.color }}</span>
                      <span v-if="item.color && item.size"> / </span>
                      <span v-if="item.size">{{ item.size }}</span>
                    </p>
                    <p class="item-quantity">{{ $t('checkout.quantity') }}: {{ item.quantity }}</p>
                  </div>
                  <p class="item-price">{{ Math.round(item.price * item.quantity) }}RMB</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Shipping Information -->
          <section class="form-section" v-if="displayItems.length > 0">
            <h2>{{ $t('checkout.shippingInfo') }}</h2>
            <div class="form-grid shipping-info-grid">
              <div class="form-group full-width">
                <div class="address-select-container">
                  <div class="address-select-trigger" @click="toggleAddressDropdown" :class="{ active: isAddressDropdownOpen }">
                    <span class="address-select-text">{{ getSelectedAddressLabel() }}</span>
                    <svg class="address-select-arrow" :class="{ rotated: isAddressDropdownOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <ul v-if="isAddressDropdownOpen" class="co-address-dropdown" @click.stop>
                    <li v-for="address in addressOptions" :key="address.value" 
                        class="co-address-option" 
                        :class="{ active: selectedAddressId === address.value }"
                        @click="selectAddress(address.value)">
                      {{ address.label }}
                    </li>
                    <li class="co-address-option" 
                        :class="{ active: selectedAddressId === 'add_new_address_sentinel' }"
                        @click="selectAddress('add_new_address_sentinel')">
                      {{ $t('checkout.addNewAddress') }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <!-- Order Notes -->
          <section class="form-section" v-if="displayItems.length > 0">
            <h2>{{ $t('checkout.orderNotes') }}</h2>
            <div class="form-group">
              <textarea id="orderNotes" v-model="orderNotes" class="form-input" rows="3"></textarea>
            </div>
          </section>

          <!-- Payment Method -->
           <section class="form-section" v-if="displayItems.length > 0">
              <h2>{{ $t('checkout.paymentMethod') }}</h2>
              <div class="payment-methods-container">
                <div class="payment-method-row">
                  <div class="payment-method-info">
                    <img :src="wechatPayIcon" alt="WeChat Pay" class="payment-icon" />
                    <span class="payment-method-name">{{ $t('checkout.paymentMethods.wechat') }}</span>
                  </div>
                  <div class="payment-radio-option">
                    <input type="radio" id="wechatPay" name="paymentMethod" value="wechat" v-model="selectedPaymentMethod" class="payment-radio">
                    <label for="wechatPay" class="payment-radio-label"></label>
                  </div>
                </div>
                <hr class="payment-divider">
                <div class="payment-method-row">
                  <div class="payment-method-info">
                    <img :src="alipayIcon" alt="Alipay" class="payment-icon" />
                    <span class="payment-method-name">{{ $t('checkout.paymentMethods.alipay') }}</span>
                  </div>
                  <div class="payment-radio-option">
                    <input type="radio" id="alipay" name="paymentMethod" value="alipay" v-model="selectedPaymentMethod" class="payment-radio">
                    <label for="alipay" class="payment-radio-label"></label>
                  </div>
                </div>
              </div>
            </section>

          <!-- Order Summary Totals -->
          <section class="form-section totals-summary-section" v-if="displayItems.length > 0">
            <h2>{{ $t('checkout.orderTotals') }}</h2>
            <div class="info-card">
              <div class="totals-summary">
                <div class="summary-row">
                  <span>{{ $t('checkout.shipping') }}</span>
                  <span>{{ shippingCost > 0 ? '$ ' + Math.round(shippingCost) : $t('checkout.free') }}</span>
                </div>
                <div class="summary-row">
                  <span>{{ $t('checkout.subtotal') }}</span>
                  <span>{{ Math.round(orderSubtotal) }} RMB</span>
                </div>
                <div class="summary-row total">
                  <span>{{ $t('checkout.total') }}</span>
                  <span>{{ Math.round(orderTotal) }} RMB</span>
                </div>
              </div>
            </div>
          </section>

          <button type="submit" class="btn btn-primary btn-pay-now" :disabled="displayItems.length === 0">
            {{ payNowButtonText }}
          </button>
          <div v-if="paymentAbandonedButCanResume && paymentTimeRemaining > 0" class="resume-payment-countdown">
            {{ $t('checkout.payWithinTime', { time: formattedTimeRemaining }) }}
          </div>
        </form>
      </div>  

      <!-- 新建收货信息弹窗 -->
      <div v-if="showAddAddressModal" class="modal-overlay" @click.self="showAddAddressModal = false">
        <div class="modal-panel">
          <div class="modal-header">
          <h3 class="modal-title">{{ $t('checkout.newShippingInfo') }}</h3>
            <button type="button" class="modal-close-btn" @click="showAddAddressModal = false">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="handleAddAddress">
            <div class="form-group">
              <label>{{ $t('checkout.recipientName') }}</label>
              <input v-model="newAddressForm.name" type="text" class="form-input" required />
            </div>
            <div class="form-group">
              <label>{{ $t('checkout.phoneNumber') }}</label>
              <input v-model="newAddressForm.phone" type="tel" class="form-input" required />
            </div>
            <div class="form-group">
              <label>{{ $t('checkout.region') }}</label>
              <div class="region-selectors">
                <!-- 省份选择 -->
                <div class="region-select-container">
                  <div class="region-select-trigger" @click="toggleProvinceDropdown" :class="{ active: isProvinceDropdownOpen }">
                    <span class="region-select-text">{{ getProvinceLabel() }}</span>
                    <svg class="region-select-arrow" :class="{ rotated: isProvinceDropdownOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <ul v-if="isProvinceDropdownOpen" class="co-region-dropdown" @click.stop>
                    <li v-for="province in allProvinces" :key="province.code" 
                        class="co-region-option" 
                        :class="{ active: newAddressForm.province === province.name }"
                        @click="selectProvince(province.name)">
                      {{ province.name }}
                    </li>
                  </ul>
                </div>
                
                <!-- 城市选择 -->
                <div class="region-select-container">
                  <div class="region-select-trigger" @click="toggleCityDropdown" :class="{ active: isCityDropdownOpen, disabled: !newAddressForm.province }">
                    <span class="region-select-text">{{ getCityLabel() }}</span>
                    <svg class="region-select-arrow" :class="{ rotated: isCityDropdownOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <ul v-if="isCityDropdownOpen && newAddressForm.province" class="co-region-dropdown" @click.stop>
                    <li v-for="city in newCities" :key="city.code" 
                        class="co-region-option" 
                        :class="{ active: newAddressForm.city === city.name }"
                        @click="selectCity(city.name)">
                      {{ city.name }}
                    </li>
                  </ul>
                </div>
                
                <!-- 区域选择 -->
                <div class="region-select-container">
                  <div class="region-select-trigger" @click="toggleAreaDropdown" :class="{ active: isAreaDropdownOpen, disabled: !newAddressForm.city }">
                    <span class="region-select-text">{{ getAreaLabel() }}</span>
                    <svg class="region-select-arrow" :class="{ rotated: isAreaDropdownOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <ul v-if="isAreaDropdownOpen && newAddressForm.city" class="co-region-dropdown" @click.stop>
                    <li v-for="area in newAreas" :key="area" 
                        class="co-region-option" 
                        :class="{ active: newAddressForm.area === area }"
                        @click="selectArea(area)">
                      {{ area }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>{{ $t('checkout.detailedAddress') }}</label>
              <textarea v-model="newAddressForm.detailedAddress" class="form-input" rows="2" maxlength="100" required></textarea>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn btn-primary">{{ $t('checkout.save') }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- QR Code Modal -->
      <div v-if="showQrCodeModal" class="modal-overlay" @click.self="closeQrCodeModal">
        <div class="modal-panel qr-code-modal-panel">
          <div class="modal-header">
            <h3 class="modal-title qr-modal-title">{{ getPaymentMethodTitle() }}</h3>
            <button type="button" class="modal-close-btn" @click="promptToAbandonPayment">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
          </button>
          </div>
          <div class="qr-code-container">
            <img v-if="qrCodeImageUrl" :src="qrCodeImageUrl" alt="请使用微信或者支付宝扫码支付" class="qr-code-image">
            <p v-else>{{ $t('checkout.qrCodeLoading') }}</p>
          </div>
          
        </div>
      </div>

      <!-- Payment Result Modal -->
      <div v-if="showPaymentResultModal" class="modal-overlay" @click.self="closePaymentResultModal">
        <div class="modal-panel payment-result-modal-panel">
          <div class="payment-result-content">
            <!-- Success Icon -->
            <div v-if="paymentResultType === 'success'" class="payment-result-icon success-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#10B981" stroke="#10B981" stroke-width="2"/>
                <path d="M20 32L28 40L44 24" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <!-- Failure Icon -->
            <div v-else class="payment-result-icon failure-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#EF4444" stroke="#EF4444" stroke-width="2"/>
                <path d="M22 22L42 42M22 42L42 22" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <!-- Result Title -->
            <h3 class="payment-result-title">
              {{ paymentResultType === 'success' ? '支付成功' : '支付失败' }}
            </h3>
            
            <!-- Result Message -->
            <p class="payment-result-message">{{ paymentResultMessage }}</p>
            
            <!-- Action Buttons -->
            <div class="payment-result-actions">
              <button v-if="paymentResultType === 'success'" 
                      type="button" 
                      class="btn btn-primary payment-result-btn" 
                      @click="handlePaymentSuccessAction">
                查看订单
              </button>
              <button v-else 
                      type="button" 
                      class="btn btn-primary payment-result-btn" 
                      @click="handlePaymentFailureAction">
                重新支付
              </button>
              <button type="button" 
                      class="btn btn-secondary payment-result-btn" 
                      @click="closePaymentResultModal">
                {{ paymentResultType === 'success' ? '稍后查看' : '取消' }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </main>
    <!-- <Footer /> -->
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TopNavigationBar from '../components/layout/TopNavigationBar.vue';
import Footer from '../components/layout/Footer.vue';
import provinces from '../assets/address/provinces.json';
import cities from '../assets/address/cities.json';
import areas from '../assets/address/areas.json';
import addressApi from '../api/addressApi';
import { createOrder, cancelOrder, getOrderStatusByNumber, createOrderWithPayment } from '../api/orderApi';
import { createPayment, pollPaymentStatus, generateOrderNumber } from '../api/paymentApi';
import { getFullImageUrl } from '../api/apiConfig.js';
import QRCode from 'qrcode';

// 静态资源导入
import wechatPayIcon from '../assets/images/wx.png';
import alipayIcon from '../assets/images/zfb.png';

const router = useRouter();
const { t } = useI18n();
const globalCartItems = inject('cartItems');
const clearCart = inject('clearCart');
const loggedInUser = inject('currentUser');

const directBuyItem = ref(null);
const displayItems = computed(() => {
  return directBuyItem.value ? [directBuyItem.value] : (globalCartItems.value || []);
});

// 新增 ref 来保存当前订单信息
const currentOrder = ref(null);

// 支付结果弹出框相关变量
const showPaymentResultModal = ref(false);
const paymentResultType = ref('success'); // 'success' 或 'failure'
const paymentResultMessage = ref('');

// 收货信息管理
const savedAddresses = ref([]);
const selectedAddressId = ref('');
const showAddAddressModal = ref(false);
const newAddressForm = ref({
  name: '', phone: '', province: '', city: '', area: '', detailedAddress: ''
});
const previousSelectedAddressId = ref('');
const selectedPaymentMethod = ref('wechat');
const orderNotes = ref('');
const newCities = ref([]);
const newAreas = ref([]);

// 地址下拉框状态
const isAddressDropdownOpen = ref(false);

// Region dropdown states for modal
const isProvinceDropdownOpen = ref(false);
const isCityDropdownOpen = ref(false);
const isAreaDropdownOpen = ref(false);

// QR Code Modal State
const showQrCodeModal = ref(false);
const qrCodeImageUrl = ref('');
const paymentTimerId = ref(null);
const paymentTimeRemaining = ref(0); // in seconds
const pollingIntervalId = ref(null);

const paymentAbandonedButCanResume = ref(false);

const formattedTimeRemaining = computed(() => {
  const minutes = Math.floor(paymentTimeRemaining.value / 60);
  const seconds = paymentTimeRemaining.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const payNowButtonText = computed(() => {
  return paymentAbandonedButCanResume.value ? t('checkout.continuePay') : t('checkout.payNow');
});

const addressOptions = computed(() => {
  return savedAddresses.value.map(addr => ({
    label: `${addr.recipientName} ${addr.phoneNumber} ${addr.province}${addr.city}${addr.area} ${addr.detailedAddress}`,
    value: addr.id
  }));
});

// 地址下拉框方法
const toggleAddressDropdown = () => {
  isAddressDropdownOpen.value = !isAddressDropdownOpen.value;
};

const selectAddress = (value) => {
  selectedAddressId.value = value;
  isAddressDropdownOpen.value = false;
};

const getSelectedAddressLabel = () => {
  if (selectedAddressId.value === 'add_new_address_sentinel') {
    return t('checkout.addNewAddress');
  }
  const selectedAddress = addressOptions.value.find(addr => addr.value === selectedAddressId.value);
  return selectedAddress ? selectedAddress.label : t('checkout.selectShippingInfo');
};

// 省市区下拉框方法
const toggleProvinceDropdown = () => {
  isProvinceDropdownOpen.value = !isProvinceDropdownOpen.value;
  isCityDropdownOpen.value = false;
  isAreaDropdownOpen.value = false;
};

const toggleCityDropdown = () => {
  if (!newAddressForm.value.province) return;
  isCityDropdownOpen.value = !isCityDropdownOpen.value;
  isProvinceDropdownOpen.value = false;
  isAreaDropdownOpen.value = false;
};

const toggleAreaDropdown = () => {
  if (!newAddressForm.value.city) return;
  isAreaDropdownOpen.value = !isAreaDropdownOpen.value;
  isProvinceDropdownOpen.value = false;
  isCityDropdownOpen.value = false;
};

const selectProvince = (provinceName) => {
  newAddressForm.value.province = provinceName;
  newAddressForm.value.city = '';
  newAddressForm.value.area = '';
  handleNewProvinceChange();
  isProvinceDropdownOpen.value = false;
};

const selectCity = (cityName) => {
  newAddressForm.value.city = cityName;
  newAddressForm.value.area = '';
  handleNewCityChange();
  isCityDropdownOpen.value = false;
};

const selectArea = (areaName) => {
  newAddressForm.value.area = areaName;
  isAreaDropdownOpen.value = false;
};

const getProvinceLabel = () => {
  return newAddressForm.value.province || t('checkout.selectProvince');
};

const getCityLabel = () => {
  return newAddressForm.value.city || t('checkout.selectCity');
};

const getAreaLabel = () => {
  return newAddressForm.value.area || t('checkout.selectDistrict');
};

function openAddAddressModal() {
  newAddressForm.value = { name: '', phone: '', province: '', city: '', area: '', detailedAddress: '' };
  newCities.value = [];
  newAreas.value = [];
  // 重置省市区下拉框状态
  isProvinceDropdownOpen.value = false;
  isCityDropdownOpen.value = false;
  isAreaDropdownOpen.value = false;
  showAddAddressModal.value = true;
}

// Watch for modal close to potentially restore selection if no new address was added and selected
watch(showAddAddressModal, (isShowing) => {
  if (!isShowing && !savedAddresses.value.some(addr => addr.id === selectedAddressId.value)) {
    // If modal closed and current selectedId is not a valid address (e.g. was reset or never set after add attempt)
    // and there was a previously valid selection, restore it.
    // This part might need adjustment based on how selectedAddressId is handled post-add.
    if (previousSelectedAddressId.value && savedAddresses.value.some(addr => addr.id === previousSelectedAddressId.value)) {
      // selectedAddressId.value = previousSelectedAddressId.value;
    }
  }
});

// 地区数据与级联逻辑（替换为使用JSON文件）
const allProvinces = ref(provinces);
// 新建表单级联
function handleNewProvinceChange() {
  newAddressForm.value.city = '';
  newAddressForm.value.area = '';
  const provinceCode = provinces.find(p => p.name === newAddressForm.value.province)?.code;
  newCities.value = provinceCode ? cities.filter(c => c.provinceCode === provinceCode) : [];
  newAreas.value = [];
}
function handleNewCityChange() {
  newAddressForm.value.area = '';
  const cityCode = newCities.value.find(c => c.name === newAddressForm.value.city)?.code;
  newAreas.value = cityCode ? areas.filter(a => a.cityCode === cityCode).map(a => a.name) : [];
}

watch(selectedAddressId, (newValue, oldValue) => {
  if (newValue === "add_new_address_sentinel") {
    openAddAddressModal();
    nextTick(() => {
      selectedAddressId.value = oldValue; // Revert to the value before "Add New Address" was selected
    });
  } else if (newValue && savedAddresses.value.some(addr => addr.id === newValue)){
    // This part ensures previousSelectedAddressId is updated only for actual address selections
    previousSelectedAddressId.value = newValue;
  } else if (!newValue && oldValue && oldValue !== 'add_new_address_sentinel'){
    // If selectedAddressId becomes empty (e.g. after modal closes without selection or address deleted)
    // and oldValue was a valid address, we might want to retain that as previous.
    // For now, previousSelectedAddressId will correctly hold the last *valid* user-selected address.
    // If selection is cleared, previousSelectedAddressId remains the last valid one.
  }
});
async function handleAddAddress() {
  if (!newAddressForm.value.name || !newAddressForm.value.phone || !newAddressForm.value.province || !newAddressForm.value.city || !newAddressForm.value.area || !newAddressForm.value.detailedAddress) {
    alert(t('checkout.fillCompleteInfo'));
    return;
  }

  try {
    // 明确映射字段，以匹配后端 AddressRequestDto 的要求
    const addressDataToSend = {
      recipientName: newAddressForm.value.name,
      phoneNumber: newAddressForm.value.phone,
      province: newAddressForm.value.province,
      city: newAddressForm.value.city,
      area: newAddressForm.value.area,
      detailedAddress: newAddressForm.value.detailedAddress,
    };
    
    const addedAddress = await addressApi.addAddress(addressDataToSend);
    savedAddresses.value.push(addedAddress);
    selectedAddressId.value = addedAddress.id; // Select the new address
    showAddAddressModal.value = false;
  } catch (error) {
    console.error('Error adding new address:', error);
  }
}

const shippingCost = computed(() => {
  return 0; 
});
const orderSubtotal = computed(() => {
  if (!displayItems.value) return 0;
  return displayItems.value.reduce((total, item) => total + item.price * item.quantity, 0);
});
const orderTotal = computed(() => {
  return orderSubtotal.value + shippingCost.value;
});

let timerInterval = null;

    const startPaymentTimer = (duration) => {
      paymentTimeRemaining.value = duration;
    
      if (paymentTimerId.value) {
        clearInterval(paymentTimerId.value);
      }
      paymentTimerId.value = setInterval(() => {
        paymentTimeRemaining.value -= 1;
        if (paymentTimeRemaining.value <= 0) {
          handlePaymentTimeout();
        }
      }, 1000);
    };

    const handlePaymentTimeout = async () => { 
      if (paymentTimerId.value) {
        clearInterval(paymentTimerId.value);
        paymentTimerId.value = null;
      }
      showQrCodeModal.value = false;
      qrCodeImageUrl.value = '';
    
      alert(t('checkout.paymentTimeout'));
      paymentAbandonedButCanResume.value = false; // 不可恢复
    
      // 清除相关数据
      if (directBuyItem.value) {
        directBuyItem.value = null;
        sessionStorage.removeItem('directBuyItem');
      } else if (clearCart && typeof clearCart === 'function') {
        clearCart();
      }
      selectedAddressId.value = '';
      selectedPaymentMethod.value = '';
      orderNotes.value = '';
      console.log('[CheckoutPage] Checkout form reset due to payment timeout.');
    };

    async function handlePayNow() {
      if (displayItems.value.length === 0 || !selectedAddressId.value) {
        alert(t('checkout.alerts.selectAddress'));
        return;
      }
    
      // 如果用户选择继续支付
      if (paymentAbandonedButCanResume.value && currentOrder.value) {
        showQrCodeModal.value = true;
        startPaymentTimer(paymentTimeRemaining.value); // 继续计时
        startPollingOrderStatus(currentOrder.value.orderNumber);
        return;
      }
      
      // 准备后端 DTO 的订单项数据 (CreateOrderItemRequestDto)
      const orderItemsData = displayItems.value.map(item => ({
          // 确保字段名与您后端的 DTO 完全一致
          productId: item.productId || item.id,
          productName: item.name,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
      }));

      // 获取选中的地址对象
      const selectedAddress = savedAddresses.value.find(addr => addr.id === selectedAddressId.value);
      if (!selectedAddress) {
          throw new Error('请选择收货地址');
      }

      // 构建 CreateOrderRequestDto
      const orderRequestData = {
          userId: loggedInUser.value.id,
          shippingAddress: {
              recipientName: selectedAddress.recipientName,
              phoneNumber: selectedAddress.phoneNumber,
              province: selectedAddress.province,
              city: selectedAddress.city,
              area: selectedAddress.area,
              detailedAddress: selectedAddress.detailedAddress
          },
          paymentMethod: selectedPaymentMethod.value,
          customerNotes: orderNotes.value,
          items: orderItemsData,
      };
      
      try {
        console.log('=== 开始创建订单和支付 ===');
        console.log('支付方式:', selectedPaymentMethod.value);
        console.log('订单数据:', orderRequestData);
        
        // 使用新的统一支付接口创建订单和支付
        const response = await createOrderWithPayment(orderRequestData, selectedPaymentMethod.value);
        
        currentOrder.value = response.order; // 保存订单信息
        const paymentInfo = response.payment; // 支付信息
        
        console.log('订单创建成功:', currentOrder.value);
        console.log('支付信息:', paymentInfo);
        
        // 处理支付二维码
        if (paymentInfo.codeUrl) {
          // 使用 qrcode 库将 URL 字符串转换为可显示的二维码图片
          qrCodeImageUrl.value = await QRCode.toDataURL(paymentInfo.codeUrl, {
            width: 320,
            margin: 2,
            errorCorrectionLevel: 'H'
          });
          
          console.log('二维码生成成功');
        } else {
          // 处理没有返回二维码的情况
          qrCodeImageUrl.value = '';
          console.log("未返回支付二维码URL");
        }
    
        showQrCodeModal.value = true; // 显示二维码弹窗
        startPaymentTimer(1800); // 启动30分钟倒计时
        startPollingOrderStatus(currentOrder.value.orderNumber);
    
      } catch (error) {
        console.error(t('checkout.alerts.createOrderFailed'), error);
        
        // 更详细的错误处理
        let errorMessage = error.message || '未知错误';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        alert(t('checkout.alerts.createOrderFailedMessage', { message: errorMessage }));
      }
    }

        // 轮询函数 - 支持多种支付方式
    function startPollingOrderStatus(orderNumber) {
        console.log(`开始轮询订单 ${orderNumber} 的状态... 支付方式: ${selectedPaymentMethod.value}`);
    
        // 清除旧的轮询（如果存在）
        if (pollingIntervalId.value) {
            clearInterval(pollingIntervalId.value);
        }
        
        // 使用新的支付状态轮询API
        pollPaymentStatus(orderNumber, selectedPaymentMethod.value, 30, 2000)
          .then(result => {
            console.log('支付轮询结果:', result);
            
            if (result.success && result.status === 'SUCCESS') {
              console.log(`订单 ${orderNumber} 支付成功！`);
              
              // 清除支付计时器
              if (paymentTimerId.value) {
                clearInterval(paymentTimerId.value);
                paymentTimerId.value = null;
              }

              // 关闭二维码弹窗
              showQrCodeModal.value = false;

              // 显示支付成功结果
              showPaymentResult('success', '支付成功！订单正在处理中');
              
            } else if (result.status === 'FAILED') {
              console.log(`订单 ${orderNumber} 支付失败:`, result.message);
              
              // 清除支付计时器
              if (paymentTimerId.value) {
                clearInterval(paymentTimerId.value);
                paymentTimerId.value = null;
              }

              // 关闭二维码弹窗
              showQrCodeModal.value = false;

              // 显示支付失败结果
              showPaymentResult('failure', result.message || '支付失败，请重试');
              
            } else if (result.status === 'TIMEOUT') {
              console.log(`订单 ${orderNumber} 支付状态查询超时`);
              
              // 支付超时处理
              handlePaymentTimeout();
            }
          })
          .catch(error => {
            console.error(`轮询订单 ${orderNumber} 状态失败:`, error);
            
            // 清除支付计时器
            if (paymentTimerId.value) {
              clearInterval(paymentTimerId.value);
              paymentTimerId.value = null;
            }

            // 关闭二维码弹窗
            showQrCodeModal.value = false;

            // 显示错误信息
            showPaymentResult('failure', '支付状态查询失败，请联系客服');
          });
    }


    // 获取支付方式对应的标题
    const getPaymentMethodTitle = () => {
      if (selectedPaymentMethod.value === 'wechat') {
        return '请使用微信扫码支付';
      } else if (selectedPaymentMethod.value === 'alipay') {
        return '请使用支付宝扫码支付';
      } else {
        return '请扫码支付';
      }
    };


const closeQrCodeModal = (reason = 'manual') => {
  console.log(`[CheckoutPage] closeQrCodeModal called with reason: ${reason}`);
  // 如果是手动关闭或模拟成功，才清除计时器并跳转
  if (reason === 'manual' || reason === 'simulated_success') {
    if (paymentTimerId.value) {
      clearInterval(paymentTimerId.value);
      paymentTimerId.value = null;
    }
          // 新增：同时清除轮询定时器
      if (pollingIntervalId.value) {
        clearInterval(pollingIntervalId.value);
        pollingIntervalId.value = null;
        console.log("手动关闭弹窗，轮询已停止。");
      }
    showQrCodeModal.value = false;
    qrCodeImageUrl.value = '';
    prepareAndNavigateToConfirmation();
  } else if (reason === 'timeout') {
    // 超时情况由 handlePaymentTimeout 处理，这里只需隐藏弹窗
    showQrCodeModal.value = false;
    qrCodeImageUrl.value = '';
  }
};

// ========== 支付结果弹出框相关函数 ==========
const showPaymentResult = (type, message) => {
  paymentResultType.value = type;
  paymentResultMessage.value = message;
  showPaymentResultModal.value = true;
};

const closePaymentResultModal = () => {
  showPaymentResultModal.value = false;
  paymentResultType.value = 'success';
  paymentResultMessage.value = '';
};

const handlePaymentSuccessAction = () => {
  closePaymentResultModal();
  // 跳转到订单详情页或订单列表
  if (currentOrder.value) {
    router.push({ name: 'OrderDetailPage', params: { orderId: currentOrder.value.id } });
  } else {
    router.push({ name: 'Orders' });
  }
};

const handlePaymentFailureAction = () => {
  closePaymentResultModal();
  // 重新显示二维码弹窗，让用户重新支付
  if (qrCodeImageUrl.value) {
    showQrCodeModal.value = true;
  }
};

const prepareAndNavigateToConfirmation = () => {
  console.log('[CheckoutPage] Attempting to prepare order details and navigate to confirmation page.');
  try {
    // 使用 currentOrder.value 中的实际订单数据
    if (!currentOrder.value) {
      console.error('currentOrder is null. Cannot navigate to confirmation without order details.');
      alert(t('checkout.orderInfoFailed'));
      return;
    }

    const orderId = currentOrder.value.id;
    // 使用后端返回的完整订单对象作为确认页面的数据
    const orderDataForConfirmation = currentOrder.value;

    console.log('[CheckoutPage] Order data for confirmation prepared:', orderDataForConfirmation);

    // Store in sessionStorage to pass to the confirmation page
    sessionStorage.setItem(`order_${orderId}`, JSON.stringify(orderDataForConfirmation));

    // Clear cart/direct buy item AFTER details are captured for the summary
    if (directBuyItem.value) {
      directBuyItem.value = null;
      sessionStorage.removeItem('directBuyItem');
      console.log('[CheckoutPage] Direct buy item cleared for confirmation page navigation.');
    } else if (clearCart && typeof clearCart === 'function') {
      clearCart();
      console.log('[CheckoutPage] Cart cleared for confirmation page navigation.');
    }
    // Reset selected payment method and address after order confirmation (optional here, depends on desired UX)
    // selectedPaymentMethod.value = ''; 
    // selectedAddressId.value = '';
    // orderNotes.value = '';

    router.push({ name: 'OrderConfirmation', params: { orderId: orderId } });
    console.log(`[CheckoutPage] Navigated to OrderConfirmation page with orderId: ${orderId}`);

  } catch (error) {
    console.error('[CheckoutPage] Error in prepareAndNavigateToConfirmation:', error);
    alert(t('checkout.orderInfoFailed'));
  }
};

const promptToAbandonPayment = () => {
  // 使用浏览器原生确认对话框
  if (confirm('确认放弃支付码？')) {
    showQrCodeModal.value = false; // 隐藏 QR modal，但计时器继续运行
    paymentAbandonedButCanResume.value = true; // 标记为可恢复
    console.log('[CheckoutPage] Payment abandoned by user, can resume. Remaining time (sec):', paymentTimeRemaining.value);
    // 计时器会继续在后台运行
  }
  // 如果用户点击取消，则什么都不做，QR modal 保持打开
};

onMounted(async () => {
  // Load direct buy item if any
  const storedDirectBuyItem = sessionStorage.getItem('directBuyItem');
  if (storedDirectBuyItem) {
    directBuyItem.value = JSON.parse(storedDirectBuyItem);
  }

  // Fetch addresses when component mounts
  try {
    const addresses = await addressApi.getAddresses();
    savedAddresses.value = addresses;
    if (savedAddresses.value.length > 0) {
      selectedAddressId.value = savedAddresses.value[0].id; // Select the first address by default
    }
  } catch (error) {
    console.error('Error fetching saved addresses:', error);
    alert(t('checkout.failedToLoadAddresses') + (error.response?.data?.message || error.message));
  }

  // 添加点击外部关闭下拉框的事件监听器
  const handleClickOutside = (event) => {
    const addressContainer = document.querySelector('.address-select-container');
    const regionContainers = document.querySelectorAll('.region-select-container');
    
    if (addressContainer && !addressContainer.contains(event.target)) {
      isAddressDropdownOpen.value = false;
    }
    
    // 检查是否点击在任何省市区下拉框外部
    let clickedInsideRegionContainer = false;
    regionContainers.forEach(container => {
      if (container.contains(event.target)) {
        clickedInsideRegionContainer = true;
      }
    });
    
    if (!clickedInsideRegionContainer) {
      isProvinceDropdownOpen.value = false;
      isCityDropdownOpen.value = false;
      isAreaDropdownOpen.value = false;
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  
  // 清理事件监听器
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
});
</script>

<style scoped>
.checkout-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg);
}

.checkout-main-content {
  padding-top: calc(var(--navbar-height, 60px) + 2rem);
  padding-bottom: 4rem;
  flex-grow: 1;
  max-width: 900px; /* 与个人资料页面保持一致 */
  margin: 0 auto;
  width: 100%;
  padding-left: var(--container-padding, 1rem);
  padding-right: var(--container-padding, 1rem);
}

/* Checkout header layout */
.checkout-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 1.5rem;
}

/* Back button styles */
.back-btn {
  position: absolute;
  left: 1.65rem; /* 与checkout-form-layout的左内边距对齐 */
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

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  text-align: center;
}

.checkout-form-layout {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--color-card); /* 核心修改：设置卡片背景色 */
  padding: 2.5rem 3rem; /* 增加内边距 */
  border-radius: 12px; /* 增加圆角 */
  border: 1px solid var(--color-border); /* 添加边框 */
}

.form-section {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.form-section:first-child {
  margin-top: 0rem;
}
.form-section h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--color-text);
  padding-bottom: 0.5rem;
}

.section-divider {
  border: none;
  height: 1px;
  background-color: var(--color-border-subtle);
  margin: 2rem 0;
}

.empty-checkout-message {
  text-align: center;
  padding: 2rem 0;
  color: var(--color-text-secondary);
}
.empty-checkout-message a {
  color: var(--color-primary);
  text-decoration: none;
}
.empty-checkout-message a:hover {
  text-decoration: underline;
}

/* Product Info */
.checkout-items-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.checkout-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  min-height: 80px;
  padding: 1rem 0;
  position: relative;
}

/* 移动端商品列表首尾间距优化 */
.checkout-item:first-child {
  padding-top: 0.5rem; /* 缩小第一个商品与顶部的间距 */
}

.checkout-item:last-child {
  padding-bottom: 0.5rem; /* 缩小最后一个商品与底部的间距 */
}

.checkout-item + .checkout-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--color-border-subtle);
}
.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--color-border-subtle);
}
.item-details { flex-grow: 1; }
.item-name { 
  font-weight: 500; 
  color: var(--color-text); 
  margin: 0 0 0.3rem 0; 
  font-size:0.95rem; 
  /* 名称只显示一行，超出部分用省略号 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.item-attributes, .item-quantity { font-size: 0.8rem; color: var(--color-text-secondary); margin: 0 0 0.25rem 0; }
.item-price { 
  font-weight: 500; 
  color: var(--color-text); 
  font-size: 0.9rem; 
  margin-left: auto; 
  display: flex; 
  align-items: center; 
  height: 100%; 
  /* 价格和单位在同一行显示 */
  white-space: nowrap;
}


/* Form Grid and Groups */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.shipping-info-grid { /* Specific grid for shipping info */
  grid-template-columns: 1fr; /* Default to single column */
  gap: 1rem;
}

@media (min-width: 768px) { /* md breakpoint */
  .shipping-info-grid {
    grid-template-columns: repeat(2, 1fr); /* Two columns for name and phone */
    gap: 1rem 1.5rem; 
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0;
}
.form-group.full-width {
  grid-column: 1 / -1; /* Span full width in grid */
}

.form-label, label {
  font-size: 0.875rem;
  color: var(--color-text);
  font-weight: 500;
}
.form-input, select.form-input, textarea.form-input {
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.9rem;
  background-color: var(--color-card);
  color: var(--color-text);
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  width: 100%;
  box-sizing: border-box;
}

select.form-input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0a0a0'%3E%3Cpath d='M7 10l5 5 5-5H7z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem center; /* Adjust 0.7rem for spacing from right edge */
  background-size: 1.2em; /* Adjust size of the arrow */
  padding-right: 2.5rem; /* Ensure text does not overlap arrow, adjust as needed */
}

.form-input::placeholder { color: var(--color-text-muted); }
.form-input:focus, select.form-input:focus, textarea.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Attempt to style select options (browser compatibility varies) */
select.form-input option {
  background-color: var(--color-surface); /* Darker background for options */
  color: var(--color-text);
  padding: 8px 12px; /* Add some padding */
}

select.form-input option:hover {
  background-color: var(--color-primary-hover) !important; /* Custom hover, less bright blue */
  color: var(--color-button-primary-text) !important;
}

select.form-input option:checked {
  background-color: var(--color-primary) !important; /* Custom selected, less bright blue */
  color: var(--color-button-primary-text) !important;
}

.add-new-address-option {
  font-weight: 500;
  color: var(--color-accent) !important; /* Use important if color is not applying */
  background-color: var(--color-card) !important; /* Different background for this option */
  border-top: 1px solid var(--color-border-subtle); /* Separator line on top */
  margin-top: 4px; /* Small gap before this option */
  padding-top: 10px; /* More padding on top */
  padding-bottom: 10px; /* More padding on bottom */
}
/* End of select option styling attempts */

textarea.form-input {
    min-height: 80px;
    resize: none;
    overflow-y: auto;
    scrollbar-width: none; /* Firefox */
}
textarea.form-input::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
}

/* Region Selectors */
.region-selectors {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}
.region-select {
  flex: 0 0 calc((100% - 1.4rem) / 3); /* flex-grow: 0, flex-shrink: 0, flex-basis: calc(...) */
  box-sizing: border-box; /* Ensure padding and border are included in the width */
  border-radius: 12px;
  font-size: 1rem;
}

.totals-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.4rem;
  margin-bottom: 0.4rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
}
.summary-row span:first-child { color: var(--color-text); }
.summary-row span:last-child { color: var(--color-text); font-weight: 500; }
.summary-row.total span { font-size: 1rem; font-weight: 500; color: var(--color-primary); }

/* Info Card Layout */
.info-card {
  margin-top: 0;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-card);
  padding: 0.5rem 1rem;
}

/* Address Select Dropdown */
.address-select-container {
  position: relative;
}

.address-select-trigger {
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.9rem;
  background-color: var(--color-card);
  color: var(--color-text);
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  width: 100%;
  height: 3.2rem;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-select-trigger:focus, .address-select-trigger.active {
  outline: none;
  border-color: var(--color-primary);
}

.address-select-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.address-select-arrow {
  margin-left: 0.5rem;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.address-select-arrow.rotated {
  transform: rotate(180deg);
}

.co-address-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + .4rem);
  background: var(--color-surface);
  border: none;
  border-radius: var(--border-radius-medium, 12px);
  box-shadow: 0 .6rem 1.6rem rgba(0,0,0,.18);
  padding: .6rem;
  margin: 0;
  list-style: none;
  z-index: 100;
  max-height: 30rem;
  overflow-y: auto;
  scrollbar-width: none;
}

.co-address-dropdown::-webkit-scrollbar {
  display: none;
}

.co-address-option {
  padding: 0.75rem 1.2rem 0.75rem 0.8rem;
  border-radius: 10px;
  color: var(--color-text);
  cursor: pointer;
  font-size: var(--font-size-small, 0.875rem);
  line-height: 1.3;
  height: 3.2rem;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;
}

.co-address-option + .co-address-option {
  margin-top: 0.6rem;
}

.co-address-option:hover {
  background: var(--color-card);
}

.co-address-option.active {
  background: var(--color-card);
  color: var(--color-text);
}

/* Payment Method Layout */
.payment-methods-container {
  margin-top: 0;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-card);
  overflow: hidden;
}

.payment-method-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem; /* 增大上下间距从0.75rem到1rem */
}

.payment-method-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-grow: 1;
}

.payment-method-name {
  color: var(--color-text);
  font-size: 0.9rem;
}

.payment-divider {
  border: none;
  height: 1px;
  background-color: var(--color-border-subtle);
  margin: 0 1rem 0 1rem;
}

.payment-radio-option {
  position: relative;
}

.payment-radio {
  opacity: 0;
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
}

.payment-radio-label {
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-card);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-radio:checked + .payment-radio-label {
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.payment-radio:checked + .payment-radio-label::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 50%;
  border-radius: 50%;
  background: white;
}
.payment-icon {
  width: 24px;
  height: 24px;
  margin-right: 0.5rem;
  border-radius: 4px; /* 为图标添加圆角 */
}

.btn-pay-now {
  width: 100%;
  padding: 0.7rem 1rem;
  font-size: 1.05rem;
  margin-top: 1.5rem;
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
  border: 1px solid var(--color-primary);
  border-radius: 12px;
  font-weight: 500;
  transition: background-color 0.2s ease, border-color 0.2s ease, filter 0.2s ease;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
}
.btn-pay-now:hover {
  opacity: 0.9;
}

.address-select-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
.form-input {
  flex: 1;
  min-width: 0;
  font-size: 1rem;
  border-radius: 12px;
  border: 1.5px solid var(--color-border);
  background: var(--color-card);
  color: var(--color-text);
  transition: border-color 0.2s;
}
.form-input:focus {
  border-color: var(--color-primary);
}

/* --- Modal Styles (Add New Address, QR Code, Confirmation) --- */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75); /* Darker overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-panel {
  background-color: var(--color-card); /* Main dark background */
  border-radius: 12px;
  padding: 2.5rem;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--color-border);
  position: relative;
  text-align: left; /* Default text alignment */
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 2rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  text-align: center;
}

.modal-close-btn {
  position: absolute;
  right: 0;
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

.modal-close-btn:hover {
  transform: translateY(-52%);
  box-shadow: 0 0px 4px rgba(0, 0, 0, 0.1);
}

/* Specific styles for Add Address form elements */
.modal-panel .form-group {
  margin-bottom: 1.5rem;
}

.modal-panel .form-group label {
  display: block;
  margin-bottom: 0.1rem;
  font-weight: 500;
  color: var(--color-text);
}

.modal-panel .form-input,
.modal-panel textarea.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 12px; /* Rounded corners as per image */
  border: 1px solid var(--color-border);
  background-color: var(--color-card); /* Slightly lighter input background */
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Custom Region Select Styles for Modal */
.modal-panel .region-select-container {
  position: relative;
  width: 100%;
}

.modal-panel .region-select-trigger {
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.9rem;
  background-color: var(--color-card);
  color: var(--color-text);
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  width: 100%;
  height: 3.2rem;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-panel .region-select-trigger:focus, 
.modal-panel .region-select-trigger.active {
  outline: none;
  border-color: var(--color-primary);
}

.modal-panel .region-select-trigger.disabled {
  cursor: not-allowed;
}

.modal-panel .region-select-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-panel .region-select-arrow {
  margin-left: 0.5rem;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.modal-panel .region-select-arrow.rotated {
  transform: rotate(180deg);
}

.modal-panel .co-region-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + .4rem);
  background: var(--color-surface);
  border: none;
  border-radius: 12px;
  box-shadow: 0 .6rem 1.6rem rgba(0,0,0,.18);
  padding: .6rem;
  margin: 0;
  list-style: none;
  z-index: 100;
  max-height: 20rem;
  overflow-y: auto;
  scrollbar-width: none;
}

.modal-panel .co-region-dropdown::-webkit-scrollbar {
  display: none;
}

.modal-panel .co-region-option {
  padding: 0.75rem 1.2rem 0.75rem 0.8rem;
  color: var(--color-text);
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.15s ease;
  font-size: 0.9rem;
  height: 3.2rem;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-panel .co-region-option:hover {
  background: var(--color-card);
}

.modal-panel .co-region-option.active {
  background: var(--color-primary);
  color: white;
}

.modal-panel .form-input:focus,
.modal-panel textarea.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.modal-panel .region-selectors {
  display: flex;
  gap: 1rem;
}

.modal-panel .char-counter {
  text-align: right;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

/* Modal Actions (Buttons) *//* Modal Actions (Buttons) */
.modal-actions {
  display: flex;
  justify-content: center; /* Center the button */
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 0; /* Removed top padding */
  border-top: none; /* Removed separator line */
}

.modal-actions .btn {
  width: 100%; /* Full width to align with inputs */
  padding: 0.8rem 1rem; /* Same height as input fields */
  font-weight: 600;
  border-radius: 12px; /* Matched screenshot's rounded corners */
  font-size: 0.9rem;
  transition: background-color 0.2s ease, filter 0.2s ease;
}

.modal-actions .btn-primary {
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
  border: 1px solid var(--color-primary);
}
.modal-actions .btn-primary:hover {
  filter: brightness(0.9);
}

.modal-actions .btn-secondary {
  background-color: var(--color-card); /* Dark grey background for Cancel button */
  color: var(--color-text);
  border: 1px solid var(--color-border); /* Matching border color to appear borderless */
}
.modal-actions .btn-secondary:hover {
  background-color: var(--color-card);
  border-color: var(--color-text-secondary);
  color: var(--color-text);
}

/* QR Code Modal specific adjustments */
.qr-code-modal-panel {
  text-align: center;
  background-color: var(--color-card);
}

/* Payment Result Modal specific styles */
.payment-result-modal-panel {
  max-width: 400px;
  background-color: var(--color-card);
  padding: 1.8rem 2rem 2rem 2rem;
  border-radius: 14px;
  text-align: center;
}

.payment-result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.payment-result-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: scaleIn 0.3s ease-out;
}

.payment-result-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: -0.5rem;
}

.payment-result-message {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
  max-width: 300px;
}

.payment-result-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.payment-result-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 400;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.payment-result-btn.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.payment-result-btn.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

/* 按钮悬浮效果：只向上移动，不变色 */
.payment-result-btn:hover {
  transform: translateY(-2px);
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.btn-close-modal {
    position: absolute;
    top: 1rem;
    right: 1.5rem;
    background: none;
    border: none;
    font-size: 2rem;
    color: var(--color-text-secondary);
    cursor: pointer;
    line-height: 1;
}

/* Abandon Payment Confirmation Modal specific adjustments */
.abandon-confirm-panel {
    max-width: 450px;
    text-align: center;
    background-color: var(--color-card); /* Set background */
    padding: 2.5rem;
    border-radius: 12px;
}

.abandon-confirm-panel .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 2.5rem; /* Add more space between title and buttons */
}

.abandon-actions {
    display: flex;
    justify-content: space-between; /* Align buttons to ends */
    border-top: none;
    padding-top: 0;
    gap: 1rem;
}

/* Re-using the .btn class from the main modal actions for consistency */
.abandon-actions .btn-abandon-action {
  min-width: auto;
  padding: 0.6rem 1.5rem;
  font-weight: 600;
  border-radius: 12px; 
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

/* 'Continue Payment' button inherits .btn-primary from main modal styles */
/* 'Abandon' button needs the secondary style */
.abandon-actions .btn-secondary {
  background-color: transparent; /* Match the desired style */
  color: var(--color-text);
  border: 1px solid var(--color-border); /* Subtle border */
}
.abandon-actions .btn-secondary:hover {
    background-color: var(--color-card);
    border-color: var(--color-text-secondary);
    color: var(--color-text);
}

/* 移动端媒体查询 - 使移动端布局与Web端保持一致 */
@media (max-aspect-ratio: 1/1) {
  /* 整体容器调整 */
  .checkout-main-content {
    padding-top: calc(var(--navbar-height, 60px) + 2rem);
    padding-bottom: 2rem;
    max-width: 100%; /* 与个人资料页面保持一致 */
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* 页面标题调整 */
  .page-title {
    font-size: 1.5rem;
  }

  /* 返回按钮移动端调整 - 与个人资料页面保持一致 */
  .back-btn {
    left: 0; /* 移动端回到左边对齐，因为form-layout没有内边距 */
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

  /* 表单布局保持Web端样式 - 移动端移除边框 */
  .checkout-form-layout {
    padding: 0rem 0rem;
    border-radius: 8px;
    border: none;
    background-color: transparent;
  }

  /* 表单章节标题 */
  .form-section h2 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  /* 商品信息区域 */
  .checkout-item {
    padding: 0.8rem 0;
    min-height: 60px; /* 进一步减少最小高度 */
    gap: 0.7rem; /* 缩小图片与信息的间距 */
    position: relative; /* 为绝对定位的价格提供参考 */
  }

  /* 移动端商品列表首尾间距优化 */
  .checkout-item:first-child {
    padding-top: 0rem; /* 使用很小的正值来缩小间距 */
  }

  .checkout-item:last-child {
    padding-bottom: 0rem; /* 使用很小的正值来缩小间距 */
  }

  .item-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
  }

  .item-details {
    /* 使用flex布局来重新排列元素顺序 */
    display: flex;
    flex-direction: column;
    flex: 1;
    position: relative;
    gap: 0.15rem; /* 减少内部元素间距 */
  }

  /* 创建一个名称和价格的行 */
  .item-name {
    font-size: 0.85rem;
    /* 名称只显示一行，超出部分用省略号 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 80px); /* 为价格留出空间 */
    order: 1; /* 名称排第一 */
    margin-right: 80px; /* 为价格留出空间 */
    margin-bottom: 0; /* 移除默认下边距 */
  }

  .item-price {
    font-size: 0.8rem;
    /* 价格和单位在同一行显示 */
    white-space: nowrap;
    /* 移动端将价格定位到名称右侧 */
    position: absolute;
    right: 0;
    top: 0;
    margin: 0;
    order: 1.5;
  }

  .item-attributes {
    font-size: 0.75rem;
    order: 2; /* 属性(颜色/尺码)排第二 */
    margin: 0; /* 移除默认边距 */
  }

  .item-quantity {
    font-size: 0.75rem;
    order: 3; /* 数量排第三(移到尺码后面) */
    margin: 0; /* 移除默认边距 */
  }

  /* 地址选择器 */
  .address-select-trigger {
    height: 2.8rem;
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    border-radius: 8px; /* 统一圆角 */
  }

  .co-address-dropdown {
    font-size: 0.8rem;
    border-radius: 8px; /* 统一圆角 */
  }

  .co-address-option {
    height: 2.8rem;
    padding: 0.6rem 1rem 0.6rem 0.7rem;
    font-size: 0.8rem;
    border-radius: 8px; /* 统一圆角 */
  }

  /* 表单输入框 */
  .form-input,
  textarea.form-input {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  textarea.form-input {
    min-height: 60px;
  }

  /* 支付方式区域 */
  .payment-methods-container {
    border-radius: 8px; /* 统一圆角 */
  }

  .payment-method-row {
    padding: 0.9rem 0.8rem; /* 增大上下间距从0.6rem到0.9rem */
  }

  .payment-method-name {
    font-size: 0.85rem;
  }

  .payment-icon {
    width: 20px;
    height: 20px;
  }

  .payment-radio-label {
    width: 1.2rem;
    height: 1.2rem;
  }

  /* 总计区域 */
  .summary-row {
    font-size: 0.85rem;
    font-weight: 400;
  }

  /* 统一左右文字的字体大小和粗细 */
  .summary-row span:first-child,
  .summary-row span:last-child {
    font-size: 0.85rem;
    font-weight: 400;
  }

  .summary-row.total span {
    font-size: 0.85rem;
    font-weight: 400;
  }

  .totals-summary {
    gap: 0.5rem;
    margin-top: 0rem;
    margin-bottom: 0rem;
  }

  /* 支付按钮 */
  .btn-pay-now {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    margin-top: 0.3rem; /* 进一步缩小与上方的间距 */
    border-radius: 8px;
  }

  .payment-divider {
    margin: 0 0.8rem 0 0.8rem;
  }

  /* 信息卡片 */
  .info-card {
    padding: 0.75rem;
    border-radius: 8px;
  }

  /* 模态框调整 */
  .modal-panel {
    padding: 1.5rem;
    margin: 1rem;
    max-width: calc(100% - 2rem);
    border-radius: 8px;
  }

  .modal-header {
    margin-bottom: 1rem; /* 缩小标题下方间距 */
  }

  .modal-title {
    font-size: 1.2rem;
  }

  .modal-close-btn {
    padding: 0.4rem;
  }

  .modal-close-btn svg {
    width: 18px;
    height: 18px;
  }

  .modal-panel .form-group label {
    margin-bottom: 0rem; /* 缩小标签与输入框的间距 */
  }

  /* 地区选择器在模态框中 */
  .modal-panel .region-select-trigger {
    height: 2.8rem;
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    border-radius: 8px; /* 统一圆角 */
  }

  .modal-panel .co-region-dropdown {
    max-height: 15rem;
    border-radius: 8px; /* 统一圆角 */
  }

  .modal-panel .co-region-option {
    height: 2.8rem;
    padding: 0.6rem 1rem 0.6rem 0.7rem;
    font-size: 0.8rem;
    border-radius: 8px; /* 统一圆角 */
  }

  .modal-panel .form-input,
  .modal-panel textarea.form-input {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  /* 模态框按钮 */
  .modal-actions {
    margin-top: 1rem; /* 缩小保存按钮与上方的间距 */
  }

  .modal-actions .btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  /* 二维码模态框 */
  .qr-code-modal-panel {
    max-width: 280px;
    padding: 1.5rem;
  }

  /* 移动端支付结果弹出框 */
  .payment-result-modal-panel {
    max-width: 320px;
    padding: 1.5rem;
    border-radius: 12px;
  }

  /* 移动端缩小图标与标题间距 */
  .payment-result-content {
    gap: 1rem; /* 从1.5rem缩小到1rem */
  }

  .payment-result-title {
    font-size: 1.25rem;
  }

  .payment-result-message {
    font-size: 0.9rem;
    max-width: 280px;
  }

  .payment-result-btn {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
    border-radius: 8px; /* 从12px缩小到8px */
  }

  .btn-close-modal {
    font-size: 1.5rem;
    top: 0.5rem;
    right: 1rem;
  }

  .qr-code-container {
    min-height: 150px;
    margin: 1rem 0;
  }

  .payment-countdown {
    font-size: 0.8rem;
  }

  /* 确认放弃支付模态框 */
  .abandon-confirm-panel {
    max-width: 300px;
    padding: 1.5rem;
  }

  .abandon-confirm-panel .modal-title {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .abandon-actions .btn-abandon-action {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  /* 恢复支付倒计时 */
  .resume-payment-countdown {
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
}

@media (max-width: 575px) {
  .region-selectors {
    flex-direction: column;
    gap: 0.3rem;
  }
}

/* 新增字数统计样式 */
.char-counter {
  display: block;
  text-align: right;
  font-size: 0.8em;
  color: var(--color-text-muted);
  margin-top: 0.2rem;
}

.qr-code-modal-panel {
  min-width: 300px; 
  max-width: 400px;
  text-align: center;
  position: relative; /* Needed for absolute positioning of close button */
}

.btn-close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.8rem; /* Make X larger */
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 5px;
  line-height: 1;
}
.btn-close-modal:hover {
  color: var(--color-text);
}

.qr-code-container {
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px; 
}

.qr-code-image {
  width: 100%; /* 改为填满容器宽度 */
  max-width: 320px; /* 设置最大宽度 */
  height: auto;
  border: 1px solid var(--color-border-subtle);
  border-radius: 12px;
}

.payment-countdown {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}
.payment-countdown p {
  margin: 0;
}

/* 测试按钮样式 */
.test-payment-buttons {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.test-btn {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  border-radius: 6px;
  min-width: 120px;
  transition: all 0.2s ease;
}

.test-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 二维码弹出框标题样式 */
.qr-modal-title {
  font-size: 1.1rem !important; /* 缩小字体大小 */
}

/* Order Summary Modal Styles */
.order-summary-modal-panel {
  min-width: 320px; /* Slightly wider for content */
  max-width: 550px; /* Max width for summary */
  width: 90vw;
  text-align: left; /* Align text to left for readability */
  padding: 1.8rem 2rem;
}

.order-summary-modal-panel .modal-title {
  text-align: center; /* Center title */
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.order-summary-content h4 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 1.2rem;
  margin-bottom: 0.8rem;
  color: var(--color-text);
  /* border-bottom: 1px solid var(--color-border-subtle); */
  padding-bottom: 0.3rem;
}
.order-summary-content h4:first-of-type {
  margin-top: 0.5rem;
}


.order-meta p {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.3rem;
}
.order-meta p strong {
  color: var(--color-text);
}


.summary-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 20rem; /* Max height for item list before scroll */
  overflow-y: auto;
  padding-right: 0.5rem; /* For scrollbar */
  margin-bottom: 1rem;
}

/* Custom scrollbar for item list */
.summary-items-list::-webkit-scrollbar {
  width: 6px;
}
.summary-items-list::-webkit-scrollbar-track {
  background: var(--color-input-background);
  border-radius: 3px;
}
.summary-items-list::-webkit-scrollbar-thumb {
  background: var(--color-border-input);
  border-radius: 3px;
}
.summary-items-list::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent-focus);
}


.summary-item {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--color-border-input);
}
.summary-item:last-child {
  border-bottom: none;
  padding-bottom: 0.2rem;
}

.summary-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--color-border-subtle);
}

.summary-item-details {
  flex-grow: 1;
}

.summary-item-name {
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 0.2rem 0;
  font-size: 0.9rem;
}

.summary-item-attributes,
.summary-item-quantity {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0 0 0.2rem 0;
}

.summary-item-price {
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.85rem;
  margin-left: auto;
  white-space: nowrap;
}

.empty-summary-items p {
  color: var(--color-text-secondary);
  text-align: center;
  padding: 1rem 0;
}

.summary-totals {
  margin-top: 0.5rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--color-border-subtle);
}
/* Reusing .summary-row from main checkout page styles where appropriate */
.summary-totals .summary-row {
  font-size: 1rem;
  margin-bottom: 0.4rem;
}
.summary-totals .summary-row.bold span {
  font-weight: 500;
}
.summary-totals .summary-row.total span {
  font-size: 1rem; /* Slightly smaller than main page total for modal context */
  color: var(--color-primary);
}


.shipping-address-summary p,
.payment-method-summary {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 0.2rem;
}
.shipping-address-summary p:first-child {
  color: var(--color-text);
  font-weight: 500;
}


.summary-actions {
  margin-top: 1.8rem;
  justify-content: center; /* Center the button */
}
.summary-actions .btn-primary {
  padding: 0.7rem 1.8rem; /* Make button a bit larger */
  font-size: 0.95rem;
}

/* Styles for Abandon Payment Confirm Modal Buttons */
.abandon-actions .btn-abandon-action {
  padding: 0.4rem 1rem; /* Smaller padding */
  font-size: 0.85rem; /* Smaller font size */
}

/* Styles for Resume Payment Countdown on main page */
.resume-payment-countdown {
  text-align: center;
  margin-top: 0.75rem;
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 500;
}

</style> 
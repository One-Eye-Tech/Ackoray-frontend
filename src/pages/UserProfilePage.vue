<template>
  <div class="user-profile-page-container">
    <TopNavigationBar />
    <main class="profile-main-content">
      <div class="profile-header">
        <button @click="$router.back()" class="back-btn">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="page-title">{{ $t('profile.myProfile') }}</h1>
      </div>

      <div class="profile-layout">
        <div class="profile-content-area">
          <section id="personal-info" class="profile-section">
            <h2>{{ $t('profile.personalInformation') }}</h2>
            <div class="form-card">
              <div class="info-row">
                <span class="info-label">{{ $t('profile.email') }}:</span>
                <span class="info-value">{{ user.email || $t('common.unknown') }}</span>
              </div>
              <!-- <button class="btn btn-secondary btn-sm" @click="editPersonalInfo">{{ $t('profile.editInformation') }}</button> -->
            </div>
          </section>

          <section id="saved-addresses" class="profile-section">
            <h2>{{ $t('profile.savedAddresses') }}</h2>
            <div class="form-card1">
              <div v-if="!savedAddresses || savedAddresses.length === 0" class="empty-state">
                <p>{{ $t('profile.noSavedAddresses') }}</p>
              </div>
              <ul v-else class="address-list">
                <li v-for="address in savedAddresses" :key="address.id" class="address-item">
                  <div class="address-details">
                    <div class="address-row name-phone-row">
                      <strong>{{ address.recipientName }}</strong>
                      <span class="phone-number">{{ address.phoneNumber }}</span>
                    </div>
                    <div class="address-row location-row">
                      <span class="location">{{ address.province }}{{ address.city }}{{ address.area }}</span>
                      <span class="detailed-address">{{ address.detailedAddress }}</span>
                    </div>
                  </div>
                  <div class="address-actions">
                     <button class="btn btn-secondary btn-sm" @click="editAddress(address.id)">{{ $t('common.edit') }}</button>
                     <button class="btn btn-secondary btn-sm" @click="deleteAddress(address.id)">{{ $t('common.delete') }}</button>
                  </div>
                </li>
              </ul>
              <button class="btn btn-primary" @click="openAddAddressModal">{{ $t('profile.addNewAddress') }}</button>
            </div>
          </section>
        </div>
      </div>
    </main>
    <!-- <Footer /> -->

    <!-- Add/Edit Address Modal (Simplified for now) -->
    <div v-if="showAddressModal" class="modal-overlay" @click.self="closeAddressModal">
      <div class="modal-panel address-modal-panel">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditingAddress ? $t('profile.editShippingInfo') : $t('profile.createShippingInfo') }}</h3>
          <button type="button" class="modal-close-btn" @click="closeAddressModal">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveAddress" class="address-form">
          <div class="form-group">
            <label for="address-name">{{ $t('profile.recipientName') }}</label>
            <input type="text" id="address-name" v-model="addressForm.recipientName" class="form-input" required>
          </div>
          <div class="form-group">
            <label for="address-phone">{{ $t('profile.phoneNumber') }}</label>
            <input type="tel" id="address-phone" v-model="addressForm.phoneNumber" class="form-input" required>
          </div>
          <div class="form-group">
            <label>{{ $t('profile.region') }}</label>
            <div class="address-region-selects">
              <!-- 省份选择 -->
              <div class="region-select-container">
                <div class="region-select-trigger" @click="toggleProvinceDropdown" :class="{ active: isProvinceDropdownOpen }">
                  <span class="region-select-text">{{ getProvinceLabel() }}</span>
                  <svg class="region-select-arrow" :class="{ rotated: isProvinceDropdownOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <ul v-if="isProvinceDropdownOpen" class="co-region-dropdown" @click.stop>
                  <li v-for="province in provinces" :key="province.code" 
                      class="co-region-option" 
                      :class="{ active: addressForm.province === province.name }"
                      @click="selectProvince(province.name)">
                    {{ province.name }}
                  </li>
                </ul>
              </div>
              
              <!-- 城市选择 -->
              <div class="region-select-container">
                <div class="region-select-trigger" @click="toggleCityDropdown" :class="{ active: isCityDropdownOpen, disabled: !addressForm.province }">
                  <span class="region-select-text">{{ getCityLabel() }}</span>
                  <svg class="region-select-arrow" :class="{ rotated: isCityDropdownOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <ul v-if="isCityDropdownOpen && addressForm.province" class="co-region-dropdown" @click.stop>
                  <li v-for="city in cities" :key="city.code" 
                      class="co-region-option" 
                      :class="{ active: addressForm.city === city.name }"
                      @click="selectCity(city.name)">
                    {{ city.name }}
                  </li>
                </ul>
              </div>
              
              <!-- 区域选择 -->
              <div class="region-select-container">
                <div class="region-select-trigger" @click="toggleAreaDropdown" :class="{ active: isAreaDropdownOpen, disabled: !addressForm.city }">
                  <span class="region-select-text">{{ getAreaLabel() }}</span>
                  <svg class="region-select-arrow" :class="{ rotated: isAreaDropdownOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <ul v-if="isAreaDropdownOpen && addressForm.city" class="co-region-dropdown" @click.stop>
                  <li v-for="area in areas" :key="area" 
                      class="co-region-option" 
                      :class="{ active: addressForm.area === area }"
                      @click="selectArea(area)">
                    {{ area }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label for="address-detailed">{{ $t('profile.detailedAddress') }}</label>
            <textarea id="address-detailed" v-model="addressForm.detailedAddress" class="form-textarea" rows="3" maxlength="100" required></textarea>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">{{ $t('common.save') }}</button>
          </div>
        </form>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TopNavigationBar from '../components/layout/TopNavigationBar.vue';
import Footer from '../components/layout/Footer.vue';
import provincesData from '../assets/address/provinces.json';
import citiesData from '../assets/address/cities.json';
import areasData from '../assets/address/areas.json';
import addressApi from '../api/addressApi'; // Import addressApi

const { t } = useI18n();
const loggedInUser = inject('currentUser', ref({ name: 'Ackoray User', email: 'user@ackoray.com' })); // Fallback if not provided

const user = computed(() => loggedInUser.value || { name: 'Ackoray User', email: 'user@ackoray.com' });

const savedAddresses = ref([]); // Initialize as empty array, will be fetched from backend

const showAddressModal = ref(false);
const isEditingAddress = ref(false);
const addressForm = ref({ id: null, recipientName: '', phoneNumber: '', province: '', city: '', area: '', detailedAddress: '' });


// 使用导入的JSON数据
const provinces = computed(() => provincesData);
const cities = ref([]);
const areas = ref([]);

// 自定义下拉框状态
const isProvinceDropdownOpen = ref(false);
const isCityDropdownOpen = ref(false);
const isAreaDropdownOpen = ref(false);

// Fetch addresses from backend
const fetchAddresses = async () => {
  try {
    const response = await addressApi.getAddresses();
    savedAddresses.value = response; // Assuming backend returns List<AddressDto>
    console.log('Addresses fetched:', savedAddresses.value);
  } catch (error) {
    console.error('Error fetching addresses:', error);
  }
};

// 省市区级联选择逻辑
function handleProvinceChange() {
  addressForm.value.city = '';
  addressForm.value.area = '';
  const provinceCode = provincesData.find(p => p.name === addressForm.value.province)?.code;
  cities.value = provinceCode ? citiesData.filter(c => c.provinceCode === provinceCode) : [];
  areas.value = [];
}

function handleCityChange() {
  addressForm.value.area = '';
  const cityCode = cities.value.find(c => c.name === addressForm.value.city)?.code;
  areas.value = cityCode ? areasData.filter(a => a.cityCode === cityCode).map(a => a.name) : [];
}

// 自定义下拉框方法
const toggleProvinceDropdown = () => {
  isProvinceDropdownOpen.value = !isProvinceDropdownOpen.value;
  isCityDropdownOpen.value = false;
  isAreaDropdownOpen.value = false;
};

const toggleCityDropdown = () => {
  if (!addressForm.value.province) return;
  isCityDropdownOpen.value = !isCityDropdownOpen.value;
  isProvinceDropdownOpen.value = false;
  isAreaDropdownOpen.value = false;
};

const toggleAreaDropdown = () => {
  if (!addressForm.value.city) return;
  isAreaDropdownOpen.value = !isAreaDropdownOpen.value;
  isProvinceDropdownOpen.value = false;
  isCityDropdownOpen.value = false;
};

const selectProvince = (provinceName) => {
  addressForm.value.province = provinceName;
  addressForm.value.city = '';
  addressForm.value.area = '';
  handleProvinceChange();
  isProvinceDropdownOpen.value = false;
};

const selectCity = (cityName) => {
  addressForm.value.city = cityName;
  addressForm.value.area = '';
  handleCityChange();
  isCityDropdownOpen.value = false;
};

const selectArea = (areaName) => {
  addressForm.value.area = areaName;
  isAreaDropdownOpen.value = false;
};

// 获取标签显示文本
const getProvinceLabel = () => {
  return addressForm.value.province || t('profile.selectProvince');
};

const getCityLabel = () => {
  return addressForm.value.city || t('profile.selectCity');
};

const getAreaLabel = () => {
  return addressForm.value.area || t('profile.selectDistrict');
};

const openAddAddressModal = () => {
  isEditingAddress.value = false;
  addressForm.value = { id: null, recipientName: '', phoneNumber: '', province: '', city: '', area: '', detailedAddress: '' }; // Clear form
  cities.value = [];
  areas.value = [];
  showAddressModal.value = true;
};

const editAddress = (addressId) => {
  const addressToEdit = savedAddresses.value.find(addr => addr.id === addressId);
  if (addressToEdit) {
    isEditingAddress.value = true;
    addressForm.value = { ...addressToEdit };
    // 编辑时需要加载对应的城市和地区数据
    const provinceCode = provincesData.find(p => p.name === addressForm.value.province)?.code;
    if (provinceCode) {
      cities.value = citiesData.filter(c => c.provinceCode === provinceCode);
      const cityCode = cities.value.find(c => c.name === addressForm.value.city)?.code;
      if (cityCode) {
        areas.value = areasData.filter(a => a.cityCode === cityCode).map(a => a.name);
      }
    }
    showAddressModal.value = true;
  }
};

const deleteAddress = async (addressId) => {
  const confirmMessage = t('profile.confirmDeleteAddress') || '确定要删除这个地址吗？';
  if (confirm(confirmMessage)) {
    try {
      await addressApi.deleteAddress(addressId);
      await fetchAddresses(); // Refresh list after deletion
      console.log(t('profile.deleteAddressSuccess') || '地址删除成功！');
    } catch (error) {
      console.error('Error deleting address:', error);
      
      // 检查是否是外键约束错误
      if (error.response && error.response.status === 500) {
        const errorMessage = error.response.data?.message || error.message || '';
        if (errorMessage.includes('foreign key constraint') || errorMessage.includes('Cannot delete')) {
          // 使用浏览器原生alert显示友好的错误信息
          alert('该地址已被订单使用，请完成订单后重试');
        } else {
          alert('该地址已被订单使用，请完成订单后重试');
        }
      } else {
        alert('该地址已被订单使用，请完成订单后重试');
      }
    }
  }
};


const saveAddress = async () => {
  try {
    if (isEditingAddress.value) {
      await addressApi.updateAddress(addressForm.value.id, addressForm.value);
      console.log(t('profile.updateAddressSuccess') || '地址更新成功！');
    } else {
      await addressApi.addAddress(addressForm.value);
      console.log(t('profile.addAddressSuccess') || '地址添加成功！');
    }
    await fetchAddresses(); // Refresh list after save
    closeAddressModal();
  } catch (error) {
    console.error('Error saving address:', error);
  }
};

const closeAddressModal = () => {
  showAddressModal.value = false;
  // 重置下拉框状态
  isProvinceDropdownOpen.value = false;
  isCityDropdownOpen.value = false;
  isAreaDropdownOpen.value = false;
};

// Removed editPersonalInfo and changePassword functions as per request.

onMounted(() => {
  fetchAddresses(); // Fetch addresses on component mount
});
</script>

<style scoped>
/* Styles adapted from CheckoutPage and common patterns */
.user-profile-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg);
}

.profile-main-content {
  padding-top: calc(var(--navbar-height, 60px) + 2rem);
  padding-bottom: 4rem;
  flex-grow: 1;
  max-width: 900px; /* Wider for profile page */
  margin: 0 auto;
  width: 100%;
  padding-left: var(--container-padding, 1rem);
  padding-right: var(--container-padding, 1rem);
}

/* Profile header layout */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 1.5rem; /* 与确认订单页面保持一致 */
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

.profile-layout {
  display: flex;
  gap: 2rem; /* Gap between sidebar and content area */
}

.profile-sidebar {
  flex: 0 0 200px; /* Fixed width for sidebar */
  /* background-color: var(--color-surface-card); */
  /* border-radius: 8px; */
  /* padding: 1rem; */
}
.profile-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.profile-sidebar li a {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.profile-sidebar li a:hover,
.profile-sidebar li a.active { /* Add .active class dynamically */
  background-color: var(--color-surface);
  color: var(--color-text);
}

.profile-content-area {
  flex-grow: 1;
}

.profile-section {
  margin-bottom: 2.5rem;
}

.profile-section h2 {
  font-size: 1.2rem; /* 与确认订单页面商品信息标题保持一致 */
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: var(--color-text);
  padding-bottom: 0;
}

.form-card {
  background-color: var(--color-card);
  padding: 1rem 1rem 1rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.form-card1 {
  background-color: var(--color-card);
  padding: 0rem 1rem 1rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  font-size: 0.95rem;
  border-bottom: 1px solid var(--color-border-subtle);
}
.info-row:last-child {
  border-bottom: none;
}
.info-label {
  color: var(--color-text);
  font-weight: 500;
}
.info-value {
  color: var(--color-text);
}
.form-card > .btn, .form-card1 > .btn { /* Button directly inside form-card or form-card1 */
  margin-top: 1.5rem;
  width: 100%;
  border-radius: 12px;
}

.empty-state {
  text-align: center;
  padding: 1.5rem 0;
  color: var(--color-text-secondary);
}

.address-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center; /* 改为center，使编辑删除按钮在分隔线中上下居中 */
  padding: 0.75rem 0; /* 减少上下内边距，缩小第一个地址与顶部的间距 */
  border-bottom: 1px solid var(--color-border-subtle);
}
.address-item:last-child {
  border-bottom: none;
}
.address-details .address-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.5;
}
.address-details .name-phone-row {
  justify-content: flex-start;
  gap: 1rem;
}
.address-details .location-row {
  justify-content: space-between;
}
.address-details .address-row:last-child {
  margin-bottom: 0;
}
.address-details .address-row strong {
  color: var(--color-text);
  font-weight: 600;
  font-size: 1rem;
}
.address-details .phone-number {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 600;
}
.address-details .location {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}
.address-details .detailed-address {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  text-align: right;
  max-width: 60%;
  word-wrap: break-word;
}
.address-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem; /* Space from address details */
  align-items: center; /* 确保按钮在垂直方向上居中对齐 */
  align-self: center; /* 在父容器中垂直居中 */
}
.address-actions .btn-sm {
  padding: 0.5rem 1.1rem; /* <-- 修改这里 */
  font-size: 0.85rem;    /* <-- 修改这里 */
}

/* Modal Styles (reusing from CheckoutPage with slight adjustments) */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-panel { /* General modal panel style */
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

.address-form .form-group {
  margin-bottom: 1.5rem;
}
.address-form .form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: var(--color-text);
}

/* Modal panel form label styles - to match CheckoutPage */
.modal-panel .form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: var(--color-text);
}

.address-form .form-input,
.address-form .form-select,
.address-form .form-textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 12px; /* Rounded corners as per image */
  border: 1px solid var(--color-border);
  background-color: var(--color-card); /* Slightly lighter input background */
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}


.address-form .form-input:focus,
.address-form .form-select:focus,
.address-form .form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.address-region-selects {
  display: flex;
  gap: 1rem;
}

/* Custom Region Select Styles for Modal */
.region-select-container {
  position: relative;
  width: 100%;
  flex: 1;
}

.region-select-trigger {
  padding: 0.8rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.95rem;
  background-color: var(--color-card);
  color: var(--color-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  height: auto;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.region-select-trigger:focus, 
.region-select-trigger.active {
  outline: none;
  border-color: var(--color-primary);
}

.region-select-trigger.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.region-select-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.region-select-arrow {
  margin-left: 0.5rem;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.region-select-arrow.rotated {
  transform: rotate(180deg);
}

.co-region-dropdown {
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

.co-region-dropdown::-webkit-scrollbar {
  display: none;
}

.co-region-option {
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

.co-region-option:hover {
  background: var(--color-card);
}

.co-region-option.active {
  background: var(--color-primary);
  color: white;
}

.address-form .form-textarea {
  min-height: 100px; /* Adjust height to match checkout page */
  resize: vertical;
}


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

.modal-actions .btn-secondary {
  background-color: var(--color-card); /* Dark grey background for Cancel button */
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.modal-actions .btn-secondary:hover {
  filter: brightness(0.9);
}

.modal-actions .btn-primary {
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
  border: 1px solid var(--color-primary);
}
.modal-actions .btn-primary:hover {
  filter: brightness(0.9);
}


/* General form group and input styles (can be common) */
.form-group {
  margin-bottom: 1.2rem;
}
.form-group label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-bottom: 0.4rem;
}
.form-input {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--color-border-input, #3F3F46);
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: var(--color-input-background, #2A2B2D);
  color: var(--color-text-input, #E0E0E0);
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-accent-focus, #3B82F6);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-rgb), 0.2);
}

.btn, .btn-primary, .btn-secondary, .btn-danger { /* Basic button styling, ensure these are globally available or define here */
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border: none;
}
.btn-primary { background-color: var(--color-primary); color: var(--color-button-primary-text); }
.btn-primary:hover { background-color: var(--color-primary-hover); }
.btn-secondary { background-color: var(--color-card); color: var(--color-text); border: 1px solid var(--color-border); }
.btn-secondary:hover { background-color: var(--color-surface); }

.btn-sm { padding: 0.4rem 0.9rem; font-size: 0.8rem; }

/* Specific button overrides for UserProfilePage sections */

/* "Change Password" button */
#account-settings .form-card .btn-secondary {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
#account-settings .form-card .btn-secondary:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-secondary);
  color: var(--color-text);
}

/* "Add New Address" button */
#saved-addresses .form-card > .btn-primary, #saved-addresses .form-card1 > .btn-primary {
  background-color: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-button-primary-text);
  width: 100%;
  text-align: center;
}
#saved-addresses .form-card > .btn-primary:hover, #saved-addresses .form-card1 > .btn-primary:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  color: var(--color-button-primary-text);
}

.address-item .address-actions .btn-secondary.btn-sm {
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
.address-item .address-actions .btn-secondary.btn-sm:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-secondary);
  color: var(--color-text);
}

/* 移动端优化样式 */
@media (max-aspect-ratio: 1/1) {
  .profile-main-content {
    padding-top: calc(var(--navbar-height, 60px) + 2rem); /* 与确认订单页面保持一致 */
    padding-bottom: 2rem;
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .profile-header {
    margin-bottom: 1.5rem; /* 与桌面版和确认订单页面保持一致 */
  }

  .page-title {
    font-size: 1.5rem;
  }

  .back-btn {
    width: 36px;
    height: 36px;
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

  .profile-section {
    margin-bottom: 1.5rem;
  }

  .profile-section h2 {
    font-size: 1rem; /* 与确认订单页面移动端商品信息标题保持一致 */
    margin-bottom: 0.8rem;
  }

  .form-card {
    padding: 1rem 1rem;
    border-radius: 8px;
  }

  .form-card1 {
    padding: 0rem 1rem 1rem 1rem;
    border-radius: 8px;
  }

  .info-row {
    padding: 0.1rem 0; /* 缩小上下间距 */
    font-size: 0.9rem;
    flex-direction: row; /* 改回水平布局 */
    align-items: center;
    justify-content: space-between; /* 左右分布 */
  }

  .info-label {
    font-size: 0.85rem;
  }

  .info-value {
    font-size: 0.9rem;
    font-weight: 500;
  }

  /* 地址列表移动端优化 */
  .address-item {
    flex-direction: row; /* 改回水平布局，让按钮在右侧 */
    align-items: flex-start;
    padding: 0.8rem 0;
    gap: 1rem;
    justify-content: space-between;
  }

  .address-details {
    flex: 1; /* 地址详情占用剩余空间 */
    min-width: 0; /* 允许内容缩小 */
  }

  .address-details .address-row {
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
  }

  .address-details .name-phone-row {
    flex-direction: row; /* 电话移到名称后面同一行 */
    align-items: center;
    gap: 1rem;
  }

  .address-details .location-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }

  .address-details .address-row strong {
    font-size: 0.95rem;
  }

  .address-details .phone-number {
    font-size: 0.9rem;
  }

  .address-details .location {
    font-size: 0.85rem;
  }

  .address-details .detailed-address {
    font-size: 0.85rem;
    text-align: left;
    max-width: 100%;
    margin-top: 0.2rem;
  }

  .address-actions {
    margin-left: 0;
    flex-direction: column; /* 编辑删除按钮上下布局 */
    align-items: flex-end; /* 按钮靠右对齐 */
    justify-content: center;
    gap: 0.5rem;
    align-self: flex-start; /* 与地址信息顶部对齐 */
    flex-shrink: 0; /* 防止按钮被压缩 */
  }

  .address-actions .btn-sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    min-width: 60px;
    border-radius: 8px; /* 移动端使用更小的圆角 */
  }

  /* 添加地址按钮 */
  .form-card > .btn, .form-card1 > .btn {
    margin-top: 1rem;
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
    border-radius: 8px; /* 移动端使用较小的圆角 */
  }

  /* 模态框移动端优化 */
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

  .address-form .form-group {
    margin-bottom: 1rem;
  }

  .address-form .form-group label {
    margin-bottom: 0rem; /* 缩小标签与输入框的间距 */
  }

  /* Modal panel form label styles - to match CheckoutPage mobile */
  .modal-panel .form-group label {
    margin-bottom: 0.5rem; /* 缩小标签与输入框的间距 */
  }

  .address-form .form-input,
  .address-form .form-textarea {
    padding: 0.7rem 0.8rem;
    font-size: 0.9rem;
    border-radius: 8px;
  }

  .address-form .form-textarea {
    min-height: 80px;
  }

  /* 地区选择器移动端优化 */
  .address-region-selects {
    flex-direction: column;
    gap: 0.8rem;
  }

  .region-select-trigger {
    padding: 0.7rem 0.8rem;
    font-size: 0.9rem;
    border-radius: 8px;
  }

  .co-region-dropdown {
    border-radius: 8px;
    max-height: 15rem;
  }

  .co-region-option {
    padding: 0.6rem 1rem 0.6rem 0.7rem;
    font-size: 0.85rem;
    height: 2.8rem;
    border-radius: 6px;
  }

  .modal-actions {
    margin-top: 1rem; /* 缩小保存按钮与上方的间距 */
  }

  .modal-actions .btn {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
    border-radius: 8px;
  }

  /* 全局移动端hover效果禁用 */
  * {
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none !important;
    user-select: none !important;
  }

  /* 禁用所有按钮的hover效果 */
  button:hover,
  .btn:hover,
  a:hover {
    transform: none !important;
    box-shadow: none !important;
  }
}

</style>
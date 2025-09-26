<template>
  <nav class="top-navigation-bar">
    <div class="logo">
    </div>
    <div class="actions">
      <div class="user-action-container">
        <img 
          src="../../assets/icons/icons8-male-user-32.png" 
          alt="User" 
          class="icon user-icon" 
          @click="handleUserIconClick" 
        />
        <UserActionsDropdown 
          :show="showUserDropdown" 
          @close="showUserDropdown = false"
          @logout="handleUserLogout" 
        />
      </div>
<div class="cart-icon-container">
  <img 
    src="../../assets/icons/icons8-shopping-cart-32.png" 
    alt="Cart" 
    class="icon cart-icon" 
    @click="handleCartIconClick" 
  />
  <span v-if="cartItemCount > 0" class="cart-count-badge">{{ cartItemCount }}</span>
</div>
<div class="settings-container">
  <img 
    src="../../assets/icons/icons8-gear-32.png" 
    alt="Settings" 
    class="icon settings-icon" 
    @click="handleSettingsIconClick" 
  />
  <SettingsDropdown
    :show="showSettingsDropdown"
    @close="showSettingsDropdown = false"
  />
</div>
    </div>
  </nav>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import UserIcon from '../../assets/icons/UserIcon.vue';
import CartIcon from '../../assets/icons/CartIcon.vue';
import SettingsIcon from '../../assets/icons/SettingsIcon.vue';
import UserActionsDropdown from '../common/UserActionsDropdown.vue';
import SettingsDropdown from '../common/SettingsDropdown.vue';

const router = useRouter();
const { t } = useI18n();
const isLoggedIn = inject('isLoggedIn');
const toggleCart = inject('toggleCart');
const cartItems = inject('cartItems');

const showUserDropdown = ref(false);
const showSettingsDropdown = ref(false);

const cartItemCount = computed(() => {
  if (!cartItems || !cartItems.value) return 0;
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

const handleUserIconClick = () => {
  if (isLoggedIn.value) {
    showUserDropdown.value = !showUserDropdown.value;
    if (showUserDropdown.value) {
      showSettingsDropdown.value = false; // 关闭其他下拉菜单
    }
  } else {
    router.push('/login');
  }
};

const handleUserLogout = () => {
  console.log('User logged out from TopNavigationBar perspective.');
};

const handleCartIconClick = () => {
  if (toggleCart) {
    toggleCart();
  } else {
    console.warn('toggleCart function not provided to TopNavigationBar');
    alert(t('cart.unavailable', 'Cart functionality is currently unavailable.'));
  }
};

const handleSettingsIconClick = () => {
  showSettingsDropdown.value = !showSettingsDropdown.value;
  if (showSettingsDropdown.value) {
    showUserDropdown.value = false; // 关闭其他下拉菜单
  }
};
</script>

<style scoped>
.top-navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 80px;
  background-color: var(--color-topbar);
  border-bottom: 1px solid var(--color-border);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: var(--navbar-height);
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
}

.logo-link {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--color-text);
  text-decoration: none;
}

.actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-icon-container {
  position: relative;
  display: flex;
  align-items: center;
}

.cart-count-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background-color: var(--color-primary);
  color: var(--color-button-primary-text);
  border-radius: 50%;
  padding: 0;
  font-size: 0.7rem;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  box-sizing: border-box;
}

.icon {
  color: var(--color-icon);
  cursor: pointer;
  width: 22px;
  height: 22px;
  transition: color 0.2s ease;
}

.icon:hover {
  color: var(--color-primary);
}

.settings-icon {
  width: 18px;
  height: 18px;
}

.user-action-container, 
.settings-container {
  position: relative;
}

.user-action-container:hover .icon,
.settings-container:hover .icon,
.cart-icon-container:hover .icon {
  color: var(--color-primary);
}

@media (max-aspect-ratio: 1/1) {
  .top-navigation-bar {
    padding: 10px 15px;
  }
}
</style>
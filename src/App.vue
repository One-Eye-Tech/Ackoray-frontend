<template>
  <div id="app-container">
    <router-view />
    <ShoppingCartSidebar />
    <!-- <ProductListPage /> --> 
    <!-- 未来会用 Vue Router 管理路由 -->
  </div>
</template>

<script setup>
import { ref, provide, readonly, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { isLoggedIn as checkIfLoggedIn, getCurrentUser as fetchCurrentUser, clearAuth } from './api/authApi';
import cartApi from './api/cartApi';
import ShoppingCartSidebar from './components/layout/ShoppingCartSidebar.vue';

const router = useRouter();

// Cart State
const isCartOpen = ref(false);
const cartItems = ref([]); // items will be { id (cartItemId), productId, name, price, quantity, imageUrl, color, size, variantColorId, variantSizeId, permalink }

// Auth State
const isLoggedIn = ref(false);
const currentUser = ref(null); // Will store user info like { name, email, id }

// 全局语言状态
const appLanguage = ref(localStorage.getItem('language') || 'zh');

// Function to fetch cart from backend
const fetchCart = async () => {
  if (isLoggedIn.value) { // Only fetch cart if user is logged in
    try {
      const response = await cartApi.getCart();
      // Map backend CartResponseDto.CartItemDto to frontend cartItems structure
      cartItems.value = response.items.map(item => ({
        id: item.id, // This is cartItemId
        productId: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        variantColorId: item.variantColorId, // Keep for update/remove
        variantSizeId: item.variantSizeId,   // Keep for update/remove
        imageUrl: item.productImageUrl || '/src/assets/images/placeholder-product.png', // Use actual image URL, with fallback
        permalink: `/product/${item.productId}` // Placeholder, adjust if different
      }));
      console.log('Cart fetched:', cartItems.value);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Handle error, e.g., clear cart if fetch fails
      cartItems.value = [];
    }
  } else {
    // If not logged in, clear cart or handle as guest cart if applicable
    cartItems.value = [];
  }
};

// Watch for isLoggedIn status changes to fetch cart
watch(isLoggedIn, (newValue, oldValue) => {
  if (newValue === true && oldValue === false) {
    fetchCart(); // Fetch cart when user logs in
  } else if (newValue === false && oldValue === true) {
    cartItems.value = []; // Clear cart when user logs out
  }
}, { immediate: true }); // Run immediately on component mount

// 在组件挂载时检查用户登录状态
onMounted(() => {
  console.log('[App] onMounted 开始检查用户登录状态');
  
  // 尝试从localStorage恢复用户会话
  if (checkIfLoggedIn()) {
    const userData = fetchCurrentUser();
    if (userData) {
      console.log('[App] 恢复用户会话成功:', userData);
      currentUser.value = userData;
      isLoggedIn.value = true;
      // 用户已登录，主动获取购物车
      fetchCart();
    } else {
      console.log('[App] 用户数据无效，清理状态');
      isLoggedIn.value = false;
    }
  } else {
    console.log('[App] 用户未登录');
    isLoggedIn.value = false;
  }
  
  // 初始化应用语言
  document.documentElement.lang = appLanguage.value;
  document.documentElement.classList.add(`lang-${appLanguage.value}`);

  console.log('[App] onMounted 完成，当前登录状态:', isLoggedIn.value);
});

// 监听全局语言变化事件
window.addEventListener('language-changed', (event) => {
  appLanguage.value = event.detail;
});

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value;
  if (isCartOpen.value) {
    fetchCart(); // Fetch cart every time the sidebar opens
  }
};

const addToCart = async (productToAdd) => {
  try {
    const response = await cartApi.addToCart(
      productToAdd.productId || productToAdd.id, // Ensure productId is passed
      productToAdd.productVariantId,
      productToAdd.quantity || 1, // Default quantity to 1 if not specified
      productToAdd.price
    );
    // After successful add, refresh cart from backend
    await fetchCart();
    console.log('Item added to cart:', response);
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};

const removeFromCart = async (itemToRemove) => {
  // Note: Backend has two remove methods: by cartItemId and by productId (all variants)
  // Here, we use remove by cartItemId, which corresponds to a specific item in the cart.
  try {
    await cartApi.removeFromCart(itemToRemove.id); // itemToRemove.id is the cartItemId
    await fetchCart(); // Refresh cart from backend
    console.log('Item removed from cart:', itemToRemove);
  } catch (error) {
    console.error('Error removing from cart:', error);
  }
};

const updateCartItemQuantity = async (itemToUpdate, newQuantity) => {
  try {
    if (newQuantity <= 0) {
      // If quantity is 0 or less, remove the item
      await cartApi.removeFromCart(itemToUpdate.id);
    } else {
      await cartApi.updateCartItemQuantity(itemToUpdate.id, newQuantity);
    }
    await fetchCart(); // Refresh cart from backend
    console.log(`Cart item ${itemToUpdate.id} quantity updated to ${newQuantity}`);
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
  }
};

const clearCart = async () => {
  try {
    await cartApi.clearCart();
    await fetchCart(); // Refresh cart from backend (should now be empty)
    console.log('Cart cleared.');
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};

// Auth Methods
const loginUser = async (userData) => { // Made async to allow fetchCart after login
  currentUser.value = userData; // e.g., { name: 'Ackoray User', email: userData.email, id: userId }
  isLoggedIn.value = true;
  console.log('用户已登录:', currentUser.value);
  await fetchCart(); // Fetch cart immediately after successful login
};

const logoutUser = () => {
  currentUser.value = null;
  isLoggedIn.value = false;
  clearAuth();
  console.log('用户已登出');
  cartItems.value = []; // Clear local cart state on logout
  router.push('/login');
};

// Provide cart state and methods to child components
provide('isCartOpen', readonly(isCartOpen));
provide('toggleCart', toggleCart);
provide('cartItems', readonly(cartItems));
provide('addToCart', addToCart);
provide('removeFromCart', removeFromCart);
provide('updateCartItemQuantity', updateCartItemQuantity);
provide('clearCart', clearCart);

// Provide auth state and methods
provide('isLoggedIn', readonly(isLoggedIn));
provide('currentUser', readonly(currentUser));
provide('loginUser', loginUser);
provide('logoutUser', logoutUser);

// 提供全局语言状态
provide('appLanguage', appLanguage);

// TODO: Later, we'll need methods to remove/update cartItems
// provide('removeFromCart', (itemId) => { /* ... */ });
// provide('updateCartItemQuantity', (itemId, quantity) => { /* ... */ });

// No longer need to import HomePage here as it's handled by the router
// import ProductListPage from './pages/ProductListPage.vue'; // 稍后根据需要启用
</script>

<style scoped>
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text-primary);
}
</style>
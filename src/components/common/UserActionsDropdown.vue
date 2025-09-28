<template>
  <div v-if="show" class="user-actions-dropdown" ref="dropdownRef">
    <ul>
      <li><router-link to="/profile" @click="onItemClick">{{ $t('common.profile') }}</router-link></li>
      <li><router-link to="/orders" @click="onItemClick">{{ $t('common.orders') }}</router-link></li>
      <li v-if="isAdmin"><router-link to="/admin" @click="onItemClick">{{ $t('common.admin') }}</router-link></li>
      <li @click="handleLogout" class="logout-item">{{ $t('common.logout') }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close', 'logout']);

const router = useRouter();
const dropdownRef = ref(null);
const currentUser = inject('currentUser', ref(null));

// 判断用户是否为管理员
const isAdmin = computed(() => {
  return currentUser.value && currentUser.value.roleId === 2; // 假设roleId为2表示管理员
});

// Inject logout function from App.vue or similar global provider
const logoutUser = inject('logoutUser', () => {
  console.warn(t('errors.logoutNotProvided'));
  // Fallback: Clear a hypothetical currentUser from localStorage and navigate to home
  // This is a placeholder and should be replaced with your actual global logout logic
  localStorage.removeItem('currentUser'); 
  router.push('/').then(() => { 
    // Force reload or use a more sophisticated state update for isLoggedIn
    window.location.reload(); 
  });
}); 

const handleLogout = () => {
  const message = t('common.confirmLogout');
  if (confirm(message)) {
    if (logoutUser) {
      logoutUser();
    }
    emit('close');
    emit('logout'); // Emit logout to inform parent if needed for extra steps
  } else {
    emit('close'); // Close dropdown even if user cancels
  }
};

const onItemClick = () => {
  emit('close');
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

</script>

<style scoped>
.user-actions-dropdown {
  position: absolute;
  top: calc(100% + 13px);
  right: 0;
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  width: 120px;
  overflow: hidden;
}

.user-actions-dropdown ul {
  list-style: none;
  padding: 0.5rem;
  margin: 0;
}

.user-actions-dropdown li {
  padding: 0.75rem 1.25rem;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 300;
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.2s ease, color 0.2s ease;
  border-radius: var(--border-radius-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.user-actions-dropdown li:hover,
.user-actions-dropdown li a:hover {
  background-color: var(--color-surface);
  color: var(--color-text);
}

.user-actions-dropdown li a {
  text-decoration: none;
  color: inherit;
  display: block;
}

.logout-item {
  color: var(--color-negative);
}

.logout-item:hover {
  background-color: rgba(255, 77, 79, 0.1);
  color: var(--color-negative);
}
</style> 
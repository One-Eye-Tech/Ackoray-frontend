<template>
  <div v-if="show" class="settings-dropdown" ref="dropdownRef">
    <ul>
      <router-link to="/" class="dropdown-item-link" @click="$emit('close')">
        <li>
          <span>{{ $t('common.home', '首页') }}</span>
        </li>
      </router-link>
      <!-- 暂时注释掉语言切换 -->
      <!-- <li @click="toggleLanguage">
        <span>{{ $t('common.language') }} {{ currentLanguage === 'zh' ? '-en' : '-zh' }}</span>
      </li> -->
      <li @click="openPrivacyPolicy">
        <span>{{ $t('common.privacyPolicy') }}</span>
      </li>
      <li @click="openUserAgreement">
        <span>{{ $t('common.userAgreement') }}</span>
      </li>
      <!-- 
      <li @click="openCustomerChat">
        <span>{{ $t('common.customerChat') }}</span>
      </li> -->
    </ul>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLanguage } from '../../i18n';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);
const dropdownRef = ref(null);
const { t, locale } = useI18n();

// 当前语言状态
const currentLanguage = ref(locale.value);

// 监听语言变化
watch(locale, (newLang) => {
  currentLanguage.value = newLang;
}, { immediate: true });

const toggleLanguage = () => {
  const newLanguage = currentLanguage.value === 'zh' ? 'en' : 'zh';
  // 使用国际化模块的语言切换方法
  setLanguage(newLanguage);
  emit('close');
};

const openPrivacyPolicy = () => {
  // 打开隐私政策页面
  console.log('Opening privacy policy');
  // 根据环境动态构建URL
  const baseUrl = window.location.hostname === 'one-eye-tech.github.io' 
    ? 'https://one-eye-tech.github.io/ackoray-frontend' 
    : '';
  window.open(`${baseUrl}/url/privacy.html`, '_blank');
  emit('close');
};

const openUserAgreement = () => {
  // 打开用户协议页面
  console.log('Opening user agreement');
  // 根据环境动态构建URL
  const baseUrl = window.location.hostname === 'one-eye-tech.github.io' 
    ? 'https://one-eye-tech.github.io/ackoray-frontend' 
    : '';
  window.open(`${baseUrl}/url/terms.html`, '_blank');
  emit('close');
};

const openCustomerChat = () => {
  // 这里可以添加打开客服聊天的逻辑
  console.log('Opening customer chat');
  alert(t('chat.connecting'));
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
.settings-dropdown {
  position: absolute;
  top: calc(100% + 15px);
  right: 0;
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  width: 120px;
  overflow: hidden;
}

.settings-dropdown ul {
  list-style: none;
  padding: 0.5rem;
  margin: 0;
}

.settings-dropdown li {
  padding: 0.75rem 1.25rem;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 300;
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-medium);
  text-align: center;
}

.settings-dropdown li:hover {
  background-color: var(--color-surface);
  color: var(--color-text);
}

.dropdown-item-link {
  text-decoration: none;
  color: inherit;
}
</style> 
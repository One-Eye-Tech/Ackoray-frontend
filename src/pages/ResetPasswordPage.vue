<template>
  <div class="auth-page-container">
    <div class="auth-form-card">
      <!-- 标题行：返回按钮 + 居中标题 -->
      <div class="title-row">
        <button @click="goBack" class="back-btn" type="button">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="form-title">{{ $t('auth.setNewPassword') }}</h1>
      </div>

      <form @submit.prevent="handleResetPasswordSubmit" class="form-main">
        <div class="form-group">
          <label for="newPassword" class="form-label">{{ $t('auth.newPassword') }}</label>
          <div class="password-input-wrapper">
            <input
              :type="newPasswordFieldType"
              id="newPassword"
              v-model="newPassword"
              :placeholder="$t('auth.passwordPlaceholder')"
              autocomplete="new-password"
              required
              class="form-input"
            />
            <button type="button" @click="toggleNewPasswordVisibility" class="password-toggle-btn" :aria-label="$t('auth.togglePassword')">
              <svg v-if="newPasswordFieldType === 'password'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="eye-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="eye-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" /></svg>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">{{ $t('auth.confirmNewPassword') }}</label>
          <div class="password-input-wrapper">
            <input
              :type="confirmPasswordFieldType"
              id="confirmPassword"
              v-model="confirmPassword"
              :placeholder="$t('auth.passwordPlaceholder')"
              autocomplete="new-password"
              required
              class="form-input"
            />
             <button type="button" @click="toggleConfirmPasswordVisibility" class="password-toggle-btn" :aria-label="$t('auth.togglePassword')">
              <svg v-if="confirmPasswordFieldType === 'password'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="eye-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="eye-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" /></svg>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-full">{{ $t('auth.saveNewPassword') }}</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { changePassword } from '../api/passwordApi';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const userEmail = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const newPasswordFieldType = ref('password');
const confirmPasswordFieldType = ref('password');

// 错误提示已改为alert，删除相关变量

const goBack = () => {
  router.back();
};

onMounted(() => {
  userEmail.value = route.query.email || '';
  const code = route.query.code || '';
  
  if (!userEmail.value || !code) {
    // 如果缺少必要参数，重定向到登录页面
    console.error('Email or verification code missing for password reset');
    router.push('/login');
  }
});

const toggleNewPasswordVisibility = () => {
  newPasswordFieldType.value = newPasswordFieldType.value === 'password' ? 'text' : 'password';
};

const toggleConfirmPasswordVisibility = () => {
  confirmPasswordFieldType.value = confirmPasswordFieldType.value === 'password' ? 'text' : 'password';
};

const validatePasswords = () => {
  // 密码长度验证
  if (!newPassword.value || newPassword.value.length < 8) {
    alert(t('auth.validation.passwordLength'));
    return false;
  }
  
  // 确认密码不能为空
  if (!confirmPassword.value) {
    alert(t('auth.validation.confirmPassword'));
    return false;
  }
  
  // 密码匹配验证
  if (newPassword.value !== confirmPassword.value) {
    alert(t('errors.passwordMismatch'));
    return false;
  }
  
  return true;
};

const handleResetPasswordSubmit = async () => {
  if (validatePasswords()) {
    try {
      // 从路由查询参数中获取验证码
      const verificationCode = route.query.code;
      
      if (!verificationCode) {
        alert(t('errors.verificationCodeMissing'));
        router.push('/login');
        return;
      }
      
      // 调用修改密码API
      const result = await changePassword(userEmail.value, verificationCode, newPassword.value);
      
      if (result === true) {
        // 如果成功，显示成功信息并跳转到登录页面
        alert(t('auth.passwordResetSuccess'));
        router.push('/login');
      } else {
        // 如果失败，显示错误信息
        let errorMessage = t('errors.unknownError');
        if (typeof result === 'string') {
          errorMessage = result;
        } else if (result && typeof result.message === 'string') {
          errorMessage = result.message;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('重置密码失败:', error);
      alert(error.message || t('errors.serverError'));
    }
  }
};
</script>

<style scoped>
/* Styles largely copied from RegisterPage.vue for consistency */
.auth-page-container {
  min-height: 100vh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: var(--color-bg); /* 使用浅色背景 */
}

.auth-form-card {
  display: flex;
  flex-direction: column;
  align-self: center;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  gap: 1.25rem;
  background-color: var(--color-card); /* 使用浅色卡片背景 */
  border-radius: 12px;
  border: 1px solid var(--color-border); /* 添加边框 */
  box-shadow: 0 0px 4px rgba(0, 0, 0, 0.05); /* 添加阴影 */
}

/* Specific styles if needed, otherwise rely on shared classes */
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

/* 标题行样式 */
.title-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center; /* 让标题居中 */
  margin-top: -0.5rem;
  min-height: 38px; /* 确保有足够高度容纳按钮 */
}

.back-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: absolute; /* 绝对定位，不影响标题居中 */
  left: 0; /* 靠左对齐 */
  top: 0;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-icon {
  width: 22px;
  height: 22px;
  color: var(--color-text);
}

.form-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text); /* 使用浅色文本颜色 */
  text-align: center;
  margin: 0; /* 移除边距，由title-row控制 */
}

.verification-text {
  color: var(--color-text); /* 使用次要文本颜色 */
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 1rem;
}
.verification-text strong {
  color: var(--color-text); /* 使用正文本颜色 */
  font-weight: 500;
}

.form-main {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.875rem;
  color: var(--color-text); /* 使用次要文本颜色 */
  font-weight: 500;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border); /* 使用浅色边框 */
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--color-card); /* 使用浅色背景 */
  color: var(--color-text); /* 使用浅色文本颜色 */
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.form-input::placeholder {
  color: var(--color-text-muted); /* 使用静音文本颜色 */
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary); /* 使用主要颜色 */
}
.form-input:-webkit-autofill,
.form-input:-webkit-autofill:hover,
.form-input:-webkit-autofill:focus,
.form-input:-webkit-autofill:active {
  -webkit-text-fill-color: var(--color-text) !important;
  -webkit-box-shadow: 0 0 0px 1000px var(--color-card) inset !important;
  transition: background-color 5000s ease-in-out 0s;
  caret-color: var(--color-text) !important;
}


/* error-message 样式已删除，改用 alert 提示 */

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.password-input-wrapper .form-input {
  padding-right: 2.75rem;
  width: 100%;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--color-icon); /* 使用图标颜色 */
}
.eye-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.btn {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, opacity 0.2s ease;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border-color: var(--color-button-primary);
}
.btn-primary:hover {
  background-color: var(--color-button-primary-hover);
  border-color: var(--color-button-primary-hover);
}

.link {
  font-size: 0.875rem;
  color: var(--color-accent); /* 使用强调色 */
  text-decoration: none;
  font-weight: 500;
}
.link:hover {
  text-decoration: underline;
}

.text-center {
  font-size: 0.875rem;
  text-align: center;
  color: var(--color-text-secondary); /* 添加文本颜色 */
}
.mt-6 {
  margin-top: 0.5rem;
}
.w-full {
  width: 100%;
}

/* 移动端专用样式 - 竖屏设备 */
@media (max-aspect-ratio: 1/1) {
  .auth-page-container {
    justify-content: flex-start; /* 改为顶部对齐 */
    padding-top: 9rem; /* 向上移动表单 */
  }

  /* 移动端返回按钮确保默认状态 */
  .back-btn {
    transform: none !important; /* 确保默认状态无变换 */
    box-shadow: none !important; /* 确保默认状态无阴影 */
  }

  /* 移动端返回按钮移除上移效果 */
  .back-btn:hover {
    transform: none !important;
    box-shadow: none !important;
  }
}
</style> 
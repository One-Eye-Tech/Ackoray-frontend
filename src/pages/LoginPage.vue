<template>
  <div class="auth-page-container">
    <div class="auth-form-card">
      <!-- 标题行：返回按钮 + 登录标题 + 占位符 -->
      <div class="title-row">
        <button @click="goToHome" class="back-btn" type="button">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="form-title">{{ $t('auth.signIn') }}</h1>
        <div class="title-spacer"></div>
      </div>

      <form @submit.prevent="handleSignInSubmit" class="form-main">
        <div class="form-group">
          <label for="email" class="form-label">{{ $t('auth.email') }}</label>
          <input
            type="email"
            id="email"
            name="email"
            v-model="email"
            :placeholder="$t('auth.emailPlaceholder')"
            autocomplete="email"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">{{ $t('auth.password') }}</label>
           <div class="password-input-wrapper">
            <input
              :type="passwordFieldType"
              id="password"
              name="password"
              v-model="password"
              :placeholder="$t('auth.passwordPlaceholder')"
              autocomplete="current-password"
              required
              class="form-input"
            />
             <button type="button" @click="togglePasswordVisibility" class="password-toggle-btn" :aria-label="$t('auth.togglePassword')">
                <svg v-if="passwordFieldType === 'password'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="eye-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="eye-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
                </svg>
            </button>
          </div>
        </div>

        <div class="form-control-row">
          <div class="form-control-label">
            <input type="checkbox" id="rememberMe" v-model="rememberMe" class="checkbox-input" />
            <label for="rememberMe" class="checkbox-label">{{ $t('auth.rememberMe') }}</label>
          </div>
          <a href="#" @click.prevent="toggleForgotPasswordDialog(true)" class="link forgot-password-link">
            {{ $t('auth.forgotPassword') }}
          </a>
        </div>

        <button type="submit" class="btn btn-primary w-full">{{ $t('auth.signIn') }}</button>

        <p class="agreement-text">
          登录即表示您同意 
          <router-link to="/url/privacy.html" target="_blank" class="link">《隐私政策》</router-link> 
          与 
          <router-link to="/url/terms.html" target="_blank" class="link">《用户协议》</router-link>
        </p>
      </form>

      <hr class="form-divider" />

      <p class="text-center">
        <router-link to="/register" class="link">立即注册</router-link>
      </p>
    </div>

    <!-- Forgot Password Dialog -->
    <div v-if="showForgotPasswordDialog" class="dialog-overlay" @click="handleDialogOverlayClick">
      <div class="dialog-paper" @click.stop>
        <form @submit.prevent="handleForgotPasswordSubmit">
          <h2 class="dialog-title">{{ $t('auth.resetPassword') }}</h2>
          <div class="dialog-content">
            <p class="dialog-content-text">
              {{ $t('auth.resetPasswordText') }}
            </p>
            <div class="form-group">
               <label for="forgot-email" class="form-label sr-only">{{ $t('auth.email') }}</label>
              <input
                type="email"
                id="forgot-email"
                v-model="forgotPasswordEmail"
                :placeholder="$t('auth.email')"
                required
                class="form-input"
              />
            </div>
          </div>
          <div class="dialog-actions">
            <button type="submit" class="btn btn-primary-dialog-full">{{ $t('auth.continue') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { login } from '../api/authApi';
import { sendPasswordResetCode } from '../api/passwordApi';

const router = useRouter();
const route = useRoute();
const loginUser = inject('loginUser');
const { t } = useI18n();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const passwordFieldType = ref('password');

const showForgotPasswordDialog = ref(false);
const forgotPasswordEmail = ref('');
const isLoading = ref(false);

// 检查URL中是否有session_expired参数
const checkSessionExpired = () => {
  if (route.query.redirected === 'session_expired') {
    alert(t('auth.validation.sessionExpired'));
  }
};

// 在组件挂载后检查
checkSessionExpired();

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const validateSignInInputs = () => {
  // Email validation
  if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
    alert(t('auth.validation.validEmail'));
    return false;
  }

  // Password validation
  if (!password.value) { // Removed length check for now, backend should handle
    alert(t('auth.validation.passwordLength'));
    return false;
  }
  return true;
};

const handleSignInSubmit = async () => {
  if (validateSignInInputs()) {
    isLoading.value = true;

    try {
      const result = await login(email.value, password.value, rememberMe.value);

      if (result.success) {
        console.log('登录成功:', result.user);
        
        // 调用inject提供的loginUser方法更新全局用户状态
        loginUser({
          name: result.user?.userName || result.user?.email,
          email: result.user?.email,
          id: result.user?.id,
          roleId: result.user?.roleId,
          // 其他可能需要的用户属性
        });
        
        // 重定向到主页或者用户之前尝试访问的页面
        const redirectPath = route.query.redirect || '/';
        router.push(redirectPath);
      } else {
        // 使用国际化文本处理错误消息
        const errorMsg = result.message || '';
        
        // 根据错误消息内容选择合适的国际化文本
        let alertMessage;
        if (errorMsg.includes('用户不存在')) {
          alertMessage = t('errors.userNotExists');
        } else if (errorMsg.includes('密码错误')) {
          alertMessage = t('errors.invalidCredentials');
        } else if (errorMsg.includes('服务不可用')) {
          alertMessage = t('errors.loginServiceUnavailable');
        } else if (errorMsg.includes('账户已被禁用')) {
          alertMessage = t('errors.accountDisabled');
        } else {
          // 默认错误消息
          alertMessage = t('errors.loginFailed');
        }
        alert(alertMessage);
      }
    } catch (error) {
      console.error('登录过程中发生错误:', error);
      alert(t('errors.serverError'));
    } finally {
      isLoading.value = false;
    }
  }
};

const toggleForgotPasswordDialog = (show) => {
  showForgotPasswordDialog.value = show;
  if (!show) {
    forgotPasswordEmail.value = '';
  }
};

const handleForgotPasswordSubmit = async () => {
  if (!forgotPasswordEmail.value || !/\S+@\S+\.\S+/.test(forgotPasswordEmail.value)) {
    alert(t('auth.validation.validEmail'));
    return;
  }
  
  try {
    isLoading.value = true;
    
    // 去除邮箱地址前后空格
    const email = forgotPasswordEmail.value.trim();
    console.log('发送密码重置请求，邮箱:', email);
    
    // 调用发送密码重置验证码API
    await sendPasswordResetCode(email);
    
    // 成功发送验证码，关闭弹窗并导航到验证页面
    toggleForgotPasswordDialog(false);
    router.push({ 
      path: '/verify-email', 
      query: { 
        email: email, 
        flow: 'resetPassword' 
      } 
    });
    
  } catch (error) {
    console.error('发送密码重置验证码失败:', error);
    
    // 获取错误消息
    const errorMsg = error?.message || '';
    
    // 使用国际化文本显示错误消息
    if (errorMsg.includes('邮箱尚未注册') || errorMsg.includes('not registered')) {
      alert(t('errors.emailNotRegistered'));
    } else if (errorMsg.includes('服务暂时不可用') || errorMsg.includes('service unavailable')) {
      alert(t('errors.serviceUnavailable'));
    } else if (errorMsg.includes('验证码错误') || errorMsg.includes('invalid code')) {
      alert(t('errors.verificationCodeInvalid'));
    } else if (errorMsg.includes('验证码已过期') || errorMsg.includes('code expired')) {
      alert(t('errors.verificationCodeExpired'));
    } else if (errorMsg.includes('请求的资源不存在') || errorMsg.includes('resource not found')) {
      // 处理通用404错误
      alert(t('errors.emailNotRegistered'));
    } else {
      // 其他未知错误
      alert(t('errors.serverError'));
    }
  } finally {
    isLoading.value = false;
  }
};

const handleSocialLoginAlert = (message) => {
  window.alert(message);
};

const handleDialogOverlayClick = () => {
  toggleForgotPasswordDialog(false);
};

const goToHome = () => {
  router.push('/');
};

</script>

<style scoped>
/* Base page container styling */
.auth-page-container {
  min-height: 100vh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center card vertically */
  align-items: center; /* Center card horizontally */
  position: relative;
  background-color: var(--color-bg); /* 使用浅色背景 */
}

/* Form card styling */
.auth-form-card {
  display: flex;
  flex-direction: column;
  align-self: center;
  width: 100%;
  max-width: 400px; /* Slightly narrower like image */
  padding: 1.5rem 2rem 1.5rem 2rem; 
  gap: 1.25rem; /* Adjusted gap */
  background-color: var(--color-card); /* 使用浅色卡片背景 */
  border-radius: 12px; /* Rounded corners like image */
  border: 1px solid var(--color-border); /* 添加边框 */
  box-shadow: 0 0px 4px rgba(0, 0, 0, 0.05); /* 添加阴影 */
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem; /* mb-6 equivalent */
}
/* Using CSS variables for Ackoray logo, defined here for clarity or can be global */
:root {
  --color-logo-accent-1: #8A8F98; /* Adjusted for dark theme if needed */
  --color-logo-accent-2: #00A080; /* Adjusted for dark theme if needed */
  --color-logo-accent-3: #3B82F6; /* Adjusted for dark theme if needed */
}


.form-title {
  font-size: 1.75rem; /* Slightly smaller than clamp, closer to image */
  font-weight: 500; /* Bold */
  color: var(--color-text); 
  text-align: center; /* 左对齐 */
}

.form-main {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem; 
  margin-top: -1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem; /* 6px */
}

.form-label {
  font-size: 0.875rem; 
  color: var(--color-text); /* 使用浅色主题的次要文本颜色 */
  font-weight: 500;
}

.form-input {
  padding: 0.75rem 1rem; 
  border: 1px solid var(--color-border); /* 使用浅色边框 */
  border-radius: 6px;
  font-size: 1rem;
  background-color: var(--color-card); /* 使用浅色输入框背景 */
  color: var(--color-text); /* 使用浅色文本颜色 */
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.form-input::placeholder {
  color: var(--color-text-secondary); /* 使用浅色主题的占位符颜色 */
  font-size: 0.875rem; /* 14px, 缩小占位符文字 */
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary); /* 使用主要颜色 */
}

.input-error {
  border-color: var(--color-negative); /* 使用负向状态色 */
}
.input-error:focus {
  border-color: var(--color-negative);
}

/* error-message 样式已删除，改用 alert 提示 */

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.password-input-wrapper .form-input {
  padding-right: 2.75rem; /* Space for the icon button */
  width: 100%;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem; /* Adjusted position */
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--color-icon); /* 使用浅色主题的图标颜色 */
}
.eye-icon {
  width: 1.25rem; 
  height: 1.25rem;
}

.form-control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.form-control-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  border-radius: 3px;
  border: 1px solid var(--color-border); 
  accent-color: var(--color-primary); /* 使用主要颜色 */
  background-color: var(--color-card); /* 使用浅色背景 */
  vertical-align: middle;
}
/* Custom styling for checkbox appearance if needed, as accent-color can be limited */
.checkbox-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-label {
  font-size: 0.75rem;
  color: var(--color-text); /* 使用次要文本颜色 */
}

.btn {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500; /* Adjusted weight */
  font-size: 0.9375rem; /* 15px */
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, opacity 0.2s ease;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: var(--color-button-primary); /* 使用主要按钮颜色 */
  color: var(--color-button-primary-text);
  border-color: var(--color-button-primary);
}
.btn-primary:hover {
  background-color: var(--color-button-primary-hover); /* 使用悬停颜色 */
  border-color: var(--color-button-primary-hover);
}

/* Social login buttons styles can be added here if needed */

.form-divider {
  border: none;
  height: 1px;
  background-color: var(--color-border); /* 使用浅色边框颜色 */
  margin-top: 0.2rem; /* Adjust spacing as needed */
  margin-bottom: 0.2rem; /* Adjust spacing as needed */
}

/* Dialog Styles (ensure these are present and correct) */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 调整覆盖层透明度 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.dialog-paper {
  background-color: var(--color-card); /* 使用浅色卡片背景 */
  padding: 1.5rem 1.8rem 1.5rem 1.8rem;
  border-radius: 12px;
  width: 100%; /* 与登录表单相同的左右间距 */
  max-width: 400px; /* 与登录表单保持一致的最大宽度 */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dialog-title {
  font-size: 1.5rem; /* 24px */
  font-weight: 500;
  color: var(--color-text);
  text-align: center;
  margin-bottom: 1rem;
}

.dialog-content-text {
  font-size: 0.875rem; /* 14px */
  color: var(--color-text-secondary); /* 使用次要文本颜色 */
  margin-bottom: 1.5rem; /* <-- 修改这里，从 1rem 增大到 1.5rem */
  line-height: 1.5;
  text-align: center;
}

.dialog-actions {
  display: flex;
  justify-content: center; /* Center the button */
  margin-top: 1.5rem;
}
.btn-text {
  color: var(--color-button-secondary-text); /* 使用次要按钮文本颜色 */
  background-color: var(--color-button-secondary); /* 使用次要按钮背景 */
  border: 1px solid var(--color-border);  /* 使用边框颜色 */
  padding: 0.6rem 1.2rem;   /* <-- 修改这里：增大按钮 */
  font-size: 0.875rem;      /* <-- 修改这里：缩小文字 */
  border-radius: 8px;
}
.btn-text:hover {
  background-color: var(--color-button-secondary-hover); /* 使用次要按钮悬停颜色 */
}

.btn-primary-dialog {
  background-color: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border-color: var(--color-button-primary);
  padding: 0.6rem 1.2rem;   /* <-- 修改这里：增大按钮 */
  font-size: 0.875rem;      /* <-- 修改这里：缩小文字 */
  border-radius: 8px;
}
.btn-primary-dialog:hover {
  background-color: var(--color-button-primary-hover);
  border-color: var(--color-button-primary-hover);
}

.btn-primary-dialog-full {
  background-color: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border: 1px solid var(--color-button-primary);
  padding: 0.7rem 1rem; /* 与form-input相同的padding */
  font-size: 1rem; /* 与form-input相同的font-size */
  border-radius: 6px; /* 与form-input相同的border-radius */
  width: 100%; /* 全宽度，与邮箱输入框对齐 */
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}
.btn-primary-dialog-full:hover {
  background-color: var(--color-button-primary-hover);
  border-color: var(--color-button-primary-hover);
}

.w-full { width: 100%; }

/* Ensure any previously commented out styles for dialog are restored if necessary */

.text-center {
  text-align: center;
  font-size: 0.75rem; /* 14px, 缩小字体 */
  color: var(--color-text-secondary);     /* 使用次要文本颜色 */
}

.link {
  color: var(--color-primary);     /* 使用强调色 */
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.link:hover {
  text-decoration: underline;
}

/* 忘记密码链接样式 */
.forgot-password-link {
  font-size: 0.75rem; /* 14px, 缩小字体 */
  font-weight: 400;
}

/* 协议文本样式 */
.agreement-text {
  font-size: 0.75rem; /* 12px, 更小的字体 */
  color: var(--color-text);
  text-align: center;
  line-height: 1.4;
  margin-top: 0.5rem;
  font-weight: 600;
}

/* 标题行样式 */
.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  justify-content: space-between; /* 三等分布局 */
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
  padding: 0;
  flex-shrink: 0; /* 防止按钮收缩 */
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

.title-spacer {
  width: 38px; /* 与返回按钮同宽，保持标题居中 */
  height: 38px;
}

/* 移动端专用样式 - 竖屏设备 */
@media (max-aspect-ratio: 1/1) {
  .auth-page-container {
    justify-content: flex-start; /* 改为顶部对齐 */
    padding-top: 5rem; /* 向上移动表单 */
  }

  .dialog-paper{
    width: calc(100% - 2.5remrem);
    max-width: calc(400px - 2.5rem);
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
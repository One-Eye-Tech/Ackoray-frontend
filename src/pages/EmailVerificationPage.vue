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
        <h1 class="form-title">{{ $t('auth.verifyEmail') }}</h1>
      </div>
      <p class="verification-text">
        {{ $t('auth.verificationCodeSent') }} <strong>{{ userEmail || $t('auth.yourEmailAddress') }}</strong>
        {{ $t('auth.enterCodeBelow') }}
      </p>

      <form @submit.prevent="handleVerificationSubmit" class="form-main">
        <div class="form-group" @click="focusHiddenInput">
          <label for="hiddenVerificationCodeInput" class="form-label sr-only">{{ $t('auth.verificationCode') }}</label>
          <div class="code-inputs-container">
            <div 
              v-for="i in 6" 
              :key="'code-box-' + i" 
              class="code-input-box"
              :class="{ 'has-value': verificationCodeDisplay[i-1], 'focused': focusedBox === i-1 }"
            >
              {{ verificationCodeDisplay[i-1] || '' }}
            </div>
          </div>
          <input
            ref="hiddenInputRef"
            type="text" 
            inputmode="numeric" 
            id="hiddenVerificationCodeInput"
            v-model="verificationCode"
            autocomplete="one-time-code"
            required
            maxlength="6"
            class="hidden-input"
            @input="handleHiddenInputChange"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
            @keydown="handleKeyDown"
          />
        </div>

        <button type="submit" class="btn btn-primary w-full">{{ $t('auth.verify') }}</button>
      </form>

      <div class="resend-container mt-4">
        {{ $t('auth.didntReceiveCode') }}
        <!-- 倒计时显示 -->
        <span v-if="countdown > 0" class="countdown-text">
          {{ countdown }}s
        </span>
        <!-- 重新发送按钮 -->
        <button v-else @click="handleResendCode" class="resend-btn" :disabled="isResending">
          {{ isResending ? $t('auth.resending') : $t('auth.resendCode') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { verifyCodeAndRegister, sendVerificationCode } from '../api/registerApi';
import { verifyPasswordResetCode, resendPasswordResetCode } from '../api/passwordApi';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const verificationCode = ref('');
const userEmail = ref(''); // Set from route query
const currentFlow = ref('register'); // Set from route query

// 错误提示已改为alert，删除相关变量
const isResending = ref(false);
const isSubmitting = ref(false);
const hiddenInputRef = ref(null);
const isInputFocused = ref(false);

// 倒计时相关
const countdown = ref(60);
const countdownTimer = ref(null);

// Stores email and password for resend in registration flow. NO fullName.
const tempRegisterData = ref({
  email: '',
  password: ''
});

const goBack = () => {
  router.back();
};

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60;
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
  
  countdownTimer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
    }
  }, 1000);
};

// 清除倒计时
const clearCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
};

onMounted(() => {
  // 从URL查询参数中获取邮箱和流程类型
  userEmail.value = route.query.email || '';
  currentFlow.value = route.query.flow || 'register';
  
  console.log('EmailVerificationPage 已挂载，获取参数:', {
    email: userEmail.value,
    flow: currentFlow.value
  });

  if (!userEmail.value) {
    console.error('错误: 邮箱参数缺失，无法进行验证');
    alert(t('auth.emailMissing'));
    router.push('/login');
    return;
  }

  if (currentFlow.value === 'register') {
    const storedUserDataString = localStorage.getItem('registerData');
    if (storedUserDataString) {
      try {
        const parsedData = JSON.parse(storedUserDataString);
        // Only email and password. fullName is NOT expected or used.
        tempRegisterData.value.email = parsedData.email || '';
        tempRegisterData.value.password = parsedData.password || '';

        if (userEmail.value && parsedData.email !== userEmail.value) {
          console.warn('Email in localStorage does not match email in route. Clearing localStorage data for registration flow.');
          localStorage.removeItem('registerData');
          tempRegisterData.value.email = '';
          tempRegisterData.value.password = '';
        }
      } catch (error) {
        console.error('Error parsing registration data from localStorage:', error);
        localStorage.removeItem('registerData');
        tempRegisterData.value.email = '';
        tempRegisterData.value.password = '';
      }
    }
  }
  focusHiddenInput();
  
  // 启动倒计时
  startCountdown();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  clearCountdown();
});

const verificationCodeDisplay = computed(() => {
  return verificationCode.value.padEnd(6, ' ').split('');
});

const focusedBox = computed(() => {
  if (isInputFocused.value) {
    return verificationCode.value.length < 6 ? verificationCode.value.length : 5;
  }
  return -1;
});

const focusHiddenInput = () => {
  hiddenInputRef.value?.focus();
};

const handleHiddenInputChange = (event) => {
  const value = event.target.value.replace(/[^0-9]/g, '');
  verificationCode.value = value.slice(0, 6);
};

const handleKeyDown = (event) => {
  if (event.key === 'Backspace' && verificationCode.value.length > 0) {
    // v-model handles deletion
  }
};

const validateCode = () => {
  if (verificationCode.value.length !== 6) {
    alert(t('auth.validation.sixDigitCode'));
    return false;
  }
  return true;
};

const handleVerificationSubmit = async () => {
  if (!validateCode()) {
    return;
  }
  
  // 确保有邮箱地址
  if (!userEmail.value) {
    alert(t('auth.emailMissing'));
    console.error('验证失败: 缺少邮箱地址');
    return;
  }
  
  try {
    isSubmitting.value = true;
    console.log('提交验证码:', verificationCode.value, '邮箱:', userEmail.value, '流程:', currentFlow.value);
    
    if (currentFlow.value === 'register') {
      // 注册流程的验证逻辑
      const result = await verifyCodeAndRegister(userEmail.value, verificationCode.value);
      console.log('注册验证结果:', result);
      
      if (result && typeof result === 'object' && result.email) {
        localStorage.removeItem('registerData');
        router.push('/login');
        alert(t('auth.registrationSuccessful'));
      } else {
        // 显示错误信息
        let errorMessage;
        if (typeof result === 'string') {
          errorMessage = result;
        } else if (result && typeof result.message === 'string') {
          errorMessage = result.message;
        } else {
          errorMessage = t('auth.validation.invalidCode');
        }
        alert(errorMessage);
        verificationCode.value = '';
      }
    } else if (currentFlow.value === 'resetPassword') {
      // 密码重置流程的验证逻辑 - 确保邮箱被正确传递
      const email = userEmail.value.trim();
      const code = String(verificationCode.value); // 确保验证码以字符串形式发送
      
      console.log('发送密码重置验证码验证，参数:', {
        email: email,
        code: code
      });
      
      if (!email) {
        throw new Error('邮箱地址不能为空，请返回登录页重新发起密码重置请求');
      }
      
      // 调用API验证验证码
      const result = await verifyPasswordResetCode(email, code);
      console.log('密码重置验证结果:', result);
      
      if (result === true) {
        // 验证成功，跳转到重置密码页面
        router.push({ 
          path: '/reset-password', 
          query: { 
            email: email, 
            code: code 
          } 
        });
      } else {
        // 验证失败，显示错误信息
        let errorMessage;
        if (typeof result === 'string') {
          errorMessage = result;
        } else if (result && typeof result.message === 'string') {
          errorMessage = result.message;
        } else {
          errorMessage = t('auth.validation.invalidCode');
        }
        alert(errorMessage);
        verificationCode.value = '';
      }
    }
  } catch (error) {
    console.error('验证失败:', error);
    alert(error.message || t('errors.serverError'));
  } finally {
    isSubmitting.value = false;
    focusHiddenInput();
  }
};

const handleResendCode = async () => {
  if (!userEmail.value) {
    console.warn('邮箱地址缺失，无法重新发送验证码');
    return;
  }
  
  try {
    isResending.value = true;
    let result;

    if (currentFlow.value === 'register') {
      // 注册流程的重发验证码逻辑
      if (tempRegisterData.value && tempRegisterData.value.email === userEmail.value && tempRegisterData.value.password) {
        console.log('重新发送注册验证码，邮箱:', userEmail.value);
        result = await sendVerificationCode(
          tempRegisterData.value.email, 
          tempRegisterData.value.password
        );
      } else {
        console.warn('注册验证码重发失败：本地数据不完整。tempRegisterData:', tempRegisterData.value, '当前邮箱:', userEmail.value);
        // 静默处理，不显示提示框
        router.push('/register');
        isResending.value = false;
        return; 
      }
    } else if (currentFlow.value === 'resetPassword') {
      // 重置密码流程的重发验证码逻辑
      console.log('重新发送密码重置验证码，邮箱:', userEmail.value);
      
      // 确保Email不为空
      if (!userEmail.value) {
        throw new Error('邮箱地址不能为空');
      }
      
      // 直接调用API并传递email参数
      result = await resendPasswordResetCode(userEmail.value);
      console.log('重发验证码API返回结果:', result);
    }

    // 处理结果
    if (result === true) {
      // 重新发送成功后启动倒计时，不显示提示框
      startCountdown();
    } else if (result === false) {
      // 发送失败，静默处理或记录日志
      console.warn('重新发送验证码失败');
    } else if (typeof result === 'string') {
      // 服务器返回错误信息，静默处理
      console.warn('重新发送验证码错误:', result);
    } else if (result && typeof result.message === 'string') {
      // 服务器返回错误对象，静默处理
      console.warn('重新发送验证码错误:', result.message);
    } else {
      // 未知错误，静默处理
      console.warn('重新发送验证码时发生未知错误');
    }
  } catch (error) {
    console.error('重发验证码时发生错误:', error);
    // 静默处理错误，不显示提示框
  } finally {
    isResending.value = false;
  }
};
</script>

<style scoped>
/* Using similar styles from LoginPage/RegisterPage for consistency */
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
  padding: 1.5rem 2rem 1.5rem 2rem; 
  gap: 1.25rem;
  background-color: var(--color-card); /* 使用浅色卡片背景 */
  border-radius: 12px;
  border: 1px solid var(--color-border); /* 添加边框 */
  box-shadow: 0 0px 4px rgba(0, 0, 0, 0.05); /* 添加阴影 */
}

/* 标题行样式 */
.title-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center; /* 让标题居中 */
  margin-bottom: 1.5rem;
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

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem; /* Matches other auth pages */
}

.form-title {
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--color-text); /* 使用浅色文本颜色 */
  text-align: center; /* 居中显示 */
  margin: 0; /* 移除边距 */
}

.verification-text {
  color: var(--color-text-secondary); /* 使用次要文本颜色 */
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 1rem; /* Space before the form */
  margin-top: -1.5rem;
}
.verification-text strong {
  color: var(--color-text-secondary); /* 强调邮箱 */
  font-weight: 500;
}

.form-main {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
  margin-top: -0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem; /* 6px */
  position: relative; /* For positioning hidden input */
}

.code-inputs-container {
  display: flex;
  justify-content: space-between; /* Distribute boxes evenly */
  gap: 0.6rem; /* Slightly adjust gap if needed for square boxes */
  width: 100%;
  cursor: text; /* Indicate it's clickable */
}

.code-input-box {
  width: 45px; /* Changed to make it square */
  height: 45px; /* Changed to make it square */
  border: 1px solid var(--color-border); /* 使用浅色边框 */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem; /* 缩小验证码数字字体 */
  color: var(--color-text); /* 使用浅色文本颜色 */
  background-color: var(--color-card); /* 使用浅色背景 */
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.code-input-box.has-value {
  border-color: var(--color-border-strong); /* 使用强边框颜色 */
}

.code-input-box.focused {
  border-color: var(--color-primary); /* 使用主要颜色 */
}

.hidden-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border: none;
  padding: 0;
  margin: 0;
  cursor: default; /* Or text, depending on desired behavior */
  caret-color: transparent; /* Hide the caret in the hidden input */
  background: transparent;
  color: transparent;
  z-index: 1; /* Ensure it's clickable but invisible */
}

.form-label.sr-only { 
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* error-message 样式已删除，改用 alert 提示 */

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
  font-size: 0.75rem; /* 与登录注册页面保持一致 */
  color: var(--color-accent); /* 使用强调色 */
  text-decoration: none;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.link:hover {
  text-decoration: underline;
}
.link:disabled {
  color: var(--color-text-secondary); /* 使用静音文本颜色 */
  cursor: not-allowed;
  text-decoration: none;
}

/* 重新发送按钮样式 */
.resend-btn {
  font-size: 0.75rem;
  color: var(--color-primary); /* 主题紫色文字 */
  text-decoration: none;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.resend-btn:hover:not(:disabled) {
  text-decoration: underline;
  color: var(--color-primary-hover);
}

.resend-btn:disabled {
  color: var(--color-text-secondary);
  cursor: not-allowed;
  text-decoration: none;
}

/* 倒计时文本样式 */
.countdown-text {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.resend-container {
  text-align: center;
  font-size: 0.75rem; /* 与登录注册页面保持一致 */
  color: var(--color-text); /* 使用主文本颜色 */
}

.text-center {
  text-align: center;
  font-size: 0.75rem; /* 与登录注册页面保持一致 */
  color: var(--color-text); /* 使用主文本颜色 */
}
.mt-4 {
  margin: 0.5rem 0 0.3rem 0;
}
.w-full {
  width: 100%;
}

/* Remove autofill styles for the hidden input if they somehow apply */
.hidden-input:-webkit-autofill,
.hidden-input:-webkit-autofill:hover,
.hidden-input:-webkit-autofill:focus,
.hidden-input:-webkit-autofill:active {
  -webkit-box-shadow: none !important;
  -webkit-text-fill-color: transparent !important;
  background-color: transparent !important;
  transition: none !important;
  caret-color: transparent !important;
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
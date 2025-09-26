/**
 * 注册相关API服务
 */
import apiClient, { REGISTER_API } from './apiConfig';

/**
 * 发送注册验证码
 * @param {string} email 用户邮箱
 * @param {string} password 用户密码
 * @returns {Promise<object>} 响应结果
 */
export const sendVerificationCode = async (email, password) => {
  try {
    const response = await apiClient.post(REGISTER_API.SEND_CODE, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

/**
 * 验证注册验证码并完成注册
 * @param {string} email 用户邮箱
 * @param {string} code 验证码
 * @returns {Promise<object>} 响应结果
 */
export const verifyCodeAndRegister = async (email, code) => {
  try {
    const response = await apiClient.post(REGISTER_API.VERIFY_CODE, {
      email,
      code,
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying code and registering:', error);
    return error.response?.data || { success: false, message: 'Verification failed or server error' };
  }
};

/**
 * （用于密码重置流程）通过邮箱重新发送验证码
 * @param {string} email 用户邮箱
 * @returns {Promise<object>} 响应结果
 */
export const resendVerificationCodeByEmail = async (email) => {
  try {
    // This might point to a different backend endpoint if it's specifically for password resets
    // For now, assuming it might re-use or be a simplified version if backend handles it by email only
    const response = await apiClient.post('/register/resend-code-by-email', {
      email,
    });
    return response.data;
  } catch (error) {
    console.error('Error resending verification code by email:', error);
    return error.response?.data || { success: false, message: 'Failed to resend code' };
  }
};

export default {
  sendVerificationCode,
  verifyCodeAndRegister,
  resendVerificationCodeByEmail
}; 
/**
 * 密码相关API服务
 */
import { post } from './httpClient';
import { PASSWORD_API } from './apiConfig';

/**
 * 发送密码重置验证码
 * @param {string} email 用户邮箱
 * @returns {Promise<boolean>} 是否发送成功
 */
export const sendPasswordResetCode = async (email) => {
  try {
    // 验证参数
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new Error('邮箱地址不能为空');
    }
    
    // 去除前后空格
    const cleanedEmail = email.trim();
    console.log('发送密码重置验证码，参数:', { email: cleanedEmail });
    
    const response = await post(PASSWORD_API.RESET_CODE, { email: cleanedEmail }, false);
    return response;
  } catch (error) {
    console.error('发送密码重置验证码失败:', error.message || '未知错误');
    throw error;
  }
};

/**
 * 重新发送密码重置验证码
 * @param {string} email 用户邮箱
 * @returns {Promise<boolean>} 是否发送成功
 */
export const resendPasswordResetCode = async (email) => {
  try {
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new Error('邮箱地址不能为空');
    }
    
    // 去除前后空格
    const cleanedEmail = email.trim();
    
    // 确保参数格式正确
    console.log('发送重置密码验证码请求，参数:', { email: cleanedEmail });
    
    const response = await post(PASSWORD_API.RESEND_CODE, { 
      email: cleanedEmail 
    }, false);
    
    return response;
  } catch (error) {
    console.error('重新发送密码重置验证码失败:', error.message || '未知错误');
    throw error;
  }
};

/**
 * 验证密码重置验证码
 * @param {string} email 用户邮箱
 * @param {string} code 验证码
 * @returns {Promise<boolean>} 验证结果
 */
export const verifyPasswordResetCode = async (email, code) => {
  try {
    // 验证参数
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.error('验证密码重置验证码失败: 邮箱参数无效', email);
      throw new Error('邮箱地址不能为空');
    }
    
    // 去除前后空格
    const cleanedEmail = email.trim();
    
    // 确保验证码以字符串形式发送
    const strCode = String(code);
    console.log('发送验证码验证请求，参数:', { 
      email: cleanedEmail, 
      code: strCode 
    });
    
    const response = await post(PASSWORD_API.VERIFY_CODE, { 
      email: cleanedEmail, 
      code: strCode 
    }, false);
    
    console.log('验证码验证响应:', response);
    return response;
  } catch (error) {
    console.error('验证密码重置验证码失败:', error.message || '未知错误');
    throw error;
  }
};

/**
 * 修改密码
 * @param {string} email 用户邮箱
 * @param {string} code 验证码
 * @param {string} newPassword 新密码
 * @returns {Promise<boolean>} 是否修改成功
 */
export const changePassword = async (email, code, newPassword) => {
  try {
    const response = await post(PASSWORD_API.CHANGE, {
      email,
      code,
      newPassword
    }, false);
    return response;
  } catch (error) {
    console.error('修改密码失败:', error.message || '未知错误');
    throw error;
  }
};

export default {
  sendPasswordResetCode,
  resendPasswordResetCode,
  verifyPasswordResetCode,
  changePassword
}; 
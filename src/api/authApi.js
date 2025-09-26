/**
 * 认证相关API服务
 */
import apiClient, { AUTH_API } from './apiConfig';

// 获取存储的令牌
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

// 获取令牌类型，默认为Bearer
export function getTokenType() {
  return localStorage.getItem('tokenType') || 'Bearer';
}

// 获取认证头
export function getAuthHeader() {
  const token = getAuthToken();
  const tokenType = getTokenType();
  return token ? { Authorization: `${tokenType} ${token}` } : {};
}

// 设置认证信息
export function setAuth(token, tokenType = 'Bearer', user = null, expiresIn = 0) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('tokenType', tokenType);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  
  // 如果提供了过期时间，计算过期时间戳并存储
  if (expiresIn > 0) {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem('tokenExpiresAt', expiresAt.toString());
  }
}

// 清除认证信息
export function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('tokenExpiresAt');
}

// 检查令牌是否过期
export function isTokenExpired() {
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  if (!expiresAt) return false; // 没有设置过期时间，默认不过期
  
  return Date.now() > parseInt(expiresAt, 10);
}

// 检查用户是否已登录
export function isLoggedIn() {
  const token = getAuthToken();
  return !!token && !isTokenExpired();
}

// 获取当前用户信息
export function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('解析用户信息出错:', e);
    return null;
  }
}

// 登录API
export async function login(email, password, rememberMe = false) {
  try {
    // 使用axios发送POST请求，无需认证
    const response = await apiClient.post(AUTH_API.LOGIN, {
      email,
      password,
      rememberMe,
    });
    
    const data = response.data;
    
    // 存储认证信息
    setAuth(data.token, data.tokenType, data.user, data.expiresIn);
    
    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('登录请求失败:', error);
    
    // 从axios错误中获取消息
    let message = '登录失败，请稍后再试';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    
    return {
      success: false,
      message: message,
    };
  }
}

// 验证令牌API
export async function validateToken(token) {
  try {
    // 使用axios发送GET请求，不需要自动添加认证头
    const response = await apiClient.get(`${AUTH_API.VALIDATE}?token=${encodeURIComponent(token)}`);
    return response.data;
  } catch (error) {
    console.error('验证令牌出错:', error);
    return false;
  }
}

// 注销
export function logout() {
  clearAuth();
  // 可以添加重定向到登录页或其他逻辑
  window.location.href = '/login';
}

// 为API请求添加认证头的辅助函数
export async function authenticatedFetch(url, options = {}) {
  // 构建请求选项，合并默认值和传入的选项
  const requestOptions = {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeader(),
    },
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    // 处理401未授权响应（令牌可能过期）
    if (response.status === 401) {
      clearAuth(); // 清除无效的认证信息
      // 可以触发重定向到登录页面或其他处理
      window.location.href = '/login?redirected=session_expired';
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('API请求出错:', error);
    throw error;
  }
} 
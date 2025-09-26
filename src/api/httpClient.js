/**
 * HTTP客户端工具，用于在请求中自动添加JWT认证头
 */
import { getAuthHeader, clearAuth, isTokenExpired } from './authApi';

// 动态获取API基础URL，支持移动端访问
const getApiBaseUrl = () => {
  // 如果是开发环境且在移动设备上访问（通过IP访问）
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // 使用相同的主机名但不同的端口
    return `http://${window.location.hostname}:8080`;
  }
  // 默认开发环境
  return 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl(); // 后端API的基础URL

/**
 * 发送HTTP请求的通用函数
 * @param {string} path - API请求路径 (例如 /register/send-code)
 * @param {Object} options - 请求选项
 * @param {boolean} requiresAuth - 是否需要验证令牌
 * @returns {Promise<any>} - 响应数据或错误
 */
export async function request(path, options = {}, requiresAuth = true) {
  try {
    // 验证token是否过期，如果已过期且请求需要认证，则清除认证信息
    if (requiresAuth && isTokenExpired()) {
      clearAuth();
      window.location.href = '/login?redirected=session_expired';
      return Promise.reject(new Error('认证令牌已过期'));
    }

    // 构建完整的请求URL
    const fullUrl = `${API_BASE_URL}${path}`;
    
    // 添加调试信息
    console.log('API请求信息:', {
      path,
      fullUrl,
      hostname: window.location.hostname,
      apiBaseUrl: API_BASE_URL,
      requiresAuth,
      method: options.method || 'GET'
    }); 

    // 构建请求选项
    const requestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(requiresAuth ? getAuthHeader() : {}),
      },
    };

    try {
      // 尝试发送请求
      const response = await fetch(fullUrl, requestOptions); // 使用完整的URL

      // 处理响应状态
      if (response.status === 401 && requiresAuth) {
        // 未授权响应，可能是令牌无效或已过期
        clearAuth();
        window.location.href = '/login?redirected=session_expired';
        return Promise.reject(new Error('未授权访问'));
      }

      if (!response.ok) {
        // 根据状态码提供不同的友好错误信息
        switch (response.status) {
          case 400:
            // 尝试获取后端返回的具体错误信息
            try {
              const badRequestData = await response.json();
              // 如果后端返回了包含message字段的错误对象，直接显示该消息
              if (badRequestData && badRequestData.message) {
                return Promise.reject(new Error(badRequestData.message));
              }
              return Promise.reject(new Error('请求参数错误，请检查您的输入'));
            } catch (err) {
              return Promise.reject(new Error('请求参数错误，请检查您的输入'));
            }
            
          case 401:
            try {
              const unauthorizedData = await response.json();
              if (unauthorizedData && unauthorizedData.message) {
                return Promise.reject(new Error(unauthorizedData.message));
              }
              return Promise.reject(new Error('验证码错误，请重新输入正确的验证码'));
            } catch (err) {
              return Promise.reject(new Error('验证码错误，请重新输入正确的验证码'));
            }
            
          case 409:
            // 处理冲突状态，通常用于标识资源已存在（如邮箱已注册）
            try {
              const conflictData = await response.json();
              if (conflictData && conflictData.message) {
                return Promise.reject(new Error(conflictData.message));
              }
              return Promise.reject(new Error('该邮箱已被注册，请使用其他邮箱或直接登录'));
            } catch (err) {
              return Promise.reject(new Error('该邮箱已被注册，请使用其他邮箱或直接登录'));
            }
            
          case 404:
            try {
              const notFoundData = await response.json();
              if (notFoundData && notFoundData.message) {
                // 如果后端返回了包含message字段的错误对象，直接使用该消息
                return Promise.reject(new Error(notFoundData.message));
              }
              // 如果没有具体错误信息，提供默认消息
              return Promise.reject(new Error('请求的资源不存在'));
            } catch (err) {
              // 无法解析JSON响应时的默认错误消息
              return Promise.reject(new Error('请求的资源不存在'));
            }
            
          case 500:
            return Promise.reject(new Error('服务器内部错误，请稍后再试'));
            
          default:
            // 尝试获取具体的错误消息
            try {
              const errorData = await response.json();
              if (errorData && errorData.message) {
                return Promise.reject(new Error(errorData.message));
              }
            } catch (err) {
              // 如果无法解析JSON，则返回默认错误消息
            }
            return Promise.reject(new Error(`网络连接异常，请检查您的网络或稍后再试 (${response.status})`));
        }
      }

      // 检查响应是否为空
      if (response.status === 204) {
        return null; // No Content
      }

      // 解析JSON响应
      return await response.json();
    } catch (networkError) {
      // 网络异常（如服务器未启动、网络断开等）
      console.error('网络请求异常:', {
        error: networkError.message,
        fullUrl,
        hostname: window.location.hostname,
        apiBaseUrl: API_BASE_URL
      });
      
      if (networkError instanceof TypeError && networkError.message.includes('fetch')) {
        return Promise.reject(new Error(`无法连接到服务器 (${API_BASE_URL})，请检查您的网络连接或服务器状态`));
      }
      throw networkError;
    }
  } catch (error) {
    console.error('请求出错:', error);
    throw error;
  }
}

/**
 * GET请求
 * @param {string} path - API请求路径
 * @param {boolean} requiresAuth - 是否需要认证
 * @returns {Promise<any>} - 响应数据
 */
export function get(path, requiresAuth = true) {
  return request(path, { method: 'GET' }, requiresAuth);
}

/**
 * POST请求
 * @param {string} path - API请求路径
 * @param {Object} data - 请求体数据
 * @param {boolean} requiresAuth - 是否需要认证
 * @returns {Promise<any>} - 响应数据
 */
export function post(path, data, requiresAuth = true) {
  return request(
    path,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    requiresAuth
  );
}

/**
 * PUT请求
 * @param {string} path - API请求路径
 * @param {Object} data - 请求体数据
 * @param {boolean} requiresAuth - 是否需要认证
 * @returns {Promise<any>} - 响应数据
 */
export function put(path, data, requiresAuth = true) {
  return request(
    path,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    requiresAuth
  );
}

/**
 * DELETE请求
 * @param {string} path - API请求路径
 * @param {boolean} requiresAuth - 是否需要认证
 * @returns {Promise<any>} - 响应数据
 */
export function del(path, requiresAuth = true) {
  return request(path, { method: 'DELETE' }, requiresAuth);
}

export default {
  request,
  get,
  post,
  put,
  del,
}; 
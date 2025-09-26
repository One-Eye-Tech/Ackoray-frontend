/**
 * API路径配置文件
 * 统一管理所有API请求路径，方便后续修改
 */

import axios from 'axios';
import { getEnvironmentConfig } from '../config/environment.js';

// 获取当前环境配置
const envConfig = getEnvironmentConfig();
const API_BASE_URL = envConfig.API_BASE_URL;

// 创建统一的axios实例
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  },
  timeout: 15000,
  withCredentials: false // 移动端跨域访问时改为false
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 获取token并添加到请求头（如果有）
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 处理特殊请求（如文件上传）
    if (config.url.includes('/products/images') && config.method === 'post') {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    // 添加调试日志
    console.log('[ApiConfig] API请求:', {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
      hostname: window.location.hostname,
      hasAuth: !!token
    });
    
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器处理错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // 处理各种HTTP错误
      switch (error.response.status) {
        case 401:
          console.error('认证失败，请重新登录');
          // 可以在这里处理登出逻辑
          break;
        case 403:
          console.error('权限不足，无法访问该资源');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error(`HTTP错误: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('未收到服务器响应');
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 创建支持文件上传的客户端实例（特殊配置）
export const fileUploadClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // 上传文件需要更长的超时时间
  withCredentials: false // 移动端跨域访问时改为false
});

// 文件上传客户端的请求拦截器
fileUploadClient.interceptors.request.use(
  config => {
    // 获取token并添加到请求头（如果有）
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 调试日志
    console.log('[FileUpload] 发送图片上传请求:', {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
      hostname: window.location.hostname,
      headers: {
        'Content-Type': config.headers['Content-Type'],
        'Authorization': config.headers['Authorization'] ? '已设置' : '未设置'
      }
    });
    
    return config;
  },
  error => Promise.reject(error)
);

// 文件上传客户端使用相同的响应拦截器
fileUploadClient.interceptors.response.use(
  response => response,
  error => {
    // MinIO上传错误处理 - 不再使用本地URL替代
    if (error.config && (error.config.url.includes('/images') || error.config.url.includes('/upload'))) {
      console.error('MinIO文件上传失败:', error.message);
      return Promise.reject(error);
    }
    
    // 其他错误处理同普通客户端
    if (error.response) {
      // 处理各种HTTP错误
      switch (error.response.status) {
        case 401:
          console.error('认证失败，请重新登录');
          break;
        case 403:
          console.error('权限不足，无法访问该资源');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error(`HTTP错误: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('未收到服务器响应');
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 将图片转换为Base64的工具函数
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]); // 删除前缀"data:image/jpeg;base64,"
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// 认证相关API路径
export const AUTH_API = {
  LOGIN: `/api/auth/login`,
  VALIDATE: `/api/auth/validate`,
};

// 注册相关API路径
export const REGISTER_API = {
  SEND_CODE: `/api/register/send-code`,
  VERIFY_CODE: `/api/register/verify-code`,
};

// 密码相关API路径
export const PASSWORD_API = {
  RESET_CODE: `/api/password/reset-code`,
  RESEND_CODE: `/api/password/resend-code`,
  VERIFY_CODE: `/api/password/verify-code`,
  CHANGE: `/api/password/change`,
};

// 用户相关API路径
export const USER_API = {
  PROFILE: `/api/users/profile`,
  UPDATE: `/api/users/update`,
};

// 商品相关API路径
export const PRODUCT_API = {
  LIST: `/api/products`,
  DETAIL: `/api/products/{id}`,
  UPLOAD_IMAGE: `/api/products/images/upload-unassigned`,
};

// 订单相关API路径
export const ORDER_API = {
  CREATE: `/api/orders`,
  LIST: `/api/orders`,
  DETAIL: `/api/orders/{id}`,
  UPDATE_STATUS: `/api/orders/{id}/status`,
};

export default apiClient; 
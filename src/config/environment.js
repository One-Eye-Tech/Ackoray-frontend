/**
 * 环境配置文件
 * 根据不同环境返回对应的API配置
 * 修复：GitHub Pages静态托管 -> 阿里云后端API
 */

// 生产环境配置
const PRODUCTION_CONFIG = {
  // 阿里云服务器地址 - 通过反向代理访问（端口80）
  // Nginx反向代理：80端口 -> 后端8081端口
  API_BASE_URL: 'http://8.133.19.226',
  
  ENVIRONMENT: 'production'
};

// 开发环境配置
const DEVELOPMENT_CONFIG = {
  API_BASE_URL: 'http://localhost:8081',
  ENVIRONMENT: 'development'
};

// 根据当前环境返回配置
export const getEnvironmentConfig = () => {
  // GitHub Pages 生产环境
  if (window.location.hostname === 'one-eye-tech.github.io') {
    return PRODUCTION_CONFIG;
  }
  
  // 本地开发环境
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return DEVELOPMENT_CONFIG;
  }
  
  // 局域网访问（移动端测试）
  return {
    API_BASE_URL: `http://${window.location.hostname}:8081`,
    ENVIRONMENT: 'development'
  };
};

export default getEnvironmentConfig();
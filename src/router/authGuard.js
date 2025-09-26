/**
 * 路由认证守卫
 * 用于保护需要登录才能访问的路由
 */
import { isLoggedIn } from '../api/authApi';

/**
 * 全局前置守卫
 * 在路由跳转前进行身份验证
 * @param {Object} to - 目标路由对象
 * @param {Object} from - 当前路由对象
 * @param {Function} next - 解析钩子函数
 */
export function setupAuthGuard(router) {
  router.beforeEach((to, from, next) => {
    // 检查路由是否需要认证
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
    // 如果路由需要认证
    if (requiresAuth) {
      // 检查用户是否已登录
      if (!isLoggedIn()) {
        // 未登录，重定向到登录页面，并保存目标路由以便登录后重定向回来
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        });
      } else {
        // 已登录，允许访问
        next();
      }
    } else {
      // 路由不需要认证，允许访问
      next();
    }
  });

  // 可选：添加全局解析守卫，用于检查用户权限等
  router.beforeResolve((to, from, next) => {
    // 在这里可以添加其他验证逻辑，例如检查用户角色和权限
    next();
  });
}

/**
 * 为路由元数据添加requiresAuth属性
 * @param {Array} routes - 路由配置数组
 * @returns {Array} - 处理后的路由配置数组
 */
export function addAuthMetaToRoutes(routes, requiresAuth = true) {
  return routes.map(route => {
    // 添加meta.requiresAuth属性
    route.meta = { ...route.meta, requiresAuth };
    
    // 处理嵌套路由
    if (route.children && route.children.length) {
      route.children = addAuthMetaToRoutes(route.children, requiresAuth);
    }
    
    return route;
  });
}

export default {
  setupAuthGuard,
  addAuthMetaToRoutes
}; 
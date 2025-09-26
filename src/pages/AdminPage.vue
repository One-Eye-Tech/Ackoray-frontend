<template>
  <div class="admin-page">
    <TopNavigationBar />
    
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <nav>
          <ul>
            <li>
              <router-link to="/admin/users" active-class="active">
                <i class="fas fa-users"></i> 用户管理
              </router-link>
            </li>
            <li>
              <router-link to="/admin/products" active-class="active">
                <i class="fas fa-box-open"></i> 产品管理
              </router-link>
            </li>
            <li>
              <router-link to="/admin/attributes" active-class="active">
                <i class="fas fa-tags"></i> 属性管理
              </router-link>
            </li>
            <li>
              <router-link to="/admin/orders" active-class="active">
                <i class="fas fa-receipt"></i> 订单管理
              </router-link>
            </li>
            <!-- 更多管理模块可以后续添加 -->
          </ul>
        </nav>
      </aside>
      
      <main class="admin-main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRouter, RouterView, RouterLink } from 'vue-router';
import TopNavigationBar from '../components/layout/TopNavigationBar.vue';

const router = useRouter();
const currentUser = inject('currentUser', ref(null));

// 检查用户是否为管理员，如果不是则重定向
onMounted(() => {
  if (!currentUser.value || currentUser.value.roleId !== 2) {
    router.push('/');
  }
});

// FontAwesome 图标库引入，如果项目中没有，需要安装和配置
// 假设已通过 CDN 或其他方式引入
</script>

<style scoped>
/* 定义深色主题变量 */
:root {
  --admin-bg-page: #0F172A; /* 更深的页面背景 slate-900 */
  --admin-bg-sidebar: #1E293B; /* 侧边栏背景 slate-800 */
  --admin-text-sidebar: #CBD5E1; /* 侧边栏文字 slate-300 */
  --admin-sidebar-active-bg: #3B82F6; /* 激活背景 - 项目主蓝 */
  --admin-sidebar-active-text: #FFFFFF; /* 激活文字 - 白色 */
  --admin-sidebar-hover-bg: #334155; /* 悬停背景 slate-700 */
  --admin-bg-content: #1E293B; /* 主内容区域背景 slate-800 */
  --admin-text-primary: #F1F5F9; /* 主要文字 slate-100 */
  --admin-text-secondary: #94A3B8; /* 次要文字 slate-400 */
  --admin-border-color: #334155; /* 边框颜色 slate-700 */
  --admin-card-bg: #293548; /* 卡片背景，比内容区域稍亮一些 */
  --navbar-height: 60px; /* 保持与TopNavigationBar一致 */
}

.admin-page {
  min-height: 100vh;
  background-color: var(--admin-bg-page);
  color: var(--admin-text-primary);
  padding-top: var(--navbar-height);
  display: flex;
  flex-direction: column;
}

.admin-layout {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.admin-sidebar {
  width: 220px;
  background-color: var(--admin-bg-sidebar);
  color: var(--admin-text-sidebar);
  padding: 1.5rem 0;
  height: calc(100vh - var(--navbar-height));
  position: fixed;
  left: 0;
  top: var(--navbar-height);
  overflow-y: auto;
  border-right: 1px solid var(--admin-border-color);
}

.admin-sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-sidebar nav ul li a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1rem 1.5rem;
  color: var(--admin-text-sidebar);
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-size: 0.95rem;
}

.admin-sidebar nav ul li a:hover {
  background-color: var(--admin-sidebar-hover-bg);
  color: var(--admin-sidebar-active-text);
}

.admin-sidebar nav ul li a.active {
  background-color: var(--admin-sidebar-active-bg);
  color: var(--admin-sidebar-active-text);
  font-weight: 500;
}

.admin-sidebar nav ul li a i {
  width: 20px;
  text-align: center;
  font-size: 1rem;
}

.admin-main-content {
  flex-grow: 1;
  padding: 3rem;
  margin-left: 220px;
  overflow-y: auto;
  height: calc(100vh - var(--navbar-height));
  background-color: var(--admin-bg-content); /* 主内容区背景 */
}

/* 移动端响应式布局 */
@media (max-aspect-ratio: 1/1) {
  .admin-layout {
    flex-direction: column;
  }
  
  .admin-sidebar {
    position: static;
    width: 100%;
    height: auto;
    padding: 1rem 0;
    border-right: none;
    border-bottom: 1px solid var(--admin-border-color);
  }
  
  .admin-sidebar nav ul {
    display: flex;
    overflow-x: auto;
    padding: 0 1rem;
    gap: 0.5rem;
  }
  
  .admin-sidebar nav ul li {
    flex-shrink: 0;
  }
  
  .admin-sidebar nav ul li a {
    padding: 0.8rem 1rem;
    border-radius: 8px;
    white-space: nowrap;
    font-size: 0.85rem;
  }
  
  .admin-sidebar nav ul li a i {
    font-size: 0.9rem;
  }
  
  .admin-main-content {
    margin-left: 0;
    padding: 1.5rem;
    height: auto;
    min-height: calc(100vh - var(--navbar-height) - 80px); /* 减去侧边栏高度 */
  }
}
</style> 
import { createRouter, createWebHistory } from 'vue-router';
import { setupAuthGuard } from './authGuard';
import HomePage from '../pages/HomePage.vue';
import ProductDetailPage from '../pages/ProductDetailPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import EmailVerificationPage from '../pages/EmailVerificationPage.vue';
import ResetPasswordPage from '../pages/ResetPasswordPage.vue';
import CheckoutPage from '../pages/CheckoutPage.vue';
import UserProfilePage from '../pages/UserProfilePage.vue';
import UserOrdersPage from '../pages/UserOrdersPage.vue';
import OrderDetailPage from '../pages/OrderDetailPage.vue';
import AdminPage from '../pages/AdminPage.vue';
import AttributeManagement from '../pages/admin/AttributeManagement.vue';
import UserManagement from '../pages/admin/UserManagement.vue';
import ProductManagement from '../pages/admin/ProductManagement.vue';
import OrderManagement from '../pages/admin/OrderManagement.vue';
import AdminOrderDetailPage from '../pages/admin/AdminOrderDetailPage.vue';

// Placeholder pages for user dropdown
const TrackPackagePage = { template: '<div style="padding: 5rem; text-align: center;"><h1>Track Package Page</h1><p>Content will be added here.</p><router-link to="/">Go Home</router-link></div>' };

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/product/:id', // Route with a dynamic segment for product ID
    name: 'ProductDetail',
    component: ProductDetailPage,
    props: true, // Pass route params as props to the component
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false } // 显式标记不需要认证
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresAuth: false } // 显式标记不需要认证
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: EmailVerificationPage,
    meta: { requiresAuth: false } // 显式标记不需要认证
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordPage,
    meta: { requiresAuth: false } // 显式标记不需要认证
  },
  // User Dropdown Routes
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfilePage, // Placeholder component
    meta: { requiresAuth: true } // Example of route meta field
  },
  {
    path: '/orders',
    name: 'Orders',
    component: UserOrdersPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/track-package',
    name: 'TrackPackage',
    component: TrackPackagePage, // Placeholder component
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutPage,
    meta: { requiresAuth: true } // Assuming checkout requires login
  },
  {
    path: '/order-confirmation/:orderId',
    name: 'OrderConfirmation',
    component: () => import('../pages/OrderConfirmationPage.vue'), // Lazy load the component
    meta: { requiresAuth: true } // Assuming confirmation page also requires context of a user/order
  },
  {
    path: '/order-detail/:orderId',
    name: 'OrderDetailPage',
    component: OrderDetailPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { requiresAuth: true }, 
    children: [
      { 
        path: '', // Default child route for /admin (optional)
        name: 'AdminDashboardRedirect', // Or directly map to users or a dashboard component
        redirect: '/admin/users' // Redirect /admin to /admin/users by default
      },
      {
        path: 'users',
        name: 'AdminUserManagement',
        component: UserManagement,
        meta: { requiresAuth: true }
      },
      { 
        path: 'products',
        name: 'AdminProductManagement', 
        component: ProductManagement,
        meta: { requiresAuth: true }
      },
      {
        path: 'attributes',
        name: 'AdminAttributeManagement',
        component: AttributeManagement,
        meta: { requiresAuth: true }
      },
      {
        path: 'orders',
        name: 'AdminOrderManagement',
        component: OrderManagement,
        meta: { requiresAuth: true }
      },
      {
        path: 'order-detail/:orderId',
        name: 'AdminOrderDetailPage',
        component: AdminOrderDetailPage,
        meta: { requiresAuth: true }
      }
    ]
  },
  // Add other routes here
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top when navigating to a new page
    return { top: 0 };
  },
});

// 应用认证守卫
setupAuthGuard(router);

export default router;
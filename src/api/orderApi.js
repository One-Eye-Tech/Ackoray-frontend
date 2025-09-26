import apiClient from './apiConfig';

export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData);
    return response.data; // 返回创建的订单数据
  } catch (error) {
    console.error('创建订单失败:', error.response?.data || error.message);
    throw error; // 抛出错误以便调用方处理
  }
};

export const cancelOrder = async (orderId) => {
  try {
    // Assuming a PUT or PATCH endpoint to update status to 'CANCELLED'
    const response = await apiClient.patch(`/orders/${orderId}/status`, { status: 'CANCELED' });
    return response.data;
  } catch (error) {
    console.error('取消订单失败:', error.response?.data || error.message);
    throw error;
  }
};

export const getOrdersByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/orders/user/${userId}`);
    return response.data; // 返回用户订单列表
  } catch (error) {
    console.error('获取用户订单失败:', error.response?.data || error.message);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('获取订单详情失败:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllOrders = async (params = {}) => {
  try {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  } catch (error) {
    console.error('获取所有订单失败:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 更新订单状态
 * @param {object} statusData - The new status data, e.g., { status: 'SHIPPED', trackingNumber: '123' }
 * @returns {Promise<object>} The updated order data
 */
export const updateOrderStatus = async (orderId, data) => {
  try {
    // The `data` object should be what the backend DTO expects, e.g., { status: "REFUND_IN_PROGRESS", reason: "..." }
    const response = await apiClient.put(`/orders/${orderId}/status`, data);
    return response.data;
  } catch (error) {
    console.error('更新订单状态失败:', error.response?.data || error.message);
    throw error;
  }
};

// 新增：获取各状态订单数量的API
export const getOrderCounts = async () => {
  const response = await apiClient.get('/orders/counts');
  return response.data;
};

export const getOrderStatusByNumber = (orderNumber) => {
  return apiClient.get(`/orders/order-status/${orderNumber}`);
};

/**
 * 发起退款请求 (商家后台调用)
 * @param {number} orderId - 需要退款的订单ID
 * @returns {Promise<any>}
 */
export const initiateRefund = async (orderId) => {
  try {
    const response = await apiClient.post(`/payment/refunds/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error initiating refund for order ${orderId}:`, error.response || error);
    throw error;
  }
};

/**
 * 创建订单并发起支付
 * @param {Object} orderData - 订单数据
 * @param {string} paymentMethod - 支付方式: 'wechat' | 'alipay'
 * @returns {Promise<Object>} 订单和支付信息
 */
export const createOrderWithPayment = async (orderData, paymentMethod = 'wechat') => {
  try {
    // 1. 创建订单
    const orderResponse = await createOrder(orderData);
    const order = orderResponse.order || orderResponse;
    
    // 2. 计算订单总金额
    const totalAmount = order.totalAmount || calculateOrderTotal(order);
    
    // 3. 生成支付订单号（使用订单号或生成新的）
    const paymentOrderNo = order.orderNumber || `PAY_${Date.now()}`;
    
    // 4. 准备支付数据
    const paymentData = {
      paymentMethod,
      orderNo: paymentOrderNo,
      amount: totalAmount,
      subject: `订单支付-${paymentOrderNo}`,
      body: order.items ? order.items.map(item => item.productName).join(', ') : '商品支付'
    };
    
    // 5. 创建支付订单
    const { createPayment } = await import('./paymentApi.js');
    const paymentResponse = await createPayment(paymentData);
    
    return {
      order,
      payment: paymentResponse,
      paymentMethod,
      totalAmount
    };
  } catch (error) {
    console.error('创建订单并发起支付失败:', error);
    throw error;
  }
};

/**
 * 计算订单总金额（辅助函数）
 * @param {Object} order - 订单对象
 * @returns {number} 总金额
 */
const calculateOrderTotal = (order) => {
  if (order.totalAmount) return order.totalAmount;
  
  let total = 0;
  if (order.items && Array.isArray(order.items)) {
    total = order.items.reduce((sum, item) => {
      const price = item.price || item.unitPrice || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  }
  
  // 加上运费
  if (order.shippingFee) {
    total += order.shippingFee;
  }
  
  return total;
};
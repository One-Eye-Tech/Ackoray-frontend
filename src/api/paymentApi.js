import apiClient from './apiConfig';

/**
 * 统一创建支付订单
 * @param {Object} paymentData - 支付数据
 * @param {string} paymentData.paymentMethod - 支付方式: 'wechat' | 'alipay'
 * @param {string} paymentData.orderNo - 商户订单号
 * @param {number} paymentData.amount - 支付金额
 * @param {string} paymentData.subject - 商品标题
 * @param {string} paymentData.body - 商品描述（可选）
 * @returns {Promise<Object>} 支付信息响应
 */
export const createPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/payment/create', paymentData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      transformRequest: [function (data) {
        // 将对象转换为URL编码格式
        const params = new URLSearchParams();
        for (const key in data) {
          if (data[key] !== undefined && data[key] !== null) {
            params.append(key, data[key]);
          }
        }
        return params;
      }]
    });
    return response.data;
  } catch (error) {
    console.error('创建支付订单失败:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 创建微信Native支付订单（兼容旧接口）
 * @param {string} orderNo - 商户订单号
 * @param {number} amount - 支付金额
 * @param {string} description - 商品描述
 * @returns {Promise<Object>} 微信支付响应
 */
export const createWeChatPayment = async (orderNo, amount, description) => {
  try {
    const response = await apiClient.post('/payment/native', {
      orderNo,
      amount,
      description
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      transformRequest: [function (data) {
        const params = new URLSearchParams();
        for (const key in data) {
          if (data[key] !== undefined && data[key] !== null) {
            params.append(key, data[key]);
          }
        }
        return params;
      }]
    });
    return response.data;
  } catch (error) {
    console.error('创建微信支付订单失败:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 创建支付宝网站支付订单
 * @param {string} orderNo - 商户订单号
 * @param {number} amount - 支付金额
 * @param {string} subject - 商品标题
 * @param {string} body - 商品描述（可选）
 * @returns {Promise<Object>} 支付宝网站支付响应
 */
export const createAlipayWebPayment = async (orderNo, amount, subject, body = '') => {
  try {
    const response = await apiClient.post('/payment/alipay/web', {
      orderNo,
      amount,
      subject,
      body
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      transformRequest: [function (data) {
        const params = new URLSearchParams();
        for (const key in data) {
          if (data[key] !== undefined && data[key] !== null) {
            params.append(key, data[key]);
          }
        }
        return params;
      }]
    });
    return response.data;
  } catch (error) {
    console.error('创建支付宝网站支付订单失败:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 查询支付宝支付订单状态
 * @param {string} orderNo - 商户订单号
 * @returns {Promise<Object>} 订单状态信息
 */
export const queryAlipayPayment = async (orderNo) => {
  try {
    const response = await apiClient.get(`/payment/alipay/query?orderNo=${orderNo}`);
    return response.data;
  } catch (error) {
    console.error('查询支付宝订单状态失败:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 轮询查询支付状态
 * @param {string} orderNo - 商户订单号
 * @param {string} paymentMethod - 支付方式
 * @param {number} maxAttempts - 最大轮询次数，默认30次
 * @param {number} interval - 轮询间隔（毫秒），默认2秒
 * @returns {Promise<Object>} 支付结果
 */
export const pollPaymentStatus = async (orderNo, paymentMethod, maxAttempts = 30, interval = 2000) => {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      attempts++;
      
      try {
        let result;
        
        if (paymentMethod === 'alipay') {
          result = await queryAlipayPayment(orderNo);
          
          // 支付宝支付状态判断
          if (result.success && (result.tradeStatus === 'TRADE_SUCCESS' || result.tradeStatus === 'TRADE_FINISHED')) {
            resolve({
              success: true,
              status: 'SUCCESS',
              paymentMethod: 'alipay',
              tradeNo: result.tradeNo,
              data: result
            });
            return;
          } else if (result.tradeStatus === 'TRADE_CLOSED') {
            resolve({
              success: false,
              status: 'FAILED',
              paymentMethod: 'alipay',
              message: '交易已关闭',
              data: result
            });
            return;
          }
        } else {
          // 微信支付可以通过订单状态查询
          // 这里可以调用订单状态查询接口
          console.log('微信支付状态轮询暂未实现具体逻辑');
        }
        
        // 如果达到最大尝试次数，返回超时
        if (attempts >= maxAttempts) {
          resolve({
            success: false,
            status: 'TIMEOUT',
            paymentMethod,
            message: '支付状态查询超时',
            attempts
          });
          return;
        }
        
        // 继续轮询
        setTimeout(poll, interval);
        
      } catch (error) {
        console.error(`支付状态轮询失败 (第${attempts}次):`, error);
        
        if (attempts >= maxAttempts) {
          reject(error);
        } else {
          setTimeout(poll, interval);
        }
      }
    };
    
    poll();
  });
};

/**
 * 获取支付方式配置
 * @returns {Object} 支付方式配置
 */
export const getPaymentMethods = () => {
  return {
    wechat: {
      name: '微信支付',
      icon: '/src/assets/images/wx.png',
      type: 'qrcode',
      description: '使用微信扫码支付'
    },
    alipay: {
      name: '支付宝支付', 
      icon: '/src/assets/images/zfb.png',
      type: 'qrcode',
      description: '使用支付宝扫码支付'
    }
  };
};

/**
 * 生成订单号
 * @param {string} prefix - 订单号前缀，默认'ORDER'
 * @returns {string} 订单号
 */
export const generateOrderNumber = (prefix = 'ORDER') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  return `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}${milliseconds}`;
};
import apiClient, { fileUploadClient, convertImageToBase64 } from './apiConfig';

// 获取所有颜色列表
export const getAllColors = async () => {
  try {
    const response = await apiClient.get('/colors');
    return response.data;
  } catch (error) {
    console.error('获取颜色列表失败');
    throw error;
  }
};

// 获取所有尺码列表
export const getAllSizes = async () => {
  try {
    const response = await apiClient.get('/sizes');
    return response.data;
  } catch (error) {
    console.error('获取尺码列表失败');
    throw error;
  }
};

// 上传图片（预上传，不与产品关联）
export const uploadTemporaryProductImage = async (imageFile, displayOrder = 0) => {
  // 检查浏览器和文件类型
  if (!imageFile || !(imageFile instanceof File)) {
    throw new Error('无效的图片文件');
  }
  
  if (!imageFile.type.match('image.*')) {
    throw new Error('请选择有效的图片文件');
  }
  
  console.log(`准备上传图片 - 文件名: ${imageFile.name}, 类型: ${imageFile.type}, 大小: ${imageFile.size / 1024}KB`);
  
  // 创建FormData
  const formData = new FormData();
  formData.append('file', imageFile);
  if (displayOrder !== null && displayOrder !== undefined) {
    formData.append('displayOrder', displayOrder.toString());
  }
  
  try {
    // 使用专用的文件上传客户端
    console.log('发送图片上传请求到: /products/images/upload-unassigned');
    const response = await fileUploadClient.post('/products/images/upload-unassigned', formData);
    console.log('图片上传成功:', response.data);
    
    // 确保返回结果有url和imageUrl字段，确保兼容性
    if (!response.data) {
      console.warn('服务器返回了空的响应数据');
      throw new Error('服务器返回空数据');
    }
    
    const result = {...response.data};
    
    // 如果返回了imageUrl但没有url
    if (result.imageUrl && !result.url) {
      result.url = result.imageUrl;
      console.log('添加url字段:', result.url);
    } 
    // 如果返回了url但没有imageUrl
    else if (result.url && !result.imageUrl) {
      result.imageUrl = result.url;
      console.log('添加imageUrl字段:', result.imageUrl);
    }
    
    // 检查结果是否包含必要的字段
    if (!result.id || (!result.url && !result.imageUrl)) {
      console.warn('服务器返回的数据缺少必要字段:', result);
      throw new Error('服务器返回的数据格式不正确');
    }
    
    console.log('处理后的图片数据:', result);
    return result;
  } catch (error) {
    console.error('上传图片失败:', error.response?.status || error.message);
    console.error('错误详情:', error.response?.data || error);
    
    if (error.response?.status === 403) {
      throw new Error('没有权限上传图片，请联系管理员');
    }
    
    if (error.response?.status === 413) {
      throw new Error('图片大小超过服务器限制，请选择小于10MB的图片');
    }
    
    // 使用本地URL作为回退方案
    const localUrl = URL.createObjectURL(imageFile);
    console.warn('使用本地URL作为回退:', localUrl);
    return {
      id: Date.now(), // 生成临时ID
      imageUrl: localUrl,
      url: localUrl,
      displayOrder: displayOrder,
      isLocalFile: true
    };
  }
};

// 创建新产品
export const createProduct = async (productData) => {
  try {
    // 检查是否有本地图片，如果有，处理相关数据
    const processedData = {...productData};
    if (processedData.imageIds) {
      // 过滤掉本地图片ID
      processedData.imageIds = processedData.imageIds.filter(id => 
        typeof id === 'number' && id < 1000000000000
      );
    }
    
    // 如果主图是本地图片，清除主图ID
    if (processedData.mainImageId && processedData.mainImageId > 1000000000000) {
      processedData.mainImageId = null;
    }
    
    const response = await apiClient.post('/products', processedData);
    return response.data;
  } catch (error) {
    console.error('创建产品失败');
    throw error;
  }
};

// 更新产品
export const updateProduct = async (productId, productData) => {
  try {
    // 过滤掉本地图片ID
    const processedData = {...productData};
    if (processedData.imageIds) {
      processedData.imageIds = processedData.imageIds.filter(id => 
        typeof id === 'number' && id < 1000000000000
      );
    }
    
    // 如果主图是本地图片，清除主图ID
    if (processedData.mainImageId && processedData.mainImageId > 1000000000000) {
      processedData.mainImageId = null;
    }
    
    const response = await apiClient.put(`/products/${productId}`, processedData);
    return response.data;
  } catch (error) {
    console.error(`更新产品失败`);
    throw error;
  }
};

// 获取产品列表（分页）
export const getProducts = async (pageNumber = 0, pageSize = 10, sortBy = 'createdTime,desc') => {
  try {
    const response = await apiClient.get('/products', {
      params: {
        page: pageNumber,
        size: pageSize,
        sort: sortBy
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取产品列表失败');
    throw error;
  }
};

// 获取所有产品（不分页）
export const getAllProductsNoPagination = async () => {
  try {
    const response = await apiClient.get('/products/all');
    return response.data;
  } catch (error) {
    console.error('获取所有产品失败');
    throw error;
  }
};

// 删除产品
export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`删除产品失败`);
    throw error;
  }
};

// 更新产品上架状态
export const updateProductStatus = async (productId, onShelves) => {
  try {
    const response = await apiClient.patch(`/products/${productId}/status`, { onShelves });
    return response.data;
  } catch (error) {
    console.error(`更新产品状态失败`);
    throw error;
  }
};

// 根据ID获取单个产品
export const getProductByIdApi = async (productId) => {
  try {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`获取产品 (ID: ${productId}) 失败:`, error);
    throw error;
  }
};
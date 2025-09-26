import apiClient from './apiConfig';

const API_BASE_URL = '/users';

/**
 * 获取所有用户列表
 */
export const getAllUsers = async () => {
  try {
    const usersArray = await apiClient.get(API_BASE_URL);
    return usersArray;
  } catch (error) {
    console.error('Error fetching all users:', error.response?.data || error.message);
    if (error instanceof Error) {
        throw error;
    }
    throw error.response?.data || new Error('获取用户列表失败');
  }
};

/**
 * 更新用户信息 (包括启用/禁用)
 * @param {number} userId - 用户ID
 * @param {object} userData - 需要更新的用户数据，例如 { enabled: true }
 */
export const updateUser = async (userId, userData) => {
  try {
    const updatedUser = await apiClient.put(`${API_BASE_URL}/${userId}`, userData);
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
    if (error instanceof Error) {
        throw error;
    }
    throw error.response?.data || new Error('更新用户信息失败');
  }
};

/**
 * 删除用户
 * @param {number} userId - 用户ID
 */
export const deleteUser = async (userId) => {
  try {
    await apiClient.delete(`${API_BASE_URL}/${userId}`);
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error.response?.data || error.message);
    if (error instanceof Error) {
        throw error;
    }
    throw error.response?.data || new Error('删除用户失败');
  }
};

/**
 * 获取所有角色列表
 */
export const getAllRoles = async () => {
    try {
        const response = await apiClient.get('/roles');
        return response.data;
    } catch (error) {
        console.error('获取角色列表失败:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * 更新用户角色
 * @param {number} userId - 用户ID
 * @param {number} roleId - 新的角色ID
 */
export const updateUserRole = async (userId, roleId) => {
    try {
        const updatedUser = await apiClient.put(`/users/${userId}/role/${roleId}`);
        return updatedUser.data;
    } catch (error) {
        console.error(`Error updating role for user ${userId}:`, error.response?.data || error.message);
        throw error;
    }
}; 
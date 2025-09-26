import apiClient from './apiConfig';

const addressApi = {
    getAddresses: async () => {
        try {
            console.log('[AddressAPI] 调用获取地址API');
            const response = await apiClient.get('/addresses');
            console.log('[AddressAPI] 地址获取成功:', response.data);
            return response.data;
        } catch (error) {
            console.error('[AddressAPI] Error fetching addresses:', error);
            throw error;
        }
    },

    addAddress: async (addressData) => {
        try {
            console.log('[AddressAPI] 调用添加地址API:', addressData);
            const response = await apiClient.post('/addresses', addressData);
            console.log('[AddressAPI] 地址添加成功:', response.data);
            return response.data;
        } catch (error) {
            console.error('[AddressAPI] Error adding address:', error);
            throw error;
        }
    },

    updateAddress: async (addressId, addressData) => {
        try {
            console.log('[AddressAPI] 调用更新地址API:', { addressId, addressData });
            const response = await apiClient.put(`/addresses/${addressId}`, addressData);
            console.log('[AddressAPI] 地址更新成功:', response.data);
            return response.data;
        } catch (error) {
            console.error('[AddressAPI] Error updating address:', error);
            throw error;
        }
    },

    deleteAddress: async (addressId) => {
        try {
            console.log('[AddressAPI] 调用删除地址API:', { addressId });
            await apiClient.delete(`/addresses/${addressId}`);
            console.log('[AddressAPI] 地址删除成功');
            return true; // Indicate success
        } catch (error) {
            console.error('[AddressAPI] Error deleting address:', error);
            throw error;
        }
    }
};

export default addressApi; 
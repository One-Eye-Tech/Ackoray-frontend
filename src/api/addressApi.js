import { get, post, put, del } from './httpClient';

const addressApi = {
    getAddresses: async () => {
        try {
            console.log('[AddressAPI] 调用获取地址API');
            const response = await get('/api/addresses', true);
            console.log('[AddressAPI] 地址获取成功:', response);
            return response;
        } catch (error) {
            console.error('[AddressAPI] Error fetching addresses:', error);
            throw error;
        }
    },

    addAddress: async (addressData) => {
        try {
            console.log('[AddressAPI] 调用添加地址API:', addressData);
            const response = await post('/api/addresses', addressData, true);
            console.log('[AddressAPI] 地址添加成功:', response);
            return response;
        } catch (error) {
            console.error('[AddressAPI] Error adding address:', error);
            throw error;
        }
    },

    updateAddress: async (addressId, addressData) => {
        try {
            console.log('[AddressAPI] 调用更新地址API:', { addressId, addressData });
            const response = await put(`/api/addresses/${addressId}`, addressData, true);
            console.log('[AddressAPI] 地址更新成功:', response);
            return response;
        } catch (error) {
            console.error('[AddressAPI] Error updating address:', error);
            throw error;
        }
    },

    deleteAddress: async (addressId) => {
        try {
            console.log('[AddressAPI] 调用删除地址API:', { addressId });
            await del(`/api/addresses/${addressId}`, true);
            console.log('[AddressAPI] 地址删除成功');
            return true; // Indicate success
        } catch (error) {
            console.error('[AddressAPI] Error deleting address:', error);
            throw error;
        }
    }
};

export default addressApi; 
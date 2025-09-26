import { get, post, put, del } from './httpClient';

// 移除直接使用axios，改用统一的httpClient

const cartApi = {
    getCart: async () => {
        try {
            console.log('[CartAPI] 调用获取购物车API');
            const response = await get('/api/cart', true);
            console.log('[CartAPI] 购物车获取成功:', response);
            return response;
        } catch (error) {
            console.error('[CartAPI] Error fetching cart:', error);
            throw error;
        }
    },

    addToCart: async (productId, productVariantId, quantity, price) => {
        try {
            console.log('[CartAPI] 调用添加到购物车API:', { productId, productVariantId, quantity, price });
            const response = await post('/api/cart/items', {
                productId,
                productVariantId,
                quantity,
                price
            }, true);
            console.log('[CartAPI] 添加到购物车成功:', response);
            return response;
        } catch (error) {
            console.error('[CartAPI] Error adding to cart:', error);
            throw error;
        }
    },

    updateCartItemQuantity: async (cartItemId, quantity) => {
        try {
            console.log('[CartAPI] 调用更新购物车数量API:', { cartItemId, quantity });
            const response = await put(`/api/cart/items/${cartItemId}?quantity=${quantity}`, {}, true);
            console.log('[CartAPI] 更新购物车数量成功:', response);
            return response;
        } catch (error) {
            console.error('[CartAPI] Error updating cart item quantity:', error);
            throw error;
        }
    },

    removeFromCart: async (cartItemId) => {
        try {
            console.log('[CartAPI] 调用删除购物车项API:', { cartItemId });
            const response = await del(`/api/cart/items/${cartItemId}`, true);
            console.log('[CartAPI] 删除购物车项成功:', response);
            return response;
        } catch (error) {
            console.error('[CartAPI] Error removing from cart:', error);
            throw error;
        }
    },

    removeProductFromCart: async (productId) => {
        try {
            console.log('[CartAPI] 调用删除商品API:', { productId });
            const response = await del(`/api/cart/items/product/${productId}`, true);
            console.log('[CartAPI] 删除商品成功:', response);
            return response;
        } catch (error) {
            console.error('[CartAPI] Error removing product from cart:', error);
            throw error;
        }
    },

    clearCart: async () => {
        try {
            console.log('[CartAPI] 调用清空购物车API');
            const response = await del('/api/cart', true);
            console.log('[CartAPI] 清空购物车成功:', response);
            return response;
        } catch (error) {
            console.error('[CartAPI] Error clearing cart:', error);
            throw error;
        }
    }
};

export default cartApi; 
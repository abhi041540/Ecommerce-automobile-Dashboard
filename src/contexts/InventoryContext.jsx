import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
    const { user } = useAuth();
    const authToken = user?.token;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getApiBaseUrl = () => {
        const baseUrl = 'https://e-commerce-automobile-server.onrender.com';
        return `${baseUrl}/api`;
    };

    const API_BASE_URL = getApiBaseUrl();

    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
    });

    const fetchProducts = async () => {
        if (!authToken) {
            console.log('[InventoryContext] No auth token available');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/products`, {
                headers: getAuthHeaders()
            });
            setProducts(response.data);
            localStorage.setItem('products_cache', JSON.stringify(response.data));
        } catch (err) {
            console.error('[InventoryContext] Fetch error:', err.response?.data || err.message);
            setError(err.response?.data?.message || err.message);
            const cached = localStorage.getItem('products_cache');
            if (cached) {
                setProducts(JSON.parse(cached));
            }
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (productData) => {
        if (!authToken) {
            throw new Error('No authentication token available');
        }
        try {
            const response = await axios.post(`${API_BASE_URL}/products`, productData, {
                headers: getAuthHeaders()
            });
            setProducts(prev => {
                const updated = [...prev, response.data];
                localStorage.setItem('products_cache', JSON.stringify(updated));
                return updated;
            });
            return response.data;
        } catch (err) {
            console.error('[InventoryContext] Add error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || err.message);
        }
    };

    const updateProduct = async (productId, productData) => {
        if (!authToken) {
            throw new Error('No authentication token available');
        }
        try {
            const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData, {
                headers: getAuthHeaders()
            });
            setProducts(prev => {
                const updated = prev.map(p => p._id === productId ? response.data : p);
                localStorage.setItem('products_cache', JSON.stringify(updated));
                return updated;
            });
            return response.data;
        } catch (err) {
            console.error('[InventoryContext] Update error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || err.message);
        }
    };

    const deleteProduct = async (productId) => {
        if (!authToken) {
            throw new Error('No authentication token available');
        }
        try {
            await axios.delete(`${API_BASE_URL}/products/${productId}`, {
                headers: getAuthHeaders()
            });
            setProducts(prev => {
                const updated = prev.filter(p => p._id !== productId);
                localStorage.setItem('products_cache', JSON.stringify(updated));
                return updated;
            });
            return true;
        } catch (err) {
            console.error('[InventoryContext] Delete error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || err.message);
        }
    };

    const getLowStockProducts = () => {
        return products.filter(product => product.quantity <= product.threshold);
    };

    useEffect(() => {
        const cached = localStorage.getItem('products_cache');
        if (cached) {
            setProducts(JSON.parse(cached));
        }
    }, []);

    useEffect(() => {
        if (authToken) {
            fetchProducts();
        }
    }, [authToken]);

    const value = {
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        fetchProducts,
        getLowStockProducts
    };

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within InventoryProvider');
    }
    return context;
};

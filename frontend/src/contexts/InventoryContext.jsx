import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { inventoryMock } from '../mockData/inventoryMock';
import productService from '../services/productService';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const InventoryProvider = ({ children }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { shop, loading } = useAuth() || {};

  const fetchProducts = useCallback(async (shopId) => {
    if (!shopId && !useMock) return;

    if (useMock) {
      console.log("Using Mock Data for Inventory");
      setInventoryItems(inventoryMock);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getAllProducts(shopId);
      setInventoryItems(data);
    } catch (err) {
      console.error("API Error - Fetching products failed:", err);
      setError("Unable to connect to inventory server.");
      // No fallback to mock data here as per user request
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading || !shop?.id) return;
    fetchProducts(shop.id);
  }, [loading, shop?.id, fetchProducts]);

  const addInventoryItem = async (item) => {
    if (useMock) {
      setInventoryItems(prev => [...prev, { ...item, id: Date.now() }]);
      return;
    }

    try {
      const newItem = await productService.createProduct(item);
      setInventoryItems(prev => [...prev, newItem]);
    } catch (err) {
      console.error("API Error - Creating product failed:", err.response?.data || err.message || err);
      alert("Failed to add product to backend.");
    }
  };

  const updateInventoryItem = async (id, updatedItem) => {
    if (useMock) {
      setInventoryItems(prev => prev.map(item => item.id === id ? { ...updatedItem, id } : item));
      return;
    }

    try {
      const updated = await productService.updateProduct(id, updatedItem);
      setInventoryItems(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error("API Error - Updating product failed:", err);
      alert("Failed to update product on backend.");
    }
  };

  const deleteInventoryItem = async (id) => {
    if (useMock) {
      setInventoryItems(prev => prev.filter(item => item.id !== id));
      return;
    }

    try {
      await productService.deleteProduct(id);
      setInventoryItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("API Error - Deleting product failed:", err);
      alert("Failed to delete product from backend.");
    }
  };

  return (
    <InventoryContext.Provider value={{ 
      inventoryItems, 
      addInventoryItem, 
      updateInventoryItem, 
      deleteInventoryItem, 
      isLoading,
      error,
      refreshInventory: fetchProducts
    }}>
      {children}
    </InventoryContext.Provider>
  );
};


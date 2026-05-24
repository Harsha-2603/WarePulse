import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { vendorMock } from '../mockData/vendorMock';
import vendorService from '../services/vendorService';
import { useAuth } from './AuthContext';
const VendorContext = createContext();

export const useVendors = () => useContext(VendorContext);

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const VendorProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { shop, loading } = useAuth() || {};

  const fetchCountRef = useRef(0);

  const fetchVendors = useCallback(async (shopId) => {
    if (!shopId && !useMock) return;

    if (useMock) {
      console.log("Using Mock Data for Vendors");
      setVendors(vendorMock);
      setIsLoading(false);
      return;
    }

    fetchCountRef.current += 1;
    const currentFetch = fetchCountRef.current;

    setIsLoading(true);
    setError(null);
    try {
      const data = await vendorService.getAllVendors(shopId);
      if (currentFetch === fetchCountRef.current) {
        setVendors(data);
      }
    } catch (err) {
      if (currentFetch === fetchCountRef.current) {
        console.error("API Error - Fetching vendors failed:", err.response?.data || err.message || err);
        setError("Unable to connect to vendor server.");
      }
    } finally {
      if (currentFetch === fetchCountRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (loading || !shop?.id) return;
    fetchVendors(shop.id);
  }, [loading, shop?.id, fetchVendors]);

  const addVendor = async (vendor) => {
    if (useMock) {
      const mockVendor = { ...vendor, id: Date.now() };
      setVendors(prev => [...prev, mockVendor]);
      return mockVendor;
    }

    try {
      const newVendor = await vendorService.createVendor(vendor);
      await fetchVendors(shop?.id);
      return newVendor;
    } catch (err) {
      console.error("API Error - Creating vendor failed:", err.response?.data || err.message || err);
      throw err;
    }
  };

  const updateVendor = async (id, updatedVendor) => {
    if (useMock) {
      setVendors(prev => prev.map(v => v.id === id ? { ...updatedVendor, id } : v));
      return;
    }

    try {
      const result = await vendorService.updateVendor(id, updatedVendor);
      await fetchVendors(shop?.id);
      return result;
    } catch (err) {
      console.error("API Error - Updating vendor failed:", err.response?.data || err.message || err);
      throw err;
    }
  };

  const deleteVendor = async (id) => {
    if (useMock) {
      setVendors(prev => prev.filter(v => v.id !== id));
      return;
    }

    try {
      await vendorService.deleteVendor(id);
      // Sync with backend to ensure the list is truly fresh
      await fetchVendors(shop?.id);
    } catch (err) {
      console.error("API Error - Deleting vendor failed:", err.response?.data || err.message || err);
      alert("Failed to delete vendor invoice from backend.");
    }
  };

  return (
    <VendorContext.Provider value={{ 
      vendors, 
      addVendor, 
      updateVendor, 
      deleteVendor, 
      isLoading,
      error,
      refreshVendors: fetchVendors
    }}>
      {children}
    </VendorContext.Provider>
  );
};


import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { customerMock } from '../mockData/customerMock';
import customerService from '../services/customerService';
import { useAuth } from './AuthContext';

const CustomerContext = createContext();

export const useCustomers = () => useContext(CustomerContext);

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { shop, loading } = useAuth() || {};

  const fetchCustomers = useCallback(async (shopId) => {
    if (!shopId && !useMock) return;

    if (useMock) {
      console.log("Using Mock Data for Customers");
      setCustomers(customerMock);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await customerService.getAllCustomers(shopId);
      setCustomers(data);
    } catch (err) {
      console.error("API Error - Fetching customers failed:", err.response?.data || err.message || err);
      setError("Unable to connect to customer server.");
      // No fallback to mock data here as per established flow
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading || !shop?.id) return;
    fetchCustomers(shop.id);
  }, [loading, shop?.id, fetchCustomers]);

  const addCustomer = async (customerData) => {
    if (useMock) {
      setCustomers(prev => [...prev, { 
        ...customerData, 
        id: `CUST-${String(prev.length + 1).padStart(3, '0')}`,
        totalOrders: 0,
        totalPurchase: 0
      }]);
      return;
    }

    try {
      const newCustomer = await customerService.createCustomer(customerData);
      setCustomers(prev => [...prev, newCustomer]);
    } catch (err) {
      console.error("API Error - Creating customer failed:", err.response?.data || err.message || err);
      alert("Failed to add customer to backend.");
    }
  };

  const updateCustomer = async (id, updatedCustomer) => {
    if (useMock) {
      setCustomers(prev => prev.map(c => c.id === id ? { ...updatedCustomer, id } : c));
      return;
    }

    try {
      const updated = await customerService.updateCustomer(id, updatedCustomer);
      setCustomers(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) {
      console.error("API Error - Updating customer failed:", err.response?.data || err.message || err);
      alert("Failed to update customer on backend.");
    }
  };

  const deleteCustomer = async (id) => {
    if (useMock) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      return;
    }

    try {
      await customerService.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("API Error - Deleting customer failed:", err.response?.data || err.message || err);
      alert("Failed to delete customer from backend.");
    }
  };

  // Sync helper for UI (can be extended to call API if needed)
  const updateCustomerStats = (customerName, orderAmount) => {
    setCustomers(prev => prev.map(customer => {
      if (customer.name === customerName) {
        return {
          ...customer,
          totalOrders: (customer.totalOrders || 0) + 1,
          totalPurchase: (customer.totalPurchase || 0) + orderAmount
        };
      }
      return customer;
    }));
  };

  return (
    <CustomerContext.Provider value={{ 
      customers, 
      addCustomer, 
      updateCustomer, 
      deleteCustomer, 
      updateCustomerStats, 
      isLoading,
      error,
      refreshCustomers: fetchCustomers
    }}>
      {children}
    </CustomerContext.Provider>
  );
};


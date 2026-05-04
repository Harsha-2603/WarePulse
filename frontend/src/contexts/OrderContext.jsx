import React, { createContext, useState, useContext, useEffect } from 'react';
import { orderMock } from '../mockData/orderMock';
import orderService from '../services/orderService';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    if (useMock) {
      setOrders(orderMock);
      setIsLoading(false);
    } else {
      try {
        setIsLoading(true);
        const data = await orderService.getAllOrders();
        setOrders(data || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (orderData) => {
    if (useMock) {
      setOrders(prev => [...prev, { ...orderData, id: `ORD-${Date.now()}` }]);
      return;
    }
    try {
      await orderService.createOrder(orderData);
      await fetchOrders(); // Immediately refresh list
    } catch (error) {
      console.error("Failed to add order:", error);
      alert(error.message);
    }
  };

  const updateOrderStatus = async (id, status) => {
    if (useMock) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      return;
    }
    try {
      await orderService.updateOrderStatus(id, status);
      await fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, isLoading, refreshOrders: fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { orderMock } from '../mockData/orderMock';
import orderService from '../services/orderService';
import { useAuth } from './AuthContext';
import { useCustomers } from './CustomerContext';
import { useInventory } from './InventoryContext';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { shop, loading } = useAuth() || {};
  const { customers } = useCustomers() || {};
  const { inventoryItems } = useInventory() || {};

  const lastFetchedShopId = useRef(null);
  const isMountedRef = useRef(true);

  // Safely manage mounting state to completely eliminate memory leak warnings
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchOrders = useCallback(async (shopId, isBackground = false, page = null, limit = null) => {
    if (!shopId && !useMock) return;

    if (useMock) {
      if (!isBackground && isMountedRef.current) setIsLoading(true);
      if (isMountedRef.current) {
        setError(null);
        setOrders(orderMock);
        setIsSuccess(true);
        setIsLoading(false);
      }
    } else {
      try {
        if (!isBackground && isMountedRef.current) setIsLoading(true);
        if (isMountedRef.current) setError(null);
        
        const data = await orderService.getAllOrders(shopId, page, limit);
        
        if (isMountedRef.current) {
          setOrders(data || []);
          setIsSuccess(true);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        if (isMountedRef.current) {
          setError(err.message || "Failed to fetch orders");
          setIsSuccess(false);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (loading || !shop?.id) return;
    // Deduplicate calls on mount/session transitions
    if (lastFetchedShopId.current === shop.id) return;
    lastFetchedShopId.current = shop.id;
    fetchOrders(shop.id);
  }, [loading, shop?.id, fetchOrders]);

  const addOrder = useCallback(async (orderData) => {
    if (!shop?.id && !useMock) return;

    const optimisticId = `TEMP-ORD-${Date.now()}`;
    
    // Resolve customer details immediately from sibling context
    let customerName = "Unknown Customer";
    if (customers && Array.isArray(customers)) {
      const matched = customers.find(c => c.id === orderData.customer_id);
      if (matched) customerName = matched.name || matched.customer_name || customerName;
    }

    // Resolve products and items immediately
    const productsInPayload = orderData.items || orderData.products || [];
    let itemsTotalAmount = 0;
    
    const mappedItems = productsInPayload.map((p, idx) => {
      let productName = "Unknown Product";
      if (inventoryItems && Array.isArray(inventoryItems)) {
        const matched = inventoryItems.find(item => item.id === p.product_id);
        if (matched) productName = matched.name || matched.product_name || productName;
      }
      
      const qty = Number(p.quantity) || 0;
      const price = Number(p.price_per_unit) || 0;
      const taxPct = Number(p.tax_percentage || 0);
      const sub = qty * price;
      const tax = sub * (taxPct / 100);
      const total = sub + tax;
      
      itemsTotalAmount += total;
      
      return {
        id: `TEMP-ITEM-${idx}-${Date.now()}`,
        product_id: p.product_id,
        product_name: productName,
        name: productName,
        quantity: qty,
        qty: qty,
        unit: p.unit || 'unit',
        price_per_unit: price,
        price: price,
        tax_percentage: taxPct,
        tax_amount: tax,
        line_total: total,
        total: total
      };
    });
    
    const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

    const optimisticOrder = {
      id: optimisticId,
      customer_name: customerName,
      customer: customerName,
      total_amount: itemsTotalAmount,
      amount: itemsTotalAmount,
      payment_status: "pending",
      paymentStatus: "Pending",
      sale_status: "confirmed",
      status: "Confirmed",
      created_at: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      items: mappedItems,
      itemDetails: mappedItems,
      item_count: itemCount,
      notes: orderData.notes || "",
      isOptimistic: true
    };

    // Prepend the optimistic order to the UI state immediately
    setOrders(prev => [optimisticOrder, ...prev]);

    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setOrders(prev => prev.map(o => o.id === optimisticId ? { 
        ...o, 
        id: `ORD-${Date.now()}`, 
        isOptimistic: false 
      } : o));
      return;
    }

    try {
      console.log(`[OrderContext] Creating order optimistically. Optimistic ID: ${optimisticId}`);
      const newOrder = await orderService.createOrder(orderData);
      console.log(`[OrderContext] Received newly created order:`, JSON.stringify(newOrder));
      
      // Replace optimistic order with real database order
      setOrders(prev => prev.map(o => o.id === optimisticId ? newOrder : o));
      
      // Sync list in background
      fetchOrders(shop.id, true);
    } catch (err) {
      console.error("[OrderContext] Failed to create order, reverting optimistic update:", err);
      // Rollback optimistic order from state
      setOrders(prev => prev.filter(o => o.id !== optimisticId));
      throw err;
    }
  }, [shop?.id, customers, inventoryItems, fetchOrders]);

  const updateOrderStatus = useCallback(async (id, status) => {
    if (!shop?.id && !useMock) return;

    // Optimistically update status locally in the UI
    setOrders(prev => prev.map(o => o.id === id ? { 
      ...o, 
      sale_status: status.toLowerCase(),
      status: status.charAt(0).toUpperCase() + status.slice(1)
    } : o));

    if (useMock) {
      return;
    }

    try {
      console.log(`[OrderContext] Updating order status optimistically for ID ${id} to: ${status}`);
      await orderService.updateOrderStatus(id, status);
      // Sync in background
      fetchOrders(shop.id, true);
    } catch (err) {
      console.error("[OrderContext] Failed to update order status, re-fetching orders:", err);
      // Sync in background to revert/correct the state
      fetchOrders(shop.id, true);
    }
  }, [shop?.id, fetchOrders]);

  return (
    <OrderContext.Provider value={{ 
      orders, 
      addOrder, 
      updateOrderStatus, 
      isLoading, 
      isSuccess, 
      error, 
      refreshOrders: fetchOrders 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import { billingMock } from '../mockData/billingMock';
import invoiceService from '../services/invoiceService';
import { useAuth } from './AuthContext';

const InvoiceContext = createContext();

export const useInvoices = () => useContext(InvoiceContext);

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { shop, loading } = useAuth() || {};

  const fetchInvoices = async (shopId) => {
    if (!shopId && !useMock) return;

    if (useMock) {
      setInvoices(billingMock);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await invoiceService.getAllInvoices(shopId);
      console.log("raw backend billing response", JSON.stringify(data));
      const mapped = (data || []).map(inv => {
        const mMode = inv.payment_mode;
        console.log("mapped frontend paymentMode", mMode);
        console.log("final rendered payment mode source", mMode);
        
        return {
          id: inv.invoice_number || inv.id,
          realId: inv.id,
          customer: inv.customer_name,
          date: inv.invoice_date,
          amount: Number(inv.total_amount),
          paymentMode: mMode,
          status: (inv.invoice_status === 'paid') ? 'Paid' : (inv.invoice_status === 'partially_paid' ? 'Partially Paid' : 'Pending'),
          orderId: inv.sale_id
        };
      });
      setInvoices(mapped);
      console.log("refreshed billing fetch response", JSON.stringify(mapped));
      mapped.forEach(m => console.log("final displayed billing status", m.status));
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loading || !shop?.id) return;
    fetchInvoices(shop.id);
  }, [loading, shop?.id]);

  const recordPayment = async (paymentData) => {
    if (useMock) {
      setInvoices(invoices.map(inv => inv.id === paymentData.invoice_id ? { ...inv, status: 'Paid', paymentMode: paymentData.payment_mode } : inv));
      return;
    }
    try {
      await invoiceService.recordPayment(paymentData);
      await fetchInvoices(shop?.id);
    } catch (error) {
      console.error("Record payment failed:", error.message);
      throw error;
    }
  };

  const addInvoice = (invoice) => {
    const nextId = invoices.length > 0 
      ? `INV-2023-${String(parseInt(invoices[invoices.length - 1].id.split('-')[2]) + 1).padStart(3, '0')}`
      : 'INV-2023-001';
    setInvoices([...invoices, { ...invoice, id: nextId }]);
  };

  const updateInvoiceStatus = (id, status) => {
    setInvoices(invoices.map(invoice => invoice.id === id ? { ...invoice, status } : invoice));
  };

  const updateInvoicePaymentMode = async (id, paymentMode) => {
    if (useMock) {
      setInvoices(invoices.map(invoice => invoice.id === id ? { ...invoice, paymentMode } : invoice));
      return;
    }
    try {
      const inv = invoices.find(i => i.id === id);
      const targetId = inv?.realId || id;
      await invoiceService.updateInvoicePaymentMode(targetId, paymentMode);
      await fetchInvoices(shop?.id);
    } catch (error) {
      console.error("Failed to update payment mode on backend:", error.message);
    }
  };

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, updateInvoiceStatus, updateInvoicePaymentMode, recordPayment, isLoading, refreshInvoices: fetchInvoices }}>
      {children}
    </InvoiceContext.Provider>
  );
};

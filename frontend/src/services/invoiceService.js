import api from './api';

const invoiceService = {
  getAllInvoices: async (shopId) => {
    const response = await api.get(`/billing?shop_id=${shopId}`);
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await api.post('/billing/invoice', invoiceData);
    return response.data;
  },

  recordPayment: async (paymentData) => {
    console.log("FRONTEND PAYMENT PAYLOAD", JSON.stringify(paymentData));
    try {
      const response = await api.post('/billing/payment', paymentData);
      console.log("PAYMENT API SUCCESS", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("PAYMENT API ERROR", error.message);
      throw error;
    }
  },

  updateInvoicePaymentMode: async (id, paymentMode) => {
    const response = await api.patch(`/billing/invoice/${id}/payment-mode`, { payment_mode: paymentMode });
    return response.data;
  }
};

export default invoiceService;

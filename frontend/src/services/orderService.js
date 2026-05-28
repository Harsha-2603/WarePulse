import api from './api';

const orderService = {
  // GET all orders
  getAllOrders: async (shopId, page = null, limit = null) => {
    try {
      let url = `/orders?shop_id=${shopId}`;
      if (page !== null && limit !== null) {
        url += `&page=${page}&limit=${limit}`;
      }
      const response = await api.get(url);
      console.log("Fetched orders count:", response.data?.length || 0);
      console.log("Received API response:", JSON.stringify(response.data));
      console.log("Mapped order data:", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.log("exact frontend API errors", error.message);
      throw error;
    }
  },

  // GET order by ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      console.log("Received API response (single):", JSON.stringify(response.data));
      console.log("Mapped order data (single):", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.log("exact frontend API errors", error.message);
      throw error;
    }
  },

  // POST new order
  createOrder: async (orderData) => {
    try {
      console.log("final frontend payload", JSON.stringify(orderData));
      const response = await api.post('/orders', orderData);
      console.log("Received API response (create):", JSON.stringify(response.data));
      console.log("Mapped order data (create):", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.log("exact frontend API errors", error.message);
      throw error;
    }
  },

  // POST new purchase
  createPurchase: async (data) => {
    try {
      console.log("final frontend payload", JSON.stringify(data));
      const response = await api.post('/orders/purchase', data);
      console.log("Received API response (purchase):", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.log("exact frontend API errors", error.message);
      throw error;
    }
  },
  
  // PUT update existing purchase
  updatePurchase: async (id, data) => {
    try {
      console.log("final frontend payload", JSON.stringify(data));
      const response = await api.put(`/orders/purchase/${id}`, data);
      console.log("Received API response (update purchase):", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.log("exact frontend API errors", error.message);
      throw error;
    }
  },

  // PATCH update order status
  updateOrderStatus: async (id, status) => {
    try {
      console.log("final frontend payload", JSON.stringify({ status }));
      const response = await api.put(`/orders/${id}`, { sale_status: status });
      console.log("Received API response (update status):", JSON.stringify(response.data));
      console.log("Mapped order data (update status):", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.log("exact frontend API errors", error.message);
      throw error;
    }
  },

  // DELETE order
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      console.log("Received API response (delete):", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.log("exact frontend API errors", error.message);
      throw error;
    }
  }
};

export default orderService;

import api from './api';

/**
 * Frontend service for managing customers
 * Handles mapping between frontend camelCase 
 * and backend snake_case database structure.
 */

const mapInbound = (c) => ({
  ...c,
  id: c.id,
  name: c.customer_name || c.name,
  type: c.customer_type || c.type || 'Standard',
  email: c.email || '',
  phone: c.phone || '',
  address: c.address || '',
  city: c.city || '',
  state: c.state || '',
  pinCode: c.pin_code || c.pinCode || '',
  gstNumber: c.customer_gst_number || c.gstNumber || c.gst_number || '',
  joinDate: c.join_date || c.joinDate || new Date().toISOString().split('T')[0],
  totalOrders: Number(c.total_orders || c.totalOrders || 0),
  totalPurchase: Number(c.total_purchase || c.totalPurchase || 0),
  shop_id: c.shop_id
});

const mapOutbound = (c) => {
  const shopId = c.shop_id || localStorage.getItem('shop_id');

  const rawPayload = {
    customer_name: c.name || c.customer_name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    customer_gst_number: c.gstNumber || c.gst_number
  };

  if (shopId && shopId !== '00000000-0000-0000-0000-000000000000') {
    rawPayload.shop_id = shopId;
  }

  const filteredPayload = Object.fromEntries(
    Object.entries(rawPayload).filter(([_, val]) => val !== undefined && val !== null && val !== '')
  );

  return filteredPayload;
};

const customerService = {
  // GET all customers
  getAllCustomers: async () => {
    const { data } = await api.get('/customers');
    return (data || []).map(mapInbound);
  },

  // GET customer by ID
  getCustomerById: async (id) => {
    const { data } = await api.get(`/customers/${id}`);
    return mapInbound(data);
  },

  // POST new customer
  createCustomer: async (customerData) => {
    const outbound = mapOutbound(customerData);
    console.log("FINAL CUSTOMER PAYLOAD:", outbound);
    const { data } = await api.post('/customers', outbound);
    return mapInbound(data);
  },

  // PUT update existing customer
  updateCustomer: async (id, customerData) => {
    const outbound = mapOutbound(customerData);
    console.log("Customer update payload:", outbound);
    const { data } = await api.put(`/customers/${id}`, outbound);
    return mapInbound(data);
  },

  // DELETE customer
  deleteCustomer: async (id) => {
    const { data } = await api.delete(`/customers/${id}`);
    return data;
  }
};

export default customerService;


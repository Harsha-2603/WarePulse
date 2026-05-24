import * as customerService from '../services/customerService.js';

const extractShopId = (req) => {
  return req.user?.shop_id;
};

export const getCustomers = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const customers = await customerService.getAllCustomers(shopId);
    return res.status(200).json(customers);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const customerData = { ...req.body, shop_id: shopId };
    const newCustomer = await customerService.createCustomer(customerData);
    
    return res.status(201).json(newCustomer);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);

    if (!id) return res.status(400).json({ success: false, message: 'Customer id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const customer = await customerService.getCustomerById(id, shopId);
    return res.status(200).json(customer);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);

    if (!id) return res.status(400).json({ success: false, message: 'Customer id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    console.log("Updating customer:", req.body);

    const updatedCustomer = await customerService.updateCustomer(id, shopId, req.body);
    return res.status(200).json(updatedCustomer);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);

    if (!id) return res.status(400).json({ success: false, message: 'Customer id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const result = await customerService.deleteCustomer(id, shopId);
    return res.status(200).json(result);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

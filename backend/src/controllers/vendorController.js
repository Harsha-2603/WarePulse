import * as vendorService from '../services/vendorService.js';
import { isAdmin, hasRole } from '../middleware/authMiddleware.js';

const extractShopId = (req) => {
  return req.user?.shop_id || req.headers['x-shop-id'] || req.params.shop_id || req.query.shop_id || req.body.shop_id;
};

export const getVendors = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const vendors = await vendorService.getAllVendors(shopId);
    return res.status(200).json(vendors);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const createVendor = async (req, res) => {
  try {
    const shopId = req.user?.shop_id;
    if (!shopId) return res.status(401).json({ success: false, message: 'Authentication required: shop_id not found' });

    const vendorData = { ...req.body, shop_id: shopId };
    const newVendor = await vendorService.createVendor(vendorData);
    
    return res.status(201).json(newVendor);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);

    if (!id) return res.status(400).json({ success: false, message: 'Vendor id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const vendor = await vendorService.getVendorById(id, shopId);
    return res.status(200).json(vendor);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user?.shop_id;
    if (!shopId) return res.status(401).json({ success: false, message: 'Authentication required: shop_id not found' });

    if (!id) return res.status(400).json({ success: false, message: 'Vendor id is required' });

    const updatedVendor = await vendorService.updateVendor(id, shopId, req.body);
    return res.status(200).json(updatedVendor);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user?.shop_id;
    if (!shopId) return res.status(401).json({ success: false, message: 'Authentication required: shop_id not found' });

    if (!id) return res.status(400).json({ success: false, message: 'Vendor id is required' });

    const result = await vendorService.deleteVendor(id, shopId);
    return res.status(200).json(result);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

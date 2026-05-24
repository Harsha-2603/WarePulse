import * as productService from '../services/productService.js';
import * as csvService from '../services/csvService.js';
import { isAdmin, hasRole } from '../middleware/authMiddleware.js';

// Helper to safely extract shopId handling different possible auth/request structures
const extractShopId = (req) => {
  const id = req.user?.shop_id;
  if (id === '00000000-0000-0000-0000-000000000000') return null;
  return id;
};

export const getProducts = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    if (!shopId) {
      return res.status(400).json({ success: false, message: 'shop_id is required' });
    }

    const products = await productService.getAllProducts(shopId);
    return res.status(200).json(products);
    
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    // Future RBAC: const userRole = req.user?.role;
    // if (!isAdmin(req)) { /* throw error or block */ }
    if (!shopId) {
      return res.status(400).json({ success: false, message: 'shop_id is required' });
    }

    const productData = { ...req.body, shop_id: shopId };
    const newProduct = await productService.createProduct(productData);
    return res.status(201).json(newProduct);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Product id is required' });
    }
    if (!shopId) {
      return res.status(400).json({ success: false, message: 'shop_id is required' });
    }

    const product = await productService.getProductById(id, shopId);
    return res.status(200).json(product);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);
    // Future RBAC: const userRole = req.user?.role;
    // if (!isAdmin(req) && !hasRole(req, ['manager'])) { /* block */ }

    if (!id) {
      return res.status(400).json({ success: false, message: 'Product id is required' });
    }
    if (!shopId) {
      return res.status(400).json({ success: false, message: 'shop_id is required' });
    }

    const updatedProduct = await productService.updateProduct(id, shopId, req.body);
    return res.status(200).json(updatedProduct);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);
    // Future RBAC: const userRole = req.user?.role;
    // if (!isAdmin(req)) { /* block */ }

    if (!id) {
      return res.status(400).json({ success: false, message: 'Product id is required' });
    }
    if (!shopId) {
      return res.status(400).json({ success: false, message: 'shop_id is required' });
    }

    const result = await productService.deleteProduct(id, shopId);
    return res.status(200).json(result);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const importProductsCsv = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    // Assuming plain text payload or a specific 'csv_data' key
    const csvData = req.body.csv_data || req.body;
    
    if (typeof csvData !== 'string' || csvData.trim() === '') {
      return res.status(400).json({ success: false, message: 'Valid CSV payload is required to import properties.' });
    }

    const result = await csvService.importProducts(csvData, shopId);
    return res.status(200).json(result);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const exportProductsCsv = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const csvOutput = await csvService.exportProducts(shopId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"');
    
    return res.status(200).send(csvOutput);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

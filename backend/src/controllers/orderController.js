import * as orderService from '../services/orderService.js';
import { isAdmin, hasRole } from '../middleware/authMiddleware.js';

const extractShopId = (req) => {
  return req.user?.shop_id || req.headers['x-shop-id'] || req.params.shop_id || req.query.shop_id || req.body.shop_id;
};

export const createSale = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    // Future RBAC: const userRole = req.user?.role;
    // if (!isAdmin(req) && !hasRole(req, ['manager'])) { /* block */ }
    const { customer_id, items, total_amount, payment_status, sale_date } = req.body;

    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });
    if (!customer_id) return res.status(400).json({ success: false, message: 'customer_id is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items array is required and must not be empty' });
    }

    for (const item of items) {
      if (!item.product_id || item.quantity === undefined || item.price_per_unit === undefined) {
        return res.status(400).json({ success: false, message: 'each item must have product_id, quantity, and price_per_unit' });
      }
    }

    const saleData = { shop_id: shopId, customer_id, items, total_amount, payment_status, sale_date };
    const sale = await orderService.createSale(saleData);

    return res.status(201).json({
      success: true,
      sale_id: sale.id,
      message: 'Sale created successfully'
    });
  } catch (error) {
    return res.status(error.message.includes('stock') || error.message.includes('allow') ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const shop_id = extractShopId(req);
    const purchaseData = { ...req.body, shop_id };

    const createdPurchase = await orderService.createPurchase(purchaseData);

    return res.status(201).json(createdPurchase);
  } catch (error) {
    console.error("API ERROR", error);
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid');
    return res.status(isVal ? 400 : 500).json({ error: error.message });
  }
};

export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);

    if (!id) return res.status(400).json({ success: false, message: 'Purchase id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const updatedPurchase = await orderService.updatePurchase(id, shopId, req.body);
    return res.status(200).json(updatedPurchase);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const payload = { ...req.body, shop_id: shopId };
    const order = await orderService.createOrder(payload);
    
    return res.status(201).json(order);
  } catch (error) {
    return res.status(error.message.includes('stock') ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const orders = await orderService.getAllOrders(shopId);
    return res.status(200).json(orders);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);

    if (!id) return res.status(400).json({ success: false, message: 'Order id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const order = await orderService.getOrderById(id, shopId);
    return res.status(200).json(order);
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);

    if (!id) return res.status(400).json({ success: false, message: 'Order id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const updated = await orderService.updateSale(id, shopId, req.body);
    return res.status(200).json(updated);
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = extractShopId(req);

    if (!id) return res.status(400).json({ success: false, message: 'Order id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const result = await orderService.deleteSale(id, shopId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const shopId = extractShopId(req);

    if (!shopId || !productId) {
       return res.status(400).json({ success: false, message: 'shop_id and productId are required' });
    }

    const stock = await orderService.getCurrentStock(productId, shopId);
    return res.status(200).json({ product_id: productId, stock });
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

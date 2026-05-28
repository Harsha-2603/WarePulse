import * as orderService from '../services/orderService.js';
import { isAdmin, hasRole } from '../middleware/authMiddleware.js';

const extractShopId = (req) => {
  return req.user?.shop_id;
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
  const shopId = extractShopId(req);
  console.log(`[orderController] POST /api/orders received. shop_id: ${shopId}, body:`, JSON.stringify(req.body));

  try {
    if (!shopId) {
      console.warn("[orderController] Rejected: missing shop_id");
      return res.status(400).json({ success: false, message: 'shop_id is required' });
    }

    const payload = { ...req.body, shop_id: shopId };
    const order = await orderService.createOrder(payload);
    
    console.log(`[orderController] Successfully created order ID: ${order.id}`);
    return res.status(201).json(order);
  } catch (error) {
    console.error("[orderController] Error creating order:", error.message);
    const statusCode = error.message.toLowerCase().includes('stock') || error.message.toLowerCase().includes('exist') ? 400 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  const shopId = extractShopId(req);
  console.log(`[orderController] GET /api/orders received. shop_id: ${shopId}`);

  try {
    if (!shopId) {
      console.warn("[orderController] Rejected: missing shop_id");
      return res.status(400).json({ success: false, message: 'shop_id is required' });
    }

    const page = req.query.page ? parseInt(req.query.page) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    const orders = await orderService.getAllOrders(shopId, page, limit);
    console.log(`[orderController] Returning ${orders.length} orders for shop ID ${shopId}`);
    return res.status(200).json(orders);
  } catch (error) {
    console.error("[orderController] Error fetching orders:", error.message);
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const getOrder = async (req, res) => {
  const { id } = req.params;
  const shopId = extractShopId(req);
  console.log(`[orderController] GET /api/orders/${id} received. shop_id: ${shopId}`);

  try {
    if (!id) return res.status(400).json({ success: false, message: 'Order id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const order = await orderService.getOrderById(id, shopId);
    console.log(`[orderController] Returning details for order ID ${id}`);
    return res.status(200).json(order);
  } catch (error) {
    console.error(`[orderController] Error fetching order ID ${id}:`, error.message);
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const shopId = extractShopId(req);
  console.log(`[orderController] PUT /api/orders/${id} received. shop_id: ${shopId}, body:`, JSON.stringify(req.body));

  try {
    if (!id) return res.status(400).json({ success: false, message: 'Order id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const updated = await orderService.updateSale(id, shopId, req.body);
    console.log(`[orderController] Successfully updated order ID: ${id}`);
    return res.status(200).json(updated);
  } catch (error) {
    console.error(`[orderController] Error updating order ID ${id}:`, error.message);
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('stock');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const shopId = extractShopId(req);
  console.log(`[orderController] DELETE /api/orders/${id} received. shop_id: ${shopId}`);

  try {
    if (!id) return res.status(400).json({ success: false, message: 'Order id is required' });
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const result = await orderService.deleteSale(id, shopId);
    console.log(`[orderController] Successfully deleted order ID: ${id}`);
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[orderController] Error deleting order ID ${id}:`, error.message);
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

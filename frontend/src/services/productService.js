import api from './api';

/**
 * Frontend service for managing products (Inventory)
 * Handles mapping between frontend camelCase and backend snake_case
 * Matches exact database schema for the product table.
 */

const mapInbound = (item) => ({
  id: item.id,
  name: item.product_name,
  variety: item.variety,
  unit: item.unit,
  purchasePrice: item.purchase_price,
  sellingPrice: item.selling_price,
  supplier: item.vendor_name || item.supplier,
  stockQuantity: item.stock_quantity,
  stock: item.stock_quantity, // support both aliases
  lastUpdated: item.updated_at || item.last_updated,
  minStockLevel: item.min_stock_level,
  shop_id: item.shop_id
});

const mapOutbound = (item) => {
  const shopId = item.shop_id || localStorage.getItem('shop_id');
  
  const rawPayload = {
    product_name: item.name || item.product_name,
    vendor_name: item.supplier || item.vendor_name,
    unit_id: item.unit || item.unit_id,
    stock_quantity: Number(item.stock) || Number(item.stockQuantity) || 0,
    purchase_price: Number(item.purchasePrice) || 0,
    selling_price: Number(item.sellingPrice) || 0
  };

  if (shopId && shopId !== '00000000-0000-0000-0000-000000000000') {
    rawPayload.shop_id = shopId;
  }

  const filteredPayload = Object.fromEntries(
    Object.entries(rawPayload).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );

  return filteredPayload;
};

const productService = {
  // GET all products
  getAllProducts: async () => {
    const { data } = await api.get('/products');
    return (data || []).map(mapInbound);
  },

  // GET product by ID
  getProductById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return mapInbound(data);
  },

  // POST new product
  createProduct: async (productData) => {
    const payload = mapOutbound(productData);
    console.log("FINAL PAYLOAD:", payload);
    const { data } = await api.post('/products', payload);
    return mapInbound(data);
  },

  // PUT update existing product
  updateProduct: async (id, productData) => {
    const payload = mapOutbound(productData);
    console.log("REAL SHOP ID:", payload.shop_id);
    console.log("FINAL UPDATE PAYLOAD:", payload);
    const { data: response } = await api.put(`/products/${id}`, payload);
    console.log("UPDATE RESPONSE:", response);
    return mapInbound(response);
  },

  // DELETE product
  deleteProduct: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  }
};

export default productService;



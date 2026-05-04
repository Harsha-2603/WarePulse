import supabase from '../config/supabaseClient.js';

const getOrCreateUnitId = async (unitString) => {
  if (!unitString) return null;
  console.log("Selected unit:", unitString);
  
  // Attempt to find existing unit
  const { data: existing } = await supabase
    .from('unit')
    .select('id')
    .ilike('unit_name', unitString)
    .single();

  if (existing) {
    console.log("Existing unit found:", existing);
    return existing.id;
  }

  // Attempt fallback on symbol
  const { data: existingBySymbol } = await supabase
    .from('unit')
    .select('id')
    .ilike('symbol', unitString)
    .single();

  if (existingBySymbol) {
    console.log("Existing unit found:", existingBySymbol);
    return existingBySymbol.id;
  }

  // Create new unit
  const { data: created, error } = await supabase
    .from('unit')
    .insert([{ 
      unit_name: unitString, 
      symbol: unitString.toLowerCase()
    }])
    .select()
    .single();

  if (error) {
    console.error("Failed to create new unit:", error);
    return null;
  }

  console.log("Created new unit:", created);
  return created.id;
};

export const getAllProducts = async (shopId) => {
  if (!shopId) {
    throw new Error('shopId is required');
  }

  const { data, error } = await supabase
    .from('product')
    .select(`*, inventory(quantity_available), unit(unit_name, symbol)`)
    .eq('shop_id', shopId);

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  console.log('[getAllProducts] Response mapping joined inventory data');
  return data.map(item => {
    const stock = Array.isArray(item.inventory) ? item.inventory[0]?.quantity_available : item.inventory?.quantity_available;
    const unit = Array.isArray(item.unit) ? item.unit[0] : item.unit;
    const finalItem = { 
      ...item, 
      stock_quantity: stock || 0,
      unit: unit?.symbol || unit?.unit_name || ''
    };
    delete finalItem.inventory;
    delete finalItem.unit_relation;
    return finalItem;
  });
};

const sanitizeProductData = (data) => {
  console.log('[sanitizeProductData] Incoming payload:', data);
  const payload = {};

  if (data.product_name !== undefined || data.name !== undefined) {
    payload.product_name = data.product_name || data.name;
  }
  
  if (data.vendor_name !== undefined || data.supplier !== undefined) {
    payload.vendor_name = data.vendor_name || data.supplier || null;
  }

  if (data.purchase_price !== undefined || data.purchasePrice !== undefined) {
    payload.purchase_price = Number(data.purchase_price) || Number(data.purchasePrice) || 0;
  }

  if (data.selling_price !== undefined || data.sellingPrice !== undefined) {
    payload.selling_price = Number(data.selling_price) || Number(data.sellingPrice) || 0;
  }

  if (data.stock_quantity !== undefined || data.stock !== undefined || data.low_stock_level !== undefined) {
    const stock_quantity = Number(data.stock_quantity) || Number(data.stock) || 0;
    payload.low_stock_level = data.low_stock_level !== undefined ? Number(data.low_stock_level) : stock_quantity;
  }

  if (data.is_active !== undefined || data.isActive !== undefined) {
    payload.is_active = data.is_active ?? data.isActive;
  }

  if (data.shop_id !== undefined) {
    payload.shop_id = data.shop_id;
  }

  const unit_id = data.unit_id || data.unitId;
  if (unit_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(unit_id)) {
    payload.unit_id = unit_id;
  }

  console.log('[sanitizeProductData] Sanitized payload:', payload);
  return payload;
};

export const createProduct = async (data) => {
  console.log('[createProduct] Incoming Request payload:', data);
  
  const unit_id = await getOrCreateUnitId(data.unit || data.unit_id || data.unitId);
  console.log("Saved unit_id:", unit_id);

  const sanitizedData = sanitizeProductData(data);
  if (unit_id) sanitizedData.unit_id = unit_id;
  
  const { product_name, shop_id, selling_price } = sanitizedData;

  if (!product_name || !shop_id || selling_price === undefined) {
    throw new Error('product_name, shop_id, and selling_price are required fields');
  }

  // Prevent duplicate product creation
  const { data: existingProduct } = await supabase
    .from('product')
    .select('id')
    .eq('shop_id', shop_id)
    .ilike('product_name', product_name)
    .single();

  if (existingProduct) {
    throw new Error(`A product with the name "${product_name}" already exists in your shop.`);
  }

  console.log("Final product payload:", sanitizedData);
  const { data: createdProduct, error } = await supabase
    .from('product')
    .insert([sanitizedData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  const stock_quantity = Number(data.stock_quantity) || Number(data.stock) || 0;
  
  const { error: inventoryError } = await supabase
    .from('inventory')
    .insert([{
      shop_id: shop_id,
      product_id: createdProduct.id,
      quantity_available: stock_quantity,
      reserved_quantity: 0
    }]);

  if (inventoryError) {
    console.error('[createProduct] Failed to initialize inventory:', inventoryError);
    throw new Error(`Failed to initialize inventory: ${inventoryError.message}`);
  }

  // Attach stock back to the returned object so frontend state stays accurate
  createdProduct.stock_quantity = stock_quantity;

  return createdProduct;
};

export const getProductById = async (id, shopId) => {
  if (!id || !shopId) {
    throw new Error('id and shopId are required');
  }

  const { data, error } = await supabase
    .from('product')
    .select(`*, inventory(quantity_available), unit(unit_name, symbol)`)
    .eq('id', id)
    .eq('shop_id', shopId)
    .single();

  if (error) {
    throw new Error(`Failed to find product: ${error.message}`);
  }

  const stock = Array.isArray(data.inventory) ? data.inventory[0]?.quantity_available : data.inventory?.quantity_available;
  const unit = Array.isArray(data.unit) ? data.unit[0] : data.unit;
  data.stock_quantity = stock || 0;
  data.unit = unit?.symbol || unit?.unit_name || '';
  delete data.inventory;

  return data;
};

export const updateProduct = async (id, shopId, data) => {
  console.log('[updateProduct] Incoming Request payload:', data);
  if (!id || !shopId) {
    throw new Error('id and shopId are required');
  }

  const unit_id = await getOrCreateUnitId(data.unit || data.unit_id || data.unitId);
  console.log("Saved unit_id:", unit_id);

  const sanitizedData = sanitizeProductData(data);
  delete sanitizedData.shop_id; // Never overwrite shop_id in DB during updates!
  if (unit_id) sanitizedData.unit_id = unit_id;

  console.log("Final product payload:", sanitizedData);

  const { data: updatedProduct, error } = await supabase
    .from('product')
    .update(sanitizedData)
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  // Update inventory table
  const stock_quantity = Number(data.stock_quantity) || Number(data.stock) || 0;
  console.log('[updateProduct] Payload to update in inventory table: quantity_available =', stock_quantity);
  
  const { error: inventoryError } = await supabase
    .from('inventory')
    .update({ quantity_available: stock_quantity })
    .eq('product_id', id)
    .eq('shop_id', shopId);

  if (inventoryError) {
    console.error('[updateProduct] Failed to update inventory:', inventoryError);
    // Don't completely fail the request if just inventory update fails, but log it.
  }

  updatedProduct.stock_quantity = stock_quantity;
  return updatedProduct;
};

export const deleteProduct = async (id, shopId) => {
  if (!id || !shopId) {
    throw new Error('id and shopId are required');
  }
  
  const productId = id;

  console.log("Deleting inventory rows:", productId);
  const { error: inventoryError } = await supabase
    .from('inventory')
    .delete()
    .eq('product_id', productId)
    .eq('shop_id', shopId);

  if (inventoryError) {
    console.error('[deleteProduct] Failed to delete inventory:', inventoryError);
  } else {
    console.log("Inventory delete success");
  }

  console.log("Deleting sale_item rows:", productId);
  const { error: saleItemError } = await supabase
    .from('sale_item')
    .delete()
    .eq('product_id', productId);

  if (saleItemError) {
    console.error('[deleteProduct] Failed to delete sale items:', saleItemError);
  } else {
    console.log("Sale item delete success");
  }

  console.log("Deleting final product row:", productId);
  const { error } = await supabase
    .from('product')
    .delete()
    .eq('id', productId)
    .eq('shop_id', shopId);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
  
  console.log("Product delete success");
  console.log("Final delete completed");

  return { success: true, deletedId: productId };
};

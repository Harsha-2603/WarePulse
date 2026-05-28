import supabase from '../config/supabaseClient.js';

/**
 * Helper to fetch or create a unit from a plain text name.
 */
const getOrCreateUnitId = async (unitString) => {
  if (!unitString) return null;
  console.log("Selected unit:", unitString);
  
  // Attempt to find existing unit
  const { data: existing } = await supabase
    .from('unit')
    .select('id')
    .ilike('unit_name', unitString.trim())
    .maybeSingle();

  if (existing) {
    console.log("Existing unit found:", existing);
    return existing.id;
  }

  // Attempt fallback on symbol
  const { data: existingBySymbol } = await supabase
    .from('unit')
    .select('id')
    .ilike('symbol', unitString.trim())
    .maybeSingle();

  if (existingBySymbol) {
    console.log("Existing unit found by symbol:", existingBySymbol);
    return existingBySymbol.id;
  }

  // Create new unit
  const { data: created, error } = await supabase
    .from('unit')
    .insert([{ 
      unit_name: unitString.trim(), 
      symbol: unitString.trim().toLowerCase()
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

/**
 * Relational validation.
 * Validates unit_id exists.
 */
const validateProductRelations = async (shopId, unitId) => {
  if (unitId) {
    const { data: unitExists, error: unitError } = await supabase
      .from('unit')
      .select('id')
      .eq('id', unitId)
      .maybeSingle();

    if (unitError || !unitExists) {
      throw new Error(`Invalid unit_id: The specified unit does not exist.`);
    }
  }
};

/**
 * Fetch all products, joining unit table.
 */
export const getAllProducts = async (shopId) => {
  if (!shopId) {
    throw new Error('shopId is required');
  }

  const { data, error } = await supabase
    .from('product')
    .select(`*, inventory(quantity_available), unit:unit_id (id, unit_name, symbol)`)
    .eq('shop_id', shopId);

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return data.map(item => {
    const stock = Array.isArray(item.inventory) ? item.inventory[0]?.quantity_available : item.inventory?.quantity_available;
    const unit = item.unit;

    const { unit: _, inventory: __, ...rest } = item;
    const finalItem = { 
      ...rest, 
      stock_quantity: stock || 0,
      unit_name: unit?.unit_name || '',
      unit: unit?.symbol || unit?.unit_name || '',
      vendor_name: item.vendor_name || ''
    };
    return finalItem;
  });
};

/**
 * Fetch all units ordered by name.
 */
export const getAllUnits = async () => {
  const { data, error } = await supabase
    .from('unit')
    .select('*')
    .order('unit_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch units: ${error.message}`);
  }
  return data;
};

const sanitizeProductData = (data) => {
  console.log('[sanitizeProductData] Incoming payload:', data);
  const payload = {};

  if (data.product_name !== undefined || data.name !== undefined) {
    payload.product_name = data.product_name || data.name;
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



  // vendor_name plain text only!
  const vendor_name = data.vendor_name || data.vendor || data.supplier || data.vendorName;
  if (vendor_name !== undefined) {
    payload.vendor_name = vendor_name ? String(vendor_name).trim() : null;
  }

  console.log('[sanitizeProductData] Sanitized payload:', payload);
  return payload;
};

export const createProduct = async (data) => {
  console.log('[createProduct] Incoming Request payload:', data);
  
  const shopId = data.shop_id;
  if (!shopId) {
    throw new Error('shop_id is required');
  }

  // Resolve Unit UUID
  let unit_id = data.unit_id || data.unitId;
  const unitText = data.unit;
  if (!unit_id && unitText) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(unitText)) {
      unit_id = unitText;
    } else {
      unit_id = await getOrCreateUnitId(unitText);
    }
  }

  const vendorText = data.vendor || data.vendor_name || data.supplier || data.vendorName;

  // Validate relationships
  await validateProductRelations(shopId, unit_id);

  const sanitizedData = sanitizeProductData(data);
  if (unit_id) sanitizedData.unit_id = unit_id;
  if (vendorText) sanitizedData.vendor_name = String(vendorText).trim();
  
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
    .maybeSingle();

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

  // Fetch fully joined created product for UI consistency
  return getProductById(createdProduct.id, shop_id);
};

export const getProductById = async (id, shopId) => {
  if (!id || !shopId) {
    throw new Error('id and shopId are required');
  }

  const { data, error } = await supabase
    .from('product')
    .select(`*, inventory(quantity_available), unit:unit_id (id, unit_name, symbol)`)
    .eq('id', id)
    .eq('shop_id', shopId)
    .single();

  if (error) {
    throw new Error(`Failed to find product: ${error.message}`);
  }

  const stock = Array.isArray(data.inventory) ? data.inventory[0]?.quantity_available : data.inventory?.quantity_available;
  const unit = data.unit;

  const { unit: _, inventory: __, ...rest } = data;
  const finalProduct = {
    ...rest,
    stock_quantity: stock || 0,
    unit_name: unit?.unit_name || '',
    unit: unit?.symbol || unit?.unit_name || '',
    vendor_name: data.vendor_name || ''
  };

  return finalProduct;
};

export const updateProduct = async (id, shopId, data) => {
  console.log('[updateProduct] Incoming Request payload:', data);
  if (!id || !shopId) {
    throw new Error('id and shopId are required');
  }

  // Resolve Unit UUID
  let unit_id = data.unit_id || data.unitId;
  const unitText = data.unit;
  if (!unit_id && unitText) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(unitText)) {
      unit_id = unitText;
    } else {
      unit_id = await getOrCreateUnitId(unitText);
    }
  }

  const vendorText = data.vendor || data.vendor_name || data.supplier || data.vendorName;

  // Validate relationships
  await validateProductRelations(shopId, unit_id);

  const sanitizedData = sanitizeProductData(data);
  delete sanitizedData.shop_id; // Never overwrite shop_id in DB during updates!
  if (unit_id) sanitizedData.unit_id = unit_id;
  if (vendorText !== undefined) sanitizedData.vendor_name = vendorText ? String(vendorText).trim() : null;

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
  }

  return getProductById(id, shopId);
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
  }

  console.log("Deleting sale_item rows:", productId);
  const { error: saleItemError } = await supabase
    .from('sale_item')
    .delete()
    .eq('product_id', productId);

  if (saleItemError) {
    console.error('[deleteProduct] Failed to delete sale items:', saleItemError);
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
  
  return { success: true, deletedId: productId };
};

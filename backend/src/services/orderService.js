import supabase from '../config/supabaseClient.js';

// ---- INVENTORY HELPER FUNCTIONS ----

export const getCurrentStock = async (productId, shopId) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('quantity_available')
    .eq('product_id', productId)
    .eq('shop_id', shopId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch stock for product ${productId}: ${error.message}`);
  }

  return data ? data.quantity_available : 0;
};

export const logStockChange = async (logData) => {
  const { error } = await supabase
    .from('stock_log')
    .insert([logData]);

  if (error) {
    throw new Error(`Failed to log stock change: ${error.message}`);
  }
};

export const increaseStock = async (productId, shopId, quantity) => {
  if (quantity <= 0) throw new Error('Quantity to increase must be greater than zero');
  
  const { data: existing, error: selectError } = await supabase
    .from('inventory')
    .select('id, quantity_available')
    .eq('product_id', productId)
    .eq('shop_id', shopId)
    .maybeSingle();

  if (selectError) throw new Error(`inventory check failed: ${selectError.message}`);

  let newStock;

  if (existing) {
    newStock = existing.quantity_available + quantity;
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ quantity_available: newStock })
      .eq('id', existing.id)
      .eq('shop_id', shopId);
    
    if (updateError) throw new Error(`Failed to increase stock: ${updateError.message}`);
  } else {
    newStock = quantity;
    const { error: insertError } = await supabase
      .from('inventory')
      .insert([{
        product_id: productId,
        shop_id: shopId,
        quantity_available: newStock
      }]);
    
    if (insertError) throw new Error(`Failed to initialize stock: ${insertError.message}`);
  }

  return newStock;
};

export const reduceStock = async (productId, shopId, quantity) => {
  if (quantity <= 0) throw new Error('Quantity to reduce must be greater than zero');
  
  const { data: existing, error: selectError } = await supabase
    .from('inventory')
    .select('id, quantity_available')
    .eq('product_id', productId)
    .eq('shop_id', shopId)
    .maybeSingle();

  if (selectError) throw new Error(`inventory check failed: ${selectError.message}`);

  if (!existing) {
    throw new Error(`Product ${productId} not found in inventory`);
  }

  const newStock = existing.quantity_available - quantity;
  if (newStock < 0) {
    throw new Error(`Negative stock not allowed for product ID: ${productId}`);
  }

  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity_available: newStock })
    .eq('id', existing.id)
    .eq('shop_id', shopId);

  if (updateError) throw new Error(`Failed to reduce stock: ${updateError.message}`);

  return newStock;
};

// ---- NEW PURCHASE FLOW ----

export const createPurchase = async (purchaseData) => {
  const { 
    shop_id, 
    vendor_id, 
    subtotal, 
    discount_amount, 
    tax_amount,
    total_amount, 
    purchase_date, 
    payment_due_date,
    payment_status,
    notes
  } = purchaseData;

  if (!shop_id) throw new Error("shop_id is required");
  if (!vendor_id) throw new Error("vendor_id is required");
  if (subtotal === undefined || subtotal === null) throw new Error("subtotal is required");
  if (discount_amount === undefined || discount_amount === null) throw new Error("discount_amount is required");
  if (total_amount === undefined || total_amount === null) throw new Error("total_amount is required");
  if (!purchase_date) throw new Error("purchase_date is required");

  // Fallback payment_due_date to purchase_date if not provided
  const resolved_due_date = payment_due_date || purchase_date;

  const insertPayload = { 
    shop_id, 
    vendor_id,
    subtotal: Number(subtotal),
    discount_amount: Number(discount_amount),
    tax_amount: tax_amount !== undefined ? Number(tax_amount) : 0,
    total_amount: Number(total_amount),
    purchase_date,
    payment_due_date: resolved_due_date,
    payment_status: payment_status ? String(payment_status).toLowerCase() : 'pending',
    notes: notes || null
  };

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchase')
    .insert([insertPayload])
    .select()
    .single();

  if (purchaseError) {
    throw new Error(`Failed to create purchase: ${purchaseError.message}`);
  }

  return purchase;
};

export const updatePurchase = async (id, shopId, purchaseData) => {
  if (!id) throw new Error('Purchase id is required');
  if (!shopId) throw new Error('shop_id is required');

  const { 
    subtotal, discount_amount, tax_amount, total_amount, 
    purchase_date, payment_due_date, payment_status, notes 
  } = purchaseData;

  const updatePayload = {};
  if (subtotal !== undefined) updatePayload.subtotal = Number(subtotal);
  if (discount_amount !== undefined) updatePayload.discount_amount = Number(discount_amount);
  if (tax_amount !== undefined) updatePayload.tax_amount = Number(tax_amount);
  if (total_amount !== undefined) updatePayload.total_amount = Number(total_amount);
  if (purchase_date) updatePayload.purchase_date = purchase_date;
  if (payment_due_date) updatePayload.payment_due_date = payment_due_date;
  if (payment_status) updatePayload.payment_status = payment_status;
  if (notes !== undefined) updatePayload.notes = notes;

  const { data, error } = await supabase
    .from('purchase')
    .update(updatePayload)
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update purchase: ${error.message}`);
  }

  return data;
};

// ---- NEW SALE FLOW ----

export const createSale = async (saleData) => {
  const { shop_id, customer_id, delivery_date, notes, products } = saleData;

  if (!shop_id) throw new Error('shop_id is required');
  if (!customer_id) throw new Error('customer_id is required');
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new Error('At least one product is required');
  }

  // Compute invoice index count
  const { count } = await supabase
    .from('sale')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop_id);
  
  const invoice_number = `INV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(3, '0')}`;

  for (const p of products) {
    const currentStock = await getCurrentStock(p.product_id, shop_id);
    if (currentStock < Number(p.quantity)) {
      throw new Error(`Only ${currentStock} available`);
    }
  }

  let computedSubtotal = 0;
  let computedTax = 0;

  const parsedItems = products.map(p => {
    const qty = Number(p.quantity) || 0;
    const price = Number(p.price_per_unit) || 0;
    const taxPct = Number(p.tax_percentage || 0);

    const line_subtotal = qty * price;
    const line_tax = line_subtotal * (taxPct / 100);
    const line_total = line_subtotal + line_tax;

    computedSubtotal += line_subtotal;
    computedTax += line_tax;

    return {
      shop_id,
      product_id: p.product_id,
      quantity: qty,
      unit: p.unit || 'unit',
      price_per_unit: price,
      tax_percentage: taxPct,
      tax_amount: line_tax,
      line_total
    };
  });

  const total_amount = computedSubtotal + computedTax;

  const { data: sale, error: saleError } = await supabase
    .from('sale')
    .insert([{
      shop_id,
      customer_id,
      sale_date: new Date().toISOString(),
      delivery_date: delivery_date || null,
      invoice_number,
      subtotal: computedSubtotal,
      discount_amount: 0,
      tax_amount: computedTax,
      total_amount,
      sale_status: 'pending',
      payment_status: 'unpaid',
      notes: notes || null
    }])
    .select()
    .single();

  if (saleError) throw new Error(`Failed to create sale record: ${saleError.message}`);

  try {
    const finalItems = parsedItems.map(item => ({
      ...item,
      sale_id: sale.id
    }));

    const { error: itemsError } = await supabase
      .from('sale_item')
      .insert(finalItems);

    if (itemsError) throw new Error(`Failed to create sale items: ${itemsError.message}`);

    // Update inventory stock levels
    for (const item of finalItems) {
      await reduceStock(item.product_id, shop_id, item.quantity);
      
      await logStockChange({
        product_id: item.product_id,
        shop_id: shop_id,
        quantity_changed: -item.quantity,
        reference_type: 'sale',
        reference_id: sale.id
      });
    }

    return sale;
  } catch (err) {
    await supabase.from('sale').delete().eq('id', sale.id);
    throw err;
  }
};

export const generateInvoiceIfCompleted = async (sale, shopId) => {
  if (!sale || sale.sale_status !== 'completed') return;

  console.log("SALE COMPLETED → CREATING INVOICE");

  const { data: existing, error: checkError } = await supabase
    .from('invoice')
    .select('id')
    .eq('sale_id', sale.id)
    .maybeSingle();

  if (checkError) throw new Error(`Failed to check existing invoice: ${checkError.message}`);
  if (existing) {
    console.log(`Invoice already exists for sale ${sale.id}`);
    return;
  }

  const { count } = await supabase
    .from('invoice')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shopId);

  const invoice_number = `INV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(3, '0')}`;

  const totalTax = Number(sale.tax_amount || 0);
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const igst = 0;

  const invoicePayload = {
    shop_id: shopId,
    sale_id: sale.id,
    invoice_number,
    invoice_date: new Date().toISOString().split('T')[0],
    cgst_amount: cgst,
    sgst_amount: sgst,
    igst_amount: igst,
    total_invoice_amount: Number(sale.total_amount || 0),
    payment_mode: null,
    invoice_status: 'generated'
  };

  console.log("INVOICE INSERT PAYLOAD", JSON.stringify(invoicePayload));

  const { data: invoice, error: insertError } = await supabase
    .from('invoice')
    .insert([invoicePayload])
    .select()
    .single();

  if (insertError) throw new Error(`Failed to generate invoice: ${insertError.message}`);

  console.log("INVOICE CREATED", JSON.stringify(invoice));
  return invoice;
};

// ---- NEW REFACTORED ORDER FUNCTIONS ----

/**
 * Standard mapper to construct the consistent API response structure
 * and attach legacy properties to ensure perfect frontend visual compatibility.
 */
const mapOrderResponse = (s) => {
  if (!s) return null;

  // Map nested order items
  const itemsList = (s.sale_item || []).map(item => ({
    id: item.id,
    product_id: item.product_id,
    product_name: item.product?.product_name || 'Unknown Product',
    name: item.product?.product_name || 'Unknown Product', // frontend compatibility
    quantity: Number(item.quantity) || 0,
    qty: Number(item.quantity) || 0, // frontend compatibility
    unit: item.unit || 'unit',
    price_per_unit: Number(item.price_per_unit) || 0,
    price: Number(item.price_per_unit) || 0, // frontend compatibility
    tax_percentage: Number(item.tax_percentage) || 0,
    tax_amount: Number(item.tax_amount) || 0,
    line_total: Number(item.line_total) || 0,
    total: Number(item.line_total) || 0 // frontend compatibility
  }));

  const customerName = s.customer?.customer_name || 'Walk-in Customer';
  const totalAmount = Number(s.total_amount) || 0;
  const paymentStatus = s.payment_status || 'pending';
  const saleStatus = s.sale_status || 'pending';
  const createdAt = s.created_at || s.sale_date || new Date().toISOString();
  
  // Format date as YYYY-MM-DD
  const formattedDate = s.sale_date ? s.sale_date.split('T')[0] : (createdAt ? createdAt.split('T')[0] : '');

  // Calculate total items count
  const itemCount = itemsList.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: s.id,
    customer_name: customerName,
    customer: customerName, // frontend compatibility
    total_amount: totalAmount,
    amount: totalAmount, // frontend compatibility
    payment_status: paymentStatus,
    paymentStatus: paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1), // e.g. "Paid", "Pending"
    sale_status: saleStatus,
    status: saleStatus.charAt(0).toUpperCase() + saleStatus.slice(1), // e.g. "Completed", "Pending", "Processing" for frontend
    created_at: createdAt,
    date: formattedDate, // frontend compatibility
    items: itemsList,
    itemDetails: itemsList, // frontend compatibility
    item_count: itemCount, // frontend compatibility
    invoice_number: s.invoice_number,
    delivery_date: s.delivery_date,
    notes: s.notes
  };
};

export const createOrder = async (orderData) => {
  console.log("[orderService] Incoming createOrder payload:", JSON.stringify(orderData));
  
  const { shop_id, customer_id, delivery_date, notes, products, items } = orderData;

  if (!shop_id) throw new Error('shop_id is required');
  if (!customer_id) throw new Error('customer_id is required');
  
  // Accept both 'items' and 'products' for robust compatibility
  const orderItemsInput = items || products;
  
  console.log("[orderService] Received items for creation:", JSON.stringify(orderItemsInput));
  
  if (!orderItemsInput || !Array.isArray(orderItemsInput) || orderItemsInput.length === 0) {
    throw new Error('At least one product item is required');
  }

  // 1. Prevent duplicate order submissions within the last 10 seconds
  const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
  const { data: duplicateCheck, error: duplicateCheckErr } = await supabase
    .from('sale')
    .select('id')
    .eq('shop_id', shop_id)
    .eq('customer_id', customer_id)
    .eq('notes', notes || null)
    .gt('created_at', tenSecondsAgo)
    .limit(1);

  if (duplicateCheckErr) {
    console.error("[orderService] Duplicate check lookup error:", duplicateCheckErr.message);
  } else if (duplicateCheck && duplicateCheck.length > 0) {
    console.warn("[orderService] Rejected duplicate order submission detected within 10 seconds.");
    throw new Error("Duplicate order submission detected. Please wait a moment before trying again.");
  }

  console.log(`[orderService] Starting order validation. shop_id: ${shop_id}, customer_id: ${customer_id}`);

  // 2. Verify Customer exists inside THIS shop
  const { data: customer, error: customerError } = await supabase
    .from('customer')
    .select('id, customer_name')
    .eq('id', customer_id)
    .eq('shop_id', shop_id)
    .maybeSingle();

  if (customerError) {
    console.error("[orderService] Customer verification query error:", customerError.message);
    throw new Error(`Customer verification failed: ${customerError.message}`);
  }
  if (!customer) {
    console.error(`[orderService] Customer lookup failed. Customer ${customer_id} does not exist in shop ${shop_id}`);
    throw new Error(`Customer does not exist in your shop.`);
  }

  // 3. Resolve and securely calculate totals on the backend using database product prices
  let computedSubtotal = 0;
  let computedTax = 0;
  const parsedItems = [];
  const productCache = {}; // Cache to store fetched product records to avoid repeated queries

  for (const item of orderItemsInput) {
    if (!item.product_id) {
      throw new Error('product_id is required for each order item');
    }
    
    // Ensure quantity is positive
    const qty = Number(item.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Quantity must be greater than zero for product ID: ${item.product_id}`);
    }

    // Verify Product exists in THIS shop and fetch selling_price securely (using local cache if available)
    let product = productCache[item.product_id];
    if (!product) {
      const { data, error: productError } = await supabase
        .from('product')
        .select('id, product_name, selling_price')
        .eq('id', item.product_id)
        .eq('shop_id', shop_id)
        .maybeSingle();

      if (productError || !data) {
        console.error(`[orderService] Product not found in shop: ${item.product_id}`);
        throw new Error(`Product not found or does not exist in your shop.`);
      }
      product = data;
      productCache[item.product_id] = product; // populate cache
    }

    // Validate selling_price
    const sellingPrice = Number(product.selling_price);
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      throw new Error(`Invalid selling price for product: ${product.product_name}`);
    }

    // Verify stock availability
    const currentStock = await getCurrentStock(item.product_id, shop_id);
    console.log(`[orderService] Stock before update for product ${product.product_name} (${item.product_id}) is: ${currentStock}`);
    
    if (currentStock < qty) {
      console.error(`[orderService] Stock mismatch for product ${product.product_name}: current=${currentStock}, requested=${qty}`);
      throw new Error(`Only ${currentStock} stock available for product ${product.product_name}.`);
    }

    const taxPct = Number(item.tax_percentage || 5);
    const line_subtotal = qty * sellingPrice;
    const line_tax = line_subtotal * (taxPct / 100);
    const line_total = line_subtotal + line_tax;

    computedSubtotal += line_subtotal;
    computedTax += line_tax;

    parsedItems.push({
      shop_id,
      product_id: item.product_id,
      quantity: qty,
      unit: item.unit || 'bags',
      price_per_unit: sellingPrice, // Securely calculated on the backend
      tax_percentage: taxPct,
      tax_amount: line_tax,
      line_total
    });
  }

  const subtotal = computedSubtotal;
  const tax_amount = computedTax;
  const total_amount = subtotal + tax_amount;

  console.log(`[orderService] Securely calculated final totals - Subtotal: ${subtotal}, Tax Amount: ${tax_amount}, Total Amount: ${total_amount}`);

  // 4. Resolve invoice sequence count for this shop
  const { count, error: countError } = await supabase
    .from('sale')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop_id);

  if (countError) {
    console.error("[orderService] Sequence count fetch failed:", countError.message);
    throw new Error(`Failed to generate invoice sequence: ${countError.message}`);
  }

  const invoice_number = `ORD-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`;

  const salePayload = {
    shop_id,
    customer_id,
    sale_date: new Date().toISOString().split("T")[0],
    delivery_date: delivery_date || null,
    invoice_number,
    subtotal,
    discount_amount: 0,
    tax_amount,
    total_amount,
    sale_status: "confirmed",
    payment_status: "pending",
    notes: notes || null
  };

  console.log("[orderService] Inserting sale header first:", JSON.stringify(salePayload));

  let sale = null;
  const adjustedStocks = []; // Track adjusted stocks to roll back on failure

  try {
    // 5. Create order master row first
    const { data: insertedSale, error: saleError } = await supabase
      .from('sale')
      .insert([salePayload])
      .select()
      .single();

    if (saleError) {
      console.error("[orderService] Sale header insert failed:", saleError.message);
      throw new Error(`Failed to create sale record: ${saleError.message}`);
    }
    
    sale = insertedSale;
    console.log("[orderService] Sale header inserted successfully:", JSON.stringify(sale));

    // 6. Create all order_items using order_id
    const finalItems = parsedItems.map(item => ({
      ...item,
      sale_id: sale.id
    }));

    console.log("[orderService] Inserting sale items:", JSON.stringify(finalItems));

    const { data: itemsResponse, error: itemsError } = await supabase
      .from('sale_item')
      .insert(finalItems)
      .select();

    if (itemsError) {
      console.error("[orderService] Sale items insert failed:", itemsError.message);
      throw new Error(`Failed to create sale items: ${itemsError.message}`);
    }

    console.log("[orderService] Sale items inserted successfully:", JSON.stringify(itemsResponse));

    // 7. Deduct inventory stock safely
    for (const item of finalItems) {
      const newStock = await reduceStock(item.product_id, shop_id, item.quantity);
      console.log(`[orderService] Stock after update for product ${item.product_id} is: ${newStock}`);
      
      adjustedStocks.push({ product_id: item.product_id, quantity: item.quantity });

      await logStockChange({
        product_id: item.product_id,
        shop_id: shop_id,
        quantity_changed: -item.quantity,
        reference_type: 'sale',
        reference_id: sale.id
      });
    }

    await generateInvoiceIfCompleted(sale, shop_id);
    
    // Fetch and return the fully joined created order response
    return getOrderById(sale.id, shop_id);
  } catch (err) {
    // 8. Rollback order creation upon failure
    console.error("[orderService] Programmatic transaction-like rollback initiated due to error:", err.message);
    
    // Rollback stock updates
    for (const adj of adjustedStocks) {
      try {
        console.log(`[orderService] Rolling back stock reduction for product ${adj.product_id}: adding back ${adj.quantity}`);
        await increaseStock(adj.product_id, shop_id, adj.quantity);
      } catch (rollbackStockErr) {
        console.error(`[orderService] CRITICAL: Failed to rollback stock deduction for product ${adj.product_id}:`, rollbackStockErr.message);
      }
    }

    // Rollback sale header insert
    if (sale && sale.id) {
      try {
        console.log(`[orderService] Rolling back order insert: deleting sale header ${sale.id}`);
        const { error: rollbackError } = await supabase
          .from('sale')
          .delete()
          .eq('id', sale.id)
          .eq('shop_id', shop_id);

        if (rollbackError) {
          console.error("[orderService] CRITICAL: Programmatic rollback deletion failed!", rollbackError.message);
        } else {
          console.log("[orderService] Programmatic rollback deletion succeeded. Orphaned sale header removed.");
        }
      } catch (rollbackSaleErr) {
        console.error("[orderService] CRITICAL: Exception during sale header rollback deletion:", rollbackSaleErr.message);
      }
    }
    
    throw err;
  }
};

export const getAllOrders = async (shopId, page = null, limit = null) => {
  if (!shopId) throw new Error('shop_id is required');
  
  let query = supabase
    .from('sale')
    .select(`
      *,
      customer(id, customer_name, email, phone, address),
      sale_item(
        *,
        product(id, product_name, vendor_name)
      )
    `)
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });

  if (page !== null && limit !== null) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    console.log(`[orderService] Fetching orders with range pagination. shopId: ${shopId}, page: ${page}, limit: ${limit}, range: [${from}, ${to}]`);
    query = query.range(from, to);
  } else {
    console.log(`[orderService] Fetching all orders (no pagination). shopId: ${shopId}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[orderService] Fetch error in getAllOrders:", error.message);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  const fetchCount = data ? data.length : 0;
  console.log(`[orderService] Fetched ${fetchCount} order records.`);

  const mappedData = (data || []).map(order => mapOrderResponse(order));
  return mappedData;
};

export const getOrderById = async (id, shopId) => {
  if (!id) throw new Error('Order id is required');
  if (!shopId) throw new Error('shop_id is required');
  console.log(`[orderService] Fetching order ID: ${id} for shop: ${shopId}`);

  const { data, error } = await supabase
    .from('sale')
    .select(`
      *,
      customer(id, customer_name, email, phone, address),
      sale_item(
        *,
        product(id, product_name, vendor_name)
      )
    `)
    .eq('id', id)
    .eq('shop_id', shopId)
    .maybeSingle();

  if (error) {
    console.error(`[orderService] Fetch error in getOrderById for order ID ${id}:`, error.message);
    throw new Error(`Failed to find order: ${error.message}`);
  }
  if (!data) {
    console.error(`[orderService] Order ID ${id} not found under shop ${shopId}`);
    throw new Error(`Order not found.`);
  }

  return mapOrderResponse(data);
};

export const updateSale = async (id, shopId, updateData) => {
  console.log(`[orderService] Incoming updateSale payload for order ${id}:`, JSON.stringify(updateData));
  
  if (!id) throw new Error('id is required');
  if (!shopId) throw new Error('shop_id is required');

  const { customer_id, delivery_date, notes, payment_status, sale_status, products } = updateData;

  // 1. Fetch existing items
  const { data: oldItems, error: oldItemsError } = await supabase
    .from('sale_item')
    .select('*')
    .eq('sale_id', id)
    .eq('shop_id', shopId);

  if (oldItemsError) {
    console.error("[orderService] Failed to fetch old items for update:", oldItemsError.message);
    throw new Error(`Failed to query old items: ${oldItemsError.message}`);
  }

  // 2. Restore inventory quantities temporarily ONLY if products are being updated
  if (products && Array.isArray(products) && products.length > 0) {
    console.log("[orderService] Temporarily restoring stock levels for update validation...");
    for (const item of oldItems) {
      await increaseStock(item.product_id, shopId, item.quantity);
    }
  }

  try {
    // 3. Validate new quantity limits
    if (products && Array.isArray(products) && products.length > 0) {
      for (const p of products) {
        const stock = await getCurrentStock(p.product_id, shopId);
        if (stock < Number(p.quantity)) {
          throw new Error(`Insufficient stock for product ID: ${p.product_id}. Only ${stock} available.`);
        }
      }
    }

    // 4. Re-calculate totals
    let computedSubtotal = 0;
    let computedTax = 0;

    const parsedItems = (products || []).map(p => {
      const qty = Number(p.quantity) || 0;
      const price = Number(p.price_per_unit) || 0;
      const taxPct = Number(p.tax_percentage || 0);

      const line_subtotal = qty * price;
      const line_tax = line_subtotal * (taxPct / 100);
      const line_total = line_subtotal + line_tax;

      computedSubtotal += line_subtotal;
      computedTax += line_tax;

      return {
        shop_id: shopId,
        sale_id: id,
        product_id: p.product_id,
        quantity: qty,
        unit: p.unit || 'unit',
        price_per_unit: price,
        tax_percentage: taxPct,
        tax_amount: line_tax,
        line_total
      };
    });

    const total_amount = computedSubtotal + computedTax;

    // 5. Update sale header
    const updatePayload = {};
    if (customer_id) updatePayload.customer_id = customer_id;
    if (delivery_date) updatePayload.delivery_date = delivery_date;
    if (notes !== undefined) updatePayload.notes = notes;
    if (payment_status) updatePayload.payment_status = payment_status.toLowerCase();
    if (sale_status) updatePayload.sale_status = sale_status.toLowerCase();
    
    if (products && products.length > 0) {
      updatePayload.subtotal = computedSubtotal;
      updatePayload.tax_amount = computedTax;
      updatePayload.total_amount = total_amount;
    }

    console.log("[orderService] Updating sale header:", JSON.stringify(updatePayload));

    const { data: sale, error: updateError } = await supabase
      .from('sale')
      .update(updatePayload)
      .eq('id', id)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (updateError) throw new Error(`Failed to update order header: ${updateError.message}`);

    console.log("[orderService] Sale header updated successfully:", JSON.stringify(sale));

    // 6. Swap sale_item rows if requested
    if (products && products.length > 0) {
      console.log("[orderService] Deleting old items for order:", id);
      const { error: deleteError } = await supabase
        .from('sale_item')
        .delete()
        .eq('sale_id', id)
        .eq('shop_id', shopId); // Strict tenant isolation!

      if (deleteError) throw new Error(`Failed to clean old items: ${deleteError.message}`);

      console.log("[orderService] Inserting new items for order:", id);
      const { error: insertError } = await supabase
        .from('sale_item')
        .insert(parsedItems);

      if (insertError) throw new Error(`Failed to update new items: ${insertError.message}`);

      // 7. Deduct quantities again
      for (const item of parsedItems) {
        await reduceStock(item.product_id, shopId, item.quantity);
        
        await logStockChange({
          product_id: item.product_id,
          shop_id: shopId,
          quantity_changed: -item.quantity,
          reference_type: 'sale',
          reference_id: sale.id
        });
      }
    }

    await generateInvoiceIfCompleted(sale, shopId);
    return getOrderById(id, shopId);
  } catch (err) {
    // ROLLBACK restore quantities ONLY if products were passed
    if (products && Array.isArray(products) && products.length > 0) {
      console.error("[orderService] Error occurred during update. Rolling back stock reductions...", err.message);
      for (const item of oldItems) {
        await reduceStock(item.product_id, shopId, item.quantity);
      }
    }
    throw err;
  }
};

export const deleteSale = async (id, shopId) => {
  if (!id) throw new Error('id is required');
  if (!shopId) throw new Error('shop_id is required');
  console.log(`[orderService] Starting deleteSale for order ID: ${id}, shop ID: ${shopId}`);

  // 1. Fetch items with tenant check
  const { data: items, error: itemsError } = await supabase
    .from('sale_item')
    .select('*')
    .eq('sale_id', id)
    .eq('shop_id', shopId);

  if (itemsError) throw new Error(`Failed to fetch items: ${itemsError.message}`);

  // 2. Restore inventory
  console.log("[orderService] Restoring stock level for deleted order items...");
  for (const item of (items || [])) {
    await increaseStock(item.product_id, shopId, item.quantity);
  }

  // 3. Delete sale items
  const { error: deleteItemsError } = await supabase
    .from('sale_item')
    .delete()
    .eq('sale_id', id)
    .eq('shop_id', shopId);

  if (deleteItemsError) throw new Error(`Failed to delete sale items: ${deleteItemsError.message}`);

  // 4. Delete sale
  const { error: deleteSaleError } = await supabase
    .from('sale')
    .delete()
    .eq('id', id)
    .eq('shop_id', shopId);

  if (deleteSaleError) throw new Error(`Failed to delete sale: ${deleteSaleError.message}`);

  console.log("[orderService] Order deletion completed successfully.");
  return { success: true };
};

// ---- DATA VERIFICATION UTILITIES ----

export const verifyInventoryConsistency = async (shopId) => {
  if (!shopId) throw new Error('shop_id is required');
  const { data: inventory, error: invError } = await supabase.from('inventory').select('*').eq('shop_id', shopId);
  if (invError) throw invError;
  const { data: logs, error: logError } = await supabase.from('stock_log').select('*').eq('shop_id', shopId);
  if (logError) throw logError;

  const expectedStock = {};
  logs.forEach(log => {
    if (!expectedStock[log.product_id]) expectedStock[log.product_id] = 0;
    expectedStock[log.product_id] += Number(log.quantity_changed || 0);
  });

  const report = [];
  inventory.forEach(inv => {
    const expected = expectedStock[inv.product_id] || 0;
    const actual = Number(inv.quantity_available || 0);
    report.push({
      product_id: inv.product_id,
      actual_stock: actual,
      expected_stock: expected,
      is_match: actual === expected,
      difference: actual - expected
    });
  });

  return {
    shop_id: shopId,
    total_checked: report.length,
    mismatches: report.filter(r => !r.is_match).length,
    details: report
  };
};

export const verifyStockLogs = async (shopId) => {
  if (!shopId) throw new Error('shop_id is required');
  const { data: logs, error } = await supabase.from('stock_log').select('*').eq('shop_id', shopId);
  if (error) throw error;
  
  const anomalies = logs.filter(log => log.quantity_changed === undefined || log.quantity_changed === null || isNaN(log.quantity_changed) || !log.reference_type);
  
  return {
    shop_id: shopId,
    total_logs: logs.length,
    anomalies_found: anomalies.length,
    anomalies
  };
};

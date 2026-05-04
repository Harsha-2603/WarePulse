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

// ---- OLD LEGACY ORDER FUNCTIONS (retained) ----

export const createOrder = async (orderData) => {
  console.log("FINAL ORDER PAYLOAD", JSON.stringify(orderData));
  console.log("RAW ORDER DATA RECEIVED:", orderData);

  const { shop_id, customer_id, delivery_date, notes, products } = orderData;

  if (!shop_id) throw new Error('shop_id is required');
  if (!customer_id) throw new Error('customer_id is required');
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new Error('At least one product is required');
  }

  // Step D: Validation
  // 1. Verify Customer exists
  const { data: customer, error: customerError } = await supabase
    .from('customer')
    .select('id')
    .eq('id', customer_id)
    .maybeSingle();

  if (customerError) {
    console.log("EXACT SUPABASE ERROR", customerError.message);
    throw new Error(`Customer verification failed: ${customerError.message}`);
  }
  if (!customer) throw new Error(`Customer ${customer_id} does not exist.`);

  // 2. Verify Products & Quantity
  for (const p of products) {
    const currentStock = await getCurrentStock(p.product_id, shop_id);
    if (currentStock < Number(p.quantity)) {
      throw new Error(`Only ${currentStock} available for this product.`);
    }
  }

  // Step A: Insert into sale
  const { count } = await supabase
    .from('sale')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop_id);

  const invoice_number = `INV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(3, '0')}`;

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

  const subtotal = computedSubtotal;
  const tax_amount = computedTax;
  const total_amount = subtotal + tax_amount;

  const salePayload = {
    shop_id,
    customer_id,
    sale_date: new Date().toISOString().split("T")[0],
    delivery_date,
    invoice_number: `ORD-${Date.now()}`,
    subtotal,
    discount_amount: 0,
    tax_amount,
    total_amount,
    sale_status: "confirmed",
    payment_status: "pending",
    notes
  };

  console.log("FINAL SALE INSERT PAYLOAD:", salePayload);
  console.log("SALE STATUS VALUE:", salePayload.sale_status);
  console.log("PAYMENT STATUS VALUE:", salePayload.payment_status);

  const { data: sale, error: saleError } = await supabase
    .from('sale')
    .insert([salePayload])
    .select()
    .single();

  if (saleError) {
    console.log("EXACT SUPABASE ERROR", saleError.message);
    throw new Error(`Failed to create sale record: ${saleError.message}`);
  }
  
  console.log("SALE INSERT RESPONSE", JSON.stringify(sale));

  try {
    // Step C: Loop through products and insert sale_item
    const finalItems = parsedItems.map(item => ({
      ...item,
      sale_id: sale.id
    }));

    const { data: itemsResponse, error: itemsError } = await supabase
      .from('sale_item')
      .insert(finalItems)
      .select();

    if (itemsError) {
      console.log("EXACT SUPABASE ERROR", itemsError.message);
      throw new Error(`Failed to create sale items: ${itemsError.message}`);
    }

    console.log("SALE ITEM INSERT RESPONSE", JSON.stringify(itemsResponse));

    // Step E & F: inventory update
    for (const item of finalItems) {
      const newStock = await reduceStock(item.product_id, shop_id, item.quantity);
      console.log("INVENTORY UPDATE RESPONSE", `Product ${item.product_id} remaining: ${newStock}`);

      await logStockChange({
        product_id: item.product_id,
        shop_id: shop_id,
        quantity_changed: -item.quantity,
        reference_type: 'sale',
        reference_id: sale.id
      });
    }

    await generateInvoiceIfCompleted(sale, shop_id);
    return sale;
  } catch (err) {
    // Step G: Rollback
    console.log("ROLLING BACK SALE DUE TO FAILURE");
    await supabase.from('sale').delete().eq('id', sale.id);
    throw err;
  }
};

export const getAllOrders = async (shopId) => {
  const { data, error } = await supabase
    .from('sale')
    .select(`
      *,
      customer(id, customer_name),
      sale_item(id, quantity)
    `)
    .eq('shop_id', shopId)
    .order('sale_date', { ascending: false });

  if (error) {
    console.log("EXACT SUPABASE ERROR", error.message);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  const formatted = (data || []).map(s => ({
    id: s.id,
    order_number: s.invoice_number,
    customer_name: s.customer?.customer_name || 'Walk-in Customer',
    date: s.sale_date ? s.sale_date.split('T')[0] : '',
    amount: s.total_amount,
    status: s.sale_status,
    item_count: (s.sale_item || []).reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)
  }));

  console.log("GET ORDERS RESPONSE", JSON.stringify(formatted));
  return formatted;
};

export const getOrderById = async (id, shopId) => {
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
    .single();

  if (error) throw new Error(`Failed to find order: ${error.message}`);
  return data;
};

export const updateSale = async (id, shopId, updateData) => {
  const { customer_id, delivery_date, notes, payment_status, sale_status, products } = updateData;

  if (!id) throw new Error('id is required');
  if (!shopId) throw new Error('shop_id is required');

  // 1. Fetch existing items
  const { data: oldItems, error: oldItemsError } = await supabase
    .from('sale_item')
    .select('*')
    .eq('sale_id', id)
    .eq('shop_id', shopId);

  if (oldItemsError) throw new Error(`Failed to query old items: ${oldItemsError.message}`);

  // 2. Restore inventory quantities temporarily ONLY if products are being updated
  if (products && Array.isArray(products) && products.length > 0) {
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

    const { data: sale, error: updateError } = await supabase
      .from('sale')
      .update(updatePayload)
      .eq('id', id)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (updateError) throw new Error(`Failed to update order header: ${updateError.message}`);

    // 6. Swap sale_item rows if requested
    if (products && products.length > 0) {
      const { error: deleteError } = await supabase
        .from('sale_item')
        .delete()
        .eq('sale_id', id);

      if (deleteError) throw new Error(`Failed to clean old items: ${deleteError.message}`);

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
    return sale;
  } catch (err) {
    // ROLLBACK restore quantities ONLY if products were passed
    if (products && Array.isArray(products) && products.length > 0) {
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

  // 1. Fetch items
  const { data: items, error: itemsError } = await supabase
    .from('sale_item')
    .select('*')
    .eq('sale_id', id);

  if (itemsError) throw new Error(`Failed to fetch items: ${itemsError.message}`);

  // 2. Restore inventory
  for (const item of (items || [])) {
    await increaseStock(item.product_id, shopId, item.quantity);
  }

  // 3. Delete sale items
  const { error: deleteItemsError } = await supabase
    .from('sale_item')
    .delete()
    .eq('sale_id', id);

  if (deleteItemsError) throw new Error(`Failed to delete sale items: ${deleteItemsError.message}`);

  // 4. Delete sale
  const { error: deleteSaleError } = await supabase
    .from('sale')
    .delete()
    .eq('id', id)
    .eq('shop_id', shopId);

  if (deleteSaleError) throw new Error(`Failed to delete sale: ${deleteSaleError.message}`);

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

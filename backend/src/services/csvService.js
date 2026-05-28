import supabase from '../config/supabaseClient.js';
import * as productService from './productService.js';

const parseCsv = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    rows.push(row);
  }
  
  return rows;
};

export const importProducts = async (csvText, shopId) => {
  console.log(`[CSV Import] Initiating import for shop: ${shopId}`);
  const rows = parseCsv(csvText);
  const validRows = [];
  const errors = [];

  // Fetch all units from DB to do fast, cached matching
  const { data: units, error: unitError } = await supabase
    .from('unit')
    .select('id, unit_name, symbol');

  if (unitError) {
    throw new Error(`Failed to load unit catalog: ${unitError.message}`);
  }

  // Pre-load existing product names in the shop to detect duplicates first
  const { data: existingProducts, error: prodError } = await supabase
    .from('product')
    .select('product_name')
    .eq('shop_id', shopId);

  if (prodError) {
    throw new Error(`Failed to verify duplicate products: ${prodError.message}`);
  }

  const existingProductNames = new Set(
    (existingProducts || []).map(p => p.product_name.toLowerCase().trim())
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // Row 1 is header
    
    // Required fields check
    if (!row.product_name || row.stock_quantity === undefined || !row.unit || row.purchase_price === undefined || row.selling_price === undefined) {
      errors.push(`Row ${rowNum}: Missing required fields (product_name, stock_quantity, unit, purchase_price, selling_price)`);
      continue;
    }

    const name = row.product_name.trim();
    if (existingProductNames.has(name.toLowerCase())) {
      errors.push(`Row ${rowNum} (${name}): A product with the name "${name}" already exists in your shop.`);
      continue;
    }

    const stock = Number(row.stock_quantity);
    const purchase = Number(row.purchase_price);
    const sell = Number(row.selling_price);

    // Validate non-negative numbers
    if (isNaN(stock) || stock < 0) {
      errors.push(`Row ${rowNum}: stock_quantity must be a valid number >= 0`);
      continue;
    }
    if (isNaN(purchase) || purchase < 0) {
      errors.push(`Row ${rowNum}: purchase_price must be a valid number >= 0`);
      continue;
    }
    if (isNaN(sell) || sell < 0) {
      errors.push(`Row ${rowNum}: selling_price must be a valid number >= 0`);
      continue;
    }

    // Normalize unit string
    const normalizedUnit = row.unit.trim().toLowerCase();
    console.log(`[CSV Import] Row ${rowNum} parsed unit string: "${row.unit}", normalized: "${normalizedUnit}"`);

    // Match unit
    const matchedUnit = units.find(u => 
      u.unit_name.toLowerCase().trim() === normalizedUnit || 
      (u.symbol && u.symbol.toLowerCase().trim() === normalizedUnit)
    );

    if (!matchedUnit) {
      console.log(`[CSV Import] Row ${rowNum} unmatched unit: "${row.unit}"`);
      errors.push(`Row ${rowNum}: Unit not found: ${row.unit}`);
      continue;
    }

    console.log(`[CSV Import] Row ${rowNum} matched unit row:`, matchedUnit);
    console.log(`[CSV Import] Row ${rowNum} generated unit_id: ${matchedUnit.id}`);

    validRows.push({
      shop_id: shopId,
      product_name: name,
      vendor_name: row.supplier ? row.supplier.trim() : null,
      unit_id: matchedUnit.id,
      purchase_price: purchase,
      selling_price: sell,
      low_stock_level: stock, // Default low_stock_level to starting stock
      is_active: true,
      stock_quantity: stock // Temporarily attach for inventory insert payload
    });
  }

  let successCount = 0;

  if (validRows.length > 0) {
    console.log(`[CSV Import] Inserting ${validRows.length} valid product rows...`);
    
    // Map payload for product insert (remove stock_quantity helper attribute)
    const productPayloads = validRows.map(({ stock_quantity, ...rest }) => rest);

    const { data: insertedProducts, error: insertError } = await supabase
      .from('product')
      .insert(productPayloads)
      .select();

    if (insertError) {
      console.error("[CSV Import] Failed to insert product records:", insertError);
      throw new Error(`Failed to bulk insert products: ${insertError.message}`);
    }

    successCount = insertedProducts.length;
    console.log(`[CSV Import] Successfully inserted ${successCount} products. Initializing inventory...`);

    // Build inventory payloads
    const inventoryPayloads = insertedProducts.map(p => {
      // Find matching row by exact case-insensitive product name match
      const matchingRow = validRows.find(
        r => r.product_name.toLowerCase() === p.product_name.toLowerCase()
      );
      
      return {
        shop_id: shopId,
        product_id: p.id,
        quantity_available: matchingRow ? matchingRow.stock_quantity : 0,
        reserved_quantity: 0
      };
    });

    const { error: invError } = await supabase
      .from('inventory')
      .insert(inventoryPayloads);

    if (invError) {
      console.error("[CSV Import] Failed to initialize inventory logs:", invError);
      throw new Error(`Failed to initialize inventory for imported products: ${invError.message}`);
    }

    console.log(`[CSV Import] Successfully initialized inventory balances for all imported products.`);
  }

  console.log(`[CSV Import] Import summary - Success: ${successCount}, Failures: ${errors.length}`);
  if (errors.length > 0) {
    console.log(`[CSV Import] Failed rows:`, errors);
  }

  return { successCount, totalRows: rows.length, errors };
};

export const exportProducts = async (shopId) => {
  const products = await productService.getAllProducts(shopId);

  const headers = ['product_name', 'supplier', 'stock_quantity', 'unit', 'purchase_price', 'selling_price'];
  const csvRows = [headers.join(',')];

  for (const p of products) {
    const rowValues = [
      `"${String(p.product_name || '').replace(/"/g, '""')}"`,
      `"${String(p.vendor_name || '').replace(/"/g, '""')}"`,
      p.stock_quantity || 0,
      `"${String(p.unit || '').replace(/"/g, '""')}"`,
      p.purchase_price || 0,
      p.selling_price || 0
    ];
    csvRows.push(rowValues.join(','));
  }

  return csvRows.join('\n');
};

import supabase from '../config/supabaseClient.js';

const parseCsv = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    // Basic CSV split, does not handle commas inside quoted strings optimally 
    // but keeps it lightweight without external libraries.
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
  const rows = parseCsv(csvText);
  let successCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    if (!row.product_name || !row.purchase_price || !row.selling_price || !row.gst_rate) {
      errors.push(`Row ${i + 2}: Missing required fields (product_name, purchase_price, selling_price, gst_rate)`);
      continue;
    }

    const productData = {
      shop_id: shopId,
      product_name: row.product_name,
      purchase_price: parseFloat(row.purchase_price),
      selling_price: parseFloat(row.selling_price),
      gst_rate: parseFloat(row.gst_rate)
    };

    if (isNaN(productData.purchase_price) || isNaN(productData.selling_price) || isNaN(productData.gst_rate)) {
      errors.push(`Row ${i + 2}: Invalid number format for prices or gst_rate`);
      continue;
    }

    const { error } = await supabase
      .from('product')
      .insert([productData]);

    if (error) {
      errors.push(`Row ${i + 2}: ${error.message}`);
    } else {
      successCount++;
    }
  }

  return { successCount, totalRows: rows.length, errors };
};

export const exportProducts = async (shopId) => {
  const { data: products, error: productError } = await supabase
    .from('product')
    .select('*')
    .eq('shop_id', shopId);

  if (productError) {
    throw new Error(`Failed to fetch products: ${productError.message}`);
  }

  // Fetch inventory to include stock-related fields
  const { data: inventoryData, error: inventoryError } = await supabase
    .from('inventory')
    .select('product_id, quantity_available')
    .eq('shop_id', shopId);

  const inventoryMap = {};
  if (!inventoryError && inventoryData) {
    inventoryData.forEach(inv => {
      inventoryMap[inv.product_id] = inv.quantity_available;
    });
  }

  if (!products || products.length === 0) {
    return 'shop_id,product_name,purchase_price,selling_price,gst_rate,quantity_available\n'; 
  }

  // Determine headers based on product keys
  const baseHeaders = ['id', 'shop_id', 'product_name', 'purchase_price', 'selling_price', 'gst_rate'];
  const firstProd = products[0] || {};
  const extraHeaders = Object.keys(firstProd).filter(k => !baseHeaders.includes(k));
  
  const finalHeaders = [...baseHeaders, ...extraHeaders, 'quantity_available'];
  const csvRows = [finalHeaders.join(',')];

  for (const p of products) {
    const rowValues = finalHeaders.map(header => {
      if (header === 'quantity_available') {
        return inventoryMap[p.id] || 0;
      }
      return `"${String(p[header] || '').replace(/"/g, '""')}"`;
    });
    csvRows.push(rowValues.join(','));
  }

  return csvRows.join('\n');
};

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
  const rows = parseCsv(csvText);
  let successCount = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Required fields check
    if (!row.product_name || row.stock_quantity === undefined || !row.unit || row.purchase_price === undefined || row.selling_price === undefined) {
      errors.push(`Row ${i + 2}: Missing required fields (product_name, stock_quantity, unit, purchase_price, selling_price)`);
      continue;
    }

    const stock = Number(row.stock_quantity);
    const purchase = Number(row.purchase_price);
    const sell = Number(row.selling_price);

    // Validate non-negative numbers
    if (isNaN(stock) || stock < 0) {
      errors.push(`Row ${i + 2}: stock_quantity must be a valid number >= 0`);
      continue;
    }
    if (isNaN(purchase) || purchase < 0) {
      errors.push(`Row ${i + 2}: purchase_price must be a valid number >= 0`);
      continue;
    }
    if (isNaN(sell) || sell < 0) {
      errors.push(`Row ${i + 2}: selling_price must be a valid number >= 0`);
      continue;
    }

    const productData = {
      shop_id: shopId,
      product_name: row.product_name,
      vendor_name: row.supplier || null,
      unit: row.unit,
      stock_quantity: stock,
      purchase_price: purchase,
      selling_price: sell
    };

    try {
      await productService.createProduct(productData);
      successCount++;
    } catch (error) {
      errors.push(`Row ${i + 2}: ${error.message}`);
    }
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

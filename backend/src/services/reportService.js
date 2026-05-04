import supabase from '../config/supabaseClient.js';

export const getSummary = async (shopId) => {
  if (!shopId) throw new Error("shop_id is required");

  // Fetch Invoices
  const { data: invoices, error: invError } = await supabase
    .from('invoice')
    .select('total_invoice_amount, invoice_status')
    .eq('shop_id', shopId);

  if (invError) throw new Error(`Summary Invoices failed: ${invError.message}`);

  // Fetch Completed Sales
  const { data: sales, error: saleError } = await supabase
    .from('sale')
    .select('id')
    .eq('shop_id', shopId)
    .eq('sale_status', 'completed');

  if (saleError) throw new Error(`Summary Sales failed: ${saleError.message}`);

  // Fetch Payments
  const { data: payments, error: payError } = await supabase
    .from('payment')
    .select('amount_paid')
    .eq('shop_id', shopId)
    .eq('payment_status', 'success');

  if (payError) throw new Error(`Summary Payments failed: ${payError.message}`);

  const totalBilled = (invoices || []).reduce((sum, inv) => sum + Number(inv.total_invoice_amount || 0), 0);
  const totalOrders = (sales || []).length;
  const avgOrderValue = totalOrders > 0 ? totalBilled / totalOrders : 0;
  const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
  const pendingAmount = Math.max(0, totalBilled - totalPaid);

  return {
    totalBilled,
    totalOrders,
    avgOrderValue,
    totalPaid,
    pendingAmount,
    netProfit: totalPaid // Temporarily using totalPaid per instruction guidelines
  };
};

export const getMonthlySales = async (shopId) => {
  if (!shopId) throw new Error("shop_id is required");

  const { data: invoices, error } = await supabase
    .from('invoice')
    .select('total_invoice_amount, invoice_date, id')
    .eq('shop_id', shopId);

  if (error) throw new Error(`Monthly Sales failed: ${error.message}`);

  // Get related payments for these invoices
  const { data: payments, error: payError } = await supabase
    .from('payment')
    .select('invoice_id, amount_paid')
    .eq('shop_id', shopId)
    .eq('payment_status', 'success');

  if (payError) throw new Error(`Monthly Payments failed: ${payError.message}`);

  const monthMap = {};

  // Setup last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthMap[monthStr] = { month: monthStr, sales: 0, paid: 0, pending: 0 };
  }

  (invoices || []).forEach(inv => {
    if (!inv.invoice_date) return;
    const d = new Date(inv.invoice_date);
    const monthStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    if (monthMap[monthStr]) {
      monthMap[monthStr].sales += Number(inv.total_invoice_amount || 0);
      
      // Map payments
      const relevantPayments = (payments || []).filter(p => p.invoice_id === inv.id);
      const paid = relevantPayments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
      
      monthMap[monthStr].paid += paid;
    }
  });

  Object.values(monthMap).forEach(m => {
    m.pending = Math.max(0, m.sales - m.paid);
  });

  return Object.values(monthMap);
};

export const getTopCategories = async (shopId) => {
  if (!shopId) throw new Error("shop_id is required");

  const { data: saleItems, error } = await supabase
    .from('sale_item')
    .select(`
      quantity,
      product(id, product_name)
    `)
    .eq('shop_id', shopId);

  if (error) throw new Error(`Top Categories failed: ${error.message}`);

  const categoryMap = {};

  (saleItems || []).forEach(item => {
    const name = item.product?.product_name || 'Miscellaneous';
    const qty = Number(item.quantity || 0);

    if (!categoryMap[name]) {
      categoryMap[name] = { category: name, quantity: 0 };
    }
    categoryMap[name].quantity += qty;
  });

  return Object.values(categoryMap).sort((a, b) => b.quantity - a.quantity);
};

export const getMargins = async (shopId) => {
  if (!shopId) throw new Error("shop_id is required");

  const { data: products, error } = await supabase
    .from('product')
    .select('product_name, selling_price, purchase_price')
    .eq('shop_id', shopId);

  if (error) throw new Error(`Margins failed: ${error.message}`);

  return (products || []).map(p => {
    const sell = Number(p.selling_price || 0);
    const purchase = Number(p.purchase_price || 0);
    let margin = 0;
    
    if (sell > 0) {
      margin = ((sell - purchase) / sell) * 100;
    }

    return {
      product_name: p.product_name,
      selling_price: sell,
      cost_price: purchase,
      margin_percentage: margin
    };
  });
};

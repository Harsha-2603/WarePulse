import supabase from '../config/supabaseClient.js';
import * as customerService from './customerService.js';

/**
 * AI Summary Service
 * Provides high-level business snapshots for Context-Aware AI responses.
 * These are "safe" summaries containing counts and aggregates, not raw customer data.
 */

export const getInventorySummary = async (shopId) => {
  const { count: totalProducts } = await supabase
    .from('product')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shopId);

  const { data: inventory } = await supabase
    .from('inventory')
    .select(`
      quantity_available,
      product:product_id (product_name, low_stock_level)
    `)
    .eq('shop_id', shopId);

  const lowStockItems = inventory?.filter(item => 
    item.quantity_available <= (item.product?.low_stock_level || 0)
  ).map(item => ({
    name: item.product?.product_name,
    stock: item.quantity_available,
    threshold: item.product?.low_stock_level
  })) || [];

  return {
    totalProducts: totalProducts || 0,
    lowStockCount: lowStockItems.length,
    lowStockDetails: lowStockItems.slice(0, 5) // Top 5 critical items
  };
};

export const getCustomerSummary = async (shopId) => {
  const totalCustomers = await customerService.getCustomerCount(shopId);

  // Get top 5 customers by sale volume
  const { data: topSales } = await supabase
    .from('sale')
    .select('customer_id, total_amount')
    .eq('shop_id', shopId)
    .not('customer_id', 'is', null);

  const customerTotals = (topSales || []).reduce((acc, sale) => {
    acc[sale.customer_id] = (acc[sale.customer_id] || 0) + Number(sale.total_amount);
    return acc;
  }, {});

  return {
    totalCustomers: totalCustomers || 0,
    topCustomerCount: Object.keys(customerTotals).length
  };
};

export const getVendorSummary = async (shopId) => {
  const { count: totalVendors } = await supabase
    .from('vendor')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shopId);

  // Get purchases for detailed analysis
  const { data: purchases } = await supabase
    .from('purchase')
    .select(`
      vendor_id, 
      total_amount, 
      payment_status, 
      payment_due_date,
      vendor:vendor_id (vendor_name)
    `)
    .eq('shop_id', shopId);

  const pList = purchases || [];
  
  // Calculate top vendors by volume
  const vTotals = pList.reduce((acc, p) => {
    const name = p.vendor?.vendor_name || 'Unknown Vendor';
    acc[name] = (acc[name] || 0) + Number(p.total_amount);
    return acc;
  }, {});

  const topVendors = Object.entries(vTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, total]) => `${name} (₹${total.toLocaleString()})`);

  // Financial status with vendors
  const now = new Date();
  const pendingVendorPayments = pList
    .filter(p => p.payment_status === 'pending' || p.payment_status === 'partial')
    .reduce((sum, p) => sum + Number(p.total_amount), 0);

  const overdueInvoicesCount = pList.filter(p => {
    if (p.payment_status === 'paid' || !p.payment_due_date) return false;
    return new Date(p.payment_due_date) < now;
  }).length;

  return {
    totalVendors: totalVendors || 0,
    topVendors,
    pendingVendorPayments,
    overdueInvoicesCount
  };
};

export const getFinancialSummary = async (shopId) => {
  const { data: allSales } = await supabase
    .from('sale')
    .select('total_amount, sale_date, payment_status')
    .eq('shop_id', shopId);

  const sales = allSales || [];
  
  const totalSalesValue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const paymentsReceived = sales
    .filter(s => s.payment_status === 'paid')
    .reduce((sum, s) => sum + Number(s.total_amount), 0);
  const pendingPayments = sales
    .filter(s => s.payment_status === 'pending' || s.payment_status === 'partial')
    .reduce((sum, s) => sum + Number(s.total_amount), 0);
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyRevenue = sales.filter(s => {
    const d = new Date(s.sale_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && s.payment_status === 'paid';
  }).reduce((sum, s) => sum + Number(s.total_amount), 0);

  return {
    totalSalesValue,
    paymentsReceived,
    pendingPayments,
    monthlyRevenue,
    salesCount: sales.length
  };
};

export const getGlobalBusinessSnapshot = async (shopId) => {
  const [inventory, customers, vendors, finance] = await Promise.all([
    getInventorySummary(shopId),
    getCustomerSummary(shopId),
    getVendorSummary(shopId),
    getFinancialSummary(shopId)
  ]);

  return {
    inventory,
    customers,
    vendors,
    finance
  };
};

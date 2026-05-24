import supabase from '../config/supabaseClient.js';

export const getAllCustomers = async (shopId) => {
  try {
    if (!shopId) throw new Error('shop_id is required');

    const { data: customers, error: customerError } = await supabase
      .from('customer')
      .select('*')
      .eq('shop_id', shopId);

    if (customerError) throw new Error(`Failed to fetch customers: ${customerError.message}`);

    const { data: sales, error: salesError } = await supabase
      .from('sale')
      .select('customer_id, total_amount')
      .eq('shop_id', shopId)
      .eq('sale_status', 'completed');

    if (salesError) throw new Error(`Failed to fetch sales: ${salesError.message}`);

    const customerStats = {};
    (sales || []).forEach(sale => {
      if (!sale.customer_id) return;
      if (!customerStats[sale.customer_id]) {
        customerStats[sale.customer_id] = { total_orders: 0, total_spent: 0 };
      }
      customerStats[sale.customer_id].total_orders += 1;
      customerStats[sale.customer_id].total_spent += Number(sale.total_amount || 0);
    });

    const enrichedCustomers = (customers || []).map(c => ({
      ...c,
      total_orders: customerStats[c.id]?.total_orders || 0,
      total_spent: customerStats[c.id]?.total_spent || 0
    }));

    return enrichedCustomers;
  } catch (error) {
    throw error;
  }
};

const getCustomerStats = async (customerId, shopId) => {
  const { data: sales, error: salesError } = await supabase
    .from('sale')
    .select('total_amount')
    .eq('customer_id', customerId)
    .eq('shop_id', shopId)
    .eq('sale_status', 'completed');

  if (salesError) throw new Error(`Failed to fetch sales for customer: ${salesError.message}`);

  const total_orders = (sales || []).length;
  const total_spent = (sales || []).reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);

  return { total_orders, total_spent };
};

export const getCustomerCount = async (shopId) => {
  const { count, error } = await supabase
    .from('customer')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shopId);
  
  if (error) throw new Error(`Count failed: ${error.message}`);
  return count || 0;
};

export const createCustomer = async (data) => {
  try {
    const { shop_id, customer_name, ...otherData } = data;

    if (!shop_id) throw new Error('shop_id is required');
    if (!customer_name) throw new Error('customer_name is required');

    const { data: customer, error } = await supabase
      .from('customer')
      .insert([{ shop_id, customer_name, ...otherData }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create customer: ${error.message}`);

    return {
      ...customer,
      total_orders: 0,
      total_spent: 0
    };
  } catch (error) {
    throw error;
  }
};

export const getCustomerById = async (id, shopId) => {
  try {
    if (!id) throw new Error('id is required');
    if (!shopId) throw new Error('shop_id is required');

    const { data: customer, error: customerError } = await supabase
      .from('customer')
      .select('*')
      .eq('id', id)
      .eq('shop_id', shopId)
      .single();

    if (customerError) throw new Error(`Failed to find customer: ${customerError.message}`);

    const stats = await getCustomerStats(id, shopId);

    return {
      ...customer,
      ...stats
    };
  } catch (error) {
    throw error;
  }
};

export const updateCustomer = async (id, shopId, data) => {
  try {
    if (!id) throw new Error('id is required');
    if (!shopId) throw new Error('shop_id is required');

    const updateData = { ...data };
    delete updateData.shop_id;
    delete updateData.total_orders;
    delete updateData.total_spent;
    delete updateData.totalOrders;
    delete updateData.totalPurchase;

    const { data: updatedCustomer, error } = await supabase
      .from('customer')
      .update(updateData)
      .eq('id', id)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update customer: ${error.message}`);

    const stats = await getCustomerStats(id, shopId);

    return {
      ...updatedCustomer,
      ...stats
    };
  } catch (error) {
    throw error;
  }
};

export const deleteCustomer = async (id, shopId) => {
  try {
    if (!id) throw new Error('id is required');
    if (!shopId) throw new Error('shop_id is required');

    const { error } = await supabase
      .from('customer')
      .delete()
      .eq('id', id)
      .eq('shop_id', shopId);

    if (error) throw new Error(`Failed to delete customer: ${error.message}`);

    return { success: true, deletedId: id };
  } catch (error) {
    throw error;
  }
};

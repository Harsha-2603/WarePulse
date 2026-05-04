import supabase from '../config/supabaseClient.js';

export const getAllCustomers = async (shopId) => {
  try {
    if (!shopId) throw new Error('shop_id is required');

    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .eq('shop_id', shopId);

    if (error) throw new Error(`Failed to fetch customers: ${error.message}`);
    
    return data;
  } catch (error) {
    throw error;
  }
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

    return customer;
  } catch (error) {
    throw error;
  }
};

export const getCustomerById = async (id, shopId) => {
  try {
    if (!id) throw new Error('id is required');
    if (!shopId) throw new Error('shop_id is required');

    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .eq('id', id)
      .eq('shop_id', shopId)
      .single();

    if (error) throw new Error(`Failed to find customer: ${error.message}`);

    return data;
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

    const { data: updatedCustomer, error } = await supabase
      .from('customer')
      .update(updateData)
      .eq('id', id)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update customer: ${error.message}`);

    return updatedCustomer;
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

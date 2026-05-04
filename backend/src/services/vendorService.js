import supabase from '../config/supabaseClient.js';

/**
 * UNIFIED HELPER: Aggregates vendor metadata with latest purchase data.
 * No database-side joins used to ensure performance and flexibility.
 */
const fetchEnhancedVendors = async (shopId, vendorId = null) => {
  // 1. Fetch vendors by shop_id
  let query = supabase.from('vendor').select('*').eq('shop_id', shopId);
  if (vendorId) query = query.eq('id', vendorId);
  
  const { data: vendors, error: vError } = await query;
  if (vError) throw new Error(`Fetch vendors failed: ${vError.message}`);
  if (!vendors || vendors.length === 0) return vendorId ? null : [];

  // 2. Fetch purchases for those vendor IDs
  const vendorIds = vendors.map(v => v.id);
  const { data: purchases, error: pError } = await supabase
    .from('purchase')
    .select('*')
    .in('vendor_id', vendorIds)
    .eq('shop_id', shopId)
    // 4. Picking the latest: Sort by created_at DESC primarily
    .order('created_at', { ascending: false });

  if (pError) console.error("Aggregation Purchase Fetch Support Warning:", pError.message);

  // 3. Group and 4. Choose Latest (with fallback)
  const purchaseMap = new Map();
  if (purchases) {
    purchases.forEach(p => {
      if (!purchaseMap.has(p.vendor_id)) {
        purchaseMap.set(p.vendor_id, p);
      } else {
        // Fallback: If created_at is identical, choose higher purchase_date
        const existing = purchaseMap.get(p.vendor_id);
        if (p.created_at === existing.created_at) {
          if (new Date(p.purchase_date) > new Date(existing.purchase_date)) {
            purchaseMap.set(p.vendor_id, p);
          }
        }
      }
    });
  }

  // 5. Map results to frontend contract
  const mappedResults = vendors.map(v => {
    const latest = purchaseMap.get(v.id);
    return {
      ...v,
      // Aggregated fields for frontend consumption
      name: v.vendor_name || v.name,
      gstNumber: v.gst_number || v.gstNumber,
      invoiceCost: latest ? latest.subtotal : 0,
      discount: latest ? latest.discount_amount : 0,
      totalToPay: latest ? latest.total_amount : 0,
      recDate: latest ? latest.purchase_date : null,
      deadline: latest ? latest.payment_due_date : null,
      purchaseId: latest ? latest.id : null,
      status: latest ? latest.payment_status : 'Pending',
      createdAt: v.created_at,
      bankDetails: {
        account: v.bank_account_number,
        ifsc: v.bank_ifsc_code,
        branch: v.bank_branch_name
      }
    };
  });

  return vendorId ? mappedResults[0] : mappedResults;
};

/**
 * Standard CRUD Operations utilizing the unified helper
 */

export const getAllVendors = async (shopId) => {
  return await fetchEnhancedVendors(shopId);
};

export const getVendorById = async (id, shopId) => {
  return await fetchEnhancedVendors(shopId, id);
};

export const createVendor = async (data) => {
  try {
    const { shop_id, vendor_name, ...otherData } = data;
    if (!shop_id) throw new Error('shop_id is required');
    if (!vendor_name) throw new Error('vendor_name is required');

    // Remove any accidental invoice fields from payload
    const { invoiceCost, discount, recDate, deadline, purchaseId, status, bankDetails, totalToPay, ...vendorFields } = otherData;

    // Safeguard: Duplicate GST check
    if (vendorFields.gst_number) {
      const { data: existing } = await supabase
        .from('vendor')
        .select('id')
        .eq('shop_id', shop_id)
        .eq('gst_number', vendorFields.gst_number)
        .maybeSingle();
      if (existing) return await fetchEnhancedVendors(shop_id, existing.id);
    }

    // 1. Insert the vendor
    const { data: created, error: vError } = await supabase
      .from('vendor')
      .insert([{ shop_id, vendor_name, ...vendorFields }])
      .select('id')
      .single();

    if (vError) throw new Error(`Vendor creation failed: ${vError.message}`);

    // Return enriched object
    return await fetchEnhancedVendors(shop_id, created.id);
  } catch (error) {
    throw error;
  }
};

export const updateVendor = async (id, shopId, data) => {
  try {
    const { 
      invoiceCost, discount, totalToPay, recDate, deadline, 
      purchaseId, status, bankDetails, ...vendorFields 
    } = data;
    
    const { error } = await supabase
      .from('vendor')
      .update(vendorFields)
      .eq('id', id)
      .eq('shop_id', shopId);

    if (error) throw new Error(`Vendor update failed: ${error.message}`);
    return await fetchEnhancedVendors(shopId, id);
  } catch (error) {
    throw error;
  }
};

export const deleteVendor = async (id, shopId) => {
  try {
    const { error } = await supabase
      .from('vendor')
      .delete()
      .eq('id', id)
      .eq('shop_id', shopId);
    if (error) throw new Error(`Vendor deletion failed: ${error.message}`);
    return { success: true, deletedId: id };
  } catch (error) {
    throw error;
  }
};

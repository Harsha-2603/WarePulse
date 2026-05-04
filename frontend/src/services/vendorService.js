import api from './api';

/**
 * Frontend service for managing vendors (Invoices)
 * Handles mapping between frontend camelCase (with nested bankDetails) 
 * and backend snake_case database structure.
 */

const mapInbound = (v) => {
  const mappedItem = {
    ...v,
    id: v.id,
    name: v.vendor_name ?? v.name,
    phone: v.phone,
    email: v.email,
    gstNumber: v.gst_number,
    invoiceCost: Number(v.invoiceCost ?? v.invoice_cost ?? 0),
    discount: Number(v.discount ?? 0),
    totalToPay: Number(v.totalToPay ?? v.total_to_pay ?? 0),
    lastPurchaseDate: v.recDate ?? v.last_purchase_date ?? null,
    // Safely mapping legacy names for robust backwards compat:
    receivedDate: v.recDate ?? v.last_purchase_date ?? v.purchase_date ?? v.received_date,
    deadline: v.deadline ?? v.payment_due_date,
    purchaseId: v.purchaseId ?? null,
    status: v.is_active === false ? 'Paid' : (v.payment_status ?? v.status ?? 'Pending'),
    createdAt: v.createdAt ?? null,
    bankDetails: {
      account: v.bank_account_number ?? v.bankDetails?.account,
      ifsc: v.bank_ifsc_code ?? v.bankDetails?.ifsc,
      branch: v.bank_branch_name ?? v.bankDetails?.branch
    },
    shop_id: v.shop_id
  };

  return mappedItem;
};

const mapVendorOutbound = (v) => {
  return Object.fromEntries(
    Object.entries({
      vendor_name: v.name || v.vendor_name,
      gst_number: v.gstNumber || v.gst_number,
      phone: v.phone,
      email: v.email,
      bank_account_number: v.bankDetails?.account || v.bankAccount || v.bank_account_number,
      bank_ifsc_code: v.bankDetails?.ifsc?.toUpperCase() || v.ifsc || v.bank_ifsc_code,
      bank_branch_name: v.bankDetails?.branch || v.bankBranch || v.bank_branch_name,
      is_active: v.status === 'Paid' ? false : (v.is_active ?? true)
    }).filter(([_, val]) => val !== undefined && val !== null && val !== '')
  );
};

const mapPurchaseOutbound = (v, vendorId) => {
  return Object.fromEntries(
    Object.entries({
      vendor_id: vendorId,
      purchase_date: v.receivedDate || v.received_date || new Date().toISOString().split('T')[0],
      payment_due_date: v.deadline || v.payment_due_date,
      invoice_number: v.invoiceNumber || v.invoice_number,
      subtotal: Number(v.cost ?? v.invoiceCost ?? v.subtotal ?? 0),
      discount_amount: Number(v.discount ?? v.discount_amount ?? 0),
      tax_amount: Number(v.tax_amount ?? v.tax ?? 0),
      total_amount: Number(v.finalAmount ?? v.totalToPay ?? v.total_amount ?? v.total ?? 0),
      payment_status: v.status || 'pending'
    }).filter(([_, val]) => val !== undefined && val !== null && val !== '' && !Number.isNaN(val))
  );
};

const vendorService = {
  // GET all vendors (now backend aggregates purchase totals intelligently)
  getAllVendors: async () => {
    try {
      const { data: vendors } = await api.get('/vendors?ts=' + Date.now(), { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log("VENDOR API RESPONSE", vendors);

      return (vendors || []).map(vendor => {
        const mappedData = mapInbound(vendor);
        return mappedData;
      });
    } catch (error) {
      console.error("VENDOR SERVICE ERROR (getAllVendors):", error);
      throw error;
    }
  },

  // GET vendor by ID
  getVendorById: async (id) => {
    try {
      const { data: vendor } = await api.get(`/vendors/${id}`);
      console.log("VENDOR API RESPONSE", vendor);

      const mappedData = mapInbound(vendor);
      return mappedData;
    } catch (error) {
      console.error(`VENDOR SERVICE ERROR (getVendorById ${id}):`, error);
      throw error;
    }
  },

  // POST new vendor (also creates initial purchase row to satisfy frontend expectations)
  createVendor: async (vendorData) => {
    try {
      const vendorPayload = mapVendorOutbound(vendorData);
      console.log("VENDOR SERVICE: POST /vendors", vendorPayload);
      const { data: newVendor } = await api.post('/vendors', vendorPayload);
      console.log("VENDOR SERVICE: POST response", newVendor);
      
      const mapped = mapInbound(newVendor);
      return mapped;
    } catch (error) {
      console.error("VENDOR SERVICE ERROR (createVendor):", error);
      throw error;
    }
  },

  // PUT update existing vendor
  updateVendor: async (id, vendorData) => {
    try {
      const vendorPayload = mapVendorOutbound(vendorData);
      console.log("VENDOR SERVICE: PUT /vendors/" + id, vendorPayload);
      const { data } = await api.put(`/vendors/${id}`, vendorPayload);
      const mapped = mapInbound(data);
      return mapped;
    } catch (error) {
      console.error(`VENDOR SERVICE ERROR (updateVendor ${id}):`, error);
      throw error;
    }
  },

  // DELETE vendor
  deleteVendor: async (id) => {
    try {
      const { data } = await api.delete(`/vendors/${id}`);
      return data;
    } catch (error) {
      console.error(`VENDOR SERVICE ERROR (deleteVendor ${id}):`, error);
      throw error;
    }
  }
};

console.log("vendorService loaded");

export default vendorService;

import supabase from '../config/supabaseClient.js';

export const createInvoice = async (invoiceData) => {
  let { 
    shop_id, 
    sale_id, 
    invoice_number, 
    invoice_date, 
    cgst_amount, 
    sgst_amount, 
    igst_amount, 
    total_invoice_amount, 
    payment_mode, 
    invoice_status
  } = invoiceData;

  if (!sale_id) throw new Error("sale_id is required");
  if (total_invoice_amount === undefined) {
    throw new Error("total_invoice_amount is required");
  }

  const { data: existing, error: checkError } = await supabase
    .from('invoice')
    .select('id')
    .eq('sale_id', sale_id)
    .maybeSingle();

  if (checkError) throw new Error(`Failed to check duplicate invoice: ${checkError.message}`);
  if (existing) {
    console.log(`Invoice already generated for sale ${sale_id}`);
    return existing;
  }

  invoice_number = invoice_number || `INV-${Date.now()}`;
  cgst_amount = cgst_amount ?? 0;
  sgst_amount = sgst_amount ?? 0;
  igst_amount = igst_amount ?? 0;

  const { data: invoice, error } = await supabase
    .from('invoice')
    .insert([{ 
      shop_id, 
      sale_id, 
      invoice_number,
      invoice_date: invoice_date || new Date().toISOString(),
      cgst_amount,
      sgst_amount,
      igst_amount,
      total_invoice_amount,
      payment_mode,
      invoice_status
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invoice: ${error.message}`);
  }

  return invoice;
};

export const createPayment = async (paymentData) => {
  const { shop_id, invoice_id, payment_mode, amount_paid, reference_number, payment_date, notes } = paymentData;

  if (!shop_id) throw new Error("shop_id is required");
  if (!invoice_id) throw new Error("invoice_id is required");
  if (amount_paid === undefined) throw new Error("amount_paid is required");
  if (!payment_mode) throw new Error("payment_mode is required");

  let sanitizedMode = (payment_mode || 'cash').toLowerCase().replace(' ', '_');
  if (!['cash', 'upi', 'bank_transfer', 'card', 'credit'].includes(sanitizedMode)) {
    sanitizedMode = 'cash';
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoice')
    .select('id, sale_id, total_invoice_amount, invoice_status')
    .eq('id', invoice_id)
    .single();

  if (invoiceError) throw new Error(`Failed to fetch invoice info: ${invoiceError.message}`);

  const { data: existingPayments, error: payError } = await supabase
    .from('payment')
    .select('amount_paid')
    .eq('invoice_id', invoice_id)
    .eq('payment_status', 'success');

  if (payError) throw new Error(`Failed to check historical payments: ${payError.message}`);

  const totalPaidBefore = (existingPayments || []).reduce((sum, p) => sum + Number(p.amount_paid), 0);
  
  if (totalPaidBefore >= Number(invoice.total_invoice_amount) || invoice.invoice_status === 'paid') {
    console.log(`Invoice ${invoice_id} is already fully paid.`);
    
    if (invoice.invoice_status !== 'paid') {
      await supabase
        .from('invoice')
        .update({ invoice_status: 'paid', payment_mode: sanitizedMode })
        .eq('id', invoice_id);
        
      if (invoice.sale_id) {
        await supabase
          .from('sale')
          .update({ payment_status: 'paid' })
          .eq('id', invoice.sale_id);
      }
      console.log("ENFORCED LATE PAID STATUS CASCADE");
    }
    
    return { alreadyPaid: true };
  }

  const { data: payment, error: paymentError } = await supabase
    .from('payment')
    .insert([{ 
      shop_id,  
      invoice_id, 
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      payment_mode: sanitizedMode, 
      amount_paid, 
      reference_number: reference_number || null,
      payment_status: 'success',
      notes: notes || null
    }])
    .select()
    .single();

  if (paymentError) {
    throw new Error(`Failed to create payment: ${paymentError.message}`);
  }

  console.log("PAYMENT CREATED");
  console.log("payment insert response", JSON.stringify(payment));

  const totalPaidSoFar = totalPaidBefore + Number(amount_paid);
  const isFullyPaid = totalPaidSoFar >= Number(invoice.total_invoice_amount);

  const targetInvoiceStatus = isFullyPaid ? 'paid' : 'partially_paid';
  const targetSaleStatus = isFullyPaid ? 'paid' : 'partial';

  const { error: updateInvoiceError } = await supabase
    .from('invoice')
    .update({ invoice_status: targetInvoiceStatus, payment_mode: sanitizedMode })
    .eq('id', invoice_id);

  if (updateInvoiceError) throw new Error(`Failed to update invoice: ${updateInvoiceError.message}`);
  console.log("INVOICE STATUS UPDATED");
  console.log("invoice update response", targetInvoiceStatus);

  if (invoice && invoice.sale_id) {
    const { error: updateSaleError } = await supabase
      .from('sale')
      .update({ payment_status: targetSaleStatus })
      .eq('id', invoice.sale_id);

    if (updateSaleError) throw new Error(`Failed to update sale status: ${updateSaleError.message}`);
    console.log("SALE PAYMENT STATUS UPDATED");
  }

  return payment;
};

export const getAllInvoices = async (shopId) => {
  if (!shopId) throw new Error("shop_id is required");

  const { data, error } = await supabase
    .from('invoice')
    .select(`
      *,
      sale(
        id,
        payment_status,
        customer(id, customer_name)
      )
    `)
    .eq('shop_id', shopId)
    .order('invoice_date', { ascending: false });

  if (error) {
    console.log("EXACT SUPABASE ERROR", error.message);
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }

  const formatted = (data || []).map(inv => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    customer_name: inv.sale?.customer?.customer_name || 'Walk-in Customer',
    invoice_date: inv.invoice_date ? inv.invoice_date.split('T')[0] : '',
    total_amount: inv.total_invoice_amount,
    payment_mode: inv.payment_mode || 'N/A',
    invoice_status: inv.invoice_status,
    payment_status: inv.sale?.payment_status || 'pending',
    sale_id: inv.sale_id
  }));

  console.log("BILLING FETCH RESPONSE", JSON.stringify(formatted));

  return formatted;
};

export const getSalesReport = async (shopId) => {
  if (!shopId) throw new Error("shop_id is required");

  const { data: sales, error } = await supabase
    .from('sale')
    .select('*')
    .eq('shop_id', shopId);

  if (error) {
    throw new Error(`Failed to fetch sales report: ${error.message}`);
  }

  let totalCount = 0;
  let totalAmount = 0;
  let totalPaid = 0;
  let totalPending = 0;

  if (sales && sales.length > 0) {
    totalCount = sales.length;
    for (const sale of sales) {
      const amount = Number(sale.total_amount) || 0;
      totalAmount += amount;
      
      const status = (sale.payment_status || '').toLowerCase();
      if (status === 'paid') {
        totalPaid += amount;
      } else if (status === 'pending') {
        totalPending += amount;
      }
    }
  }

  return {
    shop_id: shopId,
    total_sales_count: totalCount,
    total_sales_amount: totalAmount,
    total_paid_amount: totalPaid,
    total_pending_amount: totalPending
  };
};

export const getPurchaseReport = async (shopId) => {
  if (!shopId) throw new Error("shop_id is required");

  const { data: purchases, error } = await supabase
    .from('purchase')
    .select('*')
    .eq('shop_id', shopId);

  if (error) {
    throw new Error(`Failed to fetch purchase report: ${error.message}`);
  }

  let totalCount = 0;
  let totalAmount = 0;
  let totalPaid = 0;
  let totalPending = 0;

  if (purchases && purchases.length > 0) {
    totalCount = purchases.length;
    for (const purchase of purchases) {
      const amount = Number(purchase.total_amount) || 0;
      totalAmount += amount;
      
      const status = (purchase.payment_status || '').toLowerCase();
      if (status === 'paid') {
        totalPaid += amount;
      } else if (status === 'pending') {
        totalPending += amount;
      }
    }
  }

  return {
    shop_id: shopId,
    total_purchase_count: totalCount,
    total_purchase_amount: totalAmount,
    total_paid_amount: totalPaid,
    total_pending_amount: totalPending
  };
};
export const updateInvoicePaymentMode = async (invoiceId, paymentMode) => {
  if (!invoiceId) throw new Error("invoice_id is required");
  if (!paymentMode) throw new Error("payment_mode is required");

  let sanitizedMode = (paymentMode || 'cash').toLowerCase().replace(' ', '_');
  if (!['cash', 'upi', 'bank_transfer', 'card', 'credit'].includes(sanitizedMode)) {
    sanitizedMode = 'cash';
  }

  const { data, error } = await supabase
    .from('invoice')
    .update({ payment_mode: sanitizedMode })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update invoice payment mode: ${error.message}`);
  return data;
};

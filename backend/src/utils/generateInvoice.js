/**
 * Utility functions for invoice formatting and generation
 */

/**
 * Generates a unique invoice string using the current timestamp.
 * @returns {string} e.g. "INV-168128328123"
 */
export const generateInvoiceNumber = () => {
  return `INV-${Date.now()}`;
};

/**
 * Formats raw invoice, sale, and item data into a structured printable layout.
 * 
 * @param {Object} invoice - The core invoice record
 * @param {Object} sale - The parent sale record
 * @param {Array} items - The list of purchased items attached to the sale
 * @returns {Object} Structured invoice for display/printing
 */
export const formatInvoiceData = (invoice, sale, items = []) => {
  if (!invoice || !sale) {
    throw new Error('Both invoice and sale data are required to format an invoice');
  }

  const formattedItems = items.map(item => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price_per_unit) || 0;
    
    return {
      productId: item.product_id,
      quantity: qty,
      pricePerUnit: price.toFixed(2),
      totalItemPrice: (qty * price).toFixed(2)
    };
  });

  return {
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleString() : 'N/A',
    shopId: invoice.shop_id,
    
    customerDetails: {
      customerId: sale.customer_id
    },
    saleDetails: {
      saleId: sale.id,
      saleDate: sale.sale_date ? new Date(sale.sale_date).toLocaleString() : 'N/A',
      paymentStatus: sale.payment_status || 'pending'
    },
    
    items: formattedItems,
    
    billingSummary: {
      cgst: Number(invoice.cgst_amount || 0).toFixed(2),
      sgst: Number(invoice.sgst_amount || 0).toFixed(2),
      igst: Number(invoice.igst_amount || 0).toFixed(2),
      totalAmount: Number(invoice.total_invoice_amount || 0).toFixed(2),
      paymentMode: invoice.payment_mode || 'N/A',
      status: invoice.invoice_status || 'draft'
    }
  };
};

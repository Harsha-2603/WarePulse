import * as billingService from '../services/billingService.js';
import { isAdmin, hasRole } from '../middleware/authMiddleware.js';

export const getInvoices = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const invoices = await billingService.getAllInvoices(shopId);

    return res.status(200).json(invoices);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const extractShopId = (req) => {
  return req.user?.shop_id || req.headers['x-shop-id'] || req.params.shop_id || req.query.shop_id || req.body.shop_id;
};

export const createInvoice = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    // Future RBAC: const userRole = req.user?.role;
    // if (!isAdmin(req) && !hasRole(req, ['manager'])) { /* block */ }

    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });
    if (!req.body.sale_id) return res.status(400).json({ success: false, message: 'sale_id is required' });
    const invoiceData = { ...req.body, shop_id: shopId };
    const invoice = await billingService.createInvoice(invoiceData);

    return res.status(201).json({
      success: true,
      invoice_id: invoice.id,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const shopId = extractShopId(req);
    // Future RBAC: const userRole = req.user?.role;
    // if (!isAdmin(req) && !hasRole(req, ['manager'])) { /* block */ }

    if (!shopId) return res.status(400).json({ success: false, message: 'shop_id is required' });

    const { invoice_id, payment_mode, amount_paid, reference_number, payment_date } = req.body;

    if (!invoice_id) return res.status(400).json({ success: false, message: 'invoice_id is required' });
    if (!payment_mode) return res.status(400).json({ success: false, message: 'payment_mode is required' });
    if (amount_paid === undefined) return res.status(400).json({ success: false, message: 'amount_paid is required' });

    const paymentData = {
      shop_id: shopId,
      invoice_id,
      payment_mode,
      amount_paid,
      reference_number,
      payment_date
    };

    const payment = await billingService.createPayment(paymentData);

    return res.status(201).json({
      success: true,
      payment_id: payment.id,
      message: 'Payment recorded successfully'
    });

  } catch (error) {
    const isVal = error.message.toLowerCase().includes('require') || error.message.toLowerCase().includes('invalid') || error.message.includes('stock') || error.message.includes('allow') || error.message.includes('negative');
    return res.status(isVal ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const updateInvoicePaymentMode = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_mode } = req.body;

    if (!id) return res.status(400).json({ success: false, message: 'id is required' });
    if (!payment_mode) return res.status(400).json({ success: false, message: 'payment_mode is required' });

    const invoice = await billingService.updateInvoicePaymentMode(id, payment_mode);

    return res.status(200).json({
      success: true,
      invoice,
      message: 'Invoice payment mode updated successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useInvoices } from '../../contexts/InvoiceContext';
import { useOrders } from '../../contexts/OrderContext';

const CreateInvoiceModal = ({ isOpen, onClose }) => {
  const { addInvoice } = useInvoices() || {};
  const { orders = [] } = useOrders() || {}; // To pull real pending orders
  
  const [formData, setFormData] = useState({
    orderId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    paymentMode: '',
    transactionId: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Find selected order to map dynamic customer/amount
  const selectedOrder = orders.find(o => o.id === formData.orderId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrder || !formData.paymentMode) return;
    
    addInvoice({
      orderId: selectedOrder.id,
      customer: selectedOrder.customer,
      amount: selectedOrder.amount, // Inherited exactly from order
      date: formData.invoiceDate,
      status: formData.paymentMode === 'Credit' ? 'Pending' : 'Paid',
      paymentMode: formData.paymentMode,
      transactionId: formData.transactionId,
      notes: formData.notes
    });
    
    // Reset and close
    setFormData({ orderId: '', invoiceDate: new Date().toISOString().split('T')[0], paymentMode: '', transactionId: '', notes: '' });
    onClose();
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} type="button">Generate Invoice</Button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create New Invoice" 
      size="md"
      footer={footer}
    >
      <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
        {/* Core Invoice Info */}
        <div className="space-y-1.5 list-none">
          <label className="text-sm font-medium text-slate-700">Select Order</label>
          <select 
            name="orderId" 
            value={formData.orderId} 
            onChange={handleChange} 
            required
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select Pending Order...</option>
            {orders.map(order => (
              <option key={order.id} value={order.id}>
                {order.id} (₹{order.amount.toLocaleString()}) - {order.customer}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Customer</label>
            <Input value={selectedOrder ? selectedOrder.customer : ''} placeholder="Auto-filled from order" disabled className="bg-slate-50 text-slate-500" />
          </div>
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Invoice Date</label>
            <Input name="invoiceDate" value={formData.invoiceDate} onChange={handleChange} type="date" required />
          </div>
        </div>

        {/* Payment Details */}
        <div className="border-t border-slate-100 pt-4 mt-2">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Payment Record</h4>
          <div className="space-y-4">
            <div className="space-y-1.5 list-none">
              <label className="text-sm font-medium text-slate-700">Payment Mode</label>
              <select 
                name="paymentMode"
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.paymentMode}
                onChange={handleChange}
                required
              >
                <option value="">Select Payment Method...</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit">On Credit (Pending)</option>
              </select>
            </div>
            
            {(formData.paymentMode === 'Bank Transfer' || formData.paymentMode === 'UPI' || formData.paymentMode === 'Cheque') && (
              <div className="space-y-1.5 list-none animate-in slide-in-from-top-2 duration-200">
                <label className="text-sm font-medium text-slate-700">Transaction ID / Cheque No.</label>
                <Input name="transactionId" value={formData.transactionId} onChange={handleChange} placeholder="Enter reference number..." className="font-mono text-sm" />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-2">
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Notes / Terms (Optional)</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[80px] resize-none"
              placeholder="Add payment terms or notes to appear on invoice..."
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateInvoiceModal;

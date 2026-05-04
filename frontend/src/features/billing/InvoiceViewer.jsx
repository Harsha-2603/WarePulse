import React from 'react';
import { Store } from 'lucide-react';

export const InvoiceViewer = ({ order, id = "order-invoice-content" }) => {
  if (!order) return null;

  // Calculate mock values for display based on the simple context data
  const subtotal = order.amount / 1.05;
  const gst = order.amount - subtotal;
  
  // Mock items list if order doesn't have one (for demo purposes)
  const items = order.itemDetails || [
    { name: 'Electronics - Premium Desktop (Units)', qty: Math.floor(order.items / 2) + 1, price: 1350, total: Math.floor(order.amount * 0.7) },
    { name: 'Apparel Premium - Winter Jacket (Units)', qty: Math.ceil(order.items / 2), price: 1100, total: order.amount - Math.floor(order.amount * 0.7) }
  ];

  return (
    <div className="bg-white p-8 min-h-[600px]" id={id}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #${id}, #${id} * { visibility: visible; }
          #${id} { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; padding: 20mm; }
          .prt-hide { display: none !important; }
        }
      `}} />

      {/* Invoice Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">Sri Sai Wholesale Dealers</h1>
            <p className="text-sm text-slate-500 font-medium">GSTIN: 36AADCS7777P1Z5</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black text-slate-200 uppercase tracking-widest mb-1">INVOICE</h2>
          <p className="text-sm font-semibold text-slate-700">#{order.id}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">From</h3>
          <p className="font-semibold text-slate-900">Sri Sai Wholesale Dealers</p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            15-4-12, Begum Bazaar<br />
            Hyderabad, Telangana 500012<br />
            Ph: +91 9988776655
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</h3>
          <p className="font-semibold text-slate-900">{order.customer}</p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Hyderabad, Telangana<br />
            Ph: +91 91234 56789<br />
            Order Date: {new Date(order.date).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-50">
              <th className="py-3 px-2 font-semibold text-slate-700">Item</th>
              <th className="py-3 px-2 font-semibold text-slate-700 text-right">Qty</th>
              <th className="py-3 px-2 font-semibold text-slate-700 text-right">Price</th>
              <th className="py-3 px-2 font-semibold text-slate-700 text-right pr-4">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4 px-2 text-slate-800 font-medium">{item.name}</td>
                <td className="py-4 px-2 text-slate-600 text-right">{item.qty}</td>
                <td className="py-4 px-2 text-slate-600 text-right">₹{item.price.toLocaleString()}</td>
                <td className="py-4 px-2 text-slate-800 font-medium text-right pr-4">₹{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 font-medium">Subtotal</span>
            <span className="text-slate-900 font-semibold">₹{subtotal.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span className="font-medium">Tax (GST)</span>
            <span>₹{gst.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t border-slate-800 mt-2">
            <span className="text-base font-bold text-slate-900">Total Amount</span>
            <span className="text-xl font-black text-indigo-700">₹{order.amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-16 pt-6 border-t border-slate-200 text-[10px] text-slate-400">
        <p>1. Prices are inclusive of all taxes unless specified.</p>
        <p>2. Final billing is subject to stock availability.</p>
      </div>
    </div>
  );
};

export default InvoiceViewer;

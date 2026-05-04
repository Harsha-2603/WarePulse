import React from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Printer, Download, Store } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export const InvoiceContent = ({ invoiceData, id = "printable-invoice" }) => {
  if (!invoiceData) return null;

  return (
    <div className="bg-white p-2 sm:p-8 min-h-[600px]" id={id}>
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
          <p className="text-sm font-semibold text-slate-700">#{invoiceData.id}</p>
        </div>
      </div>

      {/* Business & Customer Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">From</h3>
          <p className="font-semibold text-slate-900">Sri Sai Wholesale Dealers</p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            15-4-12, Begum Bazaar<br />
            Hyderabad, Telangana 500012<br />
            Ph: +91 9988776655<br />
            Email: accounts@srisaiwholesale.in
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</h3>
          <p className="font-semibold text-slate-900">{invoiceData.customer}</p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {invoiceData.address || "123 Market Street, Sample Area"}<br />
            Ph: {invoiceData.phone || "+91 91234 56789"}<br />
            GSTIN: {invoiceData.gstNumber || "Unregistered"}
          </p>
        </div>
      </div>

      {/* Invoice Meta Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Invoice Date</p>
          <p className="font-semibold text-slate-900">{new Date(invoiceData.date).toLocaleDateString('en-IN')}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Due Date</p>
          <p className="font-semibold text-slate-900">{new Date(new Date(invoiceData.date).getTime() + (15 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN')}</p> 
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Order Ref</p>
          <p className="font-semibold text-slate-900">{invoiceData.orderId}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Payment Status</p>
          <p className={`font-semibold ${invoiceData.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{invoiceData.status}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="py-3 px-2 font-semibold text-slate-700 w-1/2">Item Description</th>
              <th className="py-3 px-2 font-semibold text-slate-700 text-center">HSN/SAC</th>
              <th className="py-3 px-2 font-semibold text-slate-700 text-right">Qty</th>
              <th className="py-3 px-2 font-semibold text-slate-700 text-right">Unit Price</th>
              <th className="py-3 px-2 font-semibold text-slate-700 text-right pr-4">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Mock single line item for simplicity */}
            <tr>
              <td className="py-4 px-2 text-slate-800 font-medium">Electronics Premium Desktop (Units)</td>
              <td className="py-4 px-2 text-slate-600 text-center font-mono">1006</td>
              <td className="py-4 px-2 text-slate-600 text-right">{(invoiceData.amount / 1350).toFixed(0)} bags</td>
              <td className="py-4 px-2 text-slate-600 text-right">₹1,350.00</td>
              <td className="py-4 px-2 text-slate-800 font-medium text-right pr-4">₹{invoiceData.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 font-medium">Subtotal</span>
            <span className="text-slate-900 font-semibold">₹{invoiceData.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          {/* Mock GST calculations (assuming included in total for UI, splitting it out) */}
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 font-medium">CGST (2.5%)</span>
            <span className="text-slate-600">₹{((invoiceData.amount / 1.05) * 0.025).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 font-medium">SGST (2.5%)</span>
            <span className="text-slate-600">₹{((invoiceData.amount / 1.05) * 0.025).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t border-slate-800 mt-2">
            <span className="text-base font-bold text-slate-900 tracking-tight">Invoice Total</span>
            <span className="text-xl font-black text-indigo-700 tracking-tight">₹{invoiceData.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions / Footer */}
      <div className="mt-16 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-700 mb-1">Terms & Conditions</p>
          <p>1. Goods once sold will not be taken back.</p>
          <p>2. Interest @ 18% p.a. will be charged if payment is delayed.</p>
          <p>3. Subject to Hyderabad jurisdiction only.</p>
        </div>
        <div className="text-right sm:text-center mt-6 sm:mt-0 pt-8 sm:w-48 border-t border-slate-300 sm:border-none">
          <p className="font-medium text-slate-800">Authorized Signatory</p>
        </div>
      </div>

    </div>
  );
};

const PrintableInvoice = ({ isOpen, onClose, invoiceData }) => {
  if (!invoiceData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-invoice');
    const opt = {
      margin:       0.5,
      filename:     `Invoice_${invoiceData.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full prt-hide">
      <Button variant="ghost" onClick={onClose}>Close</Button>
      <Button variant="outline" className="gap-2" onClick={handleDownloadPdf}>
        <Download className="w-4 h-4" /> Download PDF
      </Button>
      <Button variant="primary" onClick={handlePrint} className="gap-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-600">
        <Printer className="w-4 h-4" /> Print Invoice
      </Button>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Invoice Preview" 
      size="xl"
      footer={footer}
    >
      <InvoiceContent invoiceData={invoiceData} id="printable-invoice" />
    </Modal>
  );
};

export default PrintableInvoice;

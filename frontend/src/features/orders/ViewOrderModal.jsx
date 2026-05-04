import React from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Download, Printer, Share2 } from 'lucide-react';
import { InvoiceViewer } from '../billing/InvoiceViewer';
import html2pdf from 'html2pdf.js';

const ViewOrderModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const handleDownloadPdf = () => {
    const element = document.getElementById('order-preview-invoice');
    const opt = {
      margin:       0.5,
      filename:     `Order_${order.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const footer = (
    <div className="flex justify-between w-full">
      <Button variant="ghost" onClick={onClose}>Close</Button>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
        <Button variant="primary" size="sm" onClick={handleDownloadPdf}>
          <Download className="w-4 h-4 mr-2" /> Download PDF
        </Button>
      </div>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Order Preview: ${order.id}`} 
      size="lg"
      footer={footer}
    >
      <div className="bg-slate-50 rounded-lg p-1">
        <InvoiceViewer order={order} id="order-preview-invoice" />
      </div>
    </Modal>
  );
};

export default ViewOrderModal;

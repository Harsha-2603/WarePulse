import React, { useState } from 'react';
import { Eye, Download, MoreHorizontal, FileText, CheckCircle, Clock } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Dropdown, { DropdownItem } from '../../components/ui/Dropdown';
import html2pdf from 'html2pdf.js';
import { InvoiceViewer } from '../billing/InvoiceViewer';
import { useInvoices } from '../../contexts/InvoiceContext';
import { useToast } from '../../contexts/ToastContext';

const OrdersTable = ({ orders, onUpdateStatus, onViewDetails }) => {
  const [downloadingOrder, setDownloadingOrder] = useState(null);
  const { addInvoice } = useInvoices() || {};
  const { showToast } = useToast() || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <Badge variant="success">Completed</Badge>;
      case 'Processing': return <Badge variant="primary">Processing</Badge>;
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      default: return <Badge variant="gray">{status}</Badge>;
    }
  };

  const handleStatusUpdate = (orderId, order, newStatus) => {
    onUpdateStatus(orderId, newStatus);
    
    if (newStatus === 'Completed') {
      // Auto-generate invoice
      addInvoice({
        orderId: orderId,
        customer: order.customer,
        amount: order.amount,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending', // Creating with incomplete status as requested
        paymentMode: 'Cash' // Default payment mode
      });
      showToast('Order completed! Invoice auto-generated in Billing.');
    } else {
      showToast(`Order status updated to ${newStatus}.`);
    }
  };

  const handleDownloadPDF = (order) => {
    setDownloadingOrder(order);
    setTimeout(() => {
      const element = document.getElementById(`hidden-invoice-${order.id}`);
      if (element) {
        const opt = {
          margin: 0.5,
          filename: `Invoice_${order.id}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save().then(() => {
          setDownloadingOrder(null);
        });
      }
    }, 100);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center sm:text-left">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(orders || []).length > 0 ? (
              (orders || []).map((order) => (
                <TableRow key={order.id} className="group transition-colors hover:bg-slate-50/50">
                  <TableCell>
                    <div className="font-medium text-slate-900">{order.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{order.items} items</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-700">{order.customer}</span>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-700">₹{order.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Integrated Action Icons */}
                      <button 
                        onClick={() => onViewDetails(order)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Preview Order"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(order)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      {/* More Options Menu */}
                      <Dropdown 
                        align="right" 
                        trigger={
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        }
                      >
                        <DropdownItem icon={<FileText className="w-4 h-4"/>} onClick={() => onViewDetails(order)}>View Details</DropdownItem>
                        {order.status !== 'Completed' && (
                          <DropdownItem icon={<CheckCircle className="w-4 h-4 text-emerald-500"/>} onClick={() => handleStatusUpdate(order.id, order, 'Completed')}>Mark as Completed</DropdownItem>
                        )}
                        {order.status === 'Pending' && (
                          <DropdownItem icon={<Clock className="w-4 h-4 text-amber-500"/>} onClick={() => handleStatusUpdate(order.id, order, 'Processing')}>Mark as Processing</DropdownItem>
                        )}
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyState 
                colSpan={6} 
                title="No orders found" 
                description="Your filters didn't match any orders. Try adjusting your search criteria." 
              />
            )}
          </TableBody>
        </Table>
      </div>

      {/* Hidden PDF container */}
      {downloadingOrder && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm' }}>
          <InvoiceViewer order={downloadingOrder} id={`hidden-invoice-${downloadingOrder.id}`} />
        </div>
      )}
    </>
  );
};

export default OrdersTable;

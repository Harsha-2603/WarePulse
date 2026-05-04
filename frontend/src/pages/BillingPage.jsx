import React, { useState } from 'react';
import { Plus, Download, Eye, FileText, Receipt, CheckCircle, Clock, Trash2, ShieldCheck, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Dropdown, { DropdownItem } from '../components/ui/Dropdown';
import PrintableInvoice, { InvoiceContent } from '../features/billing/PrintableInvoice';
import html2pdf from 'html2pdf.js';
import { useInvoices } from '../contexts/InvoiceContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const BillingPage = () => {
  // State for Printable Invoice Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Use global context
  const { invoices = [], updateInvoicePaymentMode, recordPayment, isLoading } = useInvoices() || {};
  const { showToast } = useToast() || {};

  const filteredInvoices = (invoices || []).filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          invoice.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.id.localeCompare(a.id));

  // Metrics
  const totalBilled = (invoices || []).reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = (invoices || []).filter(inv => inv.status !== 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = totalBilled - totalPending;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <Badge variant="success">Paid</Badge>;
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      case 'Overdue': return <Badge variant="danger">Overdue</Badge>;
      default: return <Badge variant="gray">{status}</Badge>;
    }
  };

  const handlePreviewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  const handleDownloadPDF = (invoice) => {
    setDownloadingInvoice(invoice);
  };

  const handlePaymentUpdate = async (invoice) => {
    try {
      const shopId = localStorage.getItem('shopId');
      
      let mode = (invoice.paymentMode || 'cash').toLowerCase().replace(' ', '_');
      if (!['cash', 'upi', 'bank_transfer', 'card', 'credit'].includes(mode)) {
        mode = 'cash';
      }

      const payload = {
        invoice_id: invoice.realId || invoice.id,
        shop_id: shopId,
        payment_mode: mode,
        amount_paid: Number(invoice.amount),
        reference_number: `REF-${Date.now()}`,
        notes: 'Recorded from billing UI'
      };
      
      console.log("FINAL PAYMENT MODE SENT", mode);
      await recordPayment(payload);
      showToast(`Payment recorded successfully.`);
    } catch (error) {
      showToast(`Failed to record payment: ${error.message}`);
    }
  };

  const handlePaymentModeChange = (id, newMode) => {
    updateInvoicePaymentMode(id, newMode);
    showToast(`Payment mode updated to ${newMode}.`);
  };

  React.useEffect(() => {
    if (downloadingInvoice) {
      setTimeout(() => {
        const element = document.getElementById('hidden-printable-invoice');
        if (element) {
          const opt = {
            margin:       0.5,
            filename:     `Invoice_${downloadingInvoice.id}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          html2pdf().set(opt).from(element).save().then(() => {
            setDownloadingInvoice(null);
          });
        }
      }, 100);
    }
  }, [downloadingInvoice]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center sm:text-left">Billing & Invoices</h1>
          <p className="mt-1 text-slate-500 text-center sm:text-left">Invoices are automatically generated from completed orders.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px] font-bold">INV</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-amber-600 text-[10px] font-bold">ORD</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold">GEN</div>
          </div>
          <span className="text-sm font-medium text-slate-400 italic">Auto-Sync Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Billed" 
          value={`₹${totalBilled.toLocaleString()}`} 
          subtitle="All time revenue"
          icon={Receipt} 
          colorClass="bg-primary-100 text-primary-600" 
        />
        <StatCard 
          title="Pending Amount" 
          value={`₹${totalPending.toLocaleString()}`} 
          subtitle="Awaiting clearance"
          icon={Clock} 
          colorClass="bg-amber-100 text-amber-600" 
        />
        <StatCard 
          title="Total Paid" 
          value={`₹${totalPaid.toLocaleString()}`} 
          subtitle="Collection count high"
          icon={CheckCircle} 
          colorClass="bg-emerald-100 text-emerald-600" 
        />
        <StatCard 
          title="Total Invoices" 
          value={invoices.length} 
          subtitle="Generated to date"
          icon={FileText} 
          colorClass="bg-indigo-100 text-indigo-600" 
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchBar 
            placeholder="Search by invoice number or customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto flex flex-wrap gap-2">
          {/* Quick Filter Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
            <button 
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'paid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Paid
            </button>
            <button 
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'overdue' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Overdue
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex items-center justify-center text-center">
          <LoadingSpinner size="lg" text="Loading billing records..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center sm:text-left">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No.</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="font-medium text-primary-600">{invoice.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5 max-w-[150px] truncate" title={`Order File: ${invoice.orderId}`}>Ref: {invoice.orderId}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-700">{invoice.customer}</span>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(invoice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-700">₹{invoice.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <select 
                      value={(invoice.paymentMode || 'cash').toLowerCase().replace(' ', '_')}
                      onChange={(e) => handlePaymentModeChange(invoice.id, e.target.value)}
                      className="bg-transparent border-none text-sm text-slate-600 focus:ring-0 cursor-pointer hover:text-primary-600 transition-colors p-0 font-medium"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit">Credit</option>
                    </select>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <Dropdown 
                      align="right" 
                      trigger={
                        <Button variant="outline" size="sm" className="h-8">Actions</Button>
                      }
                    >
                      <DropdownItem 
                        icon={<Eye className="w-4 h-4"/>}
                        onClick={() => handlePreviewInvoice(invoice)}
                      >
                        Preview Invoice
                      </DropdownItem>
                      <DropdownItem 
                        icon={<Download className="w-4 h-4"/>}
                        onClick={() => handleDownloadPDF(invoice)}
                      >
                        Download PDF
                      </DropdownItem>
                      {invoice.status !== 'Paid' && (
                        <>
                          <div className="my-1 border-t border-slate-100" />
                          <DropdownItem 
                            icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
                            onClick={() => handlePaymentUpdate(invoice)}
                          >
                            Record Payment
                          </DropdownItem>
                        </>
                      )}
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyState 
                colSpan={7} 
                title="No invoices found" 
                description="There are no billing records matching your selected filters." 
              />
            )}
          </TableBody>
        </Table>
      </div>
      )}

      {/* Modals */}
      <PrintableInvoice 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        invoiceData={selectedInvoice} 
      />

      {/* Hidden container for PDF generation */}
      {downloadingInvoice && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm' }}>
          <InvoiceContent invoiceData={downloadingInvoice} id="hidden-printable-invoice" />
        </div>
      )}
      
    </div>
  );
};

export default BillingPage;

import React, { useState, useRef } from 'react';
import { Plus, Download, Info, Upload, FileDown, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import VendorCard from '../features/vendors/VendorCard';
import AddVendorModal from '../features/vendors/AddVendorModal';
import CSVFormatModal from '../components/modals/CSVFormatModal';
import { useVendors } from '../contexts/VendorContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const VendorsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline_asc');
  
  const fileInputRef = useRef(null);
  const { vendors = [], addVendor, isLoading } = useVendors() || {};
  const { showToast } = useToast() || {};

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const handleExportCSV = () => {
    if (vendors.length === 0) {
      showToast('No vendors to export.', 'error');
      return;
    }
    const headers = ['Vendor Name', 'Invoice Received Date', 'Payment Deadline', 'Total Cost', 'Discount', 'Final Amount', 'Status', 'Account Number', 'IFSC Code', 'Bank Branch'];
    const csvContent = [
      headers.join(','),
      ...vendors.map(v => [
        `"${v.name}"`,
        v.receivedDate,
        v.deadline,
        v.cost,
        v.discount,
        v.finalAmount,
        v.status,
        `"${v.bankDetails.account}"`,
        `"${v.bankDetails.ifsc}"`,
        `"${v.bankDetails.branch}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vendors_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Vendors exported successfully!');
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) {
          showToast('CSV file is empty or missing data rows.', 'error');
          return;
        }

        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const requiredFields = ['vendor name', 'invoice received date', 'payment deadline', 'total cost', 'account number'];
        
        const missingFields = requiredFields.filter(f => !headers.includes(f));
        if (missingFields.length > 0) {
          showToast(`Missing required columns: ${missingFields.join(', ')}`, 'error');
          return;
        }

        const newVendors = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const data = {};
          headers.forEach((header, index) => {
            data[header] = values[index];
          });

          return {
            name: data['vendor name'],
            receivedDate: data['invoice received date'],
            deadline: data['payment deadline'],
            cost: Number(data['total cost']) || 0,
            discount: Number(data['discount']) || 0,
            finalAmount: (Number(data['total cost']) || 0) - (Number(data['discount']) || 0),
            status: 'Pending',
            bankDetails: {
              account: data['account number'] || '',
              ifsc: data['ifsc code'] || '',
              branch: data['bank branch'] || ''
            }
          };
        });

        newVendors.forEach(vendor => addVendor(vendor));
        showToast(`Successfully imported ${newVendors.length} vendors!`);
        e.target.value = null; // Clear input
      } catch (error) {
        showToast('Failed to parse CSV file. Please check the format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const filteredVendors = (vendors || []).filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vendor.bankDetails.account.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || vendor.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // 1. Primary Sort: Push 'Paid' (Done) to the bottom
    const aIsPaid = a.status === 'Paid' || a.status === 'paid';
    const bIsPaid = b.status === 'Paid' || b.status === 'paid';
    
    if (aIsPaid && !bIsPaid) return 1;
    if (!aIsPaid && bIsPaid) return -1;

    // 2. Secondary Sort: User selected sorting
    if (sortBy === 'deadline_asc') return new Date(a.deadline || 0) - new Date(b.deadline || 0);
    if (sortBy === 'amount_desc') return (b.finalAmount || 0) - (a.finalAmount || 0);
    if (sortBy === 'recent_asc') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center sm:text-left">Vendor Management</h1>
          <p className="mt-1 text-slate-500 text-center sm:text-left">Track supplier invoices, payment deadlines, and direct bank transfers.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportCSV} 
              accept=".csv" 
              className="hidden" 
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <button 
              onClick={() => setIsInfoModalOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="CSV Format Info"
            >
              <Info className="w-5 h-5 text-center" />
            </button>
          </div>
          <Button variant="outline" onClick={handleExportCSV} className="w-full sm:w-auto">
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Invoice
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <div className="relative">
            <SearchBar 
              placeholder="Search by vendor name or account number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full sm:w-auto flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex h-10 w-full sm:w-[160px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="deadline_asc">Deadline (Closest)</option>
            <option value="amount_desc">Amount (Highest)</option>
            <option value="recent_asc">Recently Added</option>
            <option value="name_asc">Vendor (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading vendors..." />
        </div>
      ) : filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} onEdit={() => handleEdit(vendor)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
            <Search className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No vendors found</h3>
          <p className="text-slate-500 mt-2 max-w-sm">No vendor invoices match your criteria. Try adjusting your filters or tracking a new supplier invoice.</p>
          <Button variant="outline" className="mt-6" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>Clear search filters</Button>
        </div>
      )}

      {/* Modals */}
      <AddVendorModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        editingVendor={editingVendor} 
      />
      <CSVFormatModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
        type="vendor" 
      />
      
    </div>
  );
};

export default VendorsPage;

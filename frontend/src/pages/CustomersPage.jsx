import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import CustomerCard from '../features/customers/CustomerCard';
import AddCustomerModal from '../features/customers/AddCustomerModal';
import { useCustomers } from '../contexts/CustomerContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CSVFormatModal from '../components/modals/CSVFormatModal';
import { Info } from 'lucide-react';

const CustomersPage = () => {
  const { customers = [], addCustomer, isLoading } = useCustomers() || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = (customers || []).filter(customer => {
    const query = searchQuery.toLowerCase();
    const nameMatch = customer.name?.toLowerCase().includes(query) || false;
    const phoneMatch = customer.phone?.includes(query) || false;
    const emailMatch = customer.email?.toLowerCase().includes(query) || false;
    const addressMatch = customer.address?.toLowerCase().includes(query) || false;
    
    return nameMatch || phoneMatch || emailMatch || addressMatch;
  });

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert("The CSV file is empty or missing data.");
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const required = ['name', 'phone'];
      const missing = required.filter(field => !headers.some(h => h.includes(field)));

      if (missing.length > 0) {
        alert(`Rejected: Missing required columns: ${missing.join(', ')}`);
        return;
      }

      const nameIdx = headers.findIndex(h => h.includes('name'));
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const addressIdx = headers.findIndex(h => h.includes('address'));
      const cityIdx = headers.findIndex(h => h.includes('city'));
      const gstIdx = headers.findIndex(h => h.includes('gst'));

      let addedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;

        const newCustomer = {
          name: values[nameIdx],
          phone: values[phoneIdx],
          email: emailIdx !== -1 ? values[emailIdx] : '',
          address: addressIdx !== -1 ? values[addressIdx] : '',
          city: cityIdx !== -1 ? values[cityIdx] : '',
          gstNumber: gstIdx !== -1 ? values[gstIdx] : '',
          joinDate: new Date().toISOString().split('T')[0],
          totalOrders: 0,
          totalPurchase: 0
        };

        if (newCustomer.name && newCustomer.phone) {
          addCustomer(newCustomer);
          addedCount++;
        }
      }

      alert(`Successfully imported ${addedCount} customers.`);
      e.target.value = null; // Reset input
    };
    reader.readAsText(file);
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Customers</h1>
          <p className="mt-1 text-slate-500">Manage your wholesale buyers, contact details, and view their order history.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="customerCsvImport"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleImportCSV(e)}
          />
          <div className="flex items-center">
            <Button 
              variant="outline" 
              className="hidden sm:flex rounded-r-none border-r-0"
              onClick={() => document.getElementById('customerCsvImport').click()}
            >
              Import CSV
            </Button>
            <Button
              variant="outline"
              className="hidden sm:flex rounded-l-none px-2 text-slate-400 hover:text-indigo-600 border-l-[1px]"
              onClick={() => setIsInfoModalOpen(true)}
              title="CSV Format Info"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" className="hidden sm:flex">Export CSV</Button>
          <Button onClick={() => openAddModal()} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchBar 
            placeholder="Search by customer name, phone, or city..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto flex gap-2">
          <select className="flex h-10 w-full sm:w-[160px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="recent">Recently Added</option>
            <option value="orders_desc">Most Orders</option>
            <option value="spent_desc">Highest Spend</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading customers..." />
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} onEdit={() => openEditModal(customer)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
            <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No customers found</h3>
          <p className="text-slate-500 mt-2 max-w-sm">No customers match your search query. Try adjusting your filters or adding a new customer.</p>
          <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>Clear search filters</Button>
        </div>
      )}

      {/* Modal */}
      <AddCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingCustomer={editingCustomer}
      />

      <CSVFormatModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
        type="customer" 
      />
      
    </div>
  );
};

export default CustomersPage;

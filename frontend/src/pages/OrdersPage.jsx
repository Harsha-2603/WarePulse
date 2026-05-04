import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import Badge from '../components/ui/Badge';
import Dropdown, { DropdownItem } from '../components/ui/Dropdown';
import CreateOrderModal from '../features/orders/CreateOrderModal';
import OrdersTable from '../features/orders/OrdersTable';
import ViewOrderModal from '../features/orders/ViewOrderModal';
import { useOrders } from '../contexts/OrderContext';
import { useInventory } from '../contexts/InventoryContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const OrdersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Use global context instead of local mock data
  const { orders = [], updateOrderStatus, isLoading } = useOrders() || {};

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const filteredOrders = (orders || []).filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <Badge variant="success">Completed</Badge>;
      case 'Processing': return <Badge variant="primary">Processing</Badge>;
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      default: return <Badge variant="gray">{status}</Badge>;
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    
    const headers = ['Order ID', 'Customer', 'Date', 'Amount', 'Status', 'Variety', 'Quantity'];
    const rows = filteredOrders.map(order => [
      order.id,
      order.customer,
      order.date,
      order.amount,
      order.status,
      order.variety || 'N/A',
      order.items || 0
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Order Management</h1>
          <p className="mt-1 text-slate-500">Create, view, and manage customer wholesale orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex" onClick={handleExportCSV}>Export CSV</Button>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchBar 
            placeholder="Search by Order ID or Customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto flex flex-wrap gap-2">
          {/* Quick Filter Buttons instead of Select for statuses */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
            <button 
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setStatusFilter('processing')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'processing' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Processing
            </button>
            <button 
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'completed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Orders Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Fetching order records..." />
        </div>
      ) : (
        <OrdersTable 
          orders={filteredOrders} 
          onUpdateStatus={updateOrderStatus}
          onViewDetails={handleViewOrder}
        />
      )}
      
      {/* Modals */}
      <CreateOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ViewOrderModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        order={selectedOrder} 
      />
    </div>
  );
};

export default OrdersPage;

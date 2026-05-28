import React, { useState, useMemo } from 'react';
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

const TableSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center sm:text-left">
      <div className="border-b border-slate-200 bg-slate-50/50 p-4">
        <div className="h-6 w-1/4 bg-slate-200 rounded animate-pulse"></div>
      </div>
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex-1 space-y-2 w-full text-left">
              <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
              <div className="h-3 w-1/5 bg-slate-100 rounded"></div>
            </div>
            <div className="w-full sm:w-1/4 text-left">
              <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
            </div>
            <div className="w-full sm:w-1/6 text-left">
              <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
            </div>
            <div className="w-full sm:w-12 flex justify-end">
              <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { orders = [], updateOrderStatus, isLoading, error } = useOrders() || {};

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const filteredOrders = useMemo(() => {
    console.log("[OrdersPage] Filtering orders list. Total orders in context:", orders.length);
    return (orders || []).filter(order => {
      if (!order || !order.id) return false;
      const orderId = String(order.id).toLowerCase();
      const customer = String(order.customer || order.customer_name || '').toLowerCase();
      const matchesSearch = orderId.includes(searchQuery.toLowerCase()) || 
                            customer.includes(searchQuery.toLowerCase());
      const status = String(order.status || order.sale_status || '').toLowerCase();
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  console.log(`[OrdersPage] Rendering. Loading state: ${isLoading}, Orders count: ${filteredOrders.length}`);

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    
    const headers = ['Order ID', 'Customer', 'Date', 'Amount', 'Status', 'Variety', 'Quantity'];
    const rows = filteredOrders.map(order => {
      const itemsCount = Array.isArray(order.items) 
        ? order.items.length 
        : (order.item_count || order.items || 0);
      return [
        order.id,
        order.customer || order.customer_name || 'N/A',
        order.date || order.created_at?.split('T')[0] || 'N/A',
        order.amount || order.total_amount || 0,
        order.status || order.sale_status || 'N/A',
        order.variety || 'N/A',
        itemsCount
      ];
    });
    
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
      {error ? (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center">
          <p className="text-red-700 font-medium">Failed to load orders: {error}</p>
          <Button 
            variant="outline" 
            className="mt-3 border-red-300 text-red-700 hover:bg-red-100/50 bg-white"
            onClick={() => window.location.reload()}
          >
            Retry Loading
          </Button>
        </div>
      ) : isLoading ? (
        <TableSkeleton />
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

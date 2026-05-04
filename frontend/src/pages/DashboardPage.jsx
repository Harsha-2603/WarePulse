import React from 'react';
import DashboardStats from '../features/dashboard/DashboardStats';
import RecentOrders from '../features/dashboard/RecentOrders';
import LowStockAlert from '../features/dashboard/LowStockAlert';
import { useOrders } from '../contexts/OrderContext';
import { useInventory } from '../contexts/InventoryContext';

const DashboardPage = () => {
  const { orders = [] } = useOrders() || {};
  const { inventoryItems = [] } = useInventory() || {};

  const pendingOrdersCount = (orders || []).filter(o => o.status === 'Pending').length;
  const lowStockCount = (inventoryItems || []).filter(i => (i.stock || 0) < 15).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-primary-600 rounded-xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, Admin 👋</h1>
          <p className="mt-2 text-primary-100 max-w-xl">
            Here's what's happening with your business today. You have {pendingOrdersCount} pending orders to process and {lowStockCount} items running low on stock.
          </p>
        </div>
        
        {/* Decorative background pattern */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18.1,96.6,-2.8C96.4,12.5,90,27.7,81.1,41.2C72.2,54.7,60.8,66.5,47.2,74.9C33.6,83.3,17.8,88.4,1.8,85.3C-14.2,82.2,-30.4,70.9,-43.3,61.1C-56.2,51.3,-65.8,43,-73.4,32.2C-81,21.4,-86.6,8.1,-86,-4.9C-85.4,-17.9,-78.6,-30.6,-70.5,-41.8C-62.4,-53,-53,-62.7,-41.5,-70.8C-30,-78.9,-16.4,-85.4,-1.1,-83.6C14.2,-81.8,28.4,-71.7,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
          </svg>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        <div className="lg:col-span-2 h-full">
          <RecentOrders />
        </div>
        <div className="lg:col-span-1 h-full">
          <LowStockAlert />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

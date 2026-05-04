import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  TrendingUp 
} from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useCustomers } from '../../contexts/CustomerContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useInvoices } from '../../contexts/InvoiceContext';

const StatCard = ({ title, value, icon: Icon, trend, trendUp, colorClass }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend}
          </span>
          <span className="text-slate-500 ml-2">vs last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const DashboardStats = () => {
  const { orders = [] } = useOrders() || {};
  const { customers = [] } = useCustomers() || {};
  const { inventoryItems = [] } = useInventory() || {};
  const { invoices = [] } = useInvoices() || {};

  // Calculations
  const totalRevenue = (invoices || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalOrders = (orders || []).length;
  const totalCustomers = (customers || []).length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  
  const pendingOrders = (orders || []).filter(o => o.status === 'Pending').length;
  const completedOrders = (orders || []).filter(o => o.status === 'Completed').length;
  const lowStockItems = (inventoryItems || []).filter(i => (i.stock || 0) < 15).length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      colorClass: 'bg-emerald-100 text-emerald-600'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      trend: '+4.2%',
      trendUp: true,
      colorClass: 'bg-primary-100 text-primary-600'
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toString(),
      icon: Users,
      trend: '+2 new',
      trendUp: true,
      colorClass: 'bg-indigo-100 text-indigo-600'
    },
    {
      title: 'Average Order Value',
      value: `₹${avgOrderValue.toLocaleString()}`,
      icon: TrendingUp,
      trend: '+3.1%',
      trendUp: true,
      colorClass: 'bg-amber-100 text-amber-600'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: Clock,
      colorClass: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'Completed Orders',
      value: completedOrders.toString(),
      icon: CheckCircle,
      colorClass: 'bg-emerald-100 text-emerald-600'
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.toString(),
      icon: AlertTriangle,
      colorClass: 'bg-red-100 text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className={index >= 4 && index <= 6 ? 'xl:col-span-1 border-t xl:border-none pt-4 xl:pt-0 border-slate-200' : ''}>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;

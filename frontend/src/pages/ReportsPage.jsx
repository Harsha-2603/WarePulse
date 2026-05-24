import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Activity } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useInvoices } from '../contexts/InvoiceContext';
import { useOrders } from '../contexts/OrderContext';
import { useVendors } from '../contexts/VendorContext';
import { useInventory } from '../contexts/InventoryContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const StatCard = ({ title, value, trend, isPositive, icon: Icon }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend}
        </span>
        <span className="text-sm text-slate-400 ml-2">vs last month</span>
      </div>
    </CardContent>
  </Card>
);

import reportService from '../services/reportService';

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState('6M');
  const [summary, setSummary] = useState({ totalBilled: 0, netProfit: 0, totalOrders: 0, avgOrderValue: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [topSellingData, setTopSellingData] = useState([]);
  const [marginData, setMarginData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchAnalytics = async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        const [sumRes, monthRes, topRes, marginRes] = await Promise.all([
          reportService.getSummary().catch(e => { console.error("Summary failed", e); return {}; }),
          reportService.getMonthlySales().catch(e => { console.error("Monthly sales failed", e); return []; }),
          reportService.getTopCategories().catch(e => { console.error("Top categories failed", e); return []; }),
          reportService.getMargins().catch(e => { console.error("Margins failed", e); return []; })
        ]);

        setSummary({
          totalBilled: Number(sumRes?.totalBilled || 0),
          netProfit: Number(sumRes?.netProfit || 0),
          totalOrders: Number(sumRes?.totalOrders || 0),
          avgOrderValue: Number(sumRes?.avgOrderValue || 0)
        });

        setMonthlyData((monthRes || []).map(m => ({
          name: m.month,
          sales: Number(m.sales || 0),
          profit: Number(m.paid || 0)
        })));

        setTopSellingData((topRes || []).map(t => ({
          name: t.category,
          volume: Number(t.quantity || 0)
        })));

        setMarginData((marginRes || []).map(m => ({
          name: m.product_name || 'Miscellaneous',
          margin: Math.round(Number(m.margin_percentage || 0))
        })));
      } catch (error) {
        console.error("Failed to load analytics reports", error);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    };

    fetchAnalytics(true);

    const handleFocus = () => fetchAnalytics(false);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const { totalBilled, netProfit, totalOrders, avgOrderValue } = summary;

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Generating analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center sm:text-left">Reports & Analytics</h1>
          <p className="mt-1 text-slate-500 text-center sm:text-left">Business performance based on real-time orders and billing data.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg self-center sm:self-auto">
          {['1M', '3M', '6M', '1Y'].map(range => (
            <button 
              key={range}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === range ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`} 
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Billed" 
          value={`₹${totalBilled.toLocaleString()}`} 
          trend="+12.5%" 
          isPositive={true} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Net Profit" 
          value={`₹${netProfit.toLocaleString()}`} 
          trend="+8.2%" 
          isPositive={true} 
          icon={Activity} 
        />
        <StatCard 
          title="Total Orders" 
          value={totalOrders.toString()} 
          trend="+2.4%" 
          isPositive={true} 
          icon={ShoppingCart} 
        />
        <StatCard 
          title="Avg Order Value" 
          value={`₹${avgOrderValue.toLocaleString()}`} 
          trend="+4.3%" 
          isPositive={true} 
          icon={Package} 
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Sales Area Chart (Spans 2 columns) */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Sales & Volume (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[350px] min-h-[350px] mt-4">
              {monthlyData && monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="sales" name="Billed Sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    <Area type="monotone" dataKey="profit" name="Est. Margin" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm">No monthly sales data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profit Margins Bar Chart (1 column) */}
        <Card className="lg:col-span-1 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Margins by Variety (%)</CardTitle>
          </CardHeader>
          <CardContent>
            {marginData && marginData.length > 0 ? (() => {
              const sortedMargins = [...marginData]
                .sort((a, b) => b.margin - a.margin)
                .slice(0, 15);
              const chartHeight = sortedMargins.length * 45;
              return (
                <div
                  className="w-full mt-4"
                  style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}
                >
                  <BarChart
                    layout="vertical"
                    width={340}
                    height={chartHeight}
                    data={sortedMargins}
                    margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                      width={80}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value}%`, 'Margin']}
                    />
                    <Bar dataKey="margin" name="Profit Margin (%)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={18} />
                  </BarChart>
                </div>
              );
            })() : (
              <div className="flex h-[350px] items-center justify-center text-slate-400 text-sm">No margin data available</div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Volumes (Full width below) */}
        <Card className="lg:col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Top Selling Categories (Volume)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[350px] min-h-[350px] mt-4">
              {topSellingData && topSellingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value} units`, 'Volume Sold']}
                    />
                    <Bar dataKey="volume" name="Units Sold" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm">No top selling data available</div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ReportsPage;

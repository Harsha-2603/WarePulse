import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Store, 
  ShoppingCart, 
  Receipt, 
  BarChart3, 
  Bot, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/dashboard/inventory', icon: Package },
    { name: 'Customers', path: '/dashboard/customers', icon: Users },
    { name: 'Vendors', path: '/dashboard/vendors', icon: Store },
    { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Billing', path: '/dashboard/billing', icon: Receipt },
    { name: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
    { name: 'AI Assistant', path: '/dashboard/ai-assistant', icon: Bot },
  ];

  const bottomNavItems = [
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-primary-600">
          <Package className="w-6 h-6" />
          <span className="text-xl font-bold tracking-tight text-slate-900">InvenSync</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                isActive 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
              {item.name}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-slate-200 flex flex-col gap-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                isActive 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
              {item.name}
            </NavLink>
          );
        })}
        
        <NavLink 
          to="/"
          className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:translate-x-1 active:scale-[0.98] transition-all duration-200 w-full text-left"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          Logout
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;

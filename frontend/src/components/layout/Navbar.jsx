import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search Bar - Hidden on Mobile */}
        <div className="hidden lg:flex max-w-md w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-slate-50 hover:bg-white transition-all duration-200"
            placeholder="Search inventory, orders, customers..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Search Trigger */}
        <button className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="p-2 relative text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-slate-900">Admin User</span>
            <span className="text-xs text-slate-500">Store Manager</span>
          </div>
          <button className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold overflow-hidden ring-2 ring-white">
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0" 
              alt="User avatar" 
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

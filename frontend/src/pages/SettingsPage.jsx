import React, { useState } from 'react';
import { Store, Image as ImageIcon, Settings, DollarSign, FileText, User, Shield, CreditCard, Palette, Save } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('shop');
  const [isSaving, setIsSaving] = useState(false);

  // Mock settings state
  const [settings, setSettings] = useState({
    shopName: 'Sri Sai Wholesale Dealers',
    phone: '+91 9988776655',
    email: 'accounts@srisaiwholesale.in',
    address: '15-4-12, Begum Bazaar, Hyderabad, Telangana 500012',
    gstin: '36AADCS7777P1Z5',
    currency: 'INR (₹)',
    taxRate: '5',
    theme: 'light',
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const navItems = [
    { id: 'shop', label: 'Shop Information', icon: Store },
    { id: 'logo', label: 'Shop Logo', icon: ImageIcon },
    { id: 'commerce', label: 'Commerce Settings', icon: Settings },
    { id: 'pricing', label: 'Pricing & Taxes', icon: DollarSign },
    { id: 'invoice', label: 'Invoice Configuration', icon: FileText },
    { id: 'admin', label: 'Admin Profile', icon: User },
    { id: 'backup', label: 'Backup & Security', icon: Shield },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="mt-1 text-slate-500">Manage your wholesale shop details, application preferences, and administrative profile.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto min-w-[120px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Vertical Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-2 relative md:sticky md:top-6">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-primary-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          
          {/* Shop Information Content */}
          {activeTab === 'shop' && (
            <div className="p-6 sm:p-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 pb-4 border-b border-slate-100">Shop Information</h2>
              <form className="space-y-6 max-w-2xl">
                <div className="space-y-1.5 list-none">
                  <label className="text-sm font-medium text-slate-700">Business Name</label>
                  <Input 
                    value={settings.shopName} 
                    onChange={e => setSettings({...settings, shopName: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5 list-none">
                    <label className="text-sm font-medium text-slate-700">Business Email</label>
                    <Input 
                      type="email" 
                      value={settings.email} 
                      onChange={e => setSettings({...settings, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5 list-none">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <Input 
                      type="tel" 
                      value={settings.phone} 
                      onChange={e => setSettings({...settings, phone: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-1.5 list-none">
                  <label className="text-sm font-medium text-slate-700">Registered Address</label>
                  <textarea 
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px] resize-none"
                    value={settings.address}
                    onChange={e => setSettings({...settings, address: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5 list-none">
                  <label className="text-sm font-medium text-slate-700">GSTIN / Tax Registration Number</label>
                  <Input 
                    value={settings.gstin} 
                    className="font-mono text-sm max-w-xs"
                    onChange={e => setSettings({...settings, gstin: e.target.value})} 
                  />
                </div>
              </form>
            </div>
          )}

          {/* Shop Logo Content */}
          {activeTab === 'logo' && (
            <div className="p-6 sm:p-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 pb-4 border-b border-slate-100">Shop Logo</h2>
              <div className="max-w-2xl space-y-6">
                <p className="text-sm text-slate-500">This logo will appear in your top navigation and on all generated invoices.</p>
                <div className="flex items-center justify-center w-full mt-4">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-10 h-10 mb-3 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-500">SVG, PNG, JPG or WEBP (MAX. 2MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" />
                  </label>
                </div>
                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg bg-white mt-6">
                  <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
                    <Store className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 text-slate-700">Current Logo (Default)</p>
                    <button className="text-xs text-red-600 mt-1 hover:underline">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing & Taxes Content */}
          {activeTab === 'pricing' && (
            <div className="p-6 sm:p-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 pb-4 border-b border-slate-100">Pricing & Taxes</h2>
              <form className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5 list-none">
                    <label className="text-sm font-medium text-slate-700">Default Currency</label>
                    <select 
                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={settings.currency}
                      onChange={e => setSettings({...settings, currency: e.target.value})}
                    >
                      <option value="INR (₹)">Indian Rupee (₹)</option>
                      <option value="USD ($)">US Dollar ($)</option>
                      <option value="EUR (€)">Euro (€)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 list-none">
                    <label className="text-sm font-medium text-slate-700">Default GST/Tax (%) for Products</label>
                    <Input 
                      type="number" 
                      value={settings.taxRate} 
                      onChange={e => setSettings({...settings, taxRate: e.target.value})} 
                    />
                    <p className="text-xs text-slate-400 mt-1">Usually 5% for packaged products.</p>
                  </div>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                    <span className="text-sm font-medium text-slate-700">Prices entered include tax (Tax Inclusive Pricing)</span>
                  </label>
                </div>
              </form>
            </div>
          )}

          {/* Fallback for other tabs */}
          {['commerce', 'invoice', 'admin', 'backup', 'payments', 'appearance'].includes(activeTab) && (
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Advanced Settings</h3>
              <p className="text-slate-500 max-w-md mt-2">
                This configuration section ({navItems.find(i => i.id === activeTab)?.label}) requires administrative backend API access to modify. 
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setActiveTab('shop')}>
                Return to General Shop Info
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

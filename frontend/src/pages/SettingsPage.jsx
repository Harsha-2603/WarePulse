import React, { useState, useEffect } from 'react';
import { Store, Image as ImageIcon, Settings, DollarSign, FileText, User, Shield, CreditCard, Palette, Save } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('shop');
  const [isSaving, setIsSaving] = useState(false);

  const { shop, user, session } = useAuth() || {};
  const { showToast } = useToast() || {};
  const [logoUrl, setLogoUrl] = useState(shop?.logo_url || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (shop?.logo_url) {
      setLogoUrl(shop.logo_url);
    }
  }, [shop]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("FILE_SELECTED");
    console.log("UPLOAD_FUNCTION_CALLED");

    setUploading(true);

    try {
      if (!session) {
        console.log("FINAL_ERROR: No active session found");
        throw new Error("No active session found. Please sign in again.");
      }
      console.log("SESSION_FOUND");

      const shopId = shop?.id || user?.shop_id || localStorage.getItem('shopId');
      if (!shopId) {
        console.log("FINAL_ERROR: Missing shop ID");
        throw new Error("Missing shop ID. Could not associate logo.");
      }
      console.log("SHOP_ID_FOUND");

      if (!supabase) {
        console.log("FINAL_ERROR: Supabase client is not initialized correctly");
        throw new Error("Supabase client is not initialized correctly.");
      }
      console.log("SUPABASE_CLIENT_READY");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
        console.log("FINAL_ERROR: Supabase environment variables are missing");
        throw new Error("Supabase environment variables are missing.");
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        console.log("FINAL_ERROR: Invalid file type");
        throw new Error("Invalid file type. Only SVG, PNG, JPG, or WEBP are allowed.");
      }

      if (file.size > 2 * 1024 * 1024) {
        console.log("FINAL_ERROR: File size exceeds 2MB limit");
        throw new Error("File size exceeds 2MB limit.");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${shopId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('shop-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error("Supabase Storage Upload failed:", error.message);
        console.log("FINAL_ERROR: " + error.message);
        
        if (error.message.includes('Bucket not found') || error.status === 404) {
          throw new Error("Storage bucket 'shop-logos' not found. Please create it in your Supabase dashboard.");
        } else if (error.status === 401 || error.status === 403) {
          throw new Error("Unauthorized storage upload. Please configure RLS policies.");
        } else {
          throw error;
        }
      }

      console.log("UPLOAD_RESPONSE");

      const { data: publicUrlData } = supabase.storage
        .from('shop-logos')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) {
        console.log("FINAL_ERROR: Failed to generate public URL");
        throw new Error("Failed to generate public URL from storage.");
      }
      console.log("PUBLIC_URL_CREATED");

      const { error: dbError } = await supabase
        .from('shop')
        .update({ logo_url: publicUrl })
        .eq('id', shopId);

      if (dbError) {
        console.error("Database logo_url update failed:", dbError.message);
        console.log("FINAL_ERROR: " + dbError.message);
        throw new Error(`Failed to update logo URL in database: ${dbError.message}`);
      }

      console.log("DATABASE_UPDATED");

      setLogoUrl(publicUrl);
      if (showToast) {
        showToast('Logo uploaded successfully!', 'success');
      }

    } catch (err) {
      console.error("Logo upload process failed:", err.message);
      console.log("FINAL_ERROR: " + err.message);
      if (showToast) {
        showToast(err.message, 'error');
      } else {
        alert(err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm("Are you sure you want to remove the shop logo?")) return;

    setUploading(true);

    try {
      if (!session) {
        throw new Error("No active session found. Please sign in again.");
      }

      const shopId = shop?.id || user?.shop_id || localStorage.getItem('shopId');
      if (!shopId) {
        throw new Error("Missing shop ID.");
      }

      const { error: dbError } = await supabase
        .from('shop')
        .update({ logo_url: null })
        .eq('id', shopId);

      if (dbError) {
        console.error("Database logo_url deletion failed:", dbError.message);
        throw new Error(`Failed to remove logo from database: ${dbError.message}`);
      }

      if (logoUrl) {
        const urlParts = logoUrl.split('/shop-logos/');
        if (urlParts.length > 1) {
          const storagePath = decodeURIComponent(urlParts[1]);
          const { error: storageError } = await supabase.storage
            .from('shop-logos')
            .remove([storagePath]);

          if (storageError) {
            console.warn("Storage logo deletion warning:", storageError.message);
          }
        }
      }

      setLogoUrl(null);
      if (showToast) {
        showToast('Logo removed successfully.', 'success');
      }

    } catch (err) {
      console.error("Logo removal process failed:", err.message);
      if (showToast) {
        showToast(err.message, 'error');
      } else {
        alert(err.message);
      }
    } finally {
      setUploading(false);
    }
  };

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
                  <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <div className="w-10 h-10 mb-3 rounded-full border-2 border-primary-300 border-t-primary-600 animate-spin" />
                      ) : (
                        <ImageIcon className="w-10 h-10 mb-3 text-slate-400" />
                      )}
                      <p className="mb-2 text-sm text-slate-600">
                        <span className="font-semibold">{uploading ? 'Uploading...' : 'Click to upload'}</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">SVG, PNG, JPG or WEBP (MAX. 2MB)</p>
                    </div>
                    <input 
                      id="dropzone-file" 
                      type="file" 
                      accept="image/png, image/jpeg, image/svg+xml, image/webp" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg bg-white mt-6">
                  <div className="p-3 bg-primary-50 text-primary-600 rounded-lg w-14 h-14 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Shop Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Store className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {logoUrl ? 'Current Logo' : 'Current Logo (Default)'}
                    </p>
                    {logoUrl && (
                      <button 
                        onClick={handleRemoveLogo} 
                        disabled={uploading}
                        className="text-xs text-red-600 mt-1 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
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

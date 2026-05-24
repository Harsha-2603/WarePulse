import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Eye, EyeOff, Store, User, Phone, Mail, ShieldAlert, Lock, MapPin, Building, Sparkles } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signupOwner } = useAuth();
  const { showToast } = useToast();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation States
  const [errors, setErrors] = useState({});

  // Client-side validations
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    // Phone validation (Optional but must be digits if supplied)
    if (phone && !/^\+?[0-9\s\-()]{7,15}$/.test(phone)) {
      newErrors.phone = 'Please provide a valid phone number';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Shop Name validation
    if (!shopName.trim()) {
      newErrors.shopName = 'Shop Name is required';
    }

    // GST validation (Optional, but if provided must be exactly 15 chars alphanumeric)
    if (gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.trim().toUpperCase())) {
      newErrors.gstNumber = 'Format must match standard GSTIN (e.g. 22AAAAA1111A1Z1)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the validation errors in the form', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await signupOwner({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        shopName: shopName.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
        address: address.trim(),
      });

      if (res && res.emailVerificationPending) {
        showToast('Account created successfully. Please verify your email before signing in.', 'success');
        navigate('/signin');
      } else {
        showToast('Registration successful! Setting up your store...', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err);
      // Map common database/Supabase failures
      let errorMsg = err.message || 'An error occurred during signup';
      if (errorMsg.includes('already exists') || errorMsg.includes('registered')) {
        errorMsg = 'This email is already associated with an account. Please sign in instead.';
      } else if (errorMsg.includes('weak') || errorMsg.includes('should be at least')) {
        errorMsg = 'Choose a stronger password with at least 8 characters.';
      }
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-mesh py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Info Panel (Modern Glass Accent Panel) */}
        <div className="lg:col-span-5 bg-teal-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Wave/Mesh overlay background */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-700/50 to-teal-500/20 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-30 -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-30 -ml-20 -mb-20" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-10">
              <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <iconify-icon icon="lucide:layers" className="text-white text-xl"></iconify-icon>
              </div>
              <span className="text-xl font-bold tracking-tight">InventoryHub</span>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight leading-tight">Start managing your business stock like a pro.</h2>
              <p className="text-teal-100 text-sm leading-relaxed">Join thousands of SaaS store operators optimizing their warehousing, supplier payments, and billing invoices seamlessly on our scalable multi-tenant engine.</p>
            </div>
          </div>

          <div className="relative z-10 mt-12 space-y-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
              <Sparkles className="w-5 h-5 text-teal-200 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">Automated SaaS Setup</p>
                <p className="text-teal-100/80">Owner account and multi-tenant shop created in one click.</p>
              </div>
            </div>
            <p className="text-[10px] text-teal-100/60 uppercase font-bold tracking-widest text-center">SOC2 & GDPR Compliant Security</p>
          </div>
        </div>

        {/* Right Form Panel */}
        <form onSubmit={handleSignup} className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-sm text-slate-500 mt-2">
              Already have an account?{' '}
              <Link to="/signin" className="text-teal-600 font-bold hover:text-teal-700 transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Section 1: Personal Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm transition-all bg-slate-50 ${errors.fullName ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}
                  />
                  {errors.fullName && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm transition-all bg-slate-50 ${errors.email ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}
                  />
                  {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 99999 88888"
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm transition-all bg-slate-50 ${errors.phone ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className={`w-full pl-3 pr-10 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm transition-all bg-slate-50 ${errors.password ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.password}</p>}
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className={`w-full pl-3 pr-10 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm transition-all bg-slate-50 ${errors.confirmPassword ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Shop Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Store className="w-4 h-4 text-teal-600" />
                Store / Shop Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Name</label>
                  <input 
                    type="text" 
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Sri Sai Wholesale Traders"
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm transition-all bg-slate-50 ${errors.shopName ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}
                  />
                  {errors.shopName && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.shopName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GST Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input 
                    type="text" 
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="22AAAAA1111A1Z1"
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm transition-all bg-slate-50 ${errors.gstNumber ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}
                  />
                  {errors.gstNumber && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.gstNumber}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 42, Main Wholesale Market, Bangalore, India"
                  disabled={loading}
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm transition-all bg-slate-50 resize-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-teal-100 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting up store...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Free Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  useEffect(() => {
    document.body.classList.add('landing-page-root');
    return () => {
      document.body.classList.remove('landing-page-root');
    };
  }, []);

  return (
    <div className="landing-page-root min-h-screen bg-slate-50 bg-mesh">

    {/*  Header Navigation  */}
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                    <iconify-icon icon="lucide:layers" className="text-white text-xl"></iconify-icon>
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">InventoryHub</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
                <a href="#hero" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">Home</a>
                <a href="#features" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">How it Works</a>
                <a href="#integrations" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">Integrations</a>
                <a href="#reports" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">Reports</a>
                <a href="#pricing" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">Sign In</Link>
                <Link to="/login" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100">Start Free</Link>
            </div>
        </div>
    </nav>

    <main>
        {/*  Hero Section  */}
        <section id="hero" className="relative pt-32 pb-32 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="cloud-blob w-[500px] h-[300px] top-[-10%] left-[-15%]" style={{ animation: 'move-clouds 140s linear infinite', opacity: 0.4 }}></div>
                <div className="cloud-blob w-[600px] h-[400px] top-[15%] left-[-30%]" style={{ animation: 'move-clouds 190s linear infinite', animationDelay: '-50s', opacity: 0.3 }}></div>
                <div className="cloud-blob w-[450px] h-[350px] top-[50%] left-[-20%]" style={{ animation: 'move-clouds 160s linear infinite', animationDelay: '-100s', opacity: 0.2 }}></div>
            </div>
            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-bold mb-8 uppercase tracking-widest border border-teal-100">
                    <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span> Specialized for Inventory Management System v4.0
                </div>
                <h1 className="text-6xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-8">Unified Business Inventory<br/><span className="text-teal-600">At Global Scale.</span></h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">InventoryHub provides enterprise-grade inventory intelligence for complex supply chains. Automate workflows, sync multi-location stock, and gain real-time visibility across your entire operation.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 flex items-center justify-center">Start Free Trial</Link>
                    <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">Request Demo</Link>
                </div>
                {/*  Dashboard Preview  */}
                <div className="mt-20 relative animate-float">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-teal-500/20 to-blue-500/20 blur-3xl opacity-50"></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                            <div className="ml-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Business Stock Dashboard — Live</div>
                        </div>
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" alt="Business Dashboard Preview" className="w-full h-[500px] object-cover opacity-90" />
                    </div>
                </div>
            </div>
        </section>

        {/*  Features Section  */}
        <section id="features" className="py-32 bg-slate-900 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Engineered for modern supply chains.</h2>
                        <p className="text-slate-400 text-lg">Our platform is built to handle millions of products with sub-second latency, ensuring your data is always accurate and your teams are always aligned.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/*  Feature 1  */}
                    <div className="p-8 bg-slate-800/50 rounded-3xl border border-slate-700/50 hover:border-teal-500/50 transition-all group">
                        <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <iconify-icon icon="lucide:activity" className="text-teal-400 text-3xl"></iconify-icon>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Real-time Stock Tracking</h3>
                        <p className="text-slate-400 leading-relaxed">Instant updates across every warehouse and milling point. Never miss a product movement with our synchronization engine.</p>
                    </div>
                    {/*  Feature 2  */}
                    <div className="p-8 bg-slate-800/50 rounded-3xl border border-slate-700/50 hover:border-teal-500/50 transition-all group">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <iconify-icon icon="lucide:bar-chart-3" className="text-blue-400 text-3xl"></iconify-icon>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Deep Analytics</h3>
                        <p className="text-slate-400 leading-relaxed">Predict demand cycles with AI-driven forecasting. Understand product variety velocity and turnover at a granular level.</p>
                    </div>
                    {/*  Feature 3  */}
                    <div className="p-8 bg-slate-800/50 rounded-3xl border border-slate-700/50 hover:border-teal-500/50 transition-all group">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <iconify-icon icon="lucide:cpu" className="text-purple-400 text-3xl"></iconify-icon>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Workflow Automation</h3>
                        <p className="text-slate-400 leading-relaxed">Trigger purchase orders automatically based on intelligent thresholds. Reduce manual errors in your wholesale operations.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/*  Feature 4  */}
                    <div className="p-8 bg-slate-800/50 rounded-3xl border border-slate-700/50 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2">
                            <h3 className="text-2xl font-bold mb-4">Multi-location Management</h3>
                            <p className="text-slate-400 mb-6">Manage stock across multiple warehouses and states with unified visibility and control.</p>
                            <Link to="/login" className="inline-flex items-center gap-2 text-teal-400 font-bold hover:gap-3 transition-all">Learn more <iconify-icon icon="lucide:arrow-right"></iconify-icon></Link>
                        </div>
                        <div className="w-full md:w-1/2 bg-slate-900 rounded-2xl p-4">
                            <div className="space-y-3">
                                <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
                                <div className="h-4 w-1/2 bg-slate-700 rounded"></div>
                                <div className="h-4 w-5/6 bg-slate-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                    {/*  Feature 5  */}
                    <div className="p-8 bg-slate-800/50 rounded-3xl border border-slate-700/50 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2">
                            <h3 className="text-2xl font-bold mb-4">Supplier & Quality Control</h3>
                            <p className="text-slate-400 mb-6">Track product quality batches and supplier performance to ensure top-tier product standards.</p>
                            <Link to="/login" className="inline-flex items-center gap-2 text-teal-400 font-bold hover:gap-3 transition-all">View details <iconify-icon icon="lucide:arrow-right"></iconify-icon></Link>
                        </div>
                        <div className="w-full md:w-1/2 flex flex-wrap gap-4 justify-center">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center"><iconify-icon icon="lucide:clipboard-check" className="text-white text-2xl"></iconify-icon></div>
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center"><iconify-icon icon="lucide:users" className="text-white text-2xl"></iconify-icon></div>
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center"><iconify-icon icon="lucide:shield-check" className="text-white text-2xl"></iconify-icon></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/*  How it Works Section  */}
        <section id="how-it-works" className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">How it Works</h2>
                    <p className="text-slate-600">Our streamlined process ensures your business inventory is always optimized.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative py-8 px-12 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="space-y-12 relative after:absolute after:left-[23px] after:top-4 after:bottom-4 after:w-[2px] after:bg-slate-200">
                            {/*  Step 1  */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center z-10 border-4 border-white font-bold">1</div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Inventory Logging</h3>
                                    <p className="text-slate-600">Log incoming product batches with variety, grade, and origin details into the central system.</p>
                                </div>
                            </div>
                            {/*  Step 2  */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center z-10 border-4 border-white font-bold">2</div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Distribution</h3>
                                    <p className="text-slate-600">Automatically assign stock to warehouses based on demand forecasting and logistics efficiency.</p>
                                </div>
                            </div>
                            {/*  Step 3  */}
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center z-10 border-4 border-white font-bold">3</div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Real-time Sync</h3>
                                    <p className="text-slate-600">Track movements across multi-locations with instant updates to your global stock levels.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-slate-900 leading-tight">Master your supply chain with our 3-step automated workflow.</h3>
                        <p className="text-slate-600 text-lg">InventoryHub eliminates the guesswork in warehouse management, providing you with a clear roadmap from warehouse to customer.</p>
                        <Link to="/login" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:gap-3 transition-all text-lg">Watch the full demo <iconify-icon icon="lucide:play-circle"></iconify-icon></Link>
                    </div>
                </div>
            </div>
        </section>

        {/*  Integrations Section  */}
        <section id="integrations" className="py-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">Seamless Integrations</h2>
                    <p className="text-slate-600">Connect InventoryHub with your favorite platforms and ERP systems.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/*  Integration 1  */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-teal-400 transition-all shadow-sm hover:shadow-xl group text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <iconify-icon icon="logos:shopify" className="text-4xl"></iconify-icon>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Shopify</h3>
                        <p className="text-sm text-slate-500">Sync product orders and inventory levels directly with your online store.</p>
                    </div>
                    {/*  Integration 2  */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-teal-400 transition-all shadow-sm hover:shadow-xl group text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <iconify-icon icon="logos:amazon-icon" className="text-4xl"></iconify-icon>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Amazon FBA</h3>
                        <p className="text-sm text-slate-500">Manage multi-channel fulfillment across global Amazon marketplaces.</p>
                    </div>
                    {/*  Integration 3  */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-teal-400 transition-all shadow-sm hover:shadow-xl group text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <iconify-icon icon="logos:netsuite" className="text-4xl"></iconify-icon>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Oracle NetSuite</h3>
                        <p className="text-sm text-slate-500">Deep ERP integration for financial and inventory reconciliation.</p>
                    </div>
                </div>
                <div className="mt-12 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:gap-3 transition-all">Explore all 500+ integrations <iconify-icon icon="lucide:arrow-right"></iconify-icon></Link>
                </div>
            </div>
        </section>

        {/*  Reports & Analytics Section  */}
        <section id="reports" className="py-32 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Intelligence that drives growth.</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                                    <iconify-icon icon="lucide:trending-up" className="text-teal-600 text-2xl"></iconify-icon>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">Demand Forecasting</h3>
                                    <p className="text-slate-600">3-month projection based on AI neural networks with 98% accuracy for product category demand.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                    <iconify-icon icon="lucide:pie-chart" className="text-blue-600 text-2xl"></iconify-icon>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">Stockout Prevention</h3>
                                    <p className="text-slate-600">Real-time alerts when stock levels fall below critical thresholds for your major distributors.</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12">
                            <Link to="/login" className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 flex items-center justify-center w-fit">View Analytics Demo</Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-slate-900">Demand Forecast (Product Categories)</h3>
                                <iconify-icon icon="lucide:more-horizontal" className="text-slate-400"></iconify-icon>
                            </div>
                            <div className="relative h-64 w-full">
                                <svg viewBox="0 0 1000 300" className="w-full h-full">
                                    <path d="M0,280 L100,240 L200,260 L300,200 L400,220 L500,150 L600,170" fill="none" stroke="#0d9488" strokeWidth="4" strokeLinecap="round" className="chart-line"/>
                                    <path d="M600,170 L700,120 L800,140 L900,80 L1000,100" fill="none" stroke="#99f6e4" strokeWidth="4" strokeDasharray="10 5" strokeLinecap="round" className="chart-line"/>
                                </svg>
                                <div className="absolute bottom-0 left-0 w-full border-t border-slate-100 flex justify-between pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                                <iconify-icon icon="lucide:rotate-cw" className="text-xl"></iconify-icon>
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+4.2%</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Turnover Rate</p>
                        <h3 className="text-2xl font-bold text-slate-900">8.4x</h3>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <iconify-icon icon="lucide:target" className="text-xl"></iconify-icon>
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+1.8%</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Forecast Accuracy</p>
                        <h3 className="text-2xl font-bold text-slate-900">94.2%</h3>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <iconify-icon icon="lucide:alert-triangle" className="text-xl"></iconify-icon>
                            </div>
                            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">-12%</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Stockout Risk</p>
                        <h3 className="text-2xl font-bold text-slate-900">Low</h3>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <iconify-icon icon="lucide:trending-up" className="text-xl"></iconify-icon>
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+5.5%</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Gross Margin</p>
                        <h3 className="text-2xl font-bold text-slate-900">38.1%</h3>
                    </div>
                </div>
            </div>
        </section>

        {/*  Pricing Section  */}
        <section id="pricing" className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">Predictable pricing for every stage.</h2>
                    <p className="text-slate-600">Choose the plan that fits your business operational volume.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/*  Starter  */}
                    <div className="p-10 rounded-3xl border border-slate-200 hover:shadow-xl transition-all">
                        <h3 className="text-xl font-bold mb-2">Starter</h3>
                        <p className="text-slate-500 text-sm mb-6">For small businesses scaling up.</p>
                        <div className="flex items-baseline gap-1 mb-8"><span className="text-4xl font-bold">$199</span><span className="text-slate-500">/mo</span></div>
                        <ul className="space-y-4 mb-10 text-slate-600">
                            <li className="flex items-center gap-3"><iconify-icon icon="lucide:check-circle-2" className="text-teal-600"></iconify-icon> Up to 1,000 MT Volume</li>
                            <li className="flex items-center gap-3"><iconify-icon icon="lucide:check-circle-2" className="text-teal-600"></iconify-icon> 2 Warehouses</li>
                            <li className="flex items-center gap-3"><iconify-icon icon="lucide:check-circle-2" className="text-teal-600"></iconify-icon> Basic Reporting</li>
                        </ul>
                        <Link to="/login" className="w-full inline-flex items-center justify-center py-4 border border-slate-900 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all">Get Started</Link>
                    </div>
                    {/*  Growth  */}
                    <div className="p-10 rounded-3xl border-2 border-teal-600 shadow-2xl shadow-teal-100 relative bg-white scale-105">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">Most Popular</div>
                        <h3 className="text-xl font-bold mb-2">Growth</h3>
                        <p className="text-slate-500 text-sm mb-6">For rapidly expanding supply chains.</p>
                        <div className="flex items-baseline gap-1 mb-8"><span className="text-4xl font-bold">$499</span><span className="text-slate-500">/mo</span></div>
                        <ul className="space-y-4 mb-10 text-slate-600">
                            <li className="flex items-center gap-3"><iconify-icon icon="lucide:check-circle-2" className="text-teal-600"></iconify-icon> Up to 25,000 MT Volume</li>
                            <li className="flex items-center gap-3"><iconify-icon icon="lucide:check-circle-2" className="text-teal-600"></iconify-icon> Unlimited Warehouses</li>
                            <li className="flex items-center gap-3"><iconify-icon icon="lucide:check-circle-2" className="text-teal-600"></iconify-icon> AI Demand Forecasting</li>
                        </ul>
                        <Link to="/login" className="w-full inline-flex items-center justify-center py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all">Select Plan</Link>
                    </div>
                    {/*  Enterprise  */}
                    <div className="p-10 rounded-3xl border border-slate-200 hover:shadow-xl transition-all">
                        <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                        <p className="text-slate-500 text-sm mb-6">Custom solutions for global supply chains.</p>
                        <div className="flex items-baseline gap-1 mb-8"><span className="text-4xl font-bold">Custom</span></div>
                        <ul className="space-y-4 mb-10 text-slate-600">
                            <li className="flex items-center gap-3"><iconify-icon icon="lucide:check-circle-2" className="text-teal-600"></iconify-icon> Unlimited Volume</li>
                            <li className="flex items-center gap-3"><iconify-icon icon="lucide:check-circle-2" className="text-teal-600"></iconify-icon> Dedicated Support</li>
                            <li className="flex items-center gap-3"><iconify-icon icon="lucide:check-circle-2" className="text-teal-600"></iconify-icon> Custom Integrations</li>
                        </ul>
                        <Link to="/login" className="w-full inline-flex items-center justify-center py-4 border border-slate-900 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all">Contact Sales</Link>
                    </div>
                </div>
            </div>
        </section>

        {/*  CTA Section  */}
        <section id="cta" className="py-20 bg-teal-600 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mb-48 blur-3xl"></div>
            </div>
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to optimize your business inventory?</h2>
                <p className="text-teal-50 text-xl mb-12 opacity-90">Join 5,000+ companies who have transformed their logistics with InventoryHub. Get started today.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-white text-teal-700 rounded-2xl font-bold text-xl hover:bg-teal-50 transition-all shadow-2xl flex items-center justify-center">Sign Up Now</Link>
                    <Link to="/login" className="w-full sm:w-auto px-10 py-5 border-2 border-white/30 text-white rounded-2xl font-bold text-xl hover:bg-white/10 transition-all flex items-center justify-center">Request a Pricing Quote</Link>
                </div>
            </div>
        </section>
    </main>

    {/*  Footer  */}
    <footer id="footer" className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                            <iconify-icon icon="lucide:layers" className="text-white text-xl"></iconify-icon>
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">InventoryHub</span>
                    </div>
                    <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">The OS for modern product distribution. Empowering thousands of wholesale operations world-wide.</p>
                    <div className="flex gap-4">
                        <a href="https://twitter.com" className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"><iconify-icon icon="ri:twitter-x-fill"></iconify-icon></a>
                        <a href="https://linkedin.com" className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"><iconify-icon icon="ri:linkedin-fill"></iconify-icon></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 mb-6">Product</h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-500">
                        <li><a href="#features" className="hover:text-teal-600">Features</a></li>
                        <li><a href="#integrations" className="hover:text-teal-600">Integrations</a></li>
                        <li><a href="#pricing" className="hover:text-teal-600">Pricing</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-500">
                        <li><a href="#" className="hover:text-teal-600">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-teal-600">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-teal-600">Cookie Policy</a></li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <p>&copy; 2026 InventoryHub Systems Inc. All rights reserved.</p>
                <div className="flex gap-8">
                    <span>SOC2 Type II Certified</span>
                    <span>GDPR Compliant</span>
                </div>
            </div>
        </div>
    </footer>

    </div>
  );
};

export default LandingPage;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Boxes,
  Truck,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Layers,
  ChevronRight,
  Menu,
  X,
  IndianRupee,
  Cpu,
  BarChart3,
  RefreshCw,
  Clock,
  PackageCheck
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for the interactive AI Demand Prediction Demonstration
  const [selectedDemoProduct, setSelectedDemoProduct] = useState({
    name: "Parle-G Gold Biscuits (70g)",
    currentStock: 18,
    dailySales: 8,
    leadTime: 2,
    safetyStock: 10,
    purchasePrice: 8.5,
    sellingPrice: 10
  });

  const [simDailySales, setSimDailySales] = useState(8);
  const [simLeadTime, setSimLeadTime] = useState(2);
  const [simCurrentStock, setSimCurrentStock] = useState(18);

  // Mathematical Forecasting Calculation live
  const forecast7 = Math.ceil(simDailySales * 7);
  const leadTimeDemand = Math.ceil(simDailySales * simLeadTime);
  const safetyStockBuffer = Math.max(8, Math.ceil(simDailySales * 1.2));
  const rawReorder = Math.ceil(leadTimeDemand + safetyStockBuffer - simCurrentStock);
  const suggestedReorder = Math.max(0, rawReorder);
  const daysLeft = simDailySales > 0 ? (Math.round((simCurrentStock / simDailySales) * 10) / 10) : 99;
  const isCritical = simCurrentStock <= leadTimeDemand;

  const demoPresets = [
    { name: "Parle-G Biscuits", stock: 14, daily: 12, lead: 2, price: 8.5 },
    { name: "Maggi Noodles", stock: 18, daily: 9, lead: 2, price: 11.8 },
    { name: "Tata Salt 1kg", stock: 45, daily: 4, lead: 3, price: 22 },
    { name: "Surf Excel 15g", stock: 160, daily: 16, lead: 2, price: 1.6 },
    { name: "Wheel Detergent 1kg (Dead Stock)", stock: 75, daily: 0, lead: 3, price: 64 }
  ];

  const handleSelectPreset = (p) => {
    setSelectedDemoProduct(p);
    setSimCurrentStock(p.stock);
    setSimDailySales(p.daily);
    setSimLeadTime(p.lead);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      {/* 1. NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Store size={22} />
            </div>
            <div>
              <span className="text-xl font-black text-emerald-950 tracking-tight flex items-center gap-1.5">
                KIRANAS
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-emerald-700 uppercase">
                Rural FMCG Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#solution" className="hover:text-emerald-700 transition">Solution</a>
            <a href="#features" className="hover:text-emerald-700 transition">Features</a>
            <a href="#ai-demo" className="hover:text-emerald-700 transition">AI Engine Demo</a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition">How It Works</a>
            <a href="#logistics" className="hover:text-emerald-700 transition">Logistics</a>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:bg-slate-50 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <span>Explore Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-emerald-700 md:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3">
            <a
              href="#solution"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700"
            >
              Solution
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700"
            >
              Features
            </a>
            <a
              href="#ai-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700"
            >
              AI Engine Demo
            </a>
            <div className="pt-3 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2 text-sm font-semibold border border-slate-200 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/dashboard"
                className="w-full text-center py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl shadow-md"
              >
                Launch App
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-emerald-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles size={14} className="text-emerald-700" />
                Rural FMCG & Smart Inventory Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Stop Losing Money on Stock. <br />
                <span className="text-emerald-700">Start Selling Smarter.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                An intelligent inventory platform that predicts what your customers need, detects dead stock and helps your Kirana store stay ready for every sale.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/dashboard"
                  className="px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/25 transition flex items-center gap-2 text-base"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#ai-demo"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm transition flex items-center gap-2 text-base"
                >
                  <span>Explore Features</span>
                </a>
              </div>

              {/* Trust Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/70 max-w-lg">
                <div>
                  <div className="text-2xl font-black text-emerald-800">40%</div>
                  <div className="text-xs text-slate-500 font-medium">Tied-Up Cash Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-800">0</div>
                  <div className="text-xs text-slate-500 font-medium">Stockouts of Essentials</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-800">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Offline/Demo Ready</div>
                </div>
              </div>
            </div>

            {/* Right Graphic: Interactive Rural Kirana Store Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 card-shadow">
                {/* Store Header Plaque */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-xs uppercase tracking-wide text-slate-700">
                      Live Store Telemetry
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                    APMC Mandi Hub
                  </span>
                </div>

                {/* FMCG Shelf Mockup */}
                <div className="py-4 space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Parle-G Gold Biscuits</div>
                      <div className="text-[10px] text-slate-400">Velocity: 12 pkts/day · Lead: 2d</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                        Stock: 14 (Critical)
                      </span>
                      <div className="text-[10px] font-bold text-emerald-700 mt-0.5">PO: +48 units</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Maggi 2-Min Noodles</div>
                      <div className="text-[10px] text-slate-400">Velocity: 9 pkts/day · Lead: 2d</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Stock: 18 (Low)
                      </span>
                      <div className="text-[10px] font-bold text-emerald-700 mt-0.5">PO: +30 units</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Tata Salt 1kg</div>
                      <div className="text-[10px] text-slate-400">Velocity: 4 pkts/day · Lead: 3d</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Stock: 45 (Healthy)
                      </span>
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5">Cover: 11 days</div>
                    </div>
                  </div>

                  <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Wheel Detergent 1kg</div>
                      <div className="text-[10px] text-red-600">No sale in 26 days · ₹4,800 blocked</div>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      Dead Stock
                    </span>
                  </div>
                </div>

                {/* Footer KPI in card */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Auto-Replenishment:</span>
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-600" /> 2 Purchase Orders Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION & PLATFORM CAPABILITIES */}

      {/* 4. OUR SOLUTION SECTION */}
      <section id="solution" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              The Solution
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              KIRANAS: Smart Inventory. Smarter Kiranas.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              We replaced guesswork with an intelligent mathematical inventory engine specifically calibrated for rural FMCG demand patterns, counter sales, and distributor lead times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Cpu size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Velocity Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Continuous moving average calculations determine the true daily sales velocity of every FMCG SKU.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Dead Stock Sentinel</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically detects products untouched for 21+ days and calculates capital blocked in rupees.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Truck size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Lead-Time Replenishment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Formula takes supplier lead time into account so orders are placed exactly when the reorder point is breached.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <IndianRupee size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Capital Recovery Planner</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates clearance bundle strategies (e.g. combo with Maggi) or distributor return notices to unlock frozen cash.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE AI DEMAND FORECASTING DEMONSTRATION */}
      <section id="ai-demo" className="py-20 bg-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700">
              Interactive AI Engine Simulator
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Test The Forecasting Algorithm Live
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Watch how our mathematical algorithm evaluates daily velocity, distributor lead time and safety buffers in real-time.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="text-xs text-slate-400 font-semibold mr-2">Try FMCG Presets:</span>
            {demoPresets.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  selectedDemoProduct.name === p.name
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                    : "bg-emerald-900/40 text-slate-300 border-emerald-800 hover:bg-emerald-800/60"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Interactive Calculator Card */}
          <div className="max-w-4xl mx-auto bg-slate-900/90 rounded-3xl border border-emerald-800/60 p-6 md:p-8 shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left: Input Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                    <span>Current Shelf Stock:</span>
                    <span className="text-emerald-400 font-black text-sm">{simCurrentStock} units</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simCurrentStock}
                    onChange={(e) => setSimCurrentStock(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                    <span>Average Daily Sales Velocity (V_daily):</span>
                    <span className="text-emerald-400 font-black text-sm">{simDailySales} units/day</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={simDailySales}
                    onChange={(e) => setSimDailySales(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                    <span>Distributor Lead Time (Days):</span>
                    <span className="text-emerald-400 font-black text-sm">{simLeadTime} days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={simLeadTime}
                    onChange={(e) => setSimLeadTime(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Mathematical Formula Display */}
                <div className="p-3.5 bg-emerald-950/70 border border-emerald-800/50 rounded-xl text-[11px] text-emerald-200 font-mono space-y-1">
                  <div className="text-emerald-400 font-bold">Standard Reorder Formula:</div>
                  <div>Reorder Qty = max(0, LeadTimeDemand + SafetyStock - CurrentStock)</div>
                  <div className="text-slate-400">
                    = max(0, ({simDailySales} × {simLeadTime}) + {safetyStockBuffer} - {simCurrentStock}) = <span className="text-white font-bold">{suggestedReorder} units</span>
                  </div>
                </div>
              </div>

              {/* Right: Engine Calculation Result */}
              <div className="bg-emerald-900/30 p-6 rounded-2xl border border-emerald-700/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Prediction Analysis
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      isCritical
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {isCritical ? "CRITICAL RISK" : "OPTIMAL BUFFER"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">7-Day Demand</div>
                    <div className="text-xl font-black text-white mt-0.5">{forecast7} units</div>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400">Days Stock Left</div>
                    <div className="text-xl font-black text-white mt-0.5">{daysLeft} days</div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-800/40 rounded-xl border border-emerald-600/40">
                  <div className="text-xs text-emerald-300 font-semibold">Suggested Reorder Quantity:</div>
                  <div className="text-3xl font-black text-white mt-1">
                    {suggestedReorder} <span className="text-sm font-normal text-slate-300">units</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 mt-2">
                    {suggestedReorder > 0
                      ? `At current velocity of ${simDailySales}/day, your stock will deplete in ${daysLeft} days. Place order today to arrive before stockout!`
                      : "Current stock satisfies the lead-time demand and safety buffer. No purchase required today."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS IN THREE STEPS */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Simple Workflow
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              How KIRANAS Works in Three Steps
            </h2>
            <p className="text-slate-600 text-base">
              Designed for ease-of-use by rural shopkeepers on any smartphone or tablet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-emerald-600/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Track Counter Sales</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tap once to record daily cash, UPI or Khata customer sales. Shelf stock deducts automatically in real-time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-emerald-600/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Analyzes Demand & Lead Times</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The forecasting algorithm calculates your depletion rates and factors in your distributor's 2-to-4 day transit cycles.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-emerald-600/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1-Click Purchase Order</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generate clean, consolidated purchase orders for your mandi distributors with exact recommended replenishment quantities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DISTRIBUTOR & LOGISTICS SECTION */}
      <section id="logistics" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Rural FMCG Supply Chain
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Seamless Connection to Mandi Wholesale & Rural Delivery
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Rural Kiranas often suffer from fragmented delivery routes. KIRANAS consolidates orders across neighboring village stores, enabling mandi distributors to dispatch full mini-truck loads predictably.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <strong className="text-sm text-slate-800 block">Lead Time Sensitivity:</strong>
                    <span className="text-xs text-slate-600">Calculates replenishment days before distributor delivery days.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <strong className="text-sm text-slate-800 block">MOQ Optimization:</strong>
                    <span className="text-xs text-slate-600">Bundles purchase quantities to satisfy distributor minimum order quantities.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <strong className="text-sm text-slate-800 block">Auto-Restocking on Delivery:</strong>
                    <span className="text-xs text-slate-600">When orders are marked delivered, shelf stock increases automatically.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/suppliers"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                >
                  <span>Explore Distributor Directory</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Logistics Flow Illustration */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Delivery Lifecycle
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Store size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">1. Kirana Store Reorder Point</div>
                  <div className="text-[11px] text-slate-500">AI triggers replenishment PO for low items</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">2. APMC Mandi Distributor Sync</div>
                  <div className="text-[11px] text-slate-500">Order grouped & scheduled for dispatch</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Truck size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">3. Rural Route Delivery & Auto-Stock</div>
                  <div className="text-[11px] text-slate-500">Mini-truck delivery updates store stock instantly</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA SECTION */}
      <section className="py-20 bg-emerald-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700">
            Hackathon Ready · In-Memory & MongoDB Support
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Ready to Transform Your Kirana Store?
          </h2>
          <p className="text-emerald-100 text-base md:text-lg max-w-2xl mx-auto">
            Experience the working demo with authentic Indian FMCG inventory, real mathematical demand forecasts and dead-stock recovery tools.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-white text-emerald-900 font-black rounded-xl shadow-xl hover:bg-emerald-50 transition flex items-center gap-2 text-base"
            >
              <span>Launch Retailer Dashboard</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="px-6 py-4 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl border border-emerald-700 transition text-base"
            >
              Sign In Demo Account
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Store size={18} />
              </div>
              <span className="text-lg font-black text-white">KIRANAS</span>
              <span className="text-xs text-slate-500">· "Smart Inventory. Smarter Kiranas."</span>
            </div>

            <div className="text-xs text-center md:text-right">
              <p>Rural FMCG & Logistics · Smart Inventory Platform</p>
              <p className="text-slate-500 mt-1">
                Demo Credentials: <span className="text-emerald-400 font-mono">shopkeeper@kiranas.in / kirana123</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

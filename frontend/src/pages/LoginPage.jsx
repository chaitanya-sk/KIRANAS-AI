import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Store,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Zap,
  Package
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [providersConfig, setProvidersConfig] = useState(null);

  // Mouse Parallax & 3D Tilt State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const registeredSuccess = searchParams.get("registered");
  const oauthError = searchParams.get("error");
  const oauthMessage = searchParams.get("message");

  // Load remembered email on mount & check OAuth availability
  useEffect(() => {
    const savedEmail = localStorage.getItem("kiranas_remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    async function checkProviders() {
      try {
        const res = await api.get("/auth/providers");
        if (res.data) {
          setProvidersConfig(res.data);
        }
      } catch (err) {
        setProvidersConfig({ google: false, apple: false, facebook: false, microsoft: false });
      }
    }
    checkProviders();
  }, []);

  // Global mouse move for floating 3D objects parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const normY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      setMousePos({ x: normX, y: normY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Card 3D tilt calculation on mouse move
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = -((y - centerY) / centerY) * 5; // max 5 deg tilt
    const tiltY = ((x - centerX) / centerX) * 5; // max 5 deg tilt
    setCardTilt({ x: tiltX, y: tiltY });
  };

  const handleCardMouseEnter = () => setIsHovered(true);
  const handleCardMouseLeave = () => {
    setIsHovered(false);
    setCardTilt({ x: 0, y: 0 });
  };

  // Submit standard login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading || demoLoading) return;

    setError("");
    const cleanEmail = email.trim();

    // Validate email
    if (!cleanEmail) {
      setError("Email address is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address (e.g., name@kirana.com).");
      return;
    }

    // Validate password
    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(cleanEmail, password);

      if (rememberMe) {
        localStorage.setItem("kiranas_remembered_email", cleanEmail);
      } else {
        localStorage.removeItem("kiranas_remembered_email");
      }

      navigate("/dashboard");
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        (err.request
          ? "Backend server is unreachable. Please verify http://localhost:5000 is running."
          : "Invalid email or password. Please try again.");
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  // Instant Demo Sign In using configured demo account
  const handleDemoLogin = async () => {
    if (loading || demoLoading) return;
    try {
      setDemoLoading(true);
      setError("");
      // Call actual backend login with authentic demo storekeeper credentials
      await login("shopkeeper@kiranas.in", "kirana123");
      navigate("/dashboard");
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        (err.request
          ? "Backend server is unreachable. Please verify http://localhost:5000 is running."
          : "Demo sign-in failed. Please try again.");
      setError(serverMsg);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
    if (!providersConfig || !providersConfig[provider]) return;
    window.location.href = `/api/auth/${provider}`;
  };

  const hasConfiguredOAuth =
    providersConfig &&
    (providersConfig.google || providersConfig.apple || providersConfig.facebook || providersConfig.microsoft);

  return (
    <div className="min-h-screen bg-[#F1FAF5] text-slate-800 relative overflow-x-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 perspective-1000 select-none">
      {/* ===================================================
          1. 3D AMBIENT LIGHTING & GLOWING PARTICLES
          =================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-Center Emerald Sun Glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[550px] rounded-full blur-[140px] opacity-45 transition-transform duration-700 ease-out"
          style={{
            background: "radial-gradient(circle, #078451 0%, #DDF8E9 60%, transparent 80%)",
            transform: `translate(-50%, ${mousePos.y * 25}px)`
          }}
        />

        {/* Bottom-Left Mint Glow */}
        <div
          className="absolute -bottom-40 -left-20 w-[600px] h-[500px] rounded-full blur-[130px] opacity-40 transition-transform duration-700 ease-out"
          style={{
            background: "radial-gradient(circle, #DDF8E9 0%, #078451 50%, transparent 75%)",
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -15}px)`
          }}
        />

        {/* Bottom-Right Soft Emerald Ambient */}
        <div
          className="absolute -bottom-20 -right-20 w-[550px] h-[450px] rounded-full blur-[120px] opacity-35"
          style={{
            background: "radial-gradient(circle, #05633D 0%, #DDF8E9 65%, transparent 80%)"
          }}
        />

        {/* Floating Ambient Stardust Particles */}
        <div className="absolute top-1/4 left-1/6 w-2.5 h-2.5 rounded-full bg-emerald-500/30 blur-[1px] animate-pulse-subtle" />
        <div className="absolute top-1/3 right-1/5 w-3 h-3 rounded-full bg-emerald-400/25 blur-[1px] animate-pulse-subtle" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full bg-emerald-600/20 blur-[0.5px] animate-pulse-subtle" style={{ animationDelay: "2.5s" }} />
        <div className="absolute bottom-1/3 right-1/4 w-3.5 h-3.5 rounded-full bg-emerald-300/30 blur-[1px] animate-pulse-subtle" style={{ animationDelay: "3s" }} />
      </div>

      {/* ===================================================
          2. FLOATING 3D FMCG OBJECTS IN PARALLAX SPACE
          =================================================== */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* OBJECT 1: Parle-G Biscuit Packet (Top-Left) */}
        <div
          className="absolute top-10 left-[3%] sm:left-[6%] lg:left-[11%] hidden md:block animate-float-1 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 28}px, ${mousePos.y * 22}px) rotate(-10deg)`
          }}
        >
          <div className="relative w-36 h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 p-2 shadow-2xl shadow-amber-900/20 border-2 border-amber-200/90 transform hover:scale-105 transition-all">
            <div className="h-full w-full rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-300/50 to-amber-500/50 p-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-amber-950 uppercase px-1.5 py-0.5 bg-white/70 rounded">
                  PARLE-G
                </span>
                <span className="text-[9px] font-extrabold text-amber-900">₹10</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <div className="w-5 h-5 rounded-md bg-amber-600/40 border border-amber-700/30 flex items-center justify-center text-[8px] font-bold text-amber-950">G</div>
                <div className="w-5 h-5 rounded-md bg-amber-600/40 border border-amber-700/30 flex items-center justify-center text-[8px] font-bold text-amber-950">★</div>
                <div className="w-5 h-5 rounded-md bg-amber-600/40 border border-amber-700/30 flex items-center justify-center text-[8px] font-bold text-amber-950">G</div>
              </div>
              <div className="text-[8px] font-black text-amber-950 text-center tracking-tighter">
                GLUCO BISCUITS · 70g
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-full h-full rounded-2xl bg-amber-800/20 -z-10 blur-xs" />
          </div>
        </div>

        {/* OBJECT 2: Maggi 2-Minute Noodles Packet (Top-Right) */}
        <div
          className="absolute top-12 right-[3%] sm:right-[6%] lg:left-auto lg:right-[11%] hidden md:block animate-float-2 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -20}px) rotate(12deg)`
          }}
        >
          <div className="relative w-36 h-28 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 p-2 shadow-2xl shadow-yellow-900/25 border-2 border-yellow-200">
            <div className="h-full w-full rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 p-2 flex flex-col justify-between border border-red-500/30">
              <div className="flex items-center justify-between">
                <div className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider shadow-xs">
                  MAGGI
                </div>
                <span className="text-[9px] font-black text-red-700 bg-white/70 px-1 rounded">2-MIN</span>
              </div>
              <div className="text-center my-0.5">
                <div className="text-xs font-black text-red-700 tracking-tight">MASALA</div>
                <div className="text-[8px] text-amber-950 font-semibold">Tastemaker Noodles</div>
              </div>
              <div className="flex items-center justify-between text-[8px] font-bold text-slate-800">
                <span>70g PACK</span>
                <span className="text-red-700 font-black">₹14</span>
              </div>
            </div>
            <div className="absolute -bottom-1.5 -left-1 w-full h-full rounded-2xl bg-yellow-900/25 -z-10 blur-xs" />
          </div>
        </div>

        {/* OBJECT 3: Amul Milk Pouch (Bottom-Right) */}
        <div
          className="absolute bottom-12 right-[2%] sm:right-[5%] lg:right-[10%] hidden md:block animate-float-3 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -25}px, ${mousePos.y * 25}px) rotate(-8deg)`
          }}
        >
          <div className="relative w-32 h-36 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-sky-100 p-2.5 shadow-2xl shadow-sky-900/15 border-2 border-sky-200">
            <div className="h-full w-full rounded-2xl bg-gradient-to-b from-white via-sky-50 to-sky-100 p-2.5 flex flex-col justify-between border border-sky-300/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-900">AMUL</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />
              </div>
              <div className="text-center my-1">
                <div className="text-xs font-black text-blue-800">TAAZA</div>
                <div className="text-[8px] text-sky-700 font-semibold">Toned Milk · 500ml</div>
                <div className="text-[9px] text-emerald-700 font-bold mt-1">Fresh Daily</div>
              </div>
              <div className="text-center text-[9px] font-black text-blue-950 bg-sky-200/60 py-0.5 rounded-lg">
                ₹27
              </div>
            </div>
            <div className="absolute -bottom-2 -right-1.5 w-full h-full rounded-3xl bg-sky-900/15 -z-10 blur-xs" />
          </div>
        </div>

        {/* OBJECT 4: Fortune Oil Bottle (Bottom-Left) */}
        <div
          className="absolute bottom-16 left-[2%] sm:left-[5%] lg:left-[10%] hidden md:block animate-float-4 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 24}px, ${mousePos.y * -22}px) rotate(10deg)`
          }}
        >
          <div className="relative w-28 h-40 rounded-3xl bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 p-2 shadow-2xl shadow-amber-950/20 border-2 border-amber-100">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-4 rounded-t-lg bg-emerald-600 border border-emerald-500 shadow-xs" />
            <div className="h-full w-full rounded-2xl bg-gradient-to-b from-amber-100/90 via-amber-200/80 to-amber-300/90 p-2 flex flex-col justify-between border border-amber-400/40">
              <div className="text-center pt-2">
                <span className="text-[9px] font-black tracking-wider text-emerald-800 uppercase px-1 rounded bg-white/70">
                  FORTUNE
                </span>
                <div className="text-[8px] font-bold text-amber-900 mt-0.5">Sunflower Oil</div>
              </div>
              <div className="text-center">
                <div className="text-base font-black text-amber-950">1L</div>
                <div className="text-[8px] text-amber-800">Refined Pouch</div>
              </div>
              <div className="text-center text-[8px] font-black text-amber-950 bg-white/80 py-0.5 rounded">
                ₹135
              </div>
            </div>
            <div className="absolute -bottom-2 -left-1.5 w-full h-full rounded-3xl bg-amber-950/20 -z-10 blur-xs" />
          </div>
        </div>

        {/* OBJECT 5: Rural Kirana Grocery Bag (Mid-Left) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-[1%] sm:left-[2%] lg:left-[4%] hidden xl:block animate-float-2 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * 18}px, ${mousePos.y * 18}px) rotate(-6deg)`
          }}
        >
          <div className="w-32 h-36 rounded-2xl bg-gradient-to-br from-amber-100 via-stone-200 to-amber-200 p-2 shadow-xl border border-amber-300/60 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-6 rounded-t-full border-3 border-amber-800/40 bg-transparent" />
            <div className="h-full w-full rounded-xl bg-amber-50/70 p-2 flex flex-col justify-between text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] font-extrabold text-amber-950 pt-1">
                <Store size={12} className="text-emerald-700" />
                <span>KIRANA</span>
              </div>
              <div className="text-[10px] font-black text-stone-800 leading-tight">
                Fresh FMCG Staples
              </div>
              <div className="text-[8px] font-semibold text-emerald-800 bg-emerald-100/70 py-0.5 rounded">
                Verified Mandi Supply
              </div>
            </div>
          </div>
        </div>

        {/* OBJECT 6: Mini FMCG Logistics Box (Mid-Right) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 right-[1%] sm:right-[2%] lg:right-[4%] hidden xl:block animate-float-1 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -16}px) rotate(8deg)`
          }}
        >
          <div className="w-36 h-32 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 p-2.5 shadow-xl shadow-amber-950/25 border-2 border-amber-500/80 text-white">
            <div className="h-full w-full rounded-xl bg-amber-700/80 p-2 flex flex-col justify-between border border-dashed border-amber-400/50">
              <div className="flex items-center justify-between text-[9px] font-black">
                <span className="bg-white text-amber-950 px-1 py-0.2 rounded font-mono">APMC-MANDI</span>
                <span className="text-amber-200">BOX #42</span>
              </div>
              <div className="text-center">
                <div className="text-xs font-black tracking-wider text-amber-100">FMCG STOCK</div>
                <div className="text-[8px] text-amber-300">Automated Replenishment</div>
              </div>
              <div className="flex items-center justify-between text-[8px] font-bold text-amber-200">
                <span>PRIORITY</span>
                <span className="text-emerald-300 font-black">EXPRESS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          3. MAIN 3D TILT LOGIN CARD (CENTERED & RESPONSIVE)
          =================================================== */}
      <div
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseEnter={handleCardMouseEnter}
        onMouseLeave={handleCardMouseLeave}
        className="w-full max-w-[460px] z-20 transition-transform duration-200 ease-out transform-style-3d my-auto py-6"
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg) translateZ(6px)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)"
        }}
      >
        <div className="glass-panel-3d rounded-[28px] p-6 sm:p-8 relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle Glass Surface Reflection Sheen */}
          <div
            className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/20 pointer-events-none blur-2xl"
            style={{
              transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`
            }}
          />

          {/* Top Brand & Logo */}
          <div className="text-center space-y-2.5 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 group transition-transform duration-200 hover:scale-105"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#05633D] via-[#078451] to-emerald-400 text-white flex items-center justify-center font-bold shadow-lg shadow-[#078451]/25 ring-4 ring-[#DDF8E9]">
                <Store size={22} className="transition-transform group-hover:rotate-6" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-black tracking-tight text-[#101828] block leading-none">
                  KIRANAS
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#078451] uppercase block mt-1">
                  Smart Inventory. Smarter Kiranas.
                </span>
              </div>
            </Link>

            <div className="pt-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#101828] tracking-tight">
                Welcome Back, Shopkeeper
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Sign in to manage your inventory and AI demand forecasts.
              </p>
            </div>
          </div>

          {/* Registration Success Notification */}
          {registeredSuccess && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 relative z-10 text-left">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>Account created successfully! Please sign in with your credentials.</span>
            </div>
          )}

          {/* OAuth Callback Notice */}
          {oauthError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 relative z-10 text-left">
              <AlertCircle size={16} className="shrink-0" />
              <span>Authentication error: {oauthMessage || "Verification could not be completed."}</span>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="mt-4 p-3 bg-red-50/95 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 relative z-10 animate-shake text-left">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {error.includes("No account found") && (
                  <Link to="/register" className="ml-1.5 font-bold underline text-red-800 hover:text-red-950">
                    Register here
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* ===================================================
              4. HACKATHON DEMO LOGIN SECTION (HIGHLIGHTED)
              =================================================== */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-emerald-100/50 to-emerald-50/90 border border-emerald-200/90 shadow-xs relative z-10 text-left space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-xs text-[#05633D]">
                <Zap size={14} className="text-[#078451] fill-current" />
                <span>Hackathon Demo Login</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs animate-pulse">
                INSTANT ACCESS
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Explore the platform with preloaded FMCG products and 30 days of sales history.
            </p>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {demoLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Loading Demo Store...</span>
                </>
              ) : (
                <>
                  <span>Instant Demo Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>

          {/* Divider: OR SIGN IN WITH CREDENTIALS */}
          <div className="relative my-4 text-center relative z-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/90" />
            </div>
            <span className="relative bg-white/95 px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase rounded">
              OR SIGN IN WITH CREDENTIALS
            </span>
          </div>

          {/* ===================================================
              5. LOGIN FORM & INPUTS
              =================================================== */}
          <form onSubmit={handleLogin} noValidate className="space-y-3.5 relative z-10 text-left">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-[#078451] transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@kirana.com"
                  disabled={loading || demoLoading}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white/80 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#078451] focus:border-[#078451] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative group">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-[#078451] transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading || demoLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-white/80 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#078451] focus:border-[#078451] focus:bg-white transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#078451] focus:ring-[#078451] border-slate-300"
                />
                <span>Remember email</span>
              </label>
            </div>

            {/* Main Sign In Button */}
            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full py-3 px-4 bg-[#101828] hover:bg-[#078451] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-slate-900/15 hover:shadow-[#078451]/25 transition-all duration-200 active:scale-[0.98] active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Providers (Rendered only if configured on backend) */}
          {hasConfiguredOAuth ? (
            <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
              {providersConfig.google && (
                <button
                  type="button"
                  onClick={() => handleSocialAuth("google")}
                  className="w-full h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition flex items-center justify-center gap-2.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              )}

              {providersConfig.apple && (
                <button
                  type="button"
                  onClick={() => handleSocialAuth("apple")}
                  className="w-full h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 shadow-2xs transition flex items-center justify-center gap-2.5"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.99 1.72-.88 2.74 1 .08 2.02-.51 2.59-1.24" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              )}
            </div>
          ) : null}

          {/* ===================================================
              6. REGISTER SECTION
              =================================================== */}
          <div className="pt-4 text-center text-xs text-slate-500 relative z-10 border-t border-slate-100 mt-5">
            New rural store?{" "}
            <Link
              to="/register"
              className="font-bold text-[#078451] hover:text-[#05633D] hover:underline inline-flex items-center gap-1 transition"
            >
              <span>Register your Kirana store</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Back to Home Link */}
          <div className="text-center mt-3">
            <Link
              to="/"
              className="text-[11px] font-semibold text-slate-400 hover:text-[#078451] transition"
            >
              ← Return to Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) {
      setError("");
      setIsDuplicateEmail(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setIsDuplicateEmail(false);

    // 1. Validate required fields
    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.shopName.trim()) {
      setError("Please enter your store / Kirana shop name.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address (e.g., name@kirana.com).");
      return;
    }

    // 3. Validate phone number
    if (!formData.phone.trim()) {
      setError("Please enter your mobile phone number.");
      return;
    }
    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, "");
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile phone number (e.g., 9876543210).");
      return;
    }

    // 4. Validate location
    if (!formData.location.trim()) {
      setError("Please enter your village, market, or district location.");
      return;
    }

    // 5. Validate password requirements (minimum 6 characters)
    if (!formData.password) {
      setError("Please enter a password.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // 6. Validate password and confirm password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please ensure both passwords are identical.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        shopName: formData.shopName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        password: formData.password
      };

      await register(payload);

      // On successful registration, redirect to dashboard or login
      navigate("/dashboard");
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message || "Failed to register account.";

      if (
        serverMsg.toLowerCase().includes("already exists") ||
        serverMsg.toLowerCase().includes("already registered")
      ) {
        setIsDuplicateEmail(true);
        setError("This email is already registered. Please sign in.");
      } else {
        setError(serverMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/30 text-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/90 p-6 sm:p-8 my-8 relative">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group transition-transform duration-200 hover:scale-105"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-700/20">
              <Store size={22} className="transition-transform group-hover:rotate-6" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-slate-900 block leading-none">
                KIRANAS
              </span>
              <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase block mt-1">
                Smart Inventory. Smarter Kiranas.
              </span>
            </div>
          </Link>

          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Register Your Kirana Store
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your account to connect store inventory with AI demand forecasting and automated replenishment.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-shake text-left">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {isDuplicateEmail && (
                <div className="mt-1">
                  <Link
                    to="/login"
                    className="font-bold underline text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
                  >
                    <span>Click here to Sign In now</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} noValidate className="mt-5 space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <User
                  size={15}
                  className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-emerald-700 transition-colors"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Ramesh Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Shop Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shop / Store Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Store
                  size={15}
                  className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-emerald-700 transition-colors"
                />
                <input
                  type="text"
                  name="shopName"
                  placeholder="Sharma General Store"
                  value={formData.shopName}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-emerald-700 transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="name@kirana.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Phone
                  size={15}
                  className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-emerald-700 transition-colors"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Village / Market Location */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Village / Market Location <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <MapPin
                  size={15}
                  className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-emerald-700 transition-colors"
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Main Mandi Road, Gram Bilaspur"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password (6+ chars) <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-emerald-700 transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-emerald-700 transition-colors"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-lg transition duration-150 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating store account...</span>
              </>
            ) : (
              <>
                <span>Register Store & Launch Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 text-center text-xs text-slate-500 border-t border-slate-100 mt-5">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 transition"
          >
            <span>Sign In here</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-3">
          <Link
            to="/"
            className="text-[11px] font-semibold text-slate-400 hover:text-emerald-700 transition"
          >
            ← Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}

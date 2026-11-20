import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Store, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const code = searchParams.get("code");

  useEffect(() => {
    async function exchangeCode() {
      if (!code) {
        setStatus("error");
        setErrorMessage("Missing authorization code in callback URL. Please return to login and try again.");
        return;
      }

      try {
        setStatus("verifying");
        const res = await api.post("/auth/oauth/exchange", { code });
        const { token, user } = res.data;

        if (token && user) {
          setSession(token, user);
          setStatus("success");
          setTimeout(() => {
            navigate("/dashboard");
          }, 800);
        } else {
          throw new Error("Invalid session data returned from exchange");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message ||
          err.message ||
          "Failed to complete OAuth authentication. Please try again."
        );
      }
    }

    exchangeCode();
  }, [code, navigate, setSession]);

  return (
    <div className="min-h-screen bg-[#F1FAF5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-100 text-center space-y-6">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 text-emerald-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
            <Store size={22} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">KIRANAS</span>
        </div>

        {/* Verifying State */}
        {status === "verifying" && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <h2 className="text-lg font-black text-slate-800">Completing Social Authentication...</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Securely verifying authorization code, retrieving your store profile and establishing session.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="space-y-3 py-4 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-lg font-black text-emerald-900">Authentication Verified!</h2>
            <p className="text-xs text-slate-500">Redirecting to your Retailer Dashboard...</p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-lg font-black text-slate-900">Authentication Failed</h2>
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-left">
              {errorMessage}
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-md"
            >
              <span>Back to Login</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

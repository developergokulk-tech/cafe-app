"use client";

import { useState } from "react";

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030304] via-[#080710] to-[#040406] text-slate-100 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card Container */}
        <div className="overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-b from-[#12101B]/90 to-[#08070D]/95 backdrop-blur-xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-black/60 border border-amber-500/40 p-2.5 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <img
                src="/logo.png"
                alt="Rest In Peace Cafe Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Rest In Peace</h1>
            <p className="text-xs text-amber-400/90 font-bold uppercase tracking-widest mt-1">Staff & Admin Portal</p>
            <p className="text-xs text-slate-400 mt-2">Sign in to manage orders, kitchen operations, and cafe settings</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 animate-in fade-in slide-in-from-top-1 duration-200">
              <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative flex items-center rounded-2xl border border-amber-500/25 bg-[#0A0910] px-4 py-3.5 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/50 transition">
                <svg className="w-4 h-4 text-slate-500 shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative flex items-center rounded-2xl border border-amber-500/25 bg-[#0A0910] px-4 py-3.5 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/50 transition">
                <svg className="w-4 h-4 text-slate-500 shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-300 transition text-xs shrink-0 ml-2"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 py-3.5 text-sm font-extrabold text-black shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:from-amber-400 hover:to-amber-600 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Sign In to Dashboard →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


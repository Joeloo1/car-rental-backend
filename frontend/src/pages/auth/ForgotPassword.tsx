import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "@/lib/icons";
import api from "../../api/axios";

const ForgotPassword: React.FC = () => {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] animate-fade-up">

        {success ? (
          /* ── Success state ──────────────────────────────────── */
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(0,201,177,0.12)", border: "1px solid rgba(0,201,177,0.22)" }}
              >
                <CheckCircle2 size={28} className="text-teal" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink-primary tracking-tight mb-2">Check your inbox</h1>
            <p className="text-sm text-ink-tertiary leading-relaxed mb-8">
              We sent a password reset link to{" "}
              <span className="font-semibold text-ink-secondary">{email}</span>.
              Check your inbox and spam folder.
            </p>
            <div className="p-4 rounded-2xl bg-surface-1 border border-white/[0.07] text-left space-y-2.5 mb-8">
              {["Open your email inbox", "Find the email from LuxeDrive", "Click the reset link inside"].map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-gold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-ink-secondary">{s}</p>
                </div>
              ))}
            </div>
            <Link to="/login" className="btn-primary w-full">
              <ArrowLeft size={15} /> Back to sign in
            </Link>
          </div>
        ) : (
          /* ── Form state ─────────────────────────────────────── */
          <>
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6">
                <Mail size={20} className="text-gold" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-ink-primary tracking-tight mb-1.5">Forgot password?</h1>
              <p className="text-sm text-ink-tertiary leading-relaxed">
                Enter your email and we'll send you a secure link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red/[0.06] border border-red/15 text-xs text-red font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-ink-tertiary uppercase tracking-[0.1em] mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                    required
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-primary w-full"
              >
                {loading
                  ? <Loader2 size={15} className="animate-spin text-black" />
                  : <><span>Send reset link</span><ArrowRight size={15} /></>
                }
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-secondary transition-colors"
              >
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

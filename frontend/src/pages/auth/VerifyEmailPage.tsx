import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Mail, CheckCircle2, RefreshCw, ArrowRight, Loader2, Clock } from "@/lib/icons";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const COOLDOWN_S = 60;

const VerifyEmailPage: React.FC = () => {
  const { user } = useAuth();
  const location   = useLocation();

  // Prefer logged-in user's email; fall back to ?email= query param (set right after signup)
  const queryEmail = new URLSearchParams(location.search).get("email") ?? "";
  const email = user?.email ?? queryEmail;

  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent]         = useState(false);

  // Tick the cooldown counter down every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(c => c - 1), 1_000);
    return () => clearInterval(id);
  }, [cooldown]);

  const resendMutation = useMutation({
    mutationFn: () =>
      api.post("/auth/resend-verification-email", { email }),
    onSuccess: () => {
      setSent(true);
      setCooldown(COOLDOWN_S);
      toast.success("Verification email sent — check your inbox.");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to send email. Try again later.");
    },
  });

  const canResend = cooldown === 0 && !resendMutation.isPending;

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
              sent ? "bg-teal-dim border-teal/20" : "bg-gold/10 border-gold/20"
            }`}
          >
            {sent
              ? <CheckCircle2 size={28} className="text-teal" />
              : <Mail size={28} className="text-gold" />
            }
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-2xl font-bold text-ink-primary tracking-tight text-center mb-2">
          {sent ? "Email sent!" : "Verify your email"}
        </h1>

        <p className="text-sm text-ink-tertiary text-center mb-8 leading-relaxed">
          {sent ? (
            <>
              We sent a new verification link to{" "}
              <span className="font-semibold text-ink-secondary">{email}</span>.
              Check your inbox — and your spam folder just in case.
            </>
          ) : (
            <>
              We sent a verification link to{" "}
              <span className="font-semibold text-ink-secondary">{email || "your email"}</span>.
              Click the link in that email to activate your account.
            </>
          )}
        </p>

        {/* Main card */}
        <div className="rounded-2xl bg-surface-1 border border-white/[0.07] p-6 space-y-5 mb-5">

          {/* Steps */}
          <div className="space-y-3">
            {[
              { n: "1", text: "Open your email inbox" },
              { n: "2", text: `Look for an email from LuxeDrive` },
              { n: "3", text: "Click the verification link inside" },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-gold">{n}</span>
                </div>
                <p className="text-sm text-ink-secondary">{text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.07]" />

          {/* Resend */}
          <div>
            <p className="text-xs text-ink-tertiary mb-3">
              Didn't receive it? Check spam, or request a new link.
            </p>
            <button
              onClick={() => resendMutation.mutate()}
              disabled={!canResend || !email}
              className={
                canResend && email
                  ? "btn-primary w-full"
                  : "w-full flex items-center justify-center gap-2 h-[52px] rounded-xl text-sm font-semibold bg-white/[0.04] text-ink-tertiary border border-white/[0.08] cursor-not-allowed"
              }
            >
              {resendMutation.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : cooldown > 0 ? (
                <Clock size={15} />
              ) : (
                <RefreshCw size={15} />
              )}
              {resendMutation.isPending
                ? "Sending…"
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend verification email"}
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex flex-col items-center gap-2 text-sm text-ink-tertiary">
          {user ? (
            <Link to="/dashboard" className="flex items-center gap-1.5 text-gold hover:text-gold-light transition-colors font-medium">
              Go to Dashboard <ArrowRight size={13} />
            </Link>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 text-gold hover:text-gold-light transition-colors font-medium">
              Already verified? Sign in <ArrowRight size={13} />
            </Link>
          )}
          <Link to="/" className="text-ink-tertiary hover:text-ink-secondary transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

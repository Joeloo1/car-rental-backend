import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw } from "@/lib/icons";
import { useAuth } from "../../context/AuthContext";

type Status = "loading" | "success" | "expired" | "invalid" | "already_verified";

const MESSAGES: Record<Status, { icon: React.ReactNode; title: string; body: string }> = {
  loading: {
    icon: <Loader2 size={28} className="animate-spin text-gold" />,
    title: "Verifying your email…",
    body: "Please wait while we confirm your address.",
  },
  success: {
    icon: <CheckCircle2 size={28} className="text-teal" />,
    title: "Email verified!",
    body: "Your account is now fully activated. Welcome to LuxeDrive.",
  },
  already_verified: {
    icon: <CheckCircle2 size={28} className="text-teal" />,
    title: "Already verified",
    body: "This email address has already been confirmed.",
  },
  expired: {
    icon: <XCircle size={28} className="text-gold" />,
    title: "Link expired",
    body: "This verification link has expired. Links are valid for 1 hour — request a new one below.",
  },
  invalid: {
    icon: <XCircle size={28} className="text-red" />,
    title: "Invalid link",
    body: "This verification link is not valid or has already been used.",
  },
};

const ICON_BG: Record<Status, string> = {
  loading:          "rgba(245,166,35,0.10)",
  success:          "rgba(0,201,177,0.12)",
  already_verified: "rgba(0,201,177,0.12)",
  expired:          "rgba(245,166,35,0.10)",
  invalid:          "rgba(255,77,77,0.12)",
};

const ICON_BORDER: Record<Status, string> = {
  loading:          "rgba(245,166,35,0.22)",
  success:          "rgba(0,201,177,0.22)",
  already_verified: "rgba(0,201,177,0.22)",
  expired:          "rgba(245,166,35,0.22)",
  invalid:          "rgba(255,77,77,0.22)",
};

const VerifyEmailConfirmPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const success = searchParams.get("success");
    const error   = searchParams.get("error");

    if (success === "true") {
      setStatus("success");
      // Update in-memory auth state so banner disappears immediately
      if (user && !user.isVerified) updateUser({ isVerified: true });
    } else if (error === "expired") {
      setStatus("expired");
    } else if (error === "missing_token" || error === "invalid") {
      setStatus("invalid");
    } else {
      // Fallback — shouldn't normally reach here
      setStatus("invalid");
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-redirect on success after countdown
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      navigate(user ? "/dashboard" : "/login", { replace: true });
      return;
    }
    const id = setInterval(() => setCountdown(c => c - 1), 1_000);
    return () => clearInterval(id);
  }, [status, countdown, navigate, user]);

  const msg = MESSAGES[status];

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] text-center animate-fade-up">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: ICON_BG[status], border: `1px solid ${ICON_BORDER[status]}` }}
          >
            {msg.icon}
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold text-ink-primary tracking-tight mb-2">{msg.title}</h1>
        <p className="text-sm text-ink-tertiary leading-relaxed mb-8">{msg.body}</p>

        {/* Actions */}
        {status === "success" && (
          <div className="space-y-3">
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login", { replace: true })}
              className="btn-primary w-full"
            >
              {user ? "Go to Dashboard" : "Sign in"} <ArrowRight size={15} />
            </button>
            <p className="text-xs text-ink-tertiary">
              Redirecting in {countdown}s…
            </p>
          </div>
        )}

        {(status === "expired" || status === "invalid") && (
          <div className="space-y-3">
            <Link to="/verify-email" className="btn-primary w-full">
              <RefreshCw size={15} /> Request new link
            </Link>
            <Link
              to="/login"
              className="block text-sm text-ink-tertiary hover:text-ink-secondary transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        )}

        {(status === "already_verified") && (
          <Link to={user ? "/dashboard" : "/login"} className="btn-primary mx-auto w-fit">
            {user ? "Go to Dashboard" : "Sign in"} <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailConfirmPage;

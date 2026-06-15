import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "@/lib/icons";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const STEPS = [
  "Verifying credentials…",
  "Securing your session…",
  "Almost ready…",
];

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { setToken, isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const tokenMatch   = document.cookie.match(/(?:^|;\s*)oauthAccessToken=([^;]+)/);
      const accessToken  = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

      if (!accessToken) return; // AuthContext refresh-token flow handles it on mount

      document.cookie = "oauthAccessToken=; Max-Age=0; path=/";

      try {
        await setToken(accessToken);
        toast.success("Signed in with Google!");
      } catch {
        toast.error("Failed to complete Google sign-in.");
        navigate("/login");
      }
    };

    handleAuthRedirect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoading && isAuthenticated)  setTimeout(() => navigate("/dashboard"), 600);
    if (!isLoading && !isAuthenticated) { toast.error("Authentication failed."); navigate("/login"); }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6">
      <div className="w-full max-w-[380px] text-center animate-fade-up">

        {/* Spinning icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer spinning ring */}
            <div
              className="absolute -inset-3 rounded-full border border-transparent animate-spin"
              style={{
                borderTopColor: "rgba(245,166,35,0.5)",
                borderRightColor: "rgba(245,166,35,0.15)",
                animationDuration: "1.2s",
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <ShieldCheck size={26} className="text-gold" />
            </div>
          </div>
        </div>

        <h2 className="font-heading text-xl font-bold text-ink-primary tracking-tight mb-2">
          Completing sign-in
        </h2>
        <p className="text-sm text-ink-tertiary mb-6">
          Please wait while we secure your session.
        </p>

        {/* Animated step text */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-ink-tertiary uppercase tracking-widest">
          <Loader2 size={12} className="animate-spin text-gold" />
          <span key={step} className="animate-fade-in">{STEPS[step]}</span>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;

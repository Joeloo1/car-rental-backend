import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();
  const [statusText, setStatusText] = useState("Securing credentials...");

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");

      if (!accessToken) {
        toast.error("Google authentication failed: Token missing");
        navigate("/login");
        return;
      }

      try {
        setStatusText("Authenticating with Google...");
        // Save refreshToken to localStorage as well if required
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        // Expose and set access token, which fetches current user
        await setToken(accessToken);
        
        setStatusText("Welcome back! Redirecting to dashboard...");
        toast.success("Successfully logged in via Google!");
        
        // Short timeout for seamless transition
        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      } catch (err) {
        console.error("OAuth token injection failed", err);
        toast.error("Failed to complete Google authentication");
        navigate("/login");
      }
    };

    handleAuthRedirect();
  }, [searchParams, setToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0b] relative overflow-hidden font-sans">
      {/* Background ambient glowing meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Glass card container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] text-center relative z-10 space-y-6"
      >
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="absolute -inset-2.5 rounded-full border border-blue-500/20 border-t-blue-400"
            />
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <ShieldCheck size={28} className="animate-pulse" />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold tracking-tight text-white">Completing Secure Login</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
            Please wait while we complete the Google authentication handshake and retrieve your credentials.
          </p>
        </div>

        {/* Progress Spinner & Message */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <motion.span
            key={statusText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs font-semibold text-gray-500 uppercase tracking-widest block text-center"
          >
            {statusText}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthSuccess;

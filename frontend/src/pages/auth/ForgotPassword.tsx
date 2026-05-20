import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", { email });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0b] relative overflow-hidden font-sans">
      {/* Background ambient glowing meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main glass card container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] text-center relative z-10"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 py-4"
            >
              {/* Animated Success Icon container */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(59,130,246,0.15)] animate-pulse">
                  📧
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-white font-display">Check your email</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                  We've sent a secure password reset link to <strong className="text-blue-400">{email}</strong>. Please check your inbox and spam folder.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-semibold text-sm hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] transition-all cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold tracking-tight text-white">Forgot Password?</h2>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              <form className="space-y-5 text-left" onSubmit={handleSubmit}>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium text-center"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Email input field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Email Address</label>
                  <div className="relative flex items-center group">
                    <Mail className="absolute left-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                {/* Footer and Back Link */}
                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

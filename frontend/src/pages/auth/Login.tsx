import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  validateLoginForm,
  type ValidationErrors,
} from "../../utils/validation";
import type { ApiError } from "../../types";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Show error from Google OAuth redirect failure
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const messages: Record<string, string> = {
        google_auth_failed: "Google sign-in failed. Please try again.",
        authentication_failed: "Authentication failed. Please try again.",
        token_generation_failed: "Login failed. Please try again.",
      };
      toast.error(messages[error] ?? "Sign-in failed. Please try again.");
    }
  }, [searchParams]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateLoginForm(
      formData.email,
      formData.password,
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors below");
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || "Failed to login";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0b] relative overflow-hidden font-sans">
      {/* Background ambient glowing meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main glass card container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-[1020px] min-h-[640px] rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)]"
      >
        {/* Left Side Panel (Desktop only) */}
        <div className="hidden lg:flex flex-1 relative bg-cover bg-center items-end p-12 overflow-hidden group" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1000')` }}>
          {/* Black elegant gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-black/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80" />
          
          <div className="relative z-10 text-white max-w-sm space-y-4">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl font-display font-extrabold tracking-tight leading-tight"
            >
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Back</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-gray-300 text-sm md:text-base leading-relaxed font-light"
            >
              Experience the ultimate drive with LuxeDrive. Your premium journey continues here.
            </motion.p>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="flex-1 bg-black/40 p-8 md:p-12 lg:p-16 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-md space-y-8">
            <motion.div variants={itemVariants} className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-display font-bold tracking-tight text-white">Sign In</h2>
              <p className="text-gray-400 text-sm">Enter your details to access your account</p>
            </motion.div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Address */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Email Address</label>
                <div className="relative flex items-center group">
                  <Mail className="absolute left-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    disabled={isLoading}
                    className={`w-full bg-white/[0.03] border ${
                      errors.email ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-blue-500/50"
                    } rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-red-400 font-medium block mt-1">{errors.email}</span>
                )}
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Password</label>
                <div className="relative flex items-center group">
                  <Lock className="absolute left-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setErrors({ ...errors, password: "" });
                    }}
                    disabled={isLoading}
                    className={`w-full bg-white/[0.03] border ${
                      errors.password ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-blue-500/50"
                    } rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                  />
                  <button
                    type="button"
                    className="absolute right-4 text-gray-500 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs text-red-400 font-medium block mt-1">{errors.password}</span>
                )}
              </motion.div>

              {/* Options (Remember me / Forgot password) */}
              <motion.div variants={itemVariants} className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2.5 text-gray-400 cursor-pointer select-none group">
                  <input 
                    type="checkbox" 
                    className="appearance-none w-5 h-5 bg-white/[0.03] border border-white/10 rounded checked:bg-blue-500 checked:border-blue-500 checked:after:content-['✓'] checked:after:text-white checked:after:text-[10px] checked:after:flex checked:after:justify-center checked:after:items-center cursor-pointer transition-all"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase tracking-widest font-semibold">Or continue with</span>
              <div className="flex-grow border-t border-white/5"></div>
            </motion.div>

            {/* Social Buttons */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => {
                  const apiUrl = import.meta.env.VITE_API_URL || "/api";
                  window.location.href = `${apiUrl}/auth/google`;
                }}
                className="flex items-center justify-center gap-2.5 py-3 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-gray-300 hover:text-white font-medium text-sm transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    className="text-[#4285F4]"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    className="text-[#34A853]"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    className="text-[#FBBC05]"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    className="text-[#EA4335]"
                  />
                </svg>
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center gap-2.5 py-3 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-gray-300 hover:text-white font-medium text-sm transition-all cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>
            </motion.div>

            {/* Footer Links */}
            <motion.div variants={itemVariants} className="text-center text-sm text-gray-400">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Sign up for free
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

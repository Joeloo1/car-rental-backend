import React, { useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import type { ApiError } from "../../types/index";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || "Failed to login";
      toast.error(errorMessage);
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden font-sans">
      {/* Background ambient glowing meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main glass card container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-[1020px] min-h-[640px] rounded-3xl overflow-hidden border border-border bg-card/20 backdrop-blur-2xl shadow-xl"
      >
        {/* Left Side Panel (Desktop only) */}
        <div className="hidden lg:flex flex-1 relative bg-cover bg-center items-end p-12 overflow-hidden group" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1000')` }}>
          {/* Black elegant gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80" />

          <div className="relative z-10 text-white max-w-sm space-y-4">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl font-display font-extrabold tracking-tight leading-tight"
            >
              Welcome <span className="text-primary">Back</span>
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
        <div className="flex-1 bg-background/40 p-8 md:p-12 lg:p-16 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-md space-y-8">
            <motion.div variants={itemVariants} className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">Sign In</h2>
              <p className="text-muted-foreground text-sm">Enter your details to access your account</p>
            </motion.div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Address */}
              <motion.div variants={itemVariants}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={18} />}
                  error={errors.email?.message}
                  {...register("email")}
                  disabled={isSubmitting}
                />
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  leftIcon={<Lock size={18} />}
                  error={errors.password?.message}
                  {...register("password")}
                  disabled={isSubmitting}
                />
              </motion.div>

              {/* Options (Remember me / Forgot password) */}
              <motion.div variants={itemVariants} className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2.5 text-muted-foreground cursor-pointer select-none group">
                  <input 
                    type="checkbox" 
                    className="appearance-none w-5 h-5 bg-card border border-border rounded checked:bg-primary checked:border-primary cursor-pointer transition-all"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-primary hover:underline font-medium transition-colors text-sm">
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  fullWidth
                  rightIcon={<ArrowRight size={18} />}
                >
                  Sign In
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase tracking-widest font-semibold">Or continue with</span>
              <div className="flex-grow border-t border-border"></div>
            </motion.div>

            {/* Social Buttons */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                type="button"
                onClick={() => {
                  const apiUrl = import.meta.env.VITE_API_URL || "/api";
                  window.location.href = `${apiUrl}/auth/google`;
                }}
                className="w-full"
                leftIcon={
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
                }
              >
                Google
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                leftIcon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                }
              >
                GitHub
              </Button>
            </motion.div>

            {/* Footer Links */}
            <motion.div variants={itemVariants} className="text-center text-sm text-muted-foreground">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-semibold transition-colors">
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

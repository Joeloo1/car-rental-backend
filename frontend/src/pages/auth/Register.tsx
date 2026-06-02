import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import type { ApiError } from "../../types/index";

const schema = z.object({
  name:  z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must include uppercase, lowercase, and a number"),
  passwordConfirm: z.string(),
  agree: z.boolean().refine(v => v === true, "You must agree to the terms"),
}).refine(d => d.password === d.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

type FormValues = z.infer<typeof schema>;

// ── Password strength ─────────────────────────────────────────────────────────
const getStrength = (pw: string) => {
  if (!pw) return { score: 0, label: "", color: "" };
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[a-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const score = checks.filter(Boolean).length;
  if (score <= 2) return { score: 1, label: "Weak",   color: "#dc2626" };
  if (score === 3) return { score: 2, label: "Fair",   color: "#f59e0b" };
  if (score === 4) return { score: 3, label: "Good",   color: "#22c55e" };
  return             { score: 4, label: "Strong", color: "#22c55e" };
};

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
  </svg>
);

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [showPw,    setShowPw]    = useState(false);
  const [showConf,  setShowConf]  = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { name: "", email: "", password: "", passwordConfirm: "", agree: false },
    });

  const pwValue  = watch("password") ?? "";
  const strength = getStrength(pwValue);

  const onSubmit = async (data: FormValues) => {
    try {
      await registerAuth({ name: data.name, email: data.email, password: data.password, passwordConfirm: data.passwordConfirm });
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to create account.");
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || "/api/v1";

  return (
    <div className="min-h-screen bg-[#080808] flex">

      {/* ── Left panel ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-[#080808]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080808]/30" />

        <div className="relative z-10 flex flex-col justify-end p-12 pb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40 mb-4">
            LuxeDrive
          </p>
          <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-4">
            Join the<br />
            <span style={{ background: "linear-gradient(to right, #fcd34d, #d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              elite.
            </span>
          </h1>
          <p className="text-sm text-white/45 max-w-xs leading-relaxed">
            Access 1,200+ premium vehicles across 50 cities. Sign up free and start exploring today.
          </p>
          <div className="flex flex-col gap-2 mt-6">
            {["Free to sign up", "No booking fees", "Instant confirmation"].map(item => (
              <span key={item} className="flex items-center gap-2 text-xs text-white/40">
                <Check size={11} className="text-green" /> {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-[400px] animate-fade-up">

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-ink-primary tracking-tight mb-1.5">Create account</h2>
            <p className="text-sm text-ink-tertiary">Join LuxeDrive and start your journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-ink-tertiary uppercase tracking-[0.1em] mb-2">Full name</label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                <input
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  className={`input-base pl-9 ${errors.name ? "border-red/50" : ""}`}
                  {...register("name")}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-ink-tertiary uppercase tracking-[0.1em] mb-2">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`input-base pl-9 ${errors.email ? "border-red/50" : ""}`}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-ink-tertiary uppercase tracking-[0.1em] mb-2">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min 8 chars, uppercase, number"
                  autoComplete="new-password"
                  className={`input-base pl-9 pr-10 ${errors.password ? "border-red/50" : ""}`}
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Strength meter */}
              {pwValue.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.score ? strength.color : "#1c1c1c" }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-ink-tertiary uppercase tracking-[0.1em] mb-2">Confirm password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                <input
                  type={showConf ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`input-base pl-9 pr-10 ${errors.passwordConfirm ? "border-red/50" : ""}`}
                  {...register("passwordConfirm")}
                />
                <button type="button" onClick={() => setShowConf(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary transition-colors">
                  {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.passwordConfirm && <p className="mt-1.5 text-xs text-red">{errors.passwordConfirm.message}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input type="checkbox" className="sr-only peer" {...register("agree")} />
                  <div className="w-4 h-4 rounded border border-[#2a2a2a] bg-surface-2 peer-checked:bg-blue peer-checked:border-blue transition-all flex items-center justify-center">
                    <Check size={10} className="text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
                <span className="text-sm text-ink-tertiary leading-tight">
                  I agree to the{" "}
                  <Link to="/terms" className="text-ink-secondary hover:text-ink-primary transition-colors font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-ink-secondary hover:text-ink-primary transition-colors font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agree && <p className="mt-1.5 text-xs text-red">{errors.agree.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-black mt-1 disabled:opacity-60 transition-opacity hover:opacity-90 active:scale-[0.99]"
              style={{ background: "linear-gradient(135deg, #fcd34d, #d97706)" }}
            >
              {isSubmitting
                ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <><span>Create account</span><ArrowRight size={15} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 border-t border-[#1c1c1c]" />
            <span className="text-xs text-ink-disabled uppercase tracking-widest font-semibold">or</span>
            <div className="flex-1 border-t border-[#1c1c1c]" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { window.location.href = `${apiUrl}/auth/google`; }}
              className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-[#242424] bg-surface-1 text-sm font-medium text-ink-secondary hover:bg-surface-2 hover:border-[#2e2e2e] hover:text-ink-primary transition-all"
            >
              <GoogleIcon /> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-[#242424] bg-surface-1 text-sm font-medium text-ink-secondary hover:bg-surface-2 hover:border-[#2e2e2e] hover:text-ink-primary transition-all"
            >
              <GitHubIcon /> GitHub
            </button>
          </div>

          <p className="text-center text-sm text-ink-tertiary mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-ink-primary hover:text-blue-light transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

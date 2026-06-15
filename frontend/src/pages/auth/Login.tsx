import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck } from "@/lib/icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import type { ApiError } from "../../types/index";
import { GoogleIcon, GitHubIcon } from "../../components/ui/OAuthIcons";
import { AuthHero, AuthLogo, AuthOAuthButtons, AuthDivider, AuthAmbient } from "./AuthLayout";

const schema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

const Login: React.FC = () => {
  const navigate       = useNavigate();
  const location       = useLocation();
  const [searchParams] = useSearchParams();
  const { login }      = useAuth();
  const [showPw, setShowPw] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard";

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      const msgs: Record<string, string> = {
        google_auth_failed:      "Google sign-in failed. Please try again.",
        authentication_failed:   "Authentication failed. Please try again.",
        token_generation_failed: "Login failed. Please try again.",
      };
      toast.error(msgs[err] ?? "Sign-in failed. Please try again.");
    }
  }, [searchParams]);

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to sign in.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0C] p-4 sm:p-6 lg:p-8">
      <AuthAmbient />

      {/* ── Framed split card — floats with padding on all sides ─────────── */}
      <div className="relative z-10 flex w-full max-w-[1240px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D0D10] shadow-[0_40px_120px_rgba(0,0,0,0.65)] sm:rounded-3xl lg:h-[calc(100vh-4rem)] lg:max-h-[880px] lg:min-h-[620px]">

      {/* ── Left hero (desktop only) ─────────────────────────────────────── */}
      <AuthHero
        image="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1400"
        title={<>Welcome <span className="text-gold">back.</span></>}
        subtitle="Nigeria's most trusted premium car rental platform. 1,200+ vehicles across 50+ cities."
      >
        {/* Stats row */}
        <div className="flex items-center divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md">
          {[
            { value: "40k+", label: "Trips"  },
            { value: "4.9★", label: "Rating" },
            { value: "50+",  label: "Cities" },
          ].map(({ value, label }) => (
            <div key={label} className="flex-1 px-4 py-3.5 text-center">
              <p className="font-heading text-xl font-bold leading-none text-gold">{value}</p>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </AuthHero>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-10 sm:py-7">

        {/* Top bar: back link + mobile logo */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-tertiary transition-colors hover:text-ink-primary"
          >
            <ArrowLeft size={13} />
            Back to home
          </Link>
          <span className="lg:hidden"><AuthLogo compact /></span>
        </div>

        {/* Centered form */}
        <div className="m-auto w-full max-w-[400px] py-8 animate-fade-up">

          <span className="mb-8 block w-fit"><AuthLogo /></span>

          <h1 className="font-heading text-[28px] sm:text-[32px] font-bold tracking-tight text-ink-primary">
            Sign in
          </h1>
          <p className="mt-1.5 mb-8 text-sm text-ink-secondary">
            Enter your details to access your account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="mb-2 block text-2xs font-semibold uppercase tracking-[0.1em] text-ink-secondary">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary transition-colors group-focus-within:text-gold"
                />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`input-base pl-11 ${errors.email ? "error" : ""}`}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="group">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-2xs font-semibold uppercase tracking-[0.1em] text-ink-secondary">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-gold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary transition-colors group-focus-within:text-gold"
                />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className={`input-base pl-11 pr-11 ${errors.password ? "error" : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary transition-colors hover:text-ink-primary"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting} className="btn-primary group w-full !mt-7">
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <AuthDivider />

          <AuthOAuthButtons
            google={<GoogleIcon />}
            github={<GitHubIcon />}
          />

          <p className="mt-7 text-center text-[13px] text-ink-tertiary">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-gold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Bottom trust note */}
        <p className="flex items-center justify-center gap-1.5 text-2xs text-ink-tertiary">
          <ShieldCheck size={12} className="text-gold/60" />
          Secured with 256-bit encryption
        </p>
      </div>

      </div>
    </div>
  );
};

export default Login;

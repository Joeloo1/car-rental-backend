import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check, ShieldCheck } from "@/lib/icons";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import type { ApiError } from "../../types/index";
import { GoogleIcon, GitHubIcon } from "../../components/ui/OAuthIcons";
import { AuthHero, AuthLogo, AuthOAuthButtons, AuthDivider, AuthAmbient } from "./AuthLayout";

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

const getStrength = (pw: string) => {
  if (!pw) return { score: 0, label: "", color: "" };
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[a-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const s = checks.filter(Boolean).length;
  if (s <= 2)  return { score: 1, label: "Weak",        color: "#FF4D4D" };
  if (s === 3) return { score: 2, label: "Fair",        color: "#F5A623" };
  if (s === 4) return { score: 3, label: "Strong",      color: "#00C9B1" };
  return              { score: 4, label: "Very strong", color: "#00C9B1" };
};

const FieldLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="mb-2 block text-2xs font-semibold uppercase tracking-[0.1em] text-ink-secondary">
    {children}
  </label>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1.5 text-xs text-red">{message}</p> : null;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [showPw,       setShowPw]       = useState(false);
  const [showConf,     setShowConf]     = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { name: "", email: "", password: "", passwordConfirm: "", agree: false },
    });

  const pwValue   = watch("password") ?? "";
  const confValue = watch("passwordConfirm") ?? "";
  const strength  = getStrength(pwValue);
  const pwsMatch  = pwValue.length >= 8 && confValue.length > 0 && pwValue === confValue;

  const onSubmit = async (data: FormValues) => {
    try {
      await registerAuth({ name: data.name, email: data.email, password: data.password, passwordConfirm: data.passwordConfirm });
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || "Failed to create account.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0C] p-4 sm:p-6 lg:p-8">
      <AuthAmbient />

      {/* ── Framed split card — floats with padding on all sides ─────────── */}
      <div className="relative z-10 flex w-full max-w-[1240px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D0D10] shadow-[0_40px_120px_rgba(0,0,0,0.65)] sm:rounded-3xl lg:h-[calc(100vh-4rem)] lg:max-h-[880px] lg:min-h-[620px]">

      {/* ── Left hero (desktop only) ─────────────────────────────────────── */}
      <AuthHero
        image="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=1400"
        title={<>Join the <span className="text-gold">elite.</span></>}
        subtitle="Access 1,200+ premium vehicles across 50 cities. Sign up free and start exploring today."
      >
        <ul className="space-y-2.5">
          {[
            "Free to sign up — no credit card required",
            "No booking fees or hidden charges",
            "Instant booking confirmation",
          ].map(item => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15">
                <Check size={11} className="text-gold" strokeWidth={3} />
              </span>
              <span className="text-[13px] text-white/60">{item}</span>
            </li>
          ))}
        </ul>
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
        <div className="m-auto w-full max-w-[400px] py-6 animate-fade-up">

          <span className="mb-6 block w-fit"><AuthLogo /></span>

          <h1 className="font-heading text-[28px] sm:text-[32px] font-bold tracking-tight text-ink-primary">
            Create account
          </h1>
          <p className="mt-1.5 mb-7 text-sm text-ink-secondary">
            Join LuxeDrive and start your journey
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {/* Name */}
            <div className="group">
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <div className="relative">
                <UserIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary transition-colors group-focus-within:text-gold" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  className={`input-base pl-11 ${errors.name ? "error" : ""}`}
                  {...register("name")}
                />
              </div>
              <FieldError message={errors.name?.message} />
            </div>

            {/* Email */}
            <div className="group">
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary transition-colors group-focus-within:text-gold" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`input-base pl-11 ${errors.email ? "error" : ""}`}
                  {...register("email")}
                />
              </div>
              <FieldError message={errors.email?.message} />
            </div>

            {/* Password */}
            <div className="group">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary transition-colors group-focus-within:text-gold" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Min 8 chars, uppercase, number"
                  autoComplete="new-password"
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

              {/* Strength meter */}
              {pwValue.length > 0 && (
                <div className="mt-2.5">
                  <div className="mb-1.5 flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <span
                        key={i}
                        className="h-[3px] flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.score ? strength.color : "rgba(255,255,255,0.08)" }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
              <FieldError message={errors.password?.message} />
            </div>

            {/* Confirm password */}
            <div className="group">
              <FieldLabel htmlFor="passwordConfirm">Confirm password</FieldLabel>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary transition-colors group-focus-within:text-gold" />
                <input
                  id="passwordConfirm"
                  type={showConf ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`input-base pl-11 pr-11 ${errors.passwordConfirm ? "error" : ""}`}
                  {...register("passwordConfirm")}
                />
                {pwsMatch ? (
                  <motion.span
                    key="match"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                  >
                    <Check size={15} className="text-teal" />
                  </motion.span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConf(v => !v)}
                    aria-label={showConf ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary transition-colors hover:text-ink-primary"
                  >
                    {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
              <FieldError message={errors.passwordConfirm?.message} />
            </div>

            {/* Terms */}
            <div>
              <label className="flex cursor-pointer select-none items-start gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreeChecked}
                  onClick={() => {
                    const v = !agreeChecked;
                    setAgreeChecked(v);
                    setValue("agree", v, { shouldValidate: true });
                  }}
                  className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-200 ${
                    agreeChecked ? "border-gold bg-gold/15" : "border-white/10 bg-surface-1"
                  }`}
                >
                  {agreeChecked && <Check size={10} className="text-gold" strokeWidth={3} />}
                </button>
                <span className="text-[13px] leading-snug text-ink-secondary">
                  I agree to the{" "}
                  <Link to="/terms" className="font-medium text-gold hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="font-medium text-gold hover:underline">Privacy Policy</Link>
                </span>
              </label>
              <FieldError message={errors.agree?.message} />
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting} className="btn-primary group w-full !mt-7">
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              ) : (
                <>
                  Create account
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
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-gold hover:underline">
              Sign in
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

export default Register;

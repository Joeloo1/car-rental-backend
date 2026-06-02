import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios";

const schema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must include uppercase, lowercase, and a number"),
  passwordConfirm: z.string(),
}).refine(d => d.password === d.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});
type FormValues = z.infer<typeof schema>;

const getStrength = (pw: string) => {
  if (!pw) return { score: 0, label: "", color: "" };
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[a-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  if (score <= 2) return { score: 1, label: "Weak",   color: "#dc2626" };
  if (score === 3) return { score: 2, label: "Fair",   color: "#f59e0b" };
  if (score === 4) return { score: 3, label: "Good",   color: "#22c55e" };
  return             { score: 4, label: "Strong", color: "#22c55e" };
};

const ResetPassword: React.FC = () => {
  const { token }     = useParams<{ token: string }>();
  const [showPw,  setShowPw]  = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const pwValue  = watch("password") ?? "";
  const strength = getStrength(pwValue);

  const onSubmit = async (data: FormValues) => {
    setApiError("");
    try {
      await api.patch(`/auth/reset-password/${token}`, {
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });
      setSuccess(true);
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to reset password. The link may have expired.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] animate-fade-up">

        {success ? (
          /* ── Success ───────────────────────────────────────── */
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.22)" }}
              >
                <CheckCircle2 size={28} style={{ color: "#22c55e" }} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-ink-primary tracking-tight mb-2">Password updated!</h1>
            <p className="text-sm text-ink-tertiary leading-relaxed mb-8">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-black transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #fcd34d, #d97706)" }}
            >
              Sign in now <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          /* ── Form ──────────────────────────────────────────── */
          <>
            <div className="mb-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.22)" }}
              >
                <Lock size={20} style={{ color: "#3b82f6" }} />
              </div>
              <h1 className="text-2xl font-bold text-ink-primary tracking-tight mb-1.5">Reset password</h1>
              <p className="text-sm text-ink-tertiary">Choose a strong new password for your account.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="p-3 rounded-xl bg-red/[0.06] border border-red/15 text-xs text-red font-medium">
                  {apiError}
                </div>
              )}

              {/* New password */}
              <div>
                <label className="block text-xs font-semibold text-ink-tertiary uppercase tracking-[0.1em] mb-2">
                  New password
                </label>
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
                {/* Strength bar */}
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

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-ink-tertiary uppercase tracking-[0.1em] mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                  <input
                    type={showCfm ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    className={`input-base pl-9 pr-10 ${errors.passwordConfirm ? "border-red/50" : ""}`}
                    {...register("passwordConfirm")}
                  />
                  <button type="button" onClick={() => setShowCfm(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary transition-colors">
                    {showCfm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.passwordConfirm && <p className="mt-1.5 text-xs text-red">{errors.passwordConfirm.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-black disabled:opacity-60 transition-opacity hover:opacity-90 active:scale-[0.99] mt-1"
                style={{ background: "linear-gradient(135deg, #fcd34d, #d97706)" }}
              >
                {isSubmitting
                  ? <Loader2 size={15} className="animate-spin text-black" />
                  : <><span>Update password</span><ArrowRight size={15} /></>
                }
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-secondary transition-colors"
              >
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

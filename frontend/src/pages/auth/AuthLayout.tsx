import React from "react";
import { Link } from "react-router-dom";

/* ── Shared building blocks for the auth pages ──────────────────────────────
   Keeps Login / Register / etc. visually identical without duplicating
   markup. Dark split-screen layout: photo hero left, form panel right.     */

/** Brand mark — steering-wheel roundel + wordmark. */
export const AuthLogo: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <Link to="/" className="inline-flex w-fit items-center gap-2.5">
    <span className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-gold bg-surface-2">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="9" />
        <line x1="4.2" y1="16.5" x2="10.4" y2="12.8" />
        <line x1="19.8" y1="16.5" x2="13.6" y2="12.8" />
      </svg>
    </span>
    {!compact && (
      <span className="font-heading text-base font-bold tracking-tight text-ink-primary">
        LuxeDrive
      </span>
    )}
  </Link>
);

/** Ambient background for the form panel — glows + fine dot grid. */
export const AuthAmbient: React.FC = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -right-32 -top-32 h-[440px] w-[440px] rounded-full bg-gold/[0.07] blur-[110px]" />
    <div className="absolute -bottom-40 -left-24 h-[380px] w-[380px] rounded-full bg-teal/[0.04] blur-[110px]" />
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    />
  </div>
);

/** Left-side photo hero. Hidden below lg. */
export const AuthHero: React.FC<{
  image: string;
  title: React.ReactNode;
  subtitle: string;
  children?: React.ReactNode;
}> = ({ image, title, subtitle, children }) => (
  <div className="relative hidden w-[48%] shrink-0 overflow-hidden lg:block xl:w-1/2">
    <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover saturate-[1.08]" loading="eager" />
    {/* Cinematic overlays — warm dark grade */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0A0A0C]/70" />
    <div className="absolute inset-0 bg-[#F5A623]/[0.05] mix-blend-overlay" />

    <div className="absolute inset-x-0 bottom-0 z-10 p-10 xl:p-14">
      <span className="mb-4 block h-[2.5px] w-10 rounded-full bg-gradient-to-r from-gold to-gold-dark" />
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold/90">
        LuxeDrive
      </p>
      <h2 className="font-heading max-w-md text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">
        {title}
      </h2>
      <p className="mt-4 mb-7 max-w-sm text-sm leading-relaxed text-white/55">
        {subtitle}
      </p>
      {children}
    </div>
  </div>
);

/** "or continue with" divider. */
export const AuthDivider: React.FC<{ label?: string }> = ({ label = "or continue with" }) => (
  <div className="my-7 flex items-center gap-4">
    <span className="h-px flex-1 bg-white/[0.08]" />
    <span className="text-2xs uppercase tracking-[0.18em] text-ink-tertiary">{label}</span>
    <span className="h-px flex-1 bg-white/[0.08]" />
  </div>
);

/** Google / GitHub OAuth button pair. */
export const AuthOAuthButtons: React.FC<{
  google: React.ReactNode;
  github: React.ReactNode;
}> = ({ google, github }) => {
  const apiUrl = import.meta.env.VITE_API_URL || "/api/v1";
  const buttons = [
    { label: "Google", icon: google, onClick: () => { window.location.href = `${apiUrl}/auth/google`; } },
    { label: "GitHub", icon: github, onClick: () => {} },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {buttons.map(({ label, icon, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className="flex h-11 items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-white/[0.07] bg-surface-1 text-[13px] font-medium text-ink-secondary transition-all duration-200 hover:border-gold/25 hover:bg-surface-2 hover:text-ink-primary active:scale-[0.98]"
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
};

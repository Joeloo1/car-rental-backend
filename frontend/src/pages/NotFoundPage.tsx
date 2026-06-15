import React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "@/lib/icons";

/* ── Drifting car SVG ─────────────────────────────────────────────────────── */
const DriftingCar: React.FC = () => (
  <svg
    viewBox="0 0 280 120"
    className="w-40 sm:w-52 mx-auto"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      animation: "drift 3.2s ease-in-out infinite",
      filter: "drop-shadow(0 4px 20px rgba(245,166,35,0.15))",
    }}
  >
    {/* Body */}
    <path d="M24 78L48 46L80 30H200L232 46L256 78H24Z" fill="rgba(245,166,35,0.18)" stroke="rgba(245,166,35,0.40)" strokeWidth="1.5" />
    {/* Roof */}
    <path d="M100 33L116 56H164L180 33H100Z" fill="rgba(245,166,35,0.08)" stroke="rgba(245,166,35,0.20)" strokeWidth="1" />
    {/* Chassis */}
    <rect x="24" y="76" width="232" height="14" rx="4" fill="rgba(245,166,35,0.22)" />
    {/* Rear wheel */}
    <circle cx="75" cy="92" r="22" fill="rgba(10,10,12,1)" stroke="rgba(245,166,35,0.45)" strokeWidth="2" />
    <circle cx="75" cy="92" r="11" fill="rgba(17,17,20,1)" stroke="rgba(245,166,35,0.20)" strokeWidth="1" />
    {/* Front wheel */}
    <circle cx="205" cy="92" r="22" fill="rgba(10,10,12,1)" stroke="rgba(245,166,35,0.45)" strokeWidth="2" />
    <circle cx="205" cy="92" r="11" fill="rgba(17,17,20,1)" stroke="rgba(245,166,35,0.20)" strokeWidth="1" />
    {/* Headlight */}
    <rect x="244" y="58" width="14" height="9" rx="2.5" fill="rgba(255,184,77,0.55)" />
    {/* Tail light */}
    <rect x="22" y="58" width="12" height="9" rx="2.5" fill="rgba(255,77,77,0.45)" />
    {/* Window glare */}
    <line x1="118" y1="38" x2="122" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
    {/* Road dust particles */}
    <circle cx="8"  cy="91" r="2.5" fill="rgba(245,166,35,0.12)" />
    <circle cx="16" cy="87" r="1.5" fill="rgba(245,166,35,0.08)" />
    <circle cx="4"  cy="80" r="1.5" fill="rgba(245,166,35,0.06)" />
  </svg>
);

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--color-bg)" }}
    >
      {/* 404 — gold gradient */}
      <p
        className="font-heading font-black leading-none select-none mb-2 pointer-events-none"
        style={{
          fontSize: "clamp(120px, 24vw, 200px)",
          background: "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 55%, rgba(245,166,35,0.18) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </p>

      {/* Drifting car */}
      <div className="mb-6 -mt-2">
        <DriftingCar />
      </div>

      <h1
        className="font-heading font-bold tracking-tight mb-3"
        style={{ fontSize: "clamp(22px, 3.5vw, 28px)", color: "var(--color-text-primary)" }}
      >
        Looks like this road leads nowhere.
      </h1>
      <p className="text-sm max-w-sm mb-8 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate(-1 as never)}
          className="btn-secondary px-6"
        >
          Go back
        </button>
        <button
          onClick={() => navigate("/")}
          className="btn-secondary px-6"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/browse")}
          className="flex items-center gap-2 px-6 rounded-xl font-semibold text-sm text-black transition-all duration-[180ms] hover:brightness-110 active:scale-[0.98]"
          style={{
            height: "44px",
            background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
          }}
        >
          <Search size={15} /> Browse cars
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;

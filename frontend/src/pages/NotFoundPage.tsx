import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search } from "lucide-react";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] bg-[#080808] flex flex-col items-center justify-center px-4 text-center">
      {/* Big ghost number */}
      <p
        className="text-[clamp(120px,25vw,200px)] font-black leading-none select-none mb-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, #1c1c1c 0%, #0d0d0d 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </p>

      <h1 className="text-2xl font-bold text-ink-primary -mt-4 mb-3 tracking-tight">
        Page not found
      </h1>
      <p className="text-sm text-ink-tertiary max-w-sm mb-8 leading-relaxed">
        The page you're looking for doesn't exist or has been moved somewhere else.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate(-1 as any)}
          className="btn-secondary gap-2 px-5 py-2.5"
        >
          Go back
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-surface-2 border border-[#282828] text-ink-primary hover:bg-surface-3 transition-colors"
        >
          <Home size={15} /> Home
        </button>
        <button
          onClick={() => navigate("/browse")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-black transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #fcd34d, #d97706)" }}
        >
          <Search size={15} /> Browse cars
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;

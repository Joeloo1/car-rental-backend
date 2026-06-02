import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const VerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isVerified || dismissed) return null;

  return (
    <div
      className="relative border-b z-30"
      style={{
        background: "rgba(245,158,11,0.07)",
        borderColor: "rgba(245,158,11,0.18)",
      }}
    >
      <div className="container py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle size={14} className="text-amber flex-shrink-0" />
            <p className="text-sm text-ink-secondary">
              <span className="font-semibold text-ink-primary">Email not verified.</span>{" "}
              Bookings and listings are locked.{" "}
              <Link
                to="/verify-email"
                className="font-semibold text-amber hover:text-amber/80 transition-colors"
              >
                Resend verification email →
              </Link>
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="p-1 rounded text-ink-tertiary hover:text-ink-primary transition-colors flex-shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationBanner;

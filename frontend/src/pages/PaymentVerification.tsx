import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { paymentService } from "../services/payment.service";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "@/lib/icons";

const PaymentVerification: React.FC = () => {
  const { id }             = useParams<{ id: string }>();
  const [searchParams]     = useSearchParams();
  const navigate           = useNavigate();
  const reference          = searchParams.get("reference") ?? searchParams.get("trxref");

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found. Please check your bookings.");
      return;
    }

    paymentService
      .verify(reference)
      .then(() => {
        setStatus("success");
        setMessage("Your payment was successful and your booking is confirmed!");
      })
      .catch((err: any) => {
        const msg = err?.response?.data?.message ?? "Payment verification failed.";
        setStatus("failed");
        setMessage(msg);
      });
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md text-center animate-fade-up">

        {status === "loading" && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(212,151,42,0.08)", border: "1.5px solid rgba(212,151,42,0.20)" }}>
              <Loader2 size={32} className="animate-spin text-gold" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink-primary mb-2">Verifying payment…</h1>
            <p className="text-sm text-ink-tertiary">Please wait while we confirm your transaction with Paystack.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(74,197,130,0.10)", border: "1.5px solid rgba(74,197,130,0.25)" }}>
              <CheckCircle size={36} className="text-green" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink-primary mb-2">Payment successful!</h1>
            <p className="text-sm text-ink-tertiary mb-8 max-w-xs mx-auto">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/bookings"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-black"
                style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)" }}
              >
                View my bookings <ArrowRight size={15} />
              </Link>
              {id && (
                <Link
                  to={`/booking/${id}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-ink-secondary border border-[#282828] hover:border-[#333] transition-colors"
                  style={{ background: "var(--color-surface-2)" }}
                >
                  View booking details
                </Link>
              )}
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(255,77,77,0.08)", border: "1.5px solid rgba(255,77,77,0.22)" }}>
              <XCircle size={36} className="text-red" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink-primary mb-2">Payment issue</h1>
            <p className="text-sm text-ink-tertiary mb-8 max-w-xs mx-auto">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/bookings"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-black"
                style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)" }}
              >
                My bookings
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl font-semibold text-sm text-ink-secondary border border-[#282828] hover:border-[#333] transition-colors"
                style={{ background: "var(--color-surface-2)" }}
              >
                Go back
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentVerification;

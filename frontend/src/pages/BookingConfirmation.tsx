import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Car as CarIcon, ArrowRight, Search } from "@/lib/icons";
import { bookingService } from "../services/booking.service";

/* ── Animated checkmark circle ──────────────────────────────────────────── */
const AnimatedCheck: React.FC = () => {
  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef  = useRef<SVGPolylineElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPlayed(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!played) return;
    const c = circleRef.current;
    const k = checkRef.current;
    if (!c || !k) return;
    const cLen = c.getTotalLength?.() ?? 314;
    const kLen = k.getTotalLength?.() ?? 52;
    c.style.strokeDasharray  = String(cLen);
    c.style.strokeDashoffset = String(cLen);
    k.style.strokeDasharray  = String(kLen);
    k.style.strokeDashoffset = String(kLen);
    c.style.transition = "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    k.style.transition = "stroke-dashoffset 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.5s";
    c.style.strokeDashoffset = "0";
    k.style.strokeDashoffset = "0";
  }, [played]);

  return (
    <div className="flex items-center justify-center mb-8">
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
        {/* Background circle */}
        <circle cx="45" cy="45" r="43" fill="rgba(245,166,35,0.08)" />
        {/* Animated ring */}
        <circle
          ref={circleRef}
          cx="45" cy="45" r="40"
          stroke="var(--color-gold)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        {/* Checkmark */}
        <polyline
          ref={checkRef}
          points="27,46 40,59 63,32"
          stroke="var(--color-gold)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/* ── Next step row ───────────────────────────────────────────────────────── */
const Step: React.FC<{ n: number; title: string; desc: string }> = ({ n, title, desc }) => (
  <div className="flex gap-4">
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-price font-bold text-sm"
      style={{ background: "rgba(245,166,35,0.12)", border: "1.5px solid rgba(245,166,35,0.28)", color: "var(--color-gold)" }}
    >
      {n}
    </div>
    <div>
      <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--color-text-primary)" }}>{title}</p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{desc}</p>
    </div>
  </div>
);

const BookingConfirmation: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings-me"],
    queryFn:  () => bookingService.getMyBookings(),
    staleTime: 30 * 1000,
  });

  // Find this specific booking
  const booking = Array.isArray(bookings)
    ? bookings.find((b: any) => String(b.id) === id)
    : undefined;

  const car = (booking as any)?.car;

  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="w-8 h-8 border-2 border-t-gold rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.12)", borderTopColor: "var(--color-gold)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-lg animate-fade-up">

        {/* Success mark */}
        <AnimatedCheck />

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold tracking-tight mb-2" style={{ fontSize: "clamp(26px, 4vw, 34px)", color: "var(--color-text-primary)" }}>
            Booking confirmed!
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
            Your reservation has been successfully created.
          </p>
        </div>

        {/* Booking card */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: "var(--color-surface)", border: "1.5px solid rgba(245,166,35,0.22)" }}
        >
          {/* Car image */}
          {car?.images?.[0]?.imageUrl && (
            <div className="h-44 overflow-hidden relative">
              <img
                src={car.images[0].imageUrl}
                alt={car?.brand}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
              <div className="absolute bottom-3 left-4">
                <p className="font-heading font-bold text-white text-lg">{car?.brand} {car?.model}</p>
              </div>
            </div>
          )}

          {!car?.images?.[0]?.imageUrl && (
            <div className="h-28 flex items-center justify-center" style={{ background: "var(--color-surface-2)" }}>
              <CarIcon size={36} style={{ color: "var(--color-text-muted)", opacity: 0.35 }} />
            </div>
          )}

          {/* Details grid */}
          <div className="p-5 grid grid-cols-2 gap-4">
            {booking ? (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>Pick-up</p>
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "var(--color-text-primary)" }}>
                    <Calendar size={13} style={{ color: "var(--color-gold)" }} />
                    {fmt((booking as any).startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>Return</p>
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "var(--color-text-primary)" }}>
                    <Calendar size={13} style={{ color: "var(--color-gold)" }} />
                    {fmt((booking as any).endDate)}
                  </p>
                </div>
                {car?.locationCity && (
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>Location</p>
                    <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "var(--color-text-primary)" }}>
                      <MapPin size={13} style={{ color: "var(--color-gold)" }} /> {car.locationCity}
                    </p>
                  </div>
                )}
                <div className="col-span-2 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>Total paid</span>
                    <span className="font-price font-bold text-xl" style={{ color: "var(--color-gold)" }}>
                      ${(booking as any).totalPrice?.toFixed(2) ?? "—"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-2 text-center py-4">
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Booking details will appear in your account shortly.
                </p>
              </div>
            )}
          </div>

          {/* Booking reference */}
          {id && (
            <div
              className="mx-5 mb-5 px-4 py-3 rounded-xl text-center"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
            >
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>
                Booking reference
              </p>
              <p className="font-price font-bold tracking-widest" style={{ fontSize: "20px", color: "var(--color-gold)" }}>
                #{String(id).padStart(8, "0").toUpperCase()}
              </p>
            </div>
          )}
        </div>

        {/* Next steps */}
        <div
          className="rounded-2xl p-5 mb-6 space-y-4"
          style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
        >
          <h3 className="font-heading font-semibold text-sm mb-4" style={{ color: "var(--color-text-primary)" }}>
            What happens next
          </h3>
          <Step n={1} title="Check your email" desc="A confirmation email with booking details and pickup instructions has been sent to you." />
          <Step n={2} title="Contact the host" desc="The car owner will reach out within 24 hours to confirm pickup logistics." />
          <Step n={3} title="Prepare your ID" desc="Bring a valid driver's license and the payment card used for this booking." />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/bookings"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-[180ms]"
            style={{
              height: "48px",
              background: "var(--color-surface-2)",
              border: "1.5px solid var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = "rgba(245,166,35,0.30)")}
            onMouseOut={e  => (e.currentTarget.style.borderColor = "var(--color-border)")}
          >
            View my bookings <ArrowRight size={15} />
          </Link>
          <button
            onClick={() => navigate("/browse")}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm text-black transition-all duration-[180ms] hover:brightness-110"
            style={{
              height: "48px",
              background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
            }}
          >
            <Search size={15} /> Browse more cars
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

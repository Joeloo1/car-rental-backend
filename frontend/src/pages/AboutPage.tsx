import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Clock, Star, ArrowRight, MapPin, Users, Zap, Heart } from "@/lib/icons";

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0A0A0C] min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-[0.07] blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #F5A623, transparent)" }}
        />

        <div className="container text-center relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary mb-4">
            Our story
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-[58px] font-bold text-ink-primary tracking-tight mb-5 leading-[1.05]">
            Redefining how Nigeria{" "}
            <span
              style={{
                background: "linear-gradient(to right, #F5A623, #E8831A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              rents cars.
            </span>
          </h1>
          <p className="text-base text-ink-tertiary max-w-xl mx-auto leading-relaxed">
            LuxeDrive was built on a simple idea — that renting a car should feel as good as
            driving one. We connect trusted hosts with drivers who expect more.
          </p>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-3">
                How it started
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight mb-5">
                Born out of frustration with the status quo
              </h2>
              <div className="space-y-4 text-sm text-ink-tertiary leading-relaxed">
                <p>
                  In 2023, our founders were tired of the same experience: overpriced airport
                  rentals, hidden fees, and cars that never matched the listing photo. There had to
                  be a better way.
                </p>
                <p>
                  We built LuxeDrive as a peer-to-peer platform where car owners in Nigeria can list
                  their vehicles and earn on their own terms, while renters get transparent pricing
                  and properly verified cars.
                </p>
                <p>
                  Today, more than 40,000 trips later, we're the platform drivers and lenders trust
                  across 50 cities — from Lagos to Kano, Abuja to Port Harcourt.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] ring-1 ring-white/[0.06]">
                <img
                  src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&q=80&w=1000"
                  alt="Luxury car on a road"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-4 -left-4 px-4 py-3 rounded-xl bg-surface-2 border border-[#282828] shadow-lg">
                <p className="text-xl font-bold text-ink-primary">40,000+</p>
                <p className="text-xs text-ink-tertiary">Trips completed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="border-y border-[#161616]">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { value: "2023",    label: "Year founded" },
              { value: "1,200+", label: "Vehicles listed" },
              { value: "50+",    label: "Cities covered" },
              { value: "4.9★",   label: "Average rating", gold: true },
            ].map(({ value, label, gold }, i) => (
              <div key={label} className={`px-6 py-7 ${i < 3 ? "border-r border-[#161616]" : ""}`}>
                <p
                  className="text-2xl font-bold mb-0.5"
                  style={gold ? { color: "#F5A623" } : { color: "#fafafa" }}
                >
                  {value}
                </p>
                <p className="text-xs text-ink-tertiary">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-3">
              What drives us
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
              Our principles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Shield,
                iconColor: "#F5A623",
                iconBg: "rgba(245,166,35,0.12)",
                iconBorder: "rgba(245,166,35,0.22)",
                title: "Trust first",
                desc: "Every host is ID-verified, every car inspected. We never compromise on safety.",
              },
              {
                icon: Zap,
                iconColor: "#F5A623",
                iconBg: "rgba(245,166,35,0.12)",
                iconBorder: "rgba(245,166,35,0.22)",
                title: "Radical transparency",
                desc: "What you see is what you pay. No hidden fees, no surprises at checkout.",
              },
              {
                icon: Heart,
                iconColor: "#f43f5e",
                iconBg: "rgba(244,63,94,0.12)",
                iconBorder: "rgba(244,63,94,0.22)",
                title: "Community driven",
                desc: "We grow when our hosts and renters grow. Their success is our success.",
              },
              {
                icon: MapPin,
                iconColor: "#00C9B1",
                iconBg: "rgba(0,201,177,0.12)",
                iconBorder: "rgba(0,201,177,0.22)",
                title: "Local expertise",
                desc: "Built specifically for Nigeria — our platform understands local roads, culture, and needs.",
              },
            ].map(({ icon: Icon, iconColor, iconBg, iconBorder, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-[#1c1c1c] bg-surface-1 hover:border-[#272727] transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
                >
                  <Icon size={20} style={{ color: iconColor }} />
                </div>
                <h3 className="font-semibold text-[15px] text-ink-primary mb-2">{title}</h3>
                <p className="text-sm text-ink-tertiary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why We're Different ───────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-3">
                The LuxeDrive difference
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight mb-6">
                Not just another rental platform
              </h2>

              <ul className="space-y-4">
                {[
                  {
                    icon: Shield,
                    text: "Comprehensive insurance included on every trip — no extra charge.",
                  },
                  {
                    icon: Clock,
                    text: "Real-time availability sync prevents double-bookings, always.",
                  },
                  {
                    icon: Users,
                    text: "Dedicated 24/7 support, available via chat and phone.",
                  },
                  {
                    icon: Star,
                    text: "Honest review system — every rating is from a real, verified trip.",
                  },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-md bg-surface-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={13} className="text-ink-secondary" />
                    </div>
                    <p className="text-sm text-ink-secondary leading-relaxed">{text}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/3] ring-1 ring-white/[0.06]">
              <img
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1000"
                alt="Sports car"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center"
            style={{
              background: "linear-gradient(135deg, #0c1220 0%, #111827 60%, #0c1220 100%)",
              border: "1px solid #1a2234",
            }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 opacity-[0.08] blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse, #F5A623, transparent)" }}
            />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                Ready to experience the difference?
              </h2>
              <p className="text-sm text-white/50 max-w-md mx-auto mb-8 leading-relaxed">
                Join 40,000+ drivers who already trust LuxeDrive for every journey.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/browse")}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-black transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #F5A623, #E8831A)" }}
                >
                  Browse cars <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate("/register?role=lender")}
                  className="btn-secondary px-7 py-3"
                >
                  List your car
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

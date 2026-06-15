import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle,
  Shield,
  Zap,
  Star,
  ArrowRight,
  MapPin,
  CreditCard,
  Phone,
  Users,
  ChevronDown,
} from "@/lib/icons";

const fadeUp = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      step:    "01",
      icon:    Search,
      color:   "#F5A623",
      bg:      "rgba(245,166,35,0.10)",
      border:  "rgba(245,166,35,0.22)",
      title:   "Find Your Perfect Car",
      desc:    "Browse hundreds of verified premium vehicles. Filter by location, date, category, price, and more. Every car is inspected and verified by our team.",
      detail:  "Use our smart search to filter by city, airport, or specific address. Set your exact pickup and return dates to see real-time availability.",
    },
    {
      step:    "02",
      icon:    CreditCard,
      color:   "#00C9B1",
      bg:      "rgba(0,201,177,0.10)",
      border:  "rgba(0,201,177,0.22)",
      title:   "Book Instantly",
      desc:    "Reserve your car in seconds with our secure checkout. No paperwork, no waiting lines. Get instant confirmation sent to your email.",
      detail:  "Pay securely online. Your card is only charged after the host confirms your booking. We support Visa, Mastercard, and major digital wallets.",
    },
    {
      step:    "03",
      icon:    MapPin,
      color:   "#00C9B1",
      bg:      "rgba(0,201,177,0.10)",
      border:  "rgba(0,201,177,0.22)",
      title:   "Meet & Drive",
      desc:    "Meet your host at the pickup location or choose free delivery within 10 miles. Inspect the car, sign digitally, and hit the road.",
      detail:  "Your host will meet you at the agreed time. A quick digital inspection protects both parties. Keys in hand in under 5 minutes.",
    },
    {
      step:    "04",
      icon:    CheckCircle,
      color:   "#F5A623",
      bg:      "rgba(245,166,35,0.10)",
      border:  "rgba(245,166,35,0.22)",
      title:   "Return & Review",
      desc:    "Return the car at your scheduled time. Drop it off or have it picked up — your choice. Then leave a review to help the community.",
      detail:  "Returns are simple. Any fuel or mileage adjustments are calculated automatically. Your deposit is released within 24 hours.",
    },
  ];

  const features = [
    {
      icon:   Shield,
      color:  "#00C9B1",
      bg:     "rgba(0,201,177,0.10)",
      border: "rgba(0,201,177,0.22)",
      title:  "$1M Protection",
      desc:   "Every trip is covered by comprehensive insurance from the moment the keys change hands.",
    },
    {
      icon:   Zap,
      color:  "#F5A623",
      bg:     "rgba(245,166,35,0.10)",
      border: "rgba(245,166,35,0.22)",
      title:  "Instant Approval",
      desc:   "Most bookings are confirmed within minutes. No waiting days for approval.",
    },
    {
      icon:   Phone,
      color:  "#00C9B1",
      bg:     "rgba(0,201,177,0.10)",
      border: "rgba(0,201,177,0.22)",
      title:  "24/7 Support",
      desc:   "Our team is available around the clock for anything you need, before or during your trip.",
    },
    {
      icon:   Star,
      color:  "#F5A623",
      bg:     "rgba(245,166,35,0.10)",
      border: "rgba(245,166,35,0.22)",
      title:  "Verified Hosts",
      desc:   "Every host and vehicle goes through identity and inspection checks before listing.",
    },
    {
      icon:   Users,
      color:  "#F5A623",
      bg:     "rgba(245,166,35,0.10)",
      border: "rgba(245,166,35,0.22)",
      title:  "Growing Community",
      desc:   "Over 40,000 satisfied renters and 1,200+ premium vehicles across the country.",
    },
    {
      icon:   CreditCard,
      color:  "#00C9B1",
      bg:     "rgba(0,201,177,0.10)",
      border: "rgba(0,201,177,0.22)",
      title:  "Secure Payments",
      desc:   "PCI-compliant payment processing. Your financial data is always protected.",
    },
  ];

  const faqs = [
    {
      q: "Do I need a special license to rent?",
      a: "A valid standard driver's license is all you need for most vehicles. Some high-performance cars may require additional verification.",
    },
    {
      q: "What happens if the car is damaged during my trip?",
      a: "All trips include $1M liability coverage. Minor damage is handled through our claims process. Hosts can also offer additional protection plans.",
    },
    {
      q: "Can I cancel or modify my booking?",
      a: "Yes, free cancellation is available up to 24 hours before your scheduled pickup. Modifications can be requested through the dashboard.",
    },
    {
      q: "How do I become a host?",
      a: "Sign up as a lender, complete identity verification, add your car with photos and details, set your price and availability — and you're ready to earn.",
    },
    {
      q: "Is there a minimum rental duration?",
      a: "Most cars have a minimum of 1 day. Some hosts set higher minimums. The minimum is always displayed on the car's listing page.",
    },
    {
      q: "What if the host cancels on me?",
      a: "If a host cancels, you'll receive a full refund immediately plus a $25 LuxeDrive credit for the inconvenience.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-ink-primary overflow-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Ambient glows */}
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[400px] opacity-[0.06] blur-[120px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #F5A623, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[300px] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #00C9B1, transparent)" }}
        />

        <div className="container text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto">
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-medium text-ink-secondary">
                Simple, transparent, seamless
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl md:text-[68px] font-bold tracking-tight leading-[1.04] mb-5"
            >
              How{" "}
              <span
                style={{
                  background: "linear-gradient(to right, #F5A623, #FFB84D, #E8831A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                LuxeDrive
              </span>{" "}
              Works
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base text-ink-tertiary leading-relaxed mb-10 max-w-xl mx-auto">
              From browsing to driving in four effortless steps. No hidden fees,
              no paperwork, no hassle.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate("/browse")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-black transition-opacity hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #F5A623, #E8831A)" }}
              >
                Browse Cars <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-ink-secondary border border-[#242424] bg-surface-1 hover:bg-surface-2 hover:border-[#2e2e2e] hover:text-ink-primary transition-all"
              >
                List Your Car
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Steps ─────────────────────────────────────────────────────────────── */}
      <section className="py-10 pb-20">
        <div className="container max-w-5xl">
          <div className="space-y-4">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="flex flex-col md:flex-row gap-6 p-7 rounded-2xl border border-[#1c1c1c] bg-surface-1 hover:border-[#272727] transition-colors"
              >
                <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 flex-shrink-0">
                  <span className="text-5xl font-display font-black text-ink-primary/[0.06] leading-none select-none w-12 text-center">
                    {item.step}
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.bg, border: `1px solid ${item.border}` }}
                  >
                    <item.icon size={22} style={{ color: item.color }} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-ink-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed mb-2">{item.desc}</p>
                  <p className="text-sm text-ink-tertiary leading-relaxed">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-[#161616]">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-3"
            >
              Why LuxeDrive
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl font-bold text-ink-primary tracking-tight mb-3"
            >
              Built for Trust &amp; Convenience
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-ink-tertiary max-w-xl mx-auto">
              Every feature is designed to give you total peace of mind.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="p-6 rounded-2xl border border-[#1c1c1c] bg-surface-1 hover:border-[#272727] transition-colors group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: feat.bg, border: `1px solid ${feat.border}` }}
                >
                  <feat.icon size={20} style={{ color: feat.color }} />
                </div>
                <h3 className="font-semibold text-[15px] text-ink-primary mb-2">{feat.title}</h3>
                <p className="text-sm text-ink-tertiary leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-[#161616]">
        <div className="container max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-3"
            >
              Common Questions
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl font-bold text-ink-primary tracking-tight"
            >
              Frequently Asked
            </motion.h2>
          </motion.div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-[#1c1c1c] bg-surface-1 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-2 transition-colors"
                >
                  <span className="font-semibold text-[15px] text-ink-primary pr-4">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-ink-tertiary flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <div className="pt-1 border-t border-[#1c1c1c]" />
                    <p className="text-sm text-ink-tertiary leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-[#161616]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center"
            style={{
              background: "linear-gradient(135deg, #0c1220 0%, #111827 60%, #0c1220 100%)",
              border: "1px solid #1a2234",
            }}
          >
            {/* Ambient glows */}
            <div
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-[0.08] blur-3xl pointer-events-none rounded-full"
              style={{ background: "radial-gradient(ellipse, #F5A623, transparent)" }}
            />

            <div className="relative z-10 max-w-xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold mb-4">
                Start today
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Ready to Drive?
              </h2>
              <p className="text-sm text-white/50 mb-8 leading-relaxed">
                Join thousands of people who have already discovered a better way to
                experience premium cars.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/browse")}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-black transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #F5A623, #E8831A)" }}
                >
                  Browse Cars Now <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-ink-secondary border border-[#242424] bg-surface-1 hover:bg-surface-2 hover:border-[#2e2e2e] hover:text-ink-primary transition-all"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default HowItWorks;

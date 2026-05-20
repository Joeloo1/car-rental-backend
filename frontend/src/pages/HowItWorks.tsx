import React from "react";
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
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: "01",
      icon: Search,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
      title: "Find Your Perfect Car",
      desc: "Browse hundreds of verified premium vehicles. Filter by location, date, category, price, and more. Every car is inspected and verified by our team.",
      detail: "Use our smart search to filter by city, airport, or specific address. Set your exact pickup and return dates to see real-time availability.",
    },
    {
      step: "02",
      icon: CreditCard,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
      title: "Book Instantly",
      desc: "Reserve your car in seconds with our secure checkout. No paperwork, no waiting lines. Get instant confirmation sent to your email.",
      detail: "Pay securely online. Your card is only charged after the host confirms your booking. We support Visa, Mastercard, and major digital wallets.",
    },
    {
      step: "03",
      icon: MapPin,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
      title: "Meet & Drive",
      desc: "Meet your host at the pickup location or choose free delivery within 10 miles. Inspect the car, sign digitally, and hit the road.",
      detail: "Your host will meet you at the agreed time. A quick digital inspection protects both parties. Keys in hand in under 5 minutes.",
    },
    {
      step: "04",
      icon: CheckCircle,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
      title: "Return & Review",
      desc: "Return the car at your scheduled time. Drop it off or have it picked up — your choice. Then leave a review to help the community.",
      detail: "Returns are simple. Any fuel or mileage adjustments are calculated automatically. Your deposit is released within 24 hours.",
    },
  ];

  const features = [
    {
      icon: Shield,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      title: "$1M Protection",
      desc: "Every trip is covered by comprehensive insurance from the moment the keys change hands.",
    },
    {
      icon: Zap,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      title: "Instant Approval",
      desc: "Most bookings are confirmed within minutes. No waiting days for approval.",
    },
    {
      icon: Phone,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      title: "24/7 Support",
      desc: "Our team is available around the clock for anything you need, before or during your trip.",
    },
    {
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      title: "Verified Hosts",
      desc: "Every host and vehicle goes through identity and inspection checks before listing.",
    },
    {
      icon: Users,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      title: "Growing Community",
      desc: "Over 12,000 satisfied renters and 500+ premium vehicles across the country.",
    },
    {
      icon: CreditCard,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      title: "Secure Payments",
      desc: "PCI-compliant payment processing. Your financial data is always protected.",
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
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-600/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-purple-600/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <section className="pt-32 pb-20 px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-blue-100">Simple, transparent, seamless</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-tight"
            >
              How{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                LuxeDrive
              </span>{" "}
              Works
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto"
            >
              From browsing to driving in four effortless steps. No hidden fees,
              no paperwork, no hassle.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/browse")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-[0_8px_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all"
              >
                Browse Cars
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/8 border border-white/15 text-white font-bold hover:bg-white/15 transition-all"
              >
                List Your Car
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Steps */}
        <section className="py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-5xl mx-auto space-y-6">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`flex flex-col md:flex-row gap-6 p-8 rounded-3xl border bg-white/[0.02] transition-all hover:bg-white/[0.04] ${item.border}`}
              >
                <div className="flex-shrink-0 flex md:flex-col items-center md:items-start gap-4 md:gap-0">
                  <span className="text-6xl font-display font-black text-white/[0.06] leading-none select-none w-16 text-center">
                    {item.step}
                  </span>
                  <div
                    className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mt-0 md:mt-3`}
                  >
                    <item.icon size={26} className={item.color} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-display font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-300 mb-3 leading-relaxed">{item.desc}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span
                variants={fadeUp}
                className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 mb-5"
              >
                Why LuxeDrive
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-4xl md:text-5xl font-display font-bold mb-4"
              >
                Built for Trust & Convenience
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-gray-400 text-lg max-w-xl mx-auto"
              >
                Every feature is designed to give you total peace of mind.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="p-7 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feat.icon size={22} className={feat.color} />
                  </div>
                  <h3 className="text-lg font-display font-bold mb-2">{feat.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span
                variants={fadeUp}
                className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-purple-400 bg-purple-400/10 border border-purple-400/20 mb-5"
              >
                Common Questions
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-4xl font-display font-bold mb-4"
              >
                Frequently Asked
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-4"
            >
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                >
                  <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 p-12 md:p-20 text-center"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=2000')] opacity-5 bg-cover bg-center" />
              <div className="relative z-10 max-w-xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-5">
                  Ready to Drive?
                </h2>
                <p className="text-blue-100/80 text-lg mb-8 leading-relaxed">
                  Join thousands of people who have already discovered a better way to
                  experience premium cars.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate("/browse")}
                    className="px-8 py-4 rounded-full bg-white text-blue-900 font-bold hover:bg-blue-50 hover:scale-105 transition-all shadow-xl"
                  >
                    Browse Cars Now
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all backdrop-blur-md"
                  >
                    Create Free Account
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;

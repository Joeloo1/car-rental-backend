import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Shield,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Check,
  Calendar,
  Car as CarIcon,
} from "lucide-react";
import { carService } from "../services/car.service";
import { categoryService } from "../services/category.service";
import { getImageUrl } from "../utils/image";
import type { Car } from "../types/index";

// ── Premium landing car card ───────────────────────────────────────────────────
const LandingCarCard: React.FC<{ car: Car; index: number }> = ({ car, index }) => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const img = car.images?.[0]?.imageUrl
    ? getImageUrl(car.images[0].imageUrl, 600)
    : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=60&w=600";

  const delays = ["", "delay-[60ms]", "delay-[120ms]", "delay-[180ms]", "delay-[240ms]", "delay-[300ms]"];

  return (
    <article
      onClick={() => navigate(`/car/${car.id}`)}
      className={`group cursor-pointer animate-fade-up ${delays[Math.min(index, 5)]}`}
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[16/10] mb-3.5 bg-surface-2 ring-1 ring-white/[0.06] group-hover:ring-blue/30 transition-all duration-300 group-hover:shadow-lg">
        {!loaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={img}
          alt={`${car.brand} ${car.model}`}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05] ${loaded ? "opacity-100" : "opacity-0"}`}
        />

        {/* Scrim for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* Price badge — top right */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
          <span className="text-sm font-bold text-white">${car.pricePerDay}</span>
          <span className="text-xs text-white/50"> /day</span>
        </div>

        {/* Category badge — bottom left */}
        {car.category?.name && (
          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-sm text-xs font-medium text-white/80 border border-white/10">
            {car.category.name}
          </span>
        )}
      </div>

      <div className="px-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-[15px] text-ink-primary group-hover:text-blue-light transition-colors leading-tight">
            {car.brand} {car.model}
          </h3>
          {(car.averageRating ?? 0) > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <Star size={11} className="fill-amber text-amber" />
              <span className="text-xs font-semibold text-ink-secondary">
                {Number(car.averageRating).toFixed(1)}
              </span>
            </div>
          )}
        </div>
        {car.locationCity && (
          <p className="flex items-center gap-1 text-xs text-ink-tertiary">
            <MapPin size={10} className="flex-shrink-0" />
            {car.locationCity}
          </p>
        )}
      </div>
    </article>
  );
};

const LandingCarSkeleton: React.FC = () => (
  <div>
    <div className="skeleton rounded-2xl aspect-[16/10] mb-3.5" />
    <div className="skeleton h-4 w-3/4 rounded mb-2" />
    <div className="skeleton h-3 w-1/2 rounded" />
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const LandingPagePro: React.FC = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState("");

  const { data: carsData, isLoading: carsLoading, isError: carsError } = useQuery({
    queryKey: ["landing-cars"],
    queryFn: () => carService.getAll({ limit: 6, sortBy: "averageRating", sortOrder: "desc" }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: Infinity,
  });

  const cars = carsData?.cars ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity.trim()) params.set("locationCity", searchCity.trim());
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="bg-[#080808] min-h-screen">

      {/* ══════════════════  HERO  ══════════════════ */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=85&w=2400"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          {/* Layered gradient: strong bottom-up pull + left-side tint for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/72 to-[#080808]/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/60 via-[#080808]/20 to-transparent" />
        </div>

        <div className="relative z-10 w-full pb-24 pt-36">
          <div className="container">
            <div className="max-w-2xl">

              {/* Live trust badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
                </span>
                <span className="text-xs font-medium text-white/60">
                  40,000+ trips · Nigeria's #1 car rental
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-[68px] font-bold tracking-tight leading-[1.04] mb-5">
                <span className="text-white block">Drive the car</span>
                <span
                  className="block"
                  style={{
                    background: "linear-gradient(to right, #fcd34d, #f59e0b, #d97706)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  you deserve.
                </span>
              </h1>

              <p className="text-base text-white/50 max-w-md mb-9 leading-relaxed">
                1,200+ verified vehicles across 50 cities. Instant booking,
                transparent pricing, zero hidden fees.
              </p>

              {/* Search bar — glass morphism */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 max-w-[540px]">
                <div className="relative flex-1">
                  <MapPin
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="City or location…"
                    value={searchCity}
                    onChange={e => setSearchCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/25 focus:bg-white/[0.12] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-black flex-shrink-0 transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #fcd34d, #d97706)" }}
                >
                  Find a car <ArrowRight size={15} />
                </button>
              </form>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6">
                {["Free cancellation", "Fully insured", "Doorstep delivery"].map(item => (
                  <span key={item} className="flex items-center gap-1.5 text-xs text-white/40">
                    <Check size={11} className="text-green" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════  STATS  ══════════════════ */}
      <section className="border-y border-[#161616]">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { value: "1,200+",  label: "Vehicles listed",  highlight: false },
              { value: "50+",     label: "Cities covered",   highlight: false },
              { value: "40,000+", label: "Trips completed",  highlight: false },
              { value: "4.9★",    label: "Average rating",   highlight: true  },
            ].map(({ value, label, highlight }, i) => (
              <div
                key={label}
                className={`px-6 py-7 ${i < 3 ? "border-r border-[#161616]" : ""}`}
              >
                <p
                  className="text-2xl font-bold mb-0.5"
                  style={highlight ? { color: "#f59e0b" } : { color: "#fafafa" }}
                >
                  {value}
                </p>
                <p className="text-xs text-ink-tertiary">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════  CATEGORIES  ══════════════════ */}
      {(categories?.length ?? 0) > 0 && (
        <section className="py-10">
          <div className="container">
            <p className="text-sm font-semibold text-ink-secondary mb-4">Browse by type</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/browse")}
                className="px-4 py-2 rounded-full bg-surface-2 border border-[#282828] text-sm font-medium text-ink-secondary hover:bg-surface-3 hover:border-[#353535] hover:text-ink-primary transition-all"
              >
                All vehicles
              </button>
              {categories!.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/browse?category=${cat.name}`)}
                  className="px-4 py-2 rounded-full bg-surface-2 border border-[#282828] text-sm font-medium text-ink-secondary hover:bg-surface-3 hover:border-[#353535] hover:text-ink-primary transition-all"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════  FEATURED CARS  ══════════════════ */}
      <section className="py-14 border-t border-[#161616]">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-2">
                Top picks
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
                Highest-rated vehicles
              </h2>
            </div>
            <button
              onClick={() => navigate("/browse")}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
            {carsLoading
              ? Array.from({ length: 6 }, (_, i) => <LandingCarSkeleton key={i} />)
              : carsError
              ? (
                <div className="col-span-3 py-16 text-center">
                  <p className="text-sm text-ink-tertiary">
                    Could not load vehicles. Make sure the server is running.
                  </p>
                </div>
              )
              : cars.length === 0
              ? (
                <div className="col-span-3 py-16 text-center">
                  <p className="text-sm text-ink-tertiary">No vehicles available yet.</p>
                </div>
              )
              : cars.map((car, i) => <LandingCarCard key={car.id} car={car} index={i} />)
            }
          </div>

          <div className="mt-10 text-center sm:hidden">
            <button onClick={() => navigate("/browse")} className="btn-secondary gap-2">
              View all cars <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════  HOW IT WORKS  ══════════════════ */}
      <section
        className="py-20 border-t border-[#161616]"
        style={{ background: "linear-gradient(to bottom, #080808, #0d0d0d 50%, #080808)" }}
      >
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-3">
              Simple process
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
              Book in under 2 minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 relative">
            {/* Connector line — desktop only */}
            <div className="hidden sm:block absolute top-[38px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent pointer-events-none" />

            {[
              {
                icon: Search,
                step: "01",
                title: "Find your car",
                desc: "Filter by city, dates, and vehicle type. Every listing shows transparent pricing — no surprises.",
              },
              {
                icon: Calendar,
                step: "02",
                title: "Book instantly",
                desc: "Pick your dates and confirm. You get immediate booking confirmation from the host.",
              },
              {
                icon: CarIcon,
                step: "03",
                title: "Hit the road",
                desc: "Meet your host, collect the keys, and drive. Return at the agreed time and place.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center px-4 sm:px-2">
                <div className="relative mb-6">
                  <div className="w-[76px] h-[76px] rounded-2xl bg-surface-2 border border-[#222] flex items-center justify-center">
                    <Icon size={26} className="text-ink-secondary" />
                  </div>
                  {/* Step badge */}
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border border-[#282828]"
                    style={{ background: "#0d0d0d" }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: "#f59e0b" }}>{step}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-[15px] text-ink-primary mb-2">{title}</h3>
                <p className="text-sm text-ink-tertiary leading-relaxed max-w-[220px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════  TRUST FEATURES  ══════════════════ */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
              Why 40,000 drivers choose LuxeDrive
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: Shield,
                iconColor: "#3b82f6",
                iconBg: "rgba(37,99,235,0.12)",
                iconBorder: "rgba(37,99,235,0.22)",
                title: "Fully insured",
                desc: "Every trip includes comprehensive insurance and 24/7 roadside assistance at no extra cost.",
              },
              {
                icon: Clock,
                iconColor: "#f59e0b",
                iconBg: "rgba(245,158,11,0.12)",
                iconBorder: "rgba(245,158,11,0.22)",
                title: "Real-time availability",
                desc: "Live calendar sync prevents double-bookings. What you see is always what's actually available.",
              },
              {
                icon: Star,
                iconColor: "#22c55e",
                iconBg: "rgba(34,197,94,0.12)",
                iconBorder: "rgba(34,197,94,0.22)",
                title: "Verified hosts",
                desc: "All hosts are ID-verified with inspected vehicles. 4.9★ average across 40,000+ completed trips.",
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

      {/* ══════════════════  TESTIMONIALS  ══════════════════ */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-2">
                Customer stories
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
                What drivers are saying
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className="fill-amber text-amber" />
              ))}
              <span className="ml-2 text-sm font-medium text-ink-secondary">4.9 / 5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                rating: 5,
                text: "Booking was seamless and the Porsche was in perfect condition. The host was professional and on time. Absolutely worth every naira.",
                name: "Adewale O.",
                location: "Lagos",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80&h=80",
              },
              {
                rating: 5,
                text: "Used LuxeDrive for my wedding. The Rolls-Royce arrived spotless, the driver was professional, and every detail was perfect. Highly recommend.",
                name: "Chisom N.",
                location: "Abuja",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80",
              },
              {
                rating: 5,
                text: "I travel to Abuja monthly for business. LuxeDrive saves me from dealing with rentals at the airport. Great cars, fair prices, reliable hosts.",
                name: "Emeka I.",
                location: "Port Harcourt",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="relative flex flex-col p-6 rounded-2xl border border-[#1c1c1c] bg-surface-1 overflow-hidden hover:border-[#272727] transition-colors"
              >
                {/* Gold top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: "linear-gradient(to right, transparent, #d97706, transparent)" }}
                />

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, k) => (
                    <Star key={k} size={13} className="fill-amber text-amber" />
                  ))}
                </div>

                <p className="text-sm text-ink-secondary leading-relaxed flex-1 mb-5">
                  "{t.text}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-[#1c1c1c]">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">{t.name}</p>
                    <p className="text-xs text-ink-tertiary">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════  LENDER CTA  ══════════════════ */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
            style={{
              background: "linear-gradient(135deg, #0c1220 0%, #111827 60%, #0c1220 100%)",
              border: "1px solid #1a2234",
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-[0.08] blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
            />
            <div
              className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
            />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-light mb-3">
                  For car owners
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                  Earn while your car sits idle
                </h2>
                <p className="text-sm text-white/50 leading-relaxed">
                  List your car in under 5 minutes. You set the price, availability, and rules.
                  Thousands of verified renters are searching right now.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  onClick={() => navigate("/register?role=lender")}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                >
                  Start earning <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate("/browse")}
                  className="btn-secondary px-6 py-3"
                >
                  Browse instead
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════  FINAL CTA  ══════════════════ */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight mb-3">
              Ready to find your car?
            </h2>
            <p className="text-sm text-ink-tertiary mb-8 leading-relaxed">
              Browse 1,200+ vehicles right now. No account needed to search — sign up only when you're ready to book.
            </p>
            <button
              onClick={() => navigate("/browse")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-black transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #fcd34d, #d97706)" }}
            >
              Browse all cars <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPagePro;

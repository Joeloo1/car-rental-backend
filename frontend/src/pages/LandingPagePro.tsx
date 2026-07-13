import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Shield, Clock, MapPin, Star, ArrowRight, Check, Calendar,
  Car as CarIcon, Zap, Truck, Mountain, Briefcase, ChevronRight,
} from "@/lib/icons";
import { carService } from "../services/car.service";
import { categoryService } from "../services/category.service";
import { getImageUrl } from "../utils/image";
import type { Car } from "../types/index";

// ── Landing car card ──────────────────────────────────────────────────────────
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
      <div
        className="relative overflow-hidden rounded-2xl aspect-[16/10] mb-3.5 bg-surface-2"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)", transition: "box-shadow 0.3s ease, transform 0.3s ease" }}
        onMouseOver={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px rgba(212,151,42,0.25), 0 20px 50px rgba(0,0,0,0.7)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        {!loaded && <div className="absolute inset-0 skeleton animate-shimmer" />}
        <img
          src={img}
          alt={`${car.brand} ${car.model}`}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06] ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 pointer-events-none" />

        {/* "View" badge on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-black"
            style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)" }}>
            View <ArrowRight size={11} />
          </span>
        </div>

        {/* Price */}
        <div className="absolute bottom-3 right-3 flex items-baseline gap-0.5 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(13,13,15,0.72)", border: "1px solid rgba(212,151,42,0.28)", backdropFilter: "blur(12px)" }}>
          <span className="font-price font-bold leading-none" style={{ fontSize: "15px", color: "#D4972A" }}>
            ${car.pricePerDay}
          </span>
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>/day</span>
        </div>

        {/* Category */}
        {car.category?.name && (
          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-sm text-xs font-medium text-white/80 border border-white/10">
            {car.category.name}
          </span>
        )}
      </div>

      <div className="px-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-heading font-semibold text-[15px] leading-tight group-hover:text-gold transition-colors duration-150" style={{ color: "#F2F0EC" }}>
            {car.brand} {car.model}
          </h3>
          {(car.averageRating ?? 0) > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <Star size={11} style={{ fill: "#d97706", color: "#d97706" }} />
              <span className="text-xs font-semibold text-ink-secondary">{Number(car.averageRating).toFixed(1)}</span>
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
    <div className="skeleton animate-shimmer rounded-2xl aspect-[16/10] mb-3.5" />
    <div className="skeleton animate-shimmer h-4 w-3/4 rounded mb-2" />
    <div className="skeleton animate-shimmer h-3 w-1/2 rounded" />
  </div>
);

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Luxury: CarIcon, SUV: Mountain, Sport: Zap, Electric: Zap,
  Sedan: CarIcon, Van: Truck, Truck: Truck, Business: Briefcase,
};

// ── Main ──────────────────────────────────────────────────────────────────────
const LandingPagePro: React.FC = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [featuredTab, setFeaturedTab] = useState<"toprated" | "newest">("toprated");

  const { data: carsTopRated, isLoading: carsLoading, isError: carsError } = useQuery({
    queryKey: ["landing-cars", "toprated"],
    queryFn: () => carService.getAll({ limit: 6, sortBy: "averageRating", sortOrder: "desc" }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: carsNewest, isLoading: newestLoading } = useQuery({
    queryKey: ["landing-cars", "newest"],
    queryFn: () => carService.getAll({ limit: 6, sortBy: "createdAt", sortOrder: "desc" }),
    staleTime: 5 * 60 * 1000,
    enabled: featuredTab === "newest",
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: Infinity,
  });

  const { data: carCount } = useQuery({
    queryKey: ["car-count"],
    queryFn: () => carService.getAll({ limit: 1, page: 1 }),
    staleTime: 10 * 60 * 1000,
  });
  const totalCars = carCount?.pagination?.total ?? null;
  const totalCarsLabel = totalCars ? `${totalCars.toLocaleString()}+` : "1,200+";

  const activeCars = featuredTab === "toprated" ? (carsTopRated?.cars ?? []) : (carsNewest?.cars ?? carsTopRated?.cars ?? []);
  const isActiveCarsLoading = featuredTab === "toprated" ? carsLoading : newestLoading && !carsNewest;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity.trim()) params.set("locationCity", searchCity.trim());
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    navigate(`/browse?${params.toString()}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-[#0A0A0C] min-h-screen">

      {/* ══════════════  HERO  ══════════════ */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=85&w=2400"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] from-[18%] via-[#0A0A0C]/58 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0C]/70 via-[#0A0A0C]/20 to-transparent" />
        </div>

        {/* Ambient orbs */}
        <div className="absolute top-[12%] right-[18%] w-[480px] h-[480px] rounded-full pointer-events-none opacity-[0.08] blur-[120px]"
          style={{ background: "radial-gradient(circle, #D4972A, transparent)" }} />
        <div className="absolute bottom-[25%] left-[8%] w-[320px] h-[320px] rounded-full pointer-events-none opacity-[0.06] blur-[100px]"
          style={{ background: "radial-gradient(circle, #4A8EE8, transparent)" }} />

        <div className="relative z-10 w-full pb-24 pt-36">
          <div className="container">
            <div className="max-w-[640px]">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm mb-7 animate-fade-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal" />
                </span>
                <span className="text-xs font-medium text-white/60">40,000+ trips · Nigeria's #1 car rental</span>
              </div>

              {/* Headline */}
              <h1 className="font-display font-bold tracking-[-0.03em] leading-[1.0] mb-6 animate-fade-up delay-[60ms]"
                style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>
                <span className="text-white block">Drive the car</span>
                <span className="block"
                  style={{ background: "linear-gradient(to right, #E0AC3C, #D4972A, #B8791E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  you deserve.
                </span>
              </h1>

              <p className="text-[15px] text-white/45 max-w-md mb-9 leading-relaxed animate-fade-up delay-[120ms]">
                {totalCarsLabel} verified vehicles across 50 cities. Instant booking,
                transparent pricing, zero hidden fees.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="max-w-[600px] animate-fade-up delay-[180ms]">
                <div className="flex flex-col gap-2 p-2 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl"
                  style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="City or location…"
                      value={searchCity}
                      onChange={e => setSearchCity(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/20 focus:bg-white/[0.10] transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
                      <input
                        type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={today}
                        className="w-full pl-9 pr-3 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white/80 focus:outline-none focus:border-white/20 focus:bg-white/[0.10] transition-all [color-scheme:dark]"
                      />
                    </div>
                    <div className="relative flex-1">
                      <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
                      <input
                        type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || today}
                        className="w-full pl-9 pr-3 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white/80 focus:outline-none focus:border-white/20 focus:bg-white/[0.10] transition-all [color-scheme:dark]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-black flex-shrink-0 transition-all hover:brightness-110 active:scale-[0.98] hover:-translate-y-0.5 whitespace-nowrap"
                      style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)", boxShadow: "0 4px 16px rgba(212,151,42,0.28)" }}
                    >
                      <Search size={15} />
                      Search
                    </button>
                  </div>
                </div>
              </form>

              {/* Trust chips */}
              <div className="flex flex-wrap items-center gap-3 mt-6 animate-fade-up delay-[240ms]">
                {[
                  { label: "Free cancellation", color: "#4A8EE8" },
                  { label: "Fully insured",     color: "#D4972A" },
                  { label: "Doorstep delivery", color: "#D4972A" },
                ].map(({ label, color }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-white/50 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-full">
                    <Check size={11} style={{ color }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════  STATS  ══════════════ */}
      <section className="border-y border-[#161616]">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { value: totalCarsLabel, label: "Vehicles listed",   sub: "verified & inspected",   accent: "#fafafa" },
              { value: "50+",    label: "Cities covered",    sub: "across Nigeria",          accent: "#fafafa" },
              { value: "40,000+",label: "Trips completed",   sub: "in 2024 alone",           accent: "#fafafa" },
              { value: "4.9★",   label: "Average rating",    sub: "from 12,000+ reviews",    accent: "#D4972A" },
            ].map(({ value, label, sub, accent }, i) => (
              <div
                key={label}
                className={`px-6 py-8 flex flex-col gap-0.5 hover:bg-surface-1/30 transition-colors ${i < 3 ? "border-r border-[#161616]" : ""} ${i >= 2 ? "border-t border-[#161616] sm:border-t-0" : ""}`}
              >
                <p className="text-2xl sm:text-3xl font-display font-bold tracking-tight" style={{ color: accent }}>{value}</p>
                <p className="text-xs font-medium text-ink-secondary">{label}</p>
                <p className="text-[10px] text-ink-tertiary">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════  CATEGORIES  ══════════════ */}
      {(categories?.length ?? 0) > 0 && (
        <section className="py-12 border-t border-[#161616]">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-semibold text-ink-secondary">Browse by type</p>
              <button onClick={() => navigate("/browse")} className="text-xs font-medium text-ink-tertiary hover:text-gold transition-colors flex items-center gap-1">
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              <button
                onClick={() => navigate("/browse")}
                className="group flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl bg-surface-2 border border-[#282828] text-sm font-medium text-ink-secondary hover:bg-surface-3 hover:border-gold/25 hover:text-gold transition-all min-w-[88px]"
              >
                <div className="w-9 h-9 rounded-xl bg-surface-3 border border-[#333] flex items-center justify-center group-hover:border-gold/20 transition-colors">
                  <Search size={15} className="text-ink-tertiary group-hover:text-gold transition-colors" />
                </div>
                <span className="text-xs">All</span>
              </button>
              {categories!.map(cat => {
                const Icon = CATEGORY_ICONS[cat.name] ?? CarIcon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/browse?category=${cat.name}`)}
                    className="group flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl bg-surface-2 border border-[#282828] text-sm font-medium text-ink-secondary hover:bg-surface-3 hover:border-gold/25 hover:text-gold transition-all min-w-[88px]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-3 border border-[#333] flex items-center justify-center group-hover:border-gold/20 transition-colors">
                      <Icon size={15} className="text-ink-tertiary group-hover:text-gold transition-colors" />
                    </div>
                    <span className="text-xs whitespace-nowrap">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════  FEATURED CARS  ══════════════ */}
      <section className="py-14 border-t border-[#161616]">
        <div className="container">
          <div className="flex items-center justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-2">
                Featured vehicles
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-primary tracking-tight">
                Find your perfect car
              </h2>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Tab toggle */}
              <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl bg-surface-2 border border-[#282828]">
                {(["toprated", "newest"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFeaturedTab(tab)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                    style={featuredTab === tab
                      ? { background: "rgba(212,151,42,0.15)", color: "var(--color-gold)", border: "1px solid rgba(212,151,42,0.25)" }
                      : { color: "var(--color-text-muted)" }
                    }
                  >
                    {tab === "toprated" ? "Top Rated" : "New Arrivals"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate("/browse")}
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
            {isActiveCarsLoading
              ? Array.from({ length: 6 }, (_, i) => <LandingCarSkeleton key={i} />)
              : carsError
              ? (
                <div className="col-span-3 py-16 text-center">
                  <p className="text-sm text-ink-tertiary">Could not load vehicles. Make sure the server is running.</p>
                </div>
              )
              : activeCars.length === 0
              ? (
                <div className="col-span-3 py-16 text-center">
                  <p className="text-sm text-ink-tertiary">No vehicles available yet.</p>
                </div>
              )
              : activeCars.map((car, i) => <LandingCarCard key={car.id} car={car} index={i} />)
            }
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate("/browse")}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-black transition-all hover:brightness-110 active:scale-[0.98] hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)", boxShadow: "0 4px 16px rgba(212,151,42,0.22)" }}
            >
              Browse all vehicles <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate("/browse")}
              className="btn-secondary sm:hidden"
            >
              View all
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════  HOW IT WORKS  ══════════════ */}
      <section className="py-20 border-t border-[#161616]"
        style={{ background: "linear-gradient(to bottom, #0A0A0C, #101013 50%, #0A0A0C)" }}>
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-3">Simple process</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-primary tracking-tight">
              Book in under 2 minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-[38px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent pointer-events-none" />

            {[
              { icon: Search,   step: "01", title: "Find your car",  desc: "Filter by city, dates, and vehicle type. Every listing shows transparent pricing — no surprises." },
              { icon: Calendar, step: "02", title: "Book instantly", desc: "Pick your dates and confirm. You get immediate booking confirmation from the host." },
              { icon: CarIcon,  step: "03", title: "Hit the road",   desc: "Meet your host, collect the keys, and drive. Return at the agreed time and place." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="group flex flex-col items-center text-center px-4 sm:px-2">
                <div className="relative mb-6">
                  <div className="w-[76px] h-[76px] rounded-2xl bg-surface-2 border border-[#222] flex items-center justify-center transition-all group-hover:border-gold/20 group-hover:bg-surface-3">
                    <Icon size={26} className="text-ink-secondary group-hover:text-gold transition-colors" />
                  </div>
                  <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center border border-[#282828]"
                    style={{ background: "#101013" }}>
                    <span className="text-[10px] font-bold" style={{ color: "#D4972A" }}>{step}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-[15px] text-ink-primary mb-2">{title}</h3>
                <p className="text-sm text-ink-tertiary leading-relaxed max-w-[220px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════  TRUST FEATURES  ══════════════ */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-primary tracking-tight">
              Why 40,000 drivers choose LuxeDrive
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: Shield, iconColor: "#D4972A", iconBg: "rgba(212,151,42,0.10)", iconBorder: "rgba(212,151,42,0.20)",
                title: "Fully insured",
                desc: "Every trip includes comprehensive insurance and 24/7 roadside assistance at no extra cost.",
              },
              {
                icon: Clock, iconColor: "#D4972A", iconBg: "rgba(212,151,42,0.10)", iconBorder: "rgba(212,151,42,0.20)",
                title: "Real-time availability",
                desc: "Live calendar sync prevents double-bookings. What you see is always what's actually available.",
              },
              {
                icon: Star, iconColor: "#4A8EE8", iconBg: "rgba(74,142,232,0.10)", iconBorder: "rgba(74,142,232,0.20)",
                title: "Verified hosts",
                desc: "All hosts are ID-verified with inspected vehicles. 4.9★ average across 40,000+ completed trips.",
              },
            ].map(({ icon: Icon, iconColor, iconBg, iconBorder, title, desc }) => (
              <div key={title} className="group p-6 rounded-2xl border border-[#1c1c1c] bg-surface-1 hover:border-[#272727] hover:bg-surface-2 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
                  <Icon size={20} style={{ color: iconColor }} />
                </div>
                <h3 className="font-semibold text-[15px] text-ink-primary mb-2">{title}</h3>
                <p className="text-sm text-ink-tertiary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════  TESTIMONIALS  ══════════════ */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-2">Customer stories</p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-primary tracking-tight">What drivers are saying</h2>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} style={{ fill: "#d97706", color: "#d97706" }} />
              ))}
              <span className="ml-2 text-sm font-medium text-ink-secondary">4.9 / 5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                rating: 5,
                text: "Booking was seamless and the Porsche was in perfect condition. The host was professional and on time. Absolutely worth every naira.",
                name: "Adewale O.", location: "Lagos",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80&h=80",
              },
              {
                rating: 5,
                text: "Used LuxeDrive for my wedding. The Rolls-Royce arrived spotless, the driver was professional, and every detail was perfect. Highly recommend.",
                name: "Chisom N.", location: "Abuja",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80",
              },
              {
                rating: 5,
                text: "I travel to Abuja monthly for business. LuxeDrive saves me from dealing with rentals at the airport. Great cars, fair prices, reliable hosts.",
                name: "Emeka I.", location: "Port Harcourt",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80",
              },
            ].map((t, i) => (
              <div key={i} className="relative flex flex-col p-6 rounded-2xl border border-[#1c1c1c] bg-surface-1 overflow-hidden hover:border-[#272727] hover:bg-surface-2 transition-all duration-200">
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: "linear-gradient(to right, transparent, #D4972A, transparent)" }} />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, k) => (
                    <Star key={k} size={13} style={{ fill: "#d97706", color: "#d97706" }} />
                  ))}
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed flex-1 mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#1c1c1c]">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10" />
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

      {/* ══════════════  LENDER CTA  ══════════════ */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
            style={{ background: "linear-gradient(135deg, #15110A 0%, #1C160C 60%, #15110A 100%)", border: "1px solid rgba(212,151,42,0.16)" }}>
            {/* Glow effects */}
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-[0.10] blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, #D4972A, transparent)" }} />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, #4A8EE8, transparent)" }} />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  <span className="text-xs font-semibold text-gold tracking-wide">For car owners</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-3">
                  Earn while your car sits idle
                </h2>
                <p className="text-sm text-white/50 leading-relaxed mb-4">
                  List your car in under 5 minutes. You set the price, availability, and rules.
                  Thousands of verified renters are searching right now.
                </p>
                <p className="text-xs text-white/30">
                  Average host earns <span className="text-gold font-semibold">₦280,000/month</span> on LuxeDrive.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  onClick={() => navigate("/register?role=lender")}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-black transition-all hover:brightness-110 active:scale-[0.98] hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)", boxShadow: "0 4px 16px rgba(212,151,42,0.22)" }}
                >
                  Start earning <ArrowRight size={15} />
                </button>
                <button onClick={() => navigate("/browse")} className="btn-secondary px-6">
                  Browse instead
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════  FINAL CTA  ══════════════ */}
      <section className="py-16 border-t border-[#161616]">
        <div className="container">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink-primary tracking-tight mb-3">
              Ready to find your car?
            </h2>
            <p className="text-sm text-ink-tertiary mb-8 leading-relaxed">
              Browse {totalCarsLabel} vehicles right now. No account needed to search — sign up only when you're ready to book.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/browse")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-black transition-all hover:brightness-110 active:scale-[0.98] hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)", boxShadow: "0 4px 16px rgba(212,151,42,0.22)" }}
              >
                Browse all cars <ArrowRight size={15} />
              </button>
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-ink-secondary border border-[#2a2a2a] bg-surface-2 hover:bg-surface-3 hover:border-[#3a3a3a] transition-all"
              >
                Create free account
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPagePro;

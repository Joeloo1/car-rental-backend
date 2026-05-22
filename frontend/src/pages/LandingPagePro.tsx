import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Car,
  Shield,
  Zap,
  Star,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Quote,
  ArrowRight,
  Phone,
  Clock,
  Award,
  ChevronDown,
} from "lucide-react";
import { carService } from "../services/car.service.ts";
import { getImageUrl } from "../utils/image";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// ─── Vehicle type categories ─────────────────────────────────────────────────
const VEHICLE_TYPES = [
  {
    label: "SUV",
    sub: "Spacious & Versatile",
    img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=70&w=600",
    value: "suv",
  },
  {
    label: "Luxury",
    sub: "Premium Experience",
    img: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=70&w=600",
    value: "luxury",
  },
  {
    label: "Sports",
    sub: "Born to Perform",
    img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=70&w=600",
    value: "sports",
  },
  {
    label: "Sedan",
    sub: "Refined Comfort",
    img: "https://images.unsplash.com/photo-1490650034157-b506dc9e6d5f?auto=format&fit=crop&q=70&w=600",
    value: "sedan",
  },
  {
    label: "Electric",
    sub: "Zero Emissions",
    img: "https://images.unsplash.com/photo-1617650728657-cc5e8df43d67?auto=format&fit=crop&q=70&w=600",
    value: "electric",
  },
  {
    label: "Convertible",
    sub: "Open-Air Freedom",
    img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=70&w=600",
    value: "convertible",
  },
];

// ─── Popular cities ───────────────────────────────────────────────────────────
const CITIES = [
  {
    city: "Lagos",
    img: "https://images.unsplash.com/photo-1618765645323-7e5e0f5e5e5e?auto=format&fit=crop&q=70&w=400",
    count: "40+ cars",
  },
  {
    city: "Abuja",
    img: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=70&w=400",
    count: "28+ cars",
  },
  {
    city: "Port Harcourt",
    img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=70&w=400",
    count: "14+ cars",
  },
  {
    city: "Ibadan",
    img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=70&w=400",
    count: "10+ cars",
  },
];

const LandingPagePro: React.FC = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    location: "",
    startDate: "",
    endDate: "",
    category: "",
  });
  const [isHoveredSearch, setIsHoveredSearch] = useState(false);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchForm.location) params.append("location", searchForm.location);
    if (searchForm.startDate) params.append("startDate", searchForm.startDate);
    if (searchForm.endDate) params.append("endDate", searchForm.endDate);
    if (searchForm.category) params.append("category", searchForm.category);
    navigate(`/browse${params.toString() ? "?" + params.toString() : ""}`);
  };

  const { data: carsData, isLoading } = useQuery({
    queryKey: ["featured-cars"],
    queryFn: () => carService.getAll({ limit: 6 }),
  });

  const cars = Array.isArray(carsData)
    ? carsData
    : (carsData as any)?.data?.cars || (carsData as any)?.cars || [];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-hidden font-sans">

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-20 pb-28 px-6 overflow-hidden">

        {/* Background car image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark gradient overlay: strong at top & bottom, lighter in middle */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/85 via-[#0a0a0b]/55 to-[#0a0a0b]" />
          {/* Subtle colour tint */}
          <div className="absolute inset-0 bg-blue-900/20" />
        </div>

        {/* Ambient accent blobs */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-[8%] w-[25%] h-[25%] bg-blue-600/20 blur-[90px] rounded-full" />
          <div className="absolute bottom-1/3 right-[5%] w-[18%] h-[18%] bg-purple-600/20 blur-[80px] rounded-full" />
        </div>

        {/* Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm font-medium text-blue-100">Redefining Luxury Rentals</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight mb-6 leading-[1.08]"
          >
            Drive Your Dream Car <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Without Limits
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Experience the thrill of driving exotic and luxury vehicles from verified
            hosts. Unmatched quality, instant booking, and seamless rides.
          </motion.p>

          {/* Search Widget */}
          <motion.div variants={fadeUp} className="w-full max-w-4xl mx-auto">
            <div
              className={`relative p-2 md:p-3 rounded-2xl md:rounded-full bg-black/40 backdrop-blur-xl border transition-all duration-500 shadow-2xl ${
                isHoveredSearch
                  ? "border-blue-500/60 shadow-[0_0_40px_rgba(59,130,246,0.2)]"
                  : "border-white/15"
              }`}
              onMouseEnter={() => setIsHoveredSearch(true)}
              onMouseLeave={() => setIsHoveredSearch(false)}
            >
              <div className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                {/* Location */}
                <div className="flex-1 w-full flex items-center gap-3 px-6 py-4 md:py-3 group">
                  <MapPin className="text-blue-400 flex-shrink-0" size={20} />
                  <div className="flex flex-col text-left w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                      Where
                    </label>
                    <input
                      type="text"
                      placeholder="City or Airport"
                      className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm font-medium"
                      value={searchForm.location}
                      onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* Pickup Date */}
                <div className="flex-1 w-full flex items-center gap-3 px-6 py-4 md:py-3 group">
                  <Calendar className="text-purple-400 flex-shrink-0" size={20} />
                  <div className="flex flex-col text-left w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                      Pick-up
                    </label>
                    <input
                      type="date"
                      className="w-full bg-transparent border-none outline-none text-white text-sm font-medium [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                      value={searchForm.startDate}
                      onChange={(e) => setSearchForm({ ...searchForm, startDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Return Date */}
                <div className="flex-1 w-full flex items-center gap-3 px-6 py-4 md:py-3 group">
                  <Calendar className="text-emerald-400 flex-shrink-0" size={20} />
                  <div className="flex flex-col text-left w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                      Return
                    </label>
                    <input
                      type="date"
                      className="w-full bg-transparent border-none outline-none text-white text-sm font-medium [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                      value={searchForm.endDate}
                      onChange={(e) => setSearchForm({ ...searchForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Car Type */}
                <div className="flex-1 w-full flex items-center gap-3 px-6 py-4 md:py-3 group">
                  <Car className="text-amber-400 flex-shrink-0" size={20} />
                  <div className="flex flex-col text-left w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                      Type
                    </label>
                    <select
                      className="w-full bg-transparent border-none outline-none text-white text-sm font-medium appearance-none"
                      value={searchForm.category}
                      onChange={(e) => setSearchForm({ ...searchForm, category: e.target.value })}
                    >
                      <option value="" className="bg-[#111115]">Any Type</option>
                      <option value="luxury" className="bg-[#111115]">Luxury</option>
                      <option value="suv" className="bg-[#111115]">SUV</option>
                      <option value="sports" className="bg-[#111115]">Sports</option>
                      <option value="electric" className="bg-[#111115]">Electric</option>
                      <option value="sedan" className="bg-[#111115]">Sedan</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <div className="p-2 w-full md:w-auto mt-2 md:mt-0">
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full md:w-auto h-14 md:h-12 px-8 md:px-6 rounded-xl md:rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center gap-2 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_24px_rgba(79,70,229,0.45)] hover:shadow-[0_0_36px_rgba(79,70,229,0.65)] font-bold"
                  >
                    <Search size={20} className="text-white" />
                    <span className="text-white">Search</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick stats below search */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-400"
          >
            {["500+ Premium Cars", "12k+ Happy Renters", "4.9★ Average Rating"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-400" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-gray-500"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── TRUST BAR ─────────────────────────────────────────────────────── */}
      <div className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { icon: Shield, label: "Full Insurance Coverage" },
              { icon: CheckCircle, label: "Free Cancellation" },
              { icon: Phone, label: "24/7 Roadside Support" },
              { icon: Clock, label: "Instant Confirmation" },
              { icon: Award, label: "Verified Hosts Only" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon size={16} className="text-blue-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-300 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10">

        {/* ─── BROWSE BY TYPE ───────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="mb-12"
            >
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3"
              >
                Find Your Ride
              </motion.p>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <motion.h2
                  variants={fadeUp}
                  className="text-4xl md:text-5xl font-display font-bold"
                >
                  Browse by Vehicle Type
                </motion.h2>
                <motion.button
                  variants={fadeUp}
                  onClick={() => navigate("/browse")}
                  className="group flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors text-sm"
                >
                  View all vehicles
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {VEHICLE_TYPES.map((type) => (
                <motion.button
                  key={type.value}
                  variants={fadeUp}
                  onClick={() => navigate(`/browse?category=${type.value}`)}
                  className="group relative rounded-2xl overflow-hidden h-52 cursor-pointer ring-1 ring-white/5 hover:ring-blue-500/40 transition-all duration-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]"
                >
                  <img
                    src={type.img}
                    alt={type.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-blue-900/85 transition-all duration-500" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 px-3 text-center">
                    <p className="font-bold text-white text-sm leading-tight group-hover:text-blue-200 transition-colors">{type.label}</p>
                    <p className="text-[11px] text-blue-300/80 mt-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                      {type.sub}
                    </p>
                  </div>
                  {/* Top gradient overlay on hover */}
                  <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-blue-600/0 group-hover:from-blue-600/10 to-transparent transition-all duration-500" />
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURED CARS ─────────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-12 lg:px-24 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-3">Hand-Picked</p>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-3">Elite Fleet</h2>
                <p className="text-gray-400 text-lg max-w-xl">
                  Curated exceptional vehicles for those who demand the absolute best.
                </p>
              </div>
              <button
                onClick={() => navigate("/browse")}
                className="group flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-gray-300 font-semibold text-sm hover:border-blue-500/50 hover:text-white hover:bg-blue-500/10 transition-all flex-shrink-0"
              >
                View Full Collection
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : cars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {cars.map((car: any, idx: number) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, duration: 0.5 }}
                    onClick={() => navigate(`/car/${car.id}`)}
                    className="group cursor-pointer rounded-3xl bg-[#111115] border border-white/5 overflow-hidden hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-transparent z-10" />
                      <img
                        src={
                          car.images?.[0]?.imageUrl
                            ? getImageUrl(car.images[0].imageUrl, 600)
                            : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=70"
                        }
                        alt={car.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 z-20 flex gap-2">
                        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20">
                          {car.category?.name || "Premium"}
                        </span>
                      </div>
                      {car.averageRating > 0 && (
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                          <Star size={12} fill="#fbbf24" className="text-yellow-400" />
                          <span className="text-xs font-bold text-white">{(car.averageRating || 4.8).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-display font-bold mb-1 group-hover:text-blue-400 transition-colors">{car.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-5">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {car.locationCity || "Available"}
                        </span>
                        <span>·</span>
                        <span>{car.transmission || "Auto"}</span>
                        <span>·</span>
                        <span>{car.seats || 4} seats</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/5">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Daily Rate</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">${car.pricePerDay}</span>
                            <span className="text-gray-400 text-sm">/day</span>
                          </div>
                        </div>
                        <div className="h-10 px-5 rounded-full bg-white text-black text-sm font-bold flex items-center group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                          Book Now
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <Car size={64} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-bold">No vehicles currently available</h3>
                <p className="text-gray-400">Please check back later.</p>
              </div>
            )}
          </div>
        </section>

        {/* ─── POPULAR CITIES ────────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">
                Explore Nearby
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-bold">Popular Locations</h2>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-5"
            >
              {CITIES.map((city) => (
                <motion.button
                  key={city.city}
                  variants={fadeUp}
                  onClick={() => navigate(`/browse?location=${city.city}`)}
                  className="group relative rounded-2xl overflow-hidden h-60 cursor-pointer ring-1 ring-white/5 hover:ring-white/20 transition-all duration-500"
                >
                  <img
                    src={city.img}
                    alt={city.city}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:from-black/90 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                    <div className="text-left">
                      <p className="font-bold text-white text-lg leading-tight">{city.city}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{city.count}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <ArrowRight size={16} className="text-white" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── WHY CHOOSE US ─────────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-white/[0.015]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="text-center mb-14">
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">Why LuxeDrive</p>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Built for Drivers</h2>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                  Every feature is designed to put you in the driver's seat — effortlessly.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Shield,
                    color: "text-emerald-400",
                    bg: "bg-emerald-400/10",
                    border: "border-emerald-400/20",
                    title: "Premium Protection",
                    desc: "Every rental includes $1M liability coverage and 24/7 roadside assistance for total peace of mind.",
                  },
                  {
                    icon: Zap,
                    color: "text-blue-400",
                    bg: "bg-blue-400/10",
                    border: "border-blue-400/20",
                    title: "Instant Booking",
                    desc: "Skip the counter. Book in seconds, get instant confirmation, and hit the road without paperwork.",
                  },
                  {
                    icon: TrendingUp,
                    color: "text-purple-400",
                    bg: "bg-purple-400/10",
                    border: "border-purple-400/20",
                    title: "Unbeatable Value",
                    desc: "Experience luxury without the luxury price tag. Transparent pricing, no hidden fees — ever.",
                  },
                ].map((feat, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`group p-8 rounded-3xl bg-white/[0.02] border ${feat.border} hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-2`}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${feat.bg} border ${feat.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <feat.icon size={26} className={feat.color} />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-3">{feat.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feat.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── STATS ─────────────────────────────────────────────────────────── */}
        <section className="py-20 px-6 md:px-12 lg:px-24">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { value: "500+", label: "Premium Cars", sub: "Verified listings", color: "from-blue-400 to-indigo-400" },
                { value: "12k+", label: "Happy Renters", sub: "& growing", color: "from-purple-400 to-pink-400" },
                { value: "4.9★", label: "Average Rating", sub: "On 8,000+ reviews", color: "from-yellow-400 to-orange-400" },
                { value: "$2k+", label: "Avg Host Earnings", sub: "Per month", color: "from-emerald-400 to-teal-400" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="text-center p-7 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group"
                >
                  <p className={`text-4xl font-display font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="font-semibold text-white text-sm mb-0.5">{stat.label}</p>
                  <p className="text-xs text-gray-500">{stat.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-white/[0.015]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
                Simple Process
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold mb-4">
                3 Steps to the Road
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-xl mx-auto">
                From search to ignition — the fastest way to get your dream car.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
            >
              {/* Connector */}
              <div className="hidden md:block absolute top-10 left-[calc(16.7%+2rem)] right-[calc(16.7%+2rem)] h-px bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-emerald-500/40" />

              {[
                {
                  step: "01",
                  icon: Search,
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                  border: "border-blue-400/20",
                  title: "Search & Choose",
                  desc: "Browse hundreds of verified premium vehicles. Filter by city, dates, type, and budget.",
                },
                {
                  step: "02",
                  icon: CheckCircle,
                  color: "text-purple-400",
                  bg: "bg-purple-400/10",
                  border: "border-purple-400/20",
                  title: "Book Instantly",
                  desc: "Reserve in seconds. No paperwork, no queues. Instant confirmation sent to your phone.",
                },
                {
                  step: "03",
                  icon: Car,
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10",
                  border: "border-emerald-400/20",
                  title: "Hit the Road",
                  desc: "Pick up your car, enjoy every mile, and return when your adventure is over.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group"
                >
                  <span className="absolute top-4 right-6 text-5xl font-display font-black text-white/[0.04] select-none">
                    {item.step}
                  </span>
                  <div className={`w-16 h-16 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon size={28} className={item.color} />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-14"
            >
              <button
                onClick={() => navigate("/browse")}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-[0_8px_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all"
              >
                Find Your Car Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ──────────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">
                Testimonials
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold mb-4">
                Loved by Drivers
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-xl mx-auto">
                Don't take our word for it — hear from those who've experienced LuxeDrive.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  name: "Marcus T.",
                  role: "Business Traveler",
                  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
                  rating: 5,
                  text: "Booked a Porsche 911 for a weekend drive. The whole process took 3 minutes. The car was immaculate. Absolutely unreal experience.",
                },
                {
                  name: "Sophia R.",
                  role: "Weekend Explorer",
                  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b9e5?auto=format&fit=crop&q=80&w=200",
                  rating: 5,
                  text: "I was skeptical at first but LuxeDrive exceeded every expectation. The host was fantastic and the car was even better in person.",
                },
                {
                  name: "James K.",
                  role: "Luxury Host",
                  avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
                  rating: 5,
                  text: "I've been listing my BMW M5 for 6 months and consistently earn $2,400+ monthly. The platform is seamless and the clientele is top-tier.",
                },
              ].map((review, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="p-7 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all flex flex-col gap-5"
                >
                  <Quote size={28} className="text-blue-500/40" />
                  <p className="text-gray-300 leading-relaxed flex-1">"{review.text}"</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div>
                      <p className="font-bold text-white">{review.name}</p>
                      <p className="text-sm text-gray-500">{review.role}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} size={13} fill="currentColor" className="text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── HOST CTA ───────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-[2rem] overflow-hidden border border-blue-500/20">
              {/* Background image */}
              <img
                src="https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=2000"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-15"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 to-indigo-950/80" />

              <div className="relative z-10 p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-xl text-center md:text-left">
                  <p className="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-4">For Car Owners</p>
                  <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                    Earn Money with Your Car
                  </h2>
                  <p className="text-xl text-blue-100/80 mb-8 leading-relaxed">
                    Join our exclusive host network and earn money by sharing your luxury
                    car with vetted, insured clients.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => navigate("/register")}
                      className="px-8 py-4 rounded-full bg-white text-blue-900 font-bold hover:bg-blue-50 hover:scale-105 transition-all shadow-xl shadow-white/10"
                    >
                      Become a Host
                    </button>
                    <button
                      onClick={() => navigate("/how-it-works")}
                      className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all backdrop-blur-md"
                    >
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Earnings badge */}
                <div className="hidden md:flex flex-col items-center justify-center w-52 h-52 rounded-full border-2 border-dashed border-blue-400/30 relative">
                  <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">$2k+</span>
                    <span className="text-xs font-semibold text-blue-200 mt-1 uppercase tracking-wider text-center">Avg Monthly<br />Earnings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LandingPagePro;

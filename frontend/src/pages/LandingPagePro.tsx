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
} from "lucide-react";
import { carService } from "../services/car.service.ts";
import { getImageUrl } from "../utils/image";

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

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-24 px-6 md:px-12 lg:px-24 flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-blue-100">Redefining Luxury Rentals</span>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-tight">
                Drive Your Dream Car <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  Without Limits
                </span>
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience the thrill of driving exotic and luxury vehicles from verified hosts. Unmatched quality, instant booking, and seamless rides.
            </motion.p>

            {/* Premium Search Bar */}
            <motion.div variants={fadeUp} className="w-full max-w-4xl mx-auto">
              <div
                className={`relative p-2 md:p-3 rounded-2xl md:rounded-full bg-white/5 backdrop-blur-xl border transition-colors duration-500 ${
                  isHoveredSearch ? "border-blue-500/50 shadow-glow" : "border-white/10 shadow-2xl"
                }`}
                onMouseEnter={() => setIsHoveredSearch(true)}
                onMouseLeave={() => setIsHoveredSearch(false)}
              >
                <div className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                  {/* Location */}
                  <div className="flex-1 w-full flex items-center gap-3 px-6 py-4 md:py-2 group">
                    <MapPin className="text-blue-400 group-focus-within:text-blue-300 transition-colors" size={22} />
                    <div className="flex flex-col text-left w-full">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Where</label>
                      <input
                        type="text"
                        placeholder="City or Airport"
                        className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm md:text-base font-medium"
                        value={searchForm.location}
                        onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex-1 w-full flex items-center gap-3 px-6 py-4 md:py-2 group">
                    <Calendar className="text-purple-400 group-focus-within:text-purple-300 transition-colors" size={22} />
                    <div className="flex flex-col text-left w-full">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">When</label>
                      <input
                        type="date"
                        className="w-full bg-transparent border-none outline-none text-white text-sm md:text-base font-medium [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                        value={searchForm.startDate}
                        onChange={(e) => setSearchForm({ ...searchForm, startDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex-1 w-full flex items-center gap-3 px-6 py-4 md:py-2 group">
                    <Car className="text-emerald-400 group-focus-within:text-emerald-300 transition-colors" size={22} />
                    <div className="flex flex-col text-left w-full">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                      <select
                        className="w-full bg-transparent border-none outline-none text-white text-sm md:text-base font-medium appearance-none"
                        value={searchForm.category}
                        onChange={(e) => setSearchForm({ ...searchForm, category: e.target.value })}
                      >
                        <option value="" className="bg-[#111115]">Any Type</option>
                        <option value="luxury" className="bg-[#111115]">Luxury</option>
                        <option value="suv" className="bg-[#111115]">SUV</option>
                        <option value="sports" className="bg-[#111115]">Sports</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="p-2 w-full md:w-auto mt-2 md:mt-0">
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full md:w-auto h-14 md:h-12 md:w-12 md:rounded-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transform hover:scale-105"
                    >
                      <Search size={22} className="text-white" />
                      <span className="md:hidden ml-2 font-semibold">Search Cars</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* STATS SECTION */}
        <section className="py-16 px-6 md:px-12 lg:px-24">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { value: "500+", label: "Premium Cars", color: "from-blue-400 to-indigo-400" },
                { value: "12k+", label: "Happy Renters", color: "from-purple-400 to-pink-400" },
                { value: "4.9★", label: "Average Rating", color: "from-yellow-400 to-orange-400" },
                { value: "$2k+", label: "Avg Host Earnings", color: "from-emerald-400 to-teal-400" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                >
                  <p className={`text-4xl font-display font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { icon: Shield, color: "text-emerald-400", bg: "bg-emerald-400/10", title: "Premium Protection", desc: "Every rental includes $1M liability coverage and 24/7 roadside assistance." },
                { icon: Zap, color: "text-blue-400", bg: "bg-blue-400/10", title: "Instant Booking", desc: "Skip the counter. Book instantly, unlock via app, and hit the road." },
                { icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10", title: "Unbeatable Value", desc: "Experience luxury without the luxury price tag. No hidden fees." },
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300 hover:border-white/10 hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <feat.icon size={28} className={feat.color} />
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-3">{feat.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FEATURED CARS */}
        <section className="py-24 px-6 md:px-12 lg:px-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Elite Fleet</h2>
                <p className="text-gray-400 text-lg max-w-xl">Curated exceptional vehicles for those who demand the absolute best in engineering and comfort.</p>
              </div>
              <button
                onClick={() => navigate("/browse")}
                className="group flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                View Full Collection
                <span className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center group-hover:bg-blue-400/20 group-hover:translate-x-1 transition-all">
                  <ChevronRight size={18} />
                </span>
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cars.map((car: any, idx: number) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    onClick={() => navigate(`/car/${car.id}`)}
                    className="group cursor-pointer rounded-3xl bg-[#111115] border border-white/5 overflow-hidden hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-transparent z-10" />
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7 }}
                        src={car.images?.[0]?.imageUrl ? getImageUrl(car.images[0].imageUrl) : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"}
                        alt={car.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20">
                          {car.category?.name || "Premium"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 pt-2 flex-1 flex flex-col z-20 -mt-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-display font-bold">{car.title}</h3>
                        {car.reviews && (
                          <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg">
                            <Star size={14} fill="currentColor" />
                            <span className="text-sm font-bold">4.8</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {car.locationCity || "Available"}</span>
                        <span>•</span>
                        <span>{car.transmission || "Auto"}</span>
                        <span>•</span>
                        <span>{car.seats || 4} Seats</span>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Daily Rate</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">${car.pricePerDay}</span>
                            <span className="text-gray-400 text-sm">/day</span>
                          </div>
                        </div>
                        <div className="h-10 px-6 rounded-full bg-white text-black font-bold flex items-center justify-center transform group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                          Book
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
                <p className="text-gray-400">Please check back later or modify your search.</p>
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 px-6 md:px-12 lg:px-24 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 mb-6">
                Simple Process
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold mb-4">
                How It Works
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-xl mx-auto">
                Get behind the wheel of your dream car in three effortless steps.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
            >
              {/* Connector line */}
              <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

              {[
                {
                  step: "01",
                  icon: Search,
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                  title: "Browse & Choose",
                  desc: "Explore hundreds of verified premium vehicles. Filter by location, dates, type, and budget to find your perfect match.",
                },
                {
                  step: "02",
                  icon: CheckCircle,
                  color: "text-purple-400",
                  bg: "bg-purple-400/10",
                  title: "Instant Booking",
                  desc: "Book your chosen car in seconds. No paperwork, no waiting. Get instant confirmation and directions to pickup.",
                },
                {
                  step: "03",
                  icon: Car,
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10",
                  title: "Hit the Road",
                  desc: "Unlock via the app, fuel up, and drive. Return anytime within your booking window. That's it.",
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
                  <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon size={30} className={item.color} />
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
                Start Browsing
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-purple-400 bg-purple-400/10 border border-purple-400/20 mb-6">
                Testimonials
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold mb-4">
                Loved by Drivers
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-xl mx-auto">
                Don't just take our word for it — hear from those who've experienced LuxeDrive.
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
                  role: "Luxury Lender",
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
                        <Star key={j} size={14} fill="currentColor" className="text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/20">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=2000')] opacity-10 mix-blend-overlay bg-cover bg-center" />
              <div className="relative z-10 p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-xl text-center md:text-left">
                  <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Own a premium vehicle?</h2>
                  <p className="text-xl text-blue-100/80 mb-8 leading-relaxed">
                    Join our exclusive host network and earn money by sharing your luxury car with vetted clients.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button onClick={() => navigate("/register")} className="px-8 py-4 rounded-full bg-white text-blue-900 font-bold hover:bg-blue-50 hover:scale-105 transition-all shadow-xl shadow-white/10">
                      Become a Host
                    </button>
                    <button onClick={() => navigate("/about")} className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all backdrop-blur-md">
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="hidden md:block w-72 h-72 rounded-full border-2 border-dashed border-blue-400/30 animate-spin-slow flex items-center justify-center relative">
                  <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 shadow-glow flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">$2k+</span>
                    <span className="text-sm font-medium text-blue-200 mt-1 uppercase tracking-wider">Avg Monthly</span>
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

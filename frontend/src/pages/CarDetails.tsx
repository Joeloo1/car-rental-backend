import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Zap,
  Users,
  Fuel,
  Gauge,
  MessageCircle,
  Share2,
  Heart,
  ArrowLeft,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { carService } from "../services/car.service.ts";
import { useFavorites } from "../hooks/useFavorites.ts";
import Map from "../components/common/Map.tsx";
import ChatWindow from "../components/Chat/ChatWindow.tsx";
import { getImageUrl } from "../utils/image";

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: car, isLoading, error } = useQuery({
    queryKey: ["car", id],
    queryFn: () => carService.getById(id!),
    enabled: !!id,
    // If the user came from the browse page the car is already in cache — use it
    // immediately so the page renders without any spinner.
    placeholderData: () => {
      const allCarQueries = queryClient.getQueriesData<any>({ queryKey: ["cars"] });
      for (const [, data] of allCarQueries) {
        const list: any[] = Array.isArray(data)
          ? data
          : data?.data?.cars || data?.cars || [];
        const found = list.find((c: any) => String(c.id) === id);
        if (found) return found;
      }
      return undefined;
    },
  });

  const bookingMutation = useMutation({
    mutationFn: (data: { startDate: string; endDate: string }) =>
      carService.reserve(id!, data),
    onSuccess: () => {
      toast.success("Reservation successful!");
      navigate("/dashboard");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || "Failed to book car.");
    },
  });

  const handleReserve = () => {
    if (!dates.startDate || !dates.endDate) {
      toast.error("Please select pickup and return dates");
      return;
    }
    bookingMutation.mutate(dates);
  };

  const calculateDays = () => {
    if (!dates.startDate || !dates.endDate) return 0;
    const start = new Date(dates.startDate);
    const end = new Date(dates.endDate);
    return Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
  };

  const calculateTotal = () => {
    if (!car) return 0;
    const days = calculateDays();
    return days > 0 ? car.pricePerDay * days + 65 : 0;
  };

  const fallbackImages = [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200",
  ];

  const getCarImage = (index: number) => {
    const img = car?.images?.[index]?.imageUrl;
    if (img) return getImageUrl(img);
    return fallbackImages[index] || fallbackImages[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 animate-pulse">
          {/* back button */}
          <div className="h-8 w-36 rounded-full bg-white/5 mb-8" />
          {/* title row */}
          <div className="flex justify-between items-end mb-8 gap-4">
            <div className="space-y-3 flex-1">
              <div className="h-4 w-24 rounded-full bg-white/5" />
              <div className="h-10 w-2/3 rounded-xl bg-white/8" />
              <div className="h-4 w-40 rounded-full bg-white/5" />
            </div>
            <div className="flex gap-2">
              <div className="w-11 h-11 rounded-full bg-white/5" />
              <div className="w-11 h-11 rounded-full bg-white/5" />
            </div>
          </div>
          {/* gallery */}
          <div className="h-[260px] md:h-[480px] rounded-3xl bg-white/5 mb-10" />
          {/* content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5" />)}
              </div>
              <div className="space-y-3">
                <div className="h-6 w-40 rounded-lg bg-white/5" />
                <div className="h-4 rounded-lg bg-white/5" />
                <div className="h-4 w-4/5 rounded-lg bg-white/5" />
                <div className="h-4 w-3/5 rounded-lg bg-white/5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-white/5" />)}
              </div>
            </div>
            <div className="h-96 rounded-3xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] pt-24 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Car not found</h2>
          <button onClick={() => navigate("/browse")} className="text-blue-400 hover:text-blue-300">
            ← Back to browse
          </button>
        </div>
      </div>
    );
  }

  const specs = [
    { icon: Fuel, label: car.fuelType || "Petrol", sub: "Fuel Type" },
    { icon: Gauge, label: car.topSpeed ? `${car.topSpeed} km/h` : "320 km/h", sub: "Top Speed" },
    { icon: Users, label: `${car.seats || 4} Seats`, sub: "Capacity" },
    { icon: Zap, label: car.transmission || "Automatic", sub: "Transmission" },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0b] text-white font-sans pt-24 pb-20 relative overflow-hidden">
        {/* Background ambient */}
        <div className="fixed top-0 right-0 w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
              <ArrowLeft size={16} />
            </span>
            <span className="text-sm font-medium">Back to results</span>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  {car.category?.name || "Premium"}
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-semibold text-white">
                    {car.averageRating || "5.0"}
                  </span>
                  <span className="text-gray-500 text-sm">({car.totalReviews || 0} reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">{car.title}</h1>
              <div className="flex items-center gap-2 mt-3 text-gray-400">
                <MapPin size={16} className="text-blue-400" />
                <span>{car.locationCity || "Available"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/car/${id}`)
                    .then(() => toast.success("Link copied!"))
                    .catch(() => toast.error("Failed to copy"));
                }}
                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                title="Share"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={() => {
                  toggleFavorite(id!);
                  toast.success(isFavorite(id!) ? "Removed from favorites" : "Added to favorites");
                }}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                  isFavorite(id!)
                    ? "bg-red-500/15 border-red-500/50 text-red-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                }`}
                title={isFavorite(id!) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart size={18} fill={isFavorite(id!) ? "currentColor" : "none"} />
              </button>
            </div>
          </motion.div>

          {/* Gallery */}
          {/* Mobile gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 md:mb-12"
          >
            {/* Mobile: stacked hero + dot nav */}
            <div className="md:hidden rounded-2xl overflow-hidden h-[260px] relative">
              <img
                src={getCarImage(activeImage)}
                alt={car.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeImage === idx ? "w-5 bg-white" : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: grid gallery */}
            <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-3 h-[480px] rounded-3xl overflow-hidden">
              <div
                className="col-span-2 row-span-2 relative overflow-hidden cursor-pointer group"
                onClick={() => setActiveImage(0)}
              >
                <img
                  src={getCarImage(activeImage)}
                  alt={car.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              {[1, 2].map((idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden cursor-pointer group"
                  onClick={() => setActiveImage(idx)}
                >
                  <img
                    src={getCarImage(idx)}
                    alt={`${car.title} ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-12"
            >
              {/* Specs */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-6">Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specs.map((spec, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col items-center gap-3 text-center hover:bg-white/[0.06] hover:border-white/15 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <spec.icon size={22} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{spec.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{spec.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Description */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-4">About this car</h2>
                <p className="text-gray-400 leading-relaxed text-lg">
                  {car.description || "Experience the pinnacle of automotive engineering with this exceptional vehicle. Designed for those who demand the very best in performance, comfort, and style."}
                </p>
              </section>

              {/* Included */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-6">What's included</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: Shield, label: "Insurance", desc: "$1M liability coverage" },
                    { icon: Calendar, label: "Free cancellation", desc: "Up to 24h before pickup" },
                    { icon: MapPin, label: "Free delivery", desc: "Within 10 miles" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Host */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-6">Your host</h2>
                <div className="flex items-center gap-5 p-6 rounded-2xl bg-white/[0.03] border border-white/8">
                  <img
                    src={car.lender?.profileImage || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"}
                    alt={car.lender?.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Hosted by {car.lender?.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star size={13} fill="currentColor" className="text-yellow-400" />
                        5.0
                      </span>
                      <span>•</span>
                      <span>{car.lender?.totalTrips || 0} trips</span>
                      <span>•</span>
                      <span>Joined {new Date(car.lender?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <MessageCircle size={16} />
                    Message
                  </button>
                </div>
              </section>

              {/* Map */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-2">Location</h2>
                <p className="text-gray-400 mb-5 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-400" />
                  {car.locationCity}
                </p>
                <div className="rounded-2xl overflow-hidden border border-white/8">
                  <Map
                    center={[car.latitude || 51.505, car.longitude || -0.09]}
                    zoom={14}
                    markerTitle={car.title}
                    address={car.locationCity}
                  />
                </div>
              </section>

              {/* Reviews */}
              {car.reviews && car.reviews.length > 0 && (
                <section>
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <h2 className="text-2xl font-display font-bold">Guest Reviews</h2>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                      <Star size={13} fill="#fbbf24" className="text-yellow-400" />
                      <span className="text-sm font-bold text-yellow-400">
                        {Number(car.averageRating).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-400">· {car.totalReviews} review{car.totalReviews !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Rating overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/8">
                    <div className="flex flex-col items-center justify-center text-center min-w-[110px]">
                      <p className="text-5xl font-black text-white leading-none mb-2">
                        {Number(car.averageRating).toFixed(1)}
                      </p>
                      <div className="flex items-center gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= Math.round(car.averageRating) ? "#fbbf24" : "none"}
                            className={s <= Math.round(car.averageRating) ? "text-yellow-400" : "text-gray-600"}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">{car.totalReviews} reviews</p>
                    </div>

                    <div className="space-y-2 flex-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = car.reviews.filter((r: any) => r.rating === star).length;
                        const pct = car.reviews.length > 0 ? (count / car.reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3 text-sm">
                            <span className="text-gray-400 w-3 text-right text-xs">{star}</span>
                            <Star size={11} fill="#fbbf24" className="text-yellow-400 flex-shrink-0" />
                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-yellow-400/60 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-gray-600 w-5 text-right text-xs">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual review cards */}
                  <div className="space-y-4">
                    {car.reviews.map((review: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.05] transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ring-2 ring-white/10">
                            {review.user?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                              <div>
                                <p className="font-semibold text-white text-sm">{review.user?.name || "Anonymous"}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={13}
                                    fill={s <= review.rating ? "#fbbf24" : "none"}
                                    className={s <= review.rating ? "text-yellow-400" : "text-gray-700"}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>

            {/* Booking Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:sticky lg:top-28"
            >
              <div className="p-7 rounded-3xl bg-[#111115] border border-white/8 shadow-2xl">
                {/* Price header */}
                <div className="flex items-start justify-between mb-7">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${car.pricePerDay}</span>
                    <span className="text-gray-400 font-medium">/ day</span>
                  </div>
                  {car.averageRating > 4.5 && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> Top Rated
                    </span>
                  )}
                </div>

                {/* Date Inputs */}
                <div className="rounded-2xl border border-white/10 overflow-hidden mb-5">
                  <div className="p-4 border-b border-white/10">
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={dates.startDate}
                      onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-transparent border-none outline-none text-white text-sm font-medium [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <div className="p-4">
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-1">Return Date</label>
                    <input
                      type="date"
                      value={dates.endDate}
                      onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                      min={dates.startDate || new Date().toISOString().split("T")[0]}
                      className="w-full bg-transparent border-none outline-none text-white text-sm font-medium [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  {calculateDays() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">${car.pricePerDay} × {calculateDays()} day{calculateDays() > 1 ? "s" : ""}</span>
                      <span className="text-white">${car.pricePerDay * calculateDays()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Service fee</span>
                    <span className="text-white">$65</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-white/8 font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-white text-lg">${calculateTotal() || `${car.pricePerDay + 65}+`}</span>
                  </div>
                </div>

                {/* Reserve Button */}
                <button
                  onClick={handleReserve}
                  disabled={bookingMutation.isPending}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-base hover:shadow-[0_8px_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {bookingMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Reserve Now"
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-3">
                  You won't be charged yet
                </p>

                {/* Mobile chat button */}
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="md:hidden w-full mt-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                >
                  <MessageCircle size={16} />
                  Message Host
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                <Shield size={20} className="text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-gray-400">
                  <span className="text-white font-semibold">Protected by LuxeDrive.</span> Full insurance, 24/7 support.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {isChatOpen && car && (
        <ChatWindow
          carId={car.id}
          lenderId={car.lenderId}
          lenderName={car.lender?.name || "Host"}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
};

export default CarDetails;

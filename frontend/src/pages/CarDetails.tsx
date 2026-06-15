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
} from "@/lib/icons";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { carService } from "../services/car.service.ts";
import { reviewService } from "../services/review.service.ts";
import { useFavorites } from "../hooks/useFavorites.ts";
import { useAuth } from "../context/AuthContext";
import Map from "../components/common/Map.tsx";
import ChatWindow from "../components/Chat/ChatWindow.tsx";
import { getImageUrl } from "../utils/image";
import Button from "../components/ui/Button.tsx";
import Badge from "../components/ui/Badge.tsx";
import { cn } from "../utils/cn";

// ── Star rating helper ────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 13 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={i < Math.round(rating) ? "fill-amber text-amber" : "text-[#3a3a3a]"}
        strokeWidth={i < Math.round(rating) ? 0 : 1.5}
      />
    ))}
  </div>
);

// ── Reviews section ───────────────────────────────────────────────────────────
const ReviewsSection: React.FC<{ carId: string }> = ({ carId }) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", carId],
    queryFn: () => reviewService.getForCar(carId),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="p-5 rounded-2xl bg-[#111] border border-[#1c1c1c] animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#222]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-[#222]" />
                <div className="h-3 w-20 rounded bg-[#1c1c1c]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded bg-[#1c1c1c]" />
              <div className="h-3 w-3/4 rounded bg-[#1c1c1c]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <div className="py-10 text-center rounded-2xl bg-[#111] border border-[#1c1c1c]">
        <Star size={28} className="mx-auto mb-3 text-[#3a3a3a]" />
        <p className="text-sm font-medium text-ink-primary mb-1">No reviews yet</p>
        <p className="text-xs text-ink-tertiary">Be the first to review after your trip.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review: any) => (
        <div
          key={review.id}
          className="p-5 rounded-2xl bg-[#111] border border-[#1c1c1c] hover:border-[#282828] transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  review.user?.profileImage ||
                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(review.user?.name ?? "U")}&backgroundColor=1c1c1c&textColor=a1a1aa&fontSize=40`
                }
                alt={review.user?.name ?? "Reviewer"}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
              />
              <div>
                <p className="text-sm font-semibold text-ink-primary">{review.user?.name || "Guest"}</p>
                <p className="text-xs text-ink-tertiary">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} />
          </div>
          {review.comment && (
            <p className="text-sm text-ink-secondary leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: car, isLoading, error } = useQuery({
    queryKey: ["car", id],
    queryFn: () => carService.getById(id!),
    enabled: !!id,
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

  const isDateRangeBlocked = (start: string, end: string): boolean => {
    if (!car?.bookedDates || !start || !end) return false;
    const s = new Date(start);
    const e = new Date(end);
    return car.bookedDates.some((range: { startDate: string; endDate: string }) => {
      const rs = new Date(range.startDate);
      const re = new Date(range.endDate);
      return s <= re && e >= rs;
    });
  };

  const handleReserve = () => {
    if (!user) {
      toast.error("Please sign in to make a booking.");
      navigate("/login");
      return;
    }
    if (!user.isVerified) {
      toast.error("Please verify your email before making a booking.");
      return;
    }
    if (!dates.startDate || !dates.endDate) {
      toast.error("Please select pickup and return dates");
      return;
    }
    if (isDateRangeBlocked(dates.startDate, dates.endDate)) {
      toast.error("Selected dates overlap with an existing booking.");
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

  const serviceFee = car?.serviceFee ?? 65;

  const calculateTotal = () => {
    if (!car) return 0;
    const days = calculateDays();
    return days > 0 ? car.pricePerDay * days + serviceFee : 0;
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

  // Determine how many thumbnails to show
  const realImageCount = car?.images?.length ?? 0;
  const thumbCount = realImageCount > 0 ? realImageCount : 3;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20" style={{ background: "var(--color-bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-8 w-36 rounded-full bg-[#1c1c1c] mb-8" />
          <div className="flex justify-between items-end mb-8 gap-4">
            <div className="space-y-3 flex-1">
              <div className="h-4 w-24 rounded-full bg-[#1c1c1c]" />
              <div className="h-10 w-2/3 rounded-xl bg-[#1c1c1c]" />
              <div className="h-4 w-40 rounded-full bg-[#1c1c1c]" />
            </div>
            <div className="flex gap-2">
              <div className="w-11 h-11 rounded-full bg-[#1c1c1c]" />
              <div className="w-11 h-11 rounded-full bg-[#1c1c1c]" />
            </div>
          </div>
          <div className="h-[260px] md:h-[480px] rounded-3xl bg-[#1c1c1c] mb-4" />
          <div className="flex gap-2 mb-10">
            {[1,2,3].map(i => <div key={i} className="w-16 h-12 rounded-lg bg-[#1c1c1c]" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-[#1c1c1c]" />)}
              </div>
            </div>
            <div className="h-96 rounded-3xl bg-[#1c1c1c]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-ink-primary mb-4">Car not found</h2>
          <Button onClick={() => navigate("/browse")} variant="outline">
            ← Back to browse
          </Button>
        </div>
      </div>
    );
  }

  const specs = [
    { icon: Fuel,  label: car.fuelType || "Petrol",                      sub: "Fuel Type" },
    { icon: Gauge, label: car.topSpeed ? `${car.topSpeed} km/h` : "320 km/h", sub: "Top Speed" },
    { icon: Users, label: `${car.seats || 4} Seats`,                     sub: "Capacity" },
    { icon: Zap,   label: car.transmission || "Automatic",                sub: "Transmission" },
  ];

  return (
    <>
      <div className="min-h-screen text-ink-primary font-sans pt-24 pb-20 relative overflow-hidden" style={{ background: "var(--color-bg)" }}>
        {/* Ambient glows */}
        <div className="fixed top-0 right-0 w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(245,166,35,0.04), transparent)" }} />
        <div className="fixed bottom-0 left-0 w-[30%] h-[30%] blur-[100px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,201,177,0.03), transparent)" }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-ink-tertiary hover:text-ink-primary transition-colors mb-8 group"
          >
            <span className="w-9 h-9 rounded-full bg-surface-1 border border-[#1c1c1c] flex items-center justify-center group-hover:bg-surface-2 transition-all">
              <ArrowLeft size={16} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to fleet</span>
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  variant="secondary"
                  className="uppercase tracking-widest text-[10px] py-1 px-3 bg-surface-2 text-ink-tertiary border-[#282828]"
                >
                  {car.category?.name || "Premium"}
                </Badge>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg border" style={{ color: "var(--color-gold)", background: "rgba(245,166,35,0.08)", borderColor: "rgba(245,166,35,0.15)" }}>
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold">{car.averageRating || "5.0"}</span>
                  <span className="text-xs font-medium ml-1" style={{ color: "var(--color-text-muted)" }}>
                    ({car.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-none mb-4">
                {car.brand}{" "}
                <span style={{ background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{car.model}</span>
              </h1>
              <div className="flex items-center gap-2 text-ink-tertiary">
                <MapPin size={18} style={{ color: "var(--color-gold)" }} />
                <span className="font-medium">{car.locationCity || "Available Nationwide"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/car/${id}`)
                    .then(() => toast.success("Link copied!"))
                    .catch(() => toast.error("Failed to copy"));
                }}
                className="w-12 h-12 rounded-full bg-surface-1 border border-[#1c1c1c] flex items-center justify-center text-ink-tertiary hover:text-ink-primary hover:border-[#2a2a2a] hover:bg-surface-2 transition-all"
                aria-label="Share"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={() => toggleFavorite(id!)}
                className={cn(
                  "w-12 h-12 rounded-full border flex items-center justify-center transition-all",
                  isFavorite(id!)
                    ? "bg-red border-red/50 text-white shadow-lg shadow-red/20"
                    : "bg-surface-1 border-[#1c1c1c] text-ink-tertiary hover:text-ink-primary hover:border-[#2a2a2a] hover:bg-surface-2"
                )}
                aria-label={isFavorite(id!) ? "Remove from saved" : "Save car"}
              >
                <Heart size={18} fill={isFavorite(id!) ? "currentColor" : "none"} />
              </button>
            </div>
          </motion.div>

          {/* ── Gallery ──────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            {/* Main grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[300px] md:h-[520px]">
              {/* Primary image */}
              <div className="md:col-span-3 rounded-3xl overflow-hidden relative group cursor-pointer" onClick={() => {}}>
                <img
                  src={getCarImage(activeImage)}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Image counter badge */}
                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-xs font-medium text-white/70">
                  {activeImage + 1} / {thumbCount}
                </div>
              </div>
              {/* Side thumbnails (desktop) */}
              <div className="hidden md:flex flex-col gap-3">
                {[1, 2].map(idx => (
                  <div
                    key={idx}
                    className={cn(
                      "flex-1 rounded-3xl overflow-hidden relative group cursor-pointer transition-all",
                      activeImage === idx ? "ring-2" : "ring-1 ring-white/[0.06]"
                    )}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img
                      src={getCarImage(idx)}
                      alt={`${car.brand} ${car.model} — photo ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                  </div>
                ))}
              </div>
            </div>

            {/* Thumbnail strip — all images */}
            {thumbCount > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
                {Array.from({ length: thumbCount }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden transition-all border-2",
                      activeImage === i
                        ? "border-transparent opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    style={activeImage === i ? { boxShadow: "0 0 0 2px var(--color-gold)" } : {}}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img
                      src={getCarImage(i)}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Content Grid ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">

            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-14"
            >
              {/* Specs */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 rounded-full" style={{ background: "var(--color-gold)" }} />
                  Performance Specs
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specs.map((spec, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl flex flex-col items-center gap-4 text-center transition-colors"
                      style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
                      onMouseOver={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(245,166,35,0.20)")}
                      onMouseOut={e  => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)")}
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(245,166,35,0.10)", border: "1px solid rgba(245,166,35,0.20)" }}>
                        <spec.icon size={22} style={{ color: "var(--color-gold)" }} />
                      </div>
                      <div>
                        <p className="text-base font-display font-bold leading-none mb-1">{spec.label}</p>
                        <p className="text-[10px] text-ink-tertiary uppercase tracking-widest font-bold">{spec.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Description */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-5">Experience the drive</h2>
                <p className="text-ink-tertiary leading-relaxed text-base max-w-3xl">
                  {car.description ||
                    "This vehicle is maintained to professional standards, ensuring your journey is as smooth as it is stylish. Perfect for weddings, business trips, or making a weekend getaway truly special."}
                </p>
              </section>

              {/* Host */}
              <section>
                <div className="p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8" style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        car.lender?.profileImage ||
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                      }
                      alt={car.lender?.name ?? "Host"}
                      className="w-20 h-20 rounded-full object-cover"
                      style={{ border: "2px solid var(--color-gold)" }}
                    />
                    <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full border-2" style={{ background: "var(--color-gold)", color: "#000", borderColor: "var(--color-bg)" }}>
                      <Shield size={11} />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-gold)" }}>Vehicle Host</p>
                    <h3 className="text-2xl font-display font-bold mb-2">{car.lender?.name}</h3>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-ink-tertiary">
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-amber fill-amber" /> 5.0 Rating
                      </span>
                      <span>·</span>
                      <span>{car.lender?.totalTrips || 12} Trips</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-surface-2 border border-[#2a2a2a] text-ink-primary hover:bg-surface-3 hover:border-[#3a3a3a] transition-all w-full md:w-auto justify-center"
                  >
                    <MessageCircle size={16} />
                    Contact Host
                  </button>
                </div>
              </section>

              {/* Reviews */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 rounded-full" style={{ background: "var(--color-gold)" }} />
                  Reviews
                  {(car.totalReviews ?? 0) > 0 && (
                    <span className="text-ink-tertiary font-normal text-lg">
                      ({car.totalReviews})
                    </span>
                  )}
                </h2>
                <ReviewsSection carId={id!} />
              </section>

              {/* Map */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-5">Location Overview</h2>
                <div className="rounded-3xl overflow-hidden border border-[#1c1c1c] shadow-xl">
                  <Map
                    center={[car.latitude || 6.5244, car.longitude || 3.3792]}
                    zoom={14}
                    markerTitle={car.title}
                    address={car.locationCity}
                  />
                </div>
              </section>
            </motion.div>

            {/* Booking widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:sticky lg:top-28"
            >
              <div className="rounded-[28px] shadow-xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}>
                <div className="p-8">
                  {/* Price header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-xs font-bold text-ink-tertiary uppercase tracking-widest mb-1">Daily Rate</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display font-bold">${car.pricePerDay}</span>
                        <span className="text-sm text-ink-tertiary">/day</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green/10 text-green border border-green/20">
                      Available
                    </span>
                  </div>

                  {/* Date pickers */}
                  <div className="space-y-3 mb-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider ml-1">
                        Trip Pickup
                      </label>
                      <div className="relative">
                        <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-gold)" }} />
                        <input
                          type="date"
                          value={dates.startDate}
                          onChange={e => setDates({ ...dates, startDate: e.target.value })}
                          min={new Date().toISOString().split("T")[0]}
                          className="input-base pl-11 pr-4 text-sm font-medium"
                          style={{ colorScheme: "dark" }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider ml-1">
                        Trip Return
                      </label>
                      <div className="relative">
                        <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-gold)" }} />
                        <input
                          type="date"
                          value={dates.endDate}
                          onChange={e => setDates({ ...dates, endDate: e.target.value })}
                          min={dates.startDate || new Date().toISOString().split("T")[0]}
                          className="input-base pl-11 pr-4 text-sm font-medium"
                          style={{ colorScheme: "dark" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  {calculateDays() > 0 && (
                    <div className="rounded-2xl p-5 space-y-3 mb-8" style={{ background: "var(--color-surface-2)", border: "1.5px solid var(--color-border)" }}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--color-text-muted)" }}>
                          ${car.pricePerDay} × {calculateDays()} day{calculateDays() !== 1 ? "s" : ""}
                        </span>
                        <span className="font-semibold">${car.pricePerDay * calculateDays()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--color-text-muted)" }}>Insurance &amp; Service</span>
                        <span className="font-semibold">${serviceFee}</span>
                      </div>
                      <div className="pt-3 flex justify-between items-center" style={{ borderTop: "1px solid var(--color-border)" }}>
                        <span className="font-display font-bold">Total</span>
                        <span className="text-2xl font-display font-bold font-price" style={{ color: "var(--color-gold)" }}>${calculateTotal()}</span>
                      </div>
                    </div>
                  )}

                  {/* Reserve button */}
                  <button
                    onClick={handleReserve}
                    disabled={bookingMutation.isPending}
                    className="w-full h-14 py-4 rounded-2xl font-display font-bold text-base text-black disabled:opacity-60 transition-all hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
                      boxShadow: "0 8px 24px rgba(245,166,35,0.25)",
                    }}
                  >
                    {bookingMutation.isPending ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "RESERVE NOW"
                    )}
                  </button>
                  <p className="text-center text-[10px] text-ink-disabled uppercase font-bold tracking-widest mt-3">
                    Secure transaction · No charge yet
                  </p>
                </div>
              </div>

              {/* Protection badge */}
              <div className="mt-4 flex items-center gap-4 p-5 rounded-[20px] bg-green/[0.05] border border-green/15">
                <Shield size={22} className="text-green flex-shrink-0" />
                <p className="text-xs text-ink-tertiary leading-relaxed">
                  <span className="text-ink-primary font-semibold">LuxeDrive Protection.</span>{" "}
                  This trip is fully insured and covered by our 24/7 roadside assistance.
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

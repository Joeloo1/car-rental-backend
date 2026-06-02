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
import { useAuth } from "../context/AuthContext";
import Map from "../components/common/Map.tsx";
import ChatWindow from "../components/Chat/ChatWindow.tsx";
import { getImageUrl } from "../utils/image";
import Button from "../components/ui/Button.tsx";
import Badge from "../components/ui/Badge.tsx";
import { Card, CardContent } from "../components/ui/Card.tsx";
import { cn } from "../utils/cn";

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
      toast.error("Please verify your email before making a booking. Check your inbox for the verification link.");
      return;
    }
    if (!dates.startDate || !dates.endDate) {
      toast.error("Please select pickup and return dates");
      return;
    }
    if (isDateRangeBlocked(dates.startDate, dates.endDate)) {
      toast.error("Selected dates overlap with an existing booking. Please choose different dates.");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-8 w-36 rounded-full bg-muted mb-8" />
          <div className="flex justify-between items-end mb-8 gap-4">
            <div className="space-y-3 flex-1">
              <div className="h-4 w-24 rounded-full bg-muted" />
              <div className="h-10 w-2/3 rounded-xl bg-muted" />
              <div className="h-4 w-40 rounded-full bg-muted" />
            </div>
            <div className="flex gap-2">
              <div className="w-11 h-11 rounded-full bg-muted" />
              <div className="w-11 h-11 rounded-full bg-muted" />
            </div>
          </div>
          <div className="h-[260px] md:h-[480px] rounded-3xl bg-muted mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-muted" />)}
              </div>
            </div>
            <div className="h-96 rounded-3xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 font-display">Car not found</h2>
          <Button onClick={() => navigate("/browse")} variant="outline">
            ← Back to browse
          </Button>
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
      <div className="min-h-screen bg-background text-foreground font-sans pt-24 pb-20 relative overflow-hidden">
        {/* Background ambient */}
        <div className="fixed top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <span className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center group-hover:bg-muted transition-all">
              <ArrowLeft size={16} />
            </span>
            <span className="text-sm font-medium uppercase tracking-widest text-[10px]">Back to fleet</span>
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="uppercase tracking-widest text-[10px] py-1 px-3">
                  {car.category?.name || "Premium"}
                </Badge>
                <div className="flex items-center gap-1 text-amber-500 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold">
                    {car.averageRating || "5.0"}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium ml-1">({car.totalReviews || 0} reviews)</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none mb-4">{car.brand} <span className="text-primary">{car.model}</span></h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={18} className="text-primary" />
                <span className="font-medium">{car.locationCity || "Available Nationwide"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/car/${id}`)
                    .then(() => toast.success("Link copied!"))
                    .catch(() => toast.error("Failed to copy"));
                }}
                className="rounded-full h-12 w-12"
              >
                <Share2 size={18} />
              </Button>
              <Button
                variant={isFavorite(id!) ? "primary" : "outline"}
                size="icon"
                onClick={() => toggleFavorite(id!)}
                className={cn("rounded-full h-12 w-12", isFavorite(id!) && "bg-red-500 hover:bg-red-600 border-red-500 shadow-lg shadow-red-500/20")}
              >
                <Heart size={18} fill={isFavorite(id!) ? "currentColor" : "none"} />
              </Button>
            </div>
          </motion.div>

          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[300px] md:h-[550px]">
               <div className="md:col-span-3 rounded-3xl overflow-hidden relative group">
                 <img
                    src={getCarImage(activeImage)}
                    alt={car.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
               </div>
               <div className="hidden md:flex flex-col gap-4">
                 {[1, 2].map((idx) => (
                   <div key={idx} className="flex-1 rounded-3xl overflow-hidden relative group cursor-pointer" onClick={() => setActiveImage(idx)}>
                     <img
                        src={getCarImage(idx)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-16"
            >
              {/* Specs */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-primary rounded-full" /> Performance Specs
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {specs.map((spec, i) => (
                    <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
                      <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <spec.icon size={22} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold font-display leading-none mb-1">{spec.label}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{spec.sub}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Description */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-6">Experience the drive</h2>
                <p className="text-muted-foreground leading-relaxed text-lg font-light max-w-3xl">
                  {car.description || "The car is maintained to professional standards, ensuring your journey is as smooth as it is stylish. Perfect for weddings, business trips, or making a weekend getaway truly special."}
                </p>
              </section>

              {/* Host */}
              <section>
                <Card className="overflow-hidden border-border/50">
                  <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                      <img
                        src={car.lender?.profileImage || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"}
                        alt={car.lender?.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-background">
                         <Shield size={12} />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Vehicle Host</p>
                      <h3 className="text-2xl font-display font-bold mb-2">{car.lender?.name}</h3>
                      <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Star size={14} className="text-amber-500 fill-current" /> 5.0 Rating</span>
                        <span>•</span>
                        <span>{car.lender?.totalTrips || 12} Trips</span>
                      </div>
                    </div>
                    <Button onClick={() => setIsChatOpen(true)} variant="outline" leftIcon={<MessageCircle size={18} />} className="w-full md:w-auto rounded-xl">Contact Host</Button>
                  </CardContent>
                </Card>
              </section>

              {/* Map */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-6">Location Overview</h2>
                <div className="rounded-3xl overflow-hidden border border-border shadow-xl">
                  <Map
                    center={[car.latitude || 6.5244, car.longitude || 3.3792]}
                    zoom={14}
                    markerTitle={car.title}
                    address={car.locationCity}
                  />
                </div>
              </section>
            </motion.div>

            {/* Booking Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:sticky lg:top-28"
            >
              <Card className="border-primary/20 shadow-2xl bg-card/80 backdrop-blur-xl rounded-[32px]">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Daily Rate</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display font-black">${car.pricePerDay}</span>
                        <span className="text-sm text-muted-foreground">/day</span>
                      </div>
                    </div>
                    <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active Listing</Badge>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Trip Pickup</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={16} />
                        <input
                          type="date"
                          value={dates.startDate}
                          onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Trip Return</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={16} />
                        <input
                          type="date"
                          value={dates.endDate}
                          onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                          min={dates.startDate || new Date().toISOString().split("T")[0]}
                          className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {calculateDays() > 0 && (
                    <div className="bg-muted/30 rounded-2xl p-5 space-y-3 mb-8 border border-border/50">
                       <div className="flex justify-between text-sm">
                         <span className="text-muted-foreground">${car.pricePerDay} × {calculateDays()} days</span>
                         <span className="font-bold">${car.pricePerDay * calculateDays()}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-muted-foreground">Insurance & Service</span>
                         <span className="font-bold">${serviceFee}</span>
                       </div>
                       <div className="pt-3 border-t border-border flex justify-between items-center">
                         <span className="font-display font-bold">Total Amount</span>
                         <span className="text-2xl font-display font-black text-primary">${calculateTotal()}</span>
                       </div>
                    </div>
                  )}

                  <Button
                    onClick={handleReserve}
                    isLoading={bookingMutation.isPending}
                    size="lg"
                    className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 mb-4"
                  >
                    RESERVE NOW
                  </Button>
                  <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Secure transaction &middot; No charge yet</p>
                </CardContent>
              </Card>

              <div className="mt-6 flex items-center gap-4 p-5 rounded-[24px] bg-emerald-500/5 border border-emerald-500/10">
                <Shield size={24} className="text-emerald-500 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-bold">LuxeDrive Protection.</span> This trip is fully insured and covered by our 24/7 roadside assistance.
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

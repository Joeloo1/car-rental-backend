import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  X,
  ArrowRight,
  Loader2,
  Car as CarIcon,
} from "@/lib/icons";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { bookingService } from "../services/booking.service";
import ReviewModal from "../components/Dashboard/ReviewModal";
import { getImageUrl } from "../utils/image";
import type { Booking } from "../types/index";

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; pill: string }
> = {
  pending:   { label: "Pending",   icon: Clock,        pill: "text-amber bg-amber/10 border-amber/20" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, pill: "text-teal bg-teal/10 border-teal/20" },
  active:    { label: "Active",    icon: AlertCircle,  pill: "text-teal bg-teal/10 border-teal/20" },
  completed: { label: "Completed", icon: CheckCircle2, pill: "text-green bg-green/10 border-green/20" },
  cancelled: { label: "Cancelled", icon: XCircle,      pill: "text-red bg-red/[0.1] border-red/20" },
};

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=60&w=600";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getDays = (start: string, end: string) => {
  const d = Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000,
  );
  return `${d} ${d === 1 ? "day" : "days"}`;
};

// ── Booking card ─────────────────────────────────────────────────────────────
const BookingCard: React.FC<{
  booking: Booking;
  onCancel: (id: string) => void;
  onReview: (booking: Booking) => void;
  cancelling: boolean;
}> = ({ booking, onCancel, onReview, cancelling }) => {
  const navigate = useNavigate();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG["pending"];
  const StatusIcon = cfg.icon;
  const img = booking.car?.images?.[0]?.imageUrl
    ? getImageUrl(booking.car.images[0].imageUrl, 400)
    : PLACEHOLDER;

  return (
    <div className="rounded-2xl border border-[#1c1c1c] bg-surface-1 overflow-hidden hover:border-[#272727] transition-all duration-200">
      <div className="flex flex-col sm:flex-row">
        {/* Car image */}
        <div
          className="relative sm:w-52 h-44 sm:h-auto flex-shrink-0 cursor-pointer overflow-hidden"
          onClick={() => booking.car && navigate(`/car/${booking.car.id}`)}
        >
          <img
            src={img}
            alt={booking.car?.brand ?? "Car"}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />
          {/* Status ribbon on image */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.pill}`}>
              <StatusIcon size={10} />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-5 flex flex-col justify-between gap-4 min-w-0">
          <div>
            {/* Car name + year */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-[15px] text-ink-primary leading-tight truncate">
                  {booking.car
                    ? `${booking.car.brand} ${booking.car.model}`
                    : "Vehicle details unavailable"}
                </h3>
                {booking.car?.year && (
                  <p className="text-xs text-ink-tertiary mt-0.5">{booking.car.year}</p>
                )}
              </div>
              <div className="font-price text-right flex-shrink-0">
                <p className="text-lg font-bold text-ink-primary">${booking.totalPrice.toLocaleString()}</p>
                <p className="text-[10px] text-ink-tertiary">total</p>
              </div>
            </div>

            {/* Date range — visual */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-2 border border-[#242424] mb-3">
              <Calendar size={13} className="text-gold flex-shrink-0" />
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-ink-primary whitespace-nowrap">{fmt(booking.startDate)}</span>
                <svg width="24" height="8" viewBox="0 0 24 8" fill="none" className="flex-shrink-0">
                  <path d="M0 4h22M18 1l4 3-4 3" stroke="rgba(245,166,35,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-semibold text-ink-primary whitespace-nowrap">{fmt(booking.endDate)}</span>
                <span className="text-xs text-ink-tertiary px-2 py-0.5 rounded-md bg-surface-3 whitespace-nowrap">
                  {getDays(booking.startDate, booking.endDate)}
                </span>
              </div>
            </div>

            {/* Location */}
            {booking.car?.locationCity && (
              <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
                <MapPin size={11} className="text-ink-tertiary flex-shrink-0" />
                {booking.car.locationCity}
              </div>
            )}
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1c1c1c]">
            {booking.status === "completed" && (
              <button
                onClick={() => onReview(booking)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber border border-amber/20 bg-amber/[0.07] hover:bg-amber/[0.14] transition-colors"
              >
                <Star size={12} />
                Review
              </button>
            )}

            {booking.status === "pending" && !confirmCancel && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red border border-red/20 bg-red/[0.06] hover:bg-red/[0.12] transition-colors"
              >
                <X size={12} />
                Cancel
              </button>
            )}

            {confirmCancel && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-tertiary">Cancel?</span>
                <button
                  onClick={() => { onCancel(booking.id); setConfirmCancel(false); }}
                  disabled={cancelling}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red text-white hover:bg-red/80 transition-colors disabled:opacity-60"
                >
                  {cancelling ? <Loader2 size={11} className="animate-spin" /> : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  Keep
                </button>
              </div>
            )}

            {booking.car && (
              <button
                onClick={() => navigate(`/car/${booking.car!.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-ink-secondary border border-[#282828] bg-surface-2 hover:bg-surface-3 hover:border-[#333] transition-colors"
              >
                View car <ArrowRight size={11} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, authLoading, navigate]);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingService.getMyBookings,
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingService.updateBookingStatus(id, "cancelled"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success("Booking cancelled.");
    },
    onError: () => toast.error("Could not cancel booking."),
  });

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const counts: Record<StatusFilter, number> = {
    all:       bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const TABS: { key: StatusFilter; label: string }[] = [
    { key: "all",       label: "All" },
    { key: "pending",   label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-ink-tertiary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] pt-24 pb-20">
      <div className="container max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl sm:text-[28px] font-bold text-ink-primary tracking-tight">My Bookings</h1>
          <p className="text-sm text-ink-tertiary mt-1">
            {bookings.length > 0
              ? `${bookings.length} booking${bookings.length !== 1 ? "s" : ""} total`
              : "All your trip history in one place"}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto hide-scrollbar mb-8 p-1 bg-surface-1 rounded-2xl border border-[#1c1c1c] w-fit max-w-full">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                filter === key
                  ? "bg-surface-3 text-ink-primary border border-[#333] shadow-sm"
                  : "text-ink-tertiary hover:text-ink-secondary"
              }`}
            >
              {label}
              {counts[key] > 0 && (
                <span className={`ml-1.5 text-xs font-semibold ${filter === key ? "text-gold" : "text-ink-disabled"}`}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#1c1c1c] bg-surface-1 overflow-hidden flex h-44">
                <div className="w-48 skeleton flex-shrink-0" />
                <div className="flex-1 p-5 space-y-3">
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-[#282828] flex items-center justify-center mb-4">
              <CarIcon size={24} className="text-ink-tertiary" />
            </div>
            <h3 className="font-semibold text-[15px] text-ink-primary mb-1.5">
              {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
            </h3>
            <p className="text-sm text-ink-tertiary max-w-xs leading-relaxed mb-6">
              {filter === "all"
                ? "When you book a car, it'll appear here."
                : `You have no ${filter} bookings right now.`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => navigate("/browse")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-black transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #F5A623, #E8831A)" }}
              >
                Browse cars <ArrowRight size={15} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={(id) => cancelMutation.mutate(id)}
                onReview={(b) => setReviewBooking(b)}
                cancelling={cancelMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review modal */}
      {reviewBooking?.car && (
        <ReviewModal
          carId={String(reviewBooking.car.id)}
          carTitle={`${reviewBooking.car.brand} ${reviewBooking.car.model}`}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
            setReviewBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default MyBookings;

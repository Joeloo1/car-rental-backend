import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Eye,
  Trash2,
  MapPin,
  Fuel,
  Gauge,
  Users,
  Star,
  AlertTriangle,
  Car as CarIcon,
  Plus,
} from "lucide-react";
import type { ApiError } from "../../types";
import { carService } from "../../services/car.service.ts";
import { getImageUrl } from "../../utils/image";

const CAR_PLACEHOLDER =
  "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&q=70";

// ─── Delete confirmation modal ────────────────────────────────────────────────
const DeleteModal: React.FC<{
  car: any;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ car, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="relative w-full max-w-sm rounded-2xl bg-[#111115] border border-white/10 p-6 shadow-2xl"
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle size={22} className="text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">Remove Listing?</h3>
      <p className="text-sm text-gray-400 mb-5">
        <span className="text-white font-medium">
          {car.title || `${car.brand} ${car.model}`}
        </span>{" "}
        will be permanently removed from your listings.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Trash2 size={14} /> Remove
            </>
          )}
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Single car card ──────────────────────────────────────────────────────────
const CarCard: React.FC<{
  car: any;
  index: number;
  onDelete: (car: any) => void;
}> = ({ car, index, onDelete }) => {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);

  const isAvailable =
    car.availabilityStatus === "available" || car.isAvailable !== false;

  const imgSrc = car.images?.[0]?.imageUrl
    ? getImageUrl(car.images[0].imageUrl, 600)
    : CAR_PLACEHOLDER;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.07 }}
      className="group relative rounded-2xl bg-[#0d0d11] border border-white/8 overflow-hidden
                 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-400"
    >
      {/* ── Image ── */}
      <div className="relative h-48 overflow-hidden bg-[#0d0d11]">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}
        <img
          src={imgSrc}
          alt={car.title || `${car.brand} ${car.model}`}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d11] via-black/20 to-transparent" />

        {/* availability badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md ${
              isAvailable
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {isAvailable ? "Available" : "Booked"}
          </span>
        </div>

        {/* year badge */}
        {car.year && (
          <div className="absolute top-3 right-3">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/50 border border-white/20 backdrop-blur-md text-gray-200">
              {car.year}
            </span>
          </div>
        )}

        {/* category badge */}
        {car.category?.name && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 backdrop-blur-md uppercase tracking-wider">
              {car.category.name}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 space-y-3">
        {/* Title + Price */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-snug truncate group-hover:text-blue-400 transition-colors">
              {car.title || `${car.brand} ${car.model}`}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {car.brand} &middot; {car.model}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-white">${car.pricePerDay}</p>
            <p className="text-[11px] text-gray-500">/day</p>
          </div>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 flex-wrap">
          {car.locationCity && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} className="text-blue-400" />
              {car.locationCity}
            </span>
          )}
          {car.fuelType && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Fuel size={11} className="text-blue-400" />
              {car.fuelType}
            </span>
          )}
          {car.transmission && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Gauge size={11} className="text-blue-400" />
              {car.transmission}
            </span>
          )}
          {car.seats && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Users size={11} className="text-blue-400" />
              {car.seats}
            </span>
          )}
        </div>

        {/* divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        {/* Rating + Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {car.averageRating && car.averageRating > 0 ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-lg border border-yellow-500/20">
                <Star size={11} fill="#fbbf24" />
                {car.averageRating.toFixed(1)}
                {car.totalReviews > 0 && (
                  <span className="text-gray-500 font-normal">
                    ({car.totalReviews})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-xs text-gray-600 italic">No reviews</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(car)}
              className="p-2 rounded-lg bg-red-500/8 text-red-400/70 border border-red-500/10
                         hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/25 transition-all"
              title="Remove listing"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => navigate(`/car/${car.id}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-500/10 text-blue-400
                         border border-blue-500/20 text-xs font-semibold
                         hover:bg-blue-500/20 hover:border-blue-500/35 transition-all"
            >
              <Eye size={13} />
              View
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
interface CarsListProps {
  lenderId: string;
  /** Limit the number of cards shown (for the overview preview) */
  limit?: number;
}

const CarsList: React.FC<CarsListProps> = ({ lenderId, limit }) => {
  const queryClient = useQueryClient();
  const [carToDelete, setCarToDelete] = useState<any | null>(null);

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars", "lender", lenderId],
    queryFn: () => carService.getByLender(lenderId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => carService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", "lender", lenderId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Listing removed successfully.");
      setCarToDelete(null);
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Failed to remove listing.");
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-white/8 border-dashed">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
          <CarIcon size={24} className="text-blue-400" />
        </div>
        <p className="text-gray-300 font-semibold mb-1">No listings yet</p>
        <p className="text-sm text-gray-500 mb-5">
          List your first car to start earning.
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-add-car-modal"))}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-all"
        >
          <Plus size={15} /> Add a car
        </button>
      </div>
    );
  }

  const visibleCars = limit ? (cars as any[]).slice(0, limit) : (cars as any[]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleCars.map((car: any, i: number) => (
          <CarCard
            key={car.id}
            car={car}
            index={i}
            onDelete={setCarToDelete}
          />
        ))}
      </div>

      <AnimatePresence>
        {carToDelete && (
          <DeleteModal
            car={carToDelete}
            onConfirm={() => deleteMutation.mutate(carToDelete.id)}
            onCancel={() => setCarToDelete(null)}
            isLoading={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CarsList;

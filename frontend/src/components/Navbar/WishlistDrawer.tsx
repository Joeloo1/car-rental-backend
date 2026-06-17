import React from "react";
import { X, Heart, Trash2, ArrowRight } from "@/lib/icons";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { carService } from "../../services/car.service";
import { useFavorites } from "../../hooks/useFavorites";
import { getImageUrl } from "../../utils/image";
import { motion, AnimatePresence } from "framer-motion";

interface WishlistDrawerProps {
  onClose: () => void;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

  const carQueries = useQueries({
    queries: favorites.map((id) => ({
      queryKey: ["car", id],
      queryFn:  () => carService.getById(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading    = carQueries.some((q) => q.isLoading);
  const wishlistCars = carQueries.map((q) => q.data).filter((c) => c !== undefined);

  const handleCarClick = (carId: string | number) => {
    navigate(`/car/${carId}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-[6px] z-[2000] flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="w-full max-w-[420px] h-full flex flex-col"
        style={{
          background: "var(--color-surface)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          boxShadow:  "-20px 0 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)" }}
            >
              <Heart size={15} className="text-red fill-red" />
            </div>
            <span className="font-heading font-bold text-[15px] text-ink-primary">Wishlist</span>
            {favorites.length > 0 && (
              <span
                className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold bg-gold text-black leading-none"
                style={{ boxShadow: "0 4px 10px rgba(212,151,42,0.30)" }}
              >
                {favorites.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {favorites.length > 0 && (
              <button
                onClick={clearFavorites}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-tertiary hover:text-red hover:bg-red/[0.08] border border-[#252525] hover:border-red/20 transition-all"
                title="Clear wishlist"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-surface-2 border border-[#252525] transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-surface-1 border border-[#1c1c1c]">
                  <div className="w-[88px] h-[88px] rounded-xl skeleton animate-shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-3/4 rounded skeleton animate-shimmer" />
                    <div className="h-3 w-1/2 rounded skeleton animate-shimmer" />
                    <div className="h-4 w-1/3 rounded skeleton animate-shimmer mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : wishlistCars.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
              <div className="w-20 h-20 rounded-3xl bg-surface-2 border border-[#282828] flex items-center justify-center mb-5">
                <Heart size={30} className="text-ink-tertiary opacity-25" />
              </div>
              <h4 className="font-heading font-bold text-[18px] text-ink-primary mb-2">Your wishlist is empty</h4>
              <p className="text-sm text-ink-tertiary leading-relaxed mb-6 max-w-[220px]">
                Save your favourite cars while you browse.
              </p>
              <button
                onClick={() => { navigate("/browse"); onClose(); }}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-black transition-all hover:brightness-110 hover:-translate-y-0.5"
                style={{
                  background:  "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
                  boxShadow:   "0 8px 20px rgba(212,151,42,0.25)",
                }}
              >
                Browse Cars
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {wishlistCars.map((car) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group flex gap-4 p-4 rounded-2xl bg-surface-1 border border-[#1c1c1c] cursor-pointer hover:border-gold/25 hover:-translate-y-0.5 transition-all duration-200"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                    onClick={() => handleCarClick(car.id)}
                  >
                    {/* Image */}
                    <div className="w-[88px] h-[88px] rounded-xl overflow-hidden flex-shrink-0 bg-surface-2">
                      <img
                        src={car.images?.[0]?.imageUrl ? getImageUrl(car.images[0].imageUrl, 200) : "/placeholder-car.jpg"}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="font-semibold text-[14px] text-ink-primary truncate leading-tight">
                          {car.brand} {car.model}
                        </h4>
                        <button
                          className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 text-ink-tertiary hover:text-red hover:bg-red/[0.08] transition-all"
                          onClick={(e) => { e.stopPropagation(); removeFavorite(String(car.id)); }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary mt-1">
                        {car.category?.name ?? "Premium"}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-price font-bold text-[17px] text-ink-primary">
                          ₦{car.pricePerDay?.toLocaleString()}
                          <span className="text-xs text-ink-tertiary font-normal">/day</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-gold opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                          View <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {wishlistCars.length > 0 && (
          <div className="p-4 border-t border-[#1c1c1c] flex-shrink-0">
            <button
              onClick={() => { navigate("/browse"); onClose(); }}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-black transition-all hover:brightness-110 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
                boxShadow:  "0 8px 24px rgba(212,151,42,0.25)",
              }}
            >
              Continue Browsing
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WishlistDrawer;

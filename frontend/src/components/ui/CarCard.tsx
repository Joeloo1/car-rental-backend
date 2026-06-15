import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Star, Heart, Check } from "@/lib/icons";
import { getImageUrl } from "../../utils/image";
import { carService } from "../../services/car.service";

interface CarCardProps {
  car: {
    id: number | string;
    brand: string;
    model: string;
    year?: number;
    pricePerDay: number;
    locationCity?: string;
    seats?: number;
    fuelType?: string;
    transmission?: string;
    averageRating?: number;
    totalReviews?: number;
    images?: Array<{ imageUrl: string }>;
    category?: { name: string };
    availabilityStatus?: string;
  };
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  isCompared?: boolean;
  onCompare?:  (id: string) => void;
  index?: number;
}

/* ── Car placeholder SVG ─────────────────────────────────────────────────── */
const CarPlaceholder: React.FC = () => (
  <div
    className="absolute inset-0 flex flex-col items-center justify-center select-none"
    style={{ background: "linear-gradient(135deg, var(--color-surface-2) 0%, var(--color-bg) 100%)" }}
  >
    <svg viewBox="0 0 240 140" className="w-32 sm:w-36" fill="none" style={{ opacity: 0.13 }}>
      <path d="M20 95L42 58L72 40H168L198 58L220 95H20Z" fill="var(--color-gold)" />
      <path d="M85 43L98 68H142L155 43H85Z" fill="var(--color-surface-3)" opacity="0.9" />
      <rect x="20" y="93" width="200" height="16" rx="4" fill="var(--color-gold)" />
      <circle cx="65" cy="109" r="20" fill="var(--color-bg)" stroke="var(--color-gold)" strokeWidth="3" />
      <circle cx="65" cy="109" r="10" fill="var(--color-surface)" />
      <circle cx="175" cy="109" r="20" fill="var(--color-bg)" stroke="var(--color-gold)" strokeWidth="3" />
      <circle cx="175" cy="109" r="10" fill="var(--color-surface)" />
      <rect x="208" y="72" width="12" height="8" rx="2" fill="#FFB84D" opacity="0.55" />
      <rect x="20"  y="72" width="10" height="8" rx="2" fill="#FF4D4D" opacity="0.50" />
    </svg>
    <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.22em]"
      style={{ color: "var(--color-text-muted)" }}>
      No photo available
    </p>
  </div>
);

/* Fuel type colored dot colors */
const FUEL_COLORS: Record<string, string> = {
  Petrol: "#F5A623",
  Diesel: "#5A5A6A",
  Electric: "#00C9B1",
  Hybrid: "#00C9B1",
};

const STAGGER = ["", "delay-[60ms]", "delay-[120ms]", "delay-[180ms]", "delay-[240ms]"];

const RECENT_KEY = "luxedrive_recent";

const CarCard: React.FC<CarCardProps> = ({
  car, onFavorite, isFavorite = false, isCompared = false, onCompare, index = 0,
}) => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [loaded,   setLoaded]   = useState(false);
  const [imgError, setImgError] = useState(false);

  const available =
    car.availabilityStatus !== "rented" && car.availabilityStatus !== "maintenance";

  const img = car.images?.[0]?.imageUrl ? getImageUrl(car.images[0].imageUrl, 640) : null;
  const showPlaceholder = !img || imgError;

  const prefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey:  ["car", String(car.id)],
      queryFn:   () => carService.getById(String(car.id)),
      staleTime: 5 * 60 * 1000,
    });
  }, [car.id, queryClient]);

  const handleClick = () => {
    // Track recently viewed
    try {
      const entry = {
        id: String(car.id), brand: car.brand, model: car.model,
        year: car.year, pricePerDay: car.pricePerDay,
        locationCity: car.locationCity, image: img,
        categoryName: car.category?.name,
      };
      const stored: typeof entry[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      const updated = [entry, ...stored.filter(r => r.id !== entry.id)].slice(0, 12);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {}
    navigate(`/car/${car.id}`);
  };

  const fuelDotColor = car.fuelType ? FUEL_COLORS[car.fuelType] ?? "var(--color-text-muted)" : null;

  return (
    <article
      onClick={handleClick}
      onMouseEnter={prefetch}
      className={`group cursor-pointer animate-fade-up ${STAGGER[Math.min(index, 4)]}
                  transition-all duration-[220ms] ease-out hover:-translate-y-2`}
      style={{
        outline: isCompared ? "1.5px solid rgba(245,166,35,0.4)" : "none",
        borderRadius: isCompared ? "20px" : undefined,
      }}
    >
      {/* ── Image container ────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl bg-surface-2 mb-4"
        style={{
          height: "200px",
          boxShadow: "0 0 0 1.5px var(--color-border), 0 4px 16px rgba(0,0,0,0.4)",
          transition: "box-shadow 220ms ease-out",
        }}
        onMouseOver={e => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 24px 48px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(245,166,35,0.3)";
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 0 1.5px var(--color-border), 0 4px 16px rgba(0,0,0,0.4)";
        }}
      >
        {/* Skeleton */}
        {!loaded && !showPlaceholder && (
          <div className="absolute inset-0 skeleton animate-shimmer" />
        )}

        {/* Image or placeholder */}
        {showPlaceholder ? (
          <CarPlaceholder />
        ) : (
          <img
            src={img!}
            alt={`${car.brand} ${car.model}`}
            onLoad={() => setLoaded(true)}
            onError={() => { setImgError(true); setLoaded(true); }}
            className={`w-full h-full object-cover transition-transform duration-500
                        group-hover:scale-[1.05] ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {/* Bottom scrim */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)" }} />

        {/* Unavailable overlay */}
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(3px)" }}>
            <span className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{
                background: "rgba(255,77,77,0.15)",
                border: "1px solid rgba(255,77,77,0.40)",
                color: "var(--color-red)",
                backdropFilter: "blur(10px)",
              }}>
              Unavailable
            </span>
          </div>
        )}

        {/* Compare checkbox — top left (only when comparison mode active) */}
        {onCompare && (
          <button
            onClick={e => { e.stopPropagation(); onCompare(String(car.id)); }}
            aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
            className="absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-10"
            style={isCompared
              ? { background: "var(--color-gold)", border: "none" }
              : { background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.20)" }
            }
          >
            <Check size={12} style={{ color: isCompared ? "#000" : "rgba(255,255,255,0.75)", strokeWidth: 3 }} />
          </button>
        )}

        {/* Category tag — only when compare mode off */}
        {!onCompare && car.category?.name && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.08em]"
            style={{
              background: "rgba(0,0,0,0.60)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.80)",
              backdropFilter: "blur(8px)",
            }}>
            {car.category.name}
          </span>
        )}

        {/* Favorite button — top right */}
        <button
          onClick={e => { e.stopPropagation(); onFavorite?.(String(car.id)); }}
          aria-label={isFavorite ? "Remove from saved" : "Save car"}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={isFavorite
            ? { background: "white" }
            : { background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }
          }
        >
          <Heart
            size={13}
            style={isFavorite ? { fill: "#FF4D4D", color: "#FF4D4D" } : { color: "rgba(255,255,255,0.75)" }}
          />
        </button>

        {/* Price badge — bottom right */}
        <div className="absolute bottom-3 right-3 flex items-baseline gap-0.5 px-3 py-1.5 rounded-xl"
          style={{
            background: "rgba(10,10,12,0.75)",
            border: "1px solid rgba(245,166,35,0.28)",
            backdropFilter: "blur(12px)",
          }}>
          <span className="font-price font-bold leading-none" style={{ fontSize: "16px", color: "var(--color-gold)" }}>
            ${car.pricePerDay}
          </span>
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.38)" }}>/day</span>
        </div>

        {/* "View Details" CTA — slides up on hover */}
        {available && (
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3
                         translate-y-full group-hover:translate-y-0
                         opacity-0 group-hover:opacity-100
                         transition-all duration-[220ms] ease-out pointer-events-none">
            <div className="w-full py-2.5 rounded-xl text-center text-[13px] font-semibold"
              style={{ background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))", color: "#000" }}>
              View Details →
            </div>
          </div>
        )}
      </div>

      {/* ── Info section ──────────────────────────────────────────────────── */}
      <div className="px-0.5 space-y-1.5">
        {/* Name + year + rating */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-heading font-semibold leading-tight transition-colors duration-[180ms] group-hover:text-gold"
            style={{ fontSize: "15px", color: "var(--color-text-primary)" }}
          >
            {car.brand} {car.model}
            {car.year && (
              <span
                className="inline-flex items-center ml-1.5 px-1.5 py-0.5 rounded text-[11px] font-normal"
                style={{ background: "var(--color-surface-3)", color: "var(--color-text-muted)" }}
              >
                {car.year}
              </span>
            )}
          </h3>

          {/* Rating or "New" badge */}
          {(car.averageRating ?? 0) > 0 ? (
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <Star size={11} style={{ fill: "var(--color-gold)", color: "var(--color-gold)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                {Number(car.averageRating).toFixed(1)}
              </span>
              {(car.totalReviews ?? 0) > 0 && (
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  ({car.totalReviews})
                </span>
              )}
            </div>
          ) : (
            <span
              className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide mt-0.5"
              style={{
                background: "var(--color-teal)",
                color: "#fff",
                borderRadius: "6px",
                padding: "2px 7px",
              }}
            >
              New
            </span>
          )}
        </div>

        {/* Location + specs */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
          {car.locationCity && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <MapPin size={10} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
              {car.locationCity}
            </span>
          )}
          {car.transmission && (
            <>
              <span style={{ color: "var(--color-surface-3)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{car.transmission}</span>
            </>
          )}
          {car.fuelType && (
            <>
              <span style={{ color: "var(--color-surface-3)" }}>·</span>
              <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                {fuelDotColor && (
                  <span
                    className="inline-block rounded-full flex-shrink-0"
                    style={{ width: "6px", height: "6px", background: fuelDotColor }}
                  />
                )}
                {car.fuelType}
              </span>
            </>
          )}
          {car.seats && (
            <>
              <span style={{ color: "var(--color-surface-3)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{car.seats} seats</span>
            </>
          )}
        </div>

      </div>
    </article>
  );
};

export default CarCard;

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Star, Heart } from "lucide-react";
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
  index?: number;
}

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=60&w=800";

const delays = ["", "delay-[60ms]", "delay-[120ms]", "delay-[180ms]", "delay-[240ms]"];

const CarCard: React.FC<CarCardProps> = ({
  car,
  onFavorite,
  isFavorite = false,
  index = 0,
}) => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [loaded, setLoaded] = useState(false);

  const available =
    car.availabilityStatus !== "rented" && car.availabilityStatus !== "maintenance";

  const img = car.images?.[0]?.imageUrl
    ? getImageUrl(car.images[0].imageUrl, 640)
    : PLACEHOLDER;

  const prefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey:  ["car", String(car.id)],
      queryFn:   () => carService.getById(String(car.id)),
      staleTime: 5 * 60 * 1000,
    });
  }, [car.id, queryClient]);

  const specs: string[] = [
    car.transmission,
    car.fuelType,
    car.seats ? `${car.seats} seats` : undefined,
  ].filter(Boolean) as string[];

  return (
    <article
      onClick={() => navigate(`/car/${car.id}`)}
      onMouseEnter={prefetch}
      className={`group cursor-pointer animate-fade-up ${delays[Math.min(index, 4)]}`}
    >
      {/* ── Image ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl aspect-[16/10] bg-surface-2 mb-3.5 ring-1 ring-white/[0.06] group-hover:ring-blue/30 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300">

        {/* Skeleton shimmer */}
        {!loaded && <div className="absolute inset-0 skeleton" />}

        {/* Photo */}
        <img
          src={img}
          alt={`${car.brand} ${car.model}`}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06] ${loaded ? "opacity-100" : "opacity-0"}`}
        />

        {/* Gradient scrim — gives bottom elements legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

        {/* Unavailable full overlay */}
        {!available && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-[11px] font-bold text-white/80 border border-white/15 uppercase tracking-widest">
              Unavailable
            </span>
          </div>
        )}

        {/* Favourite button — top right */}
        <button
          onClick={e => { e.stopPropagation(); onFavorite?.(String(car.id)); }}
          aria-label={isFavorite ? "Remove from saved" : "Save car"}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-150 ${
            isFavorite
              ? "bg-white text-red-500 shadow-lg scale-110"
              : "bg-black/50 backdrop-blur-sm text-white/75 hover:bg-black/70 hover:text-white hover:scale-110"
          }`}
        >
          <Heart size={13} className={isFavorite ? "fill-red-500" : ""} strokeWidth={isFavorite ? 0 : 2} />
        </button>

        {/* Bottom-left: category */}
        {car.category?.name && (
          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-xs font-medium text-white/80 border border-white/10">
            {car.category.name}
          </span>
        )}

        {/* Bottom-right: price badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
          <span className="text-sm font-bold text-white">${car.pricePerDay}</span>
          <span className="text-xs text-white/50"> /day</span>
        </div>
      </div>

      {/* ── Info ───────────────────────────────────────────────────────────── */}
      <div className="px-0.5 space-y-1">
        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[15px] text-ink-primary group-hover:text-blue-light transition-colors leading-tight">
            {car.brand} {car.model}
            {car.year && (
              <span className="text-ink-tertiary font-normal"> · {car.year}</span>
            )}
          </h3>
          {(car.averageRating ?? 0) > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <Star size={11} className="fill-amber text-amber" />
              <span className="text-xs font-semibold text-ink-secondary">
                {Number(car.averageRating).toFixed(1)}
              </span>
              {(car.totalReviews ?? 0) > 0 && (
                <span className="text-xs text-ink-tertiary">({car.totalReviews})</span>
              )}
            </div>
          )}
        </div>

        {/* Location + specs compact row */}
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
          {car.locationCity && (
            <>
              <span className="flex items-center gap-1 text-xs text-ink-tertiary">
                <MapPin size={10} className="flex-shrink-0" />
                {car.locationCity}
              </span>
              {specs.length > 0 && (
                <span className="text-ink-disabled text-xs">·</span>
              )}
            </>
          )}
          {specs.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span className="text-ink-disabled text-xs">·</span>}
              <span className="text-xs text-ink-tertiary">{s}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </article>
  );
};

export default CarCard;

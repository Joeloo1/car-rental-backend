import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Fuel,
  Gauge,
  Star,
  Heart,
  ArrowRight,
  Calendar,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "../../utils/image";
import Badge from "./Badge";
import { clsx } from "clsx";

interface CarCardProps {
  car: {
    id: number | string;
    title?: string;
    brand: string;
    model: string;
    year: number;
    pricePerDay: number;
    location?: string;
    locationCity?: string;
    seats?: number;
    fuelType?: string;
    transmission?: string;
    averageRating?: number;
    totalReviews?: number;
    images?: Array<{ imageUrl: string }>;
    category?: { name: string };
    isAvailable?: boolean;
  };
  onFavorite?: (id: number) => void;
  isFavorite?: boolean;
  index?: number;
}

const CarCard: React.FC<CarCardProps> = ({
  car,
  onFavorite,
  isFavorite = false,
  index = 0,
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayLocation = car.locationCity || car.location;

  const handleCardClick = () => {
    navigate(`/car/${car.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(typeof car.id === "string" ? parseInt(car.id) : car.id);
    }
  };

  const imageUrl =
    car.images && car.images.length > 0
      ? getImageUrl(car.images[0].imageUrl)
      : "/placeholder-car.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div
        className={clsx(
          "relative bg-dark-500 rounded-2xl overflow-hidden cursor-pointer",
          "border border-white/10 transition-all duration-500",
          "hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20",
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`View details for ${car.brand} ${car.model}`}
      >
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden bg-dark-400">
          {/* Skeleton loader */}
          {!imageLoaded && <div className="absolute inset-0 skeleton" />}

          {/* Car Image */}
          <motion.img
            src={imageUrl}
            alt={`${car.brand} ${car.model}`}
            className={clsx(
              "w-full h-full object-cover transition-all duration-700",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110",
            )}
            style={{
              transform: isHovered ? "scale(1.1)" : "scale(1)",
            }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div
            className={clsx(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
              "transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-60",
            )}
          />

          {/* Top Badges Row */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
            {/* Category Badge */}
            {car.category && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge
                  variant="neutral"
                  className="backdrop-blur-md bg-black/40"
                >
                  {car.category.name}
                </Badge>
              </motion.div>
            )}

            {/* Favorite Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={clsx(
                "p-2.5 rounded-full backdrop-blur-md transition-all duration-300",
                isFavorite
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/50"
                  : "bg-black/40 text-white hover:bg-black/60",
              )}
              onClick={handleFavoriteClick}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                size={18}
                fill={isFavorite ? "currentColor" : "none"}
                className="transition-all"
              />
            </motion.button>
          </div>

          {/* Availability Badge */}
          {car.isAvailable !== undefined && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge
                variant={car.isAvailable ? "success" : "danger"}
                className="backdrop-blur-md"
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={clsx(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      car.isAvailable ? "bg-green-400" : "bg-red-400",
                    )}
                  />
                  {car.isAvailable ? "Available" : "Booked"}
                </span>
              </Badge>
            </div>
          )}

          {/* Quick View Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="glass-strong px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2">
              View Details
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                {car.title || `${car.brand} ${car.model}`}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">{car.brand} {car.model} · {car.year}</p>
            </div>

            {/* Rating */}
            {car.averageRating !== undefined && car.averageRating > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2.5 py-1.5 rounded-lg border border-yellow-500/20">
                <Star size={14} fill="#fbbf24" className="text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">
                  {car.averageRating.toFixed(1)}
                </span>
                {car.totalReviews !== undefined && car.totalReviews > 0 && (
                  <span className="text-xs text-gray-400">
                    ({car.totalReviews})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-3 gap-3">
            {car.seats && (
              <div className="flex flex-col items-center gap-1.5 p-2.5 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/50 transition-colors">
                <Users size={18} className="text-blue-400" />
                <span className="text-xs font-medium text-gray-300">
                  {car.seats} Seats
                </span>
              </div>
            )}
            {car.fuelType && (
              <div className="flex flex-col items-center gap-1.5 p-2.5 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/50 transition-colors">
                <Fuel size={18} className="text-blue-400" />
                <span className="text-xs font-medium text-gray-300">
                  {car.fuelType}
                </span>
              </div>
            )}
            {car.transmission && (
              <div className="flex flex-col items-center gap-1.5 p-2.5 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/50 transition-colors">
                <Gauge size={18} className="text-blue-400" />
                <span className="text-xs font-medium text-gray-300 truncate">
                  {car.transmission}
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          {displayLocation && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin size={16} className="text-blue-400 flex-shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Footer */}
          <div className="flex items-center justify-between gap-4">
            {/* Price */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  ${car.pricePerDay}
                </span>
                <span className="text-sm text-gray-400">/day</span>
              </div>
              <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Shield size={12} />
                Insurance included
              </span>
            </div>

            {/* Book Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "px-5 py-2.5 rounded-lg font-semibold text-sm",
                "bg-gradient-to-r from-blue-500 to-indigo-600",
                "text-white shadow-lg shadow-blue-500/30",
                "hover:shadow-xl hover:shadow-blue-500/50",
                "transition-all duration-300",
                "flex items-center gap-2",
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              <Calendar size={16} />
              Book Now
            </motion.button>
          </div>
        </div>

        {/* Shine effect on hover */}
        <div
          className={clsx(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
            "bg-gradient-to-r from-transparent via-white/5 to-transparent",
            "-translate-x-full group-hover:translate-x-full",
          )}
          style={{ transition: "transform 1s" }}
        />
      </div>
    </motion.div>
  );
};

export default CarCard;

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Users,
  Fuel,
  Gauge,
  Star,
  Heart,
  ArrowRight,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "../../utils/image";
import { carService } from "../../services/car.service";
import Badge from "./Badge";
import Button from "./Button";
import { Card, CardContent } from "./Card";
import { cn } from "../../utils/cn";

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
  const queryClient = useQueryClient();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayLocation = car.locationCity || car.location;

  const handleCardClick = () => {
    navigate(`/car/${car.id}`);
  };

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    queryClient.prefetchQuery({
      queryKey: ["car", String(car.id)],
      queryFn: () => carService.getById(String(car.id)),
      staleTime: 5 * 60 * 1000,
    });
  }, [car.id, queryClient]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(typeof car.id === "string" ? parseInt(car.id) : car.id);
    }
  };

  const imgSrc =
    car.images && car.images.length > 0
      ? getImageUrl(car.images[0].imageUrl, 800)
      : "/placeholder-car.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <Card 
        className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500"
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden bg-muted">
          {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
          
          <img
            src={imgSrc}
            alt={`${car.brand} ${car.model}`}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              imageLoaded ? "opacity-100" : "opacity-0",
              isHovered ? "scale-110" : "scale-100"
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />
          
          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className="backdrop-blur-md bg-background/40 uppercase tracking-widest text-[8px]">
                {car.category?.name || "Premium"}
              </Badge>
              {car.isAvailable !== false ? (
                <Badge variant="success" className="backdrop-blur-md bg-background/40">
                   <Zap size={10} className="mr-1 fill-current" /> Available
                </Badge>
              ) : (
                <Badge variant="destructive" className="backdrop-blur-md bg-background/40">Booked</Badge>
              )}
            </div>
            
            <button
              onClick={handleFavoriteClick}
              className={cn(
                "p-2.5 rounded-full backdrop-blur-md transition-all duration-300",
                isFavorite 
                  ? "bg-primary text-white shadow-lg shadow-primary/30" 
                  : "bg-background/40 text-white hover:bg-background/60"
              )}
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Quick View indicator */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <div className="bg-primary/90 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              EXPLORE DETAILS <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-5 space-y-5">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-display font-bold leading-tight truncate group-hover:text-primary transition-colors">
                {car.brand} {car.model}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                <MapPin size={12} className="text-primary" />
                <span className="text-xs truncate">{displayLocation}</span>
              </div>
            </div>
            
            {car.averageRating ? (
              <div className="flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                <Star size={12} className="text-primary fill-primary" />
                <span className="text-xs font-bold">{car.averageRating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-2 py-1">
             {[
               { icon: Users, label: car.seats ? `${car.seats} Seats` : '5 Seats' },
               { icon: Fuel, label: car.fuelType || 'Petrol' },
               { icon: Gauge, label: car.transmission || 'Auto' }
             ].map((feature, i) => (
               <div key={i} className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/30 border border-border/50 group-hover:bg-primary/5 transition-colors">
                 <feature.icon size={14} className="text-primary mb-1" />
                 <span className="text-[10px] font-medium text-muted-foreground truncate w-full text-center">{feature.label}</span>
               </div>
             ))}
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Daily Rate</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-display font-black text-foreground">${car.pricePerDay}</span>
                <span className="text-xs text-muted-foreground">/day</span>
              </div>
            </div>
            <Button 
              size="sm" 
              className="h-10 px-5 rounded-xl shadow-md group-hover:shadow-primary/20 transition-all"
              onClick={handleCardClick}
            >
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CarCard;

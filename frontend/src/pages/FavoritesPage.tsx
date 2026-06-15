import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { Heart, ArrowRight, Loader2 } from "@/lib/icons";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import { carService } from "../services/car.service";
import CarCard from "../components/ui/CarCard";

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { favorites, isFavorite, toggleFavorite, isLoading: favLoading } = useFavorites();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch full car details for each favourite in parallel
  const carQueries = useQueries({
    queries: favorites.map((id) => ({
      queryKey: ["car", id],
      queryFn: () => carService.getById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const loading = authLoading || favLoading || carQueries.some((q) => q.isLoading && !q.data);
  const cars = carQueries.filter((q) => q.data).map((q) => q.data!);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-ink-tertiary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] pt-24 pb-20">
      <div className="container">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl sm:text-[28px] font-bold text-ink-primary tracking-tight">
              My Favourites
            </h1>
            <p className="text-sm text-ink-tertiary mt-1">
              {favorites.length > 0
                ? `${favorites.length} saved car${favorites.length !== 1 ? "s" : ""}`
                : "Cars you've saved will appear here"}
            </p>
          </div>

          {cars.length > 0 && (
            <button
              onClick={() => navigate("/browse")}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Browse more <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: Math.max(favorites.length, 4) }).map((_, i) => (
              <div key={i}>
                <div className="skeleton rounded-2xl aspect-[16/10] mb-3.5" />
                <div className="skeleton h-4 w-3/4 rounded mb-2" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-[#282828] flex items-center justify-center mb-4">
              <Heart size={24} className="text-ink-tertiary" />
            </div>
            <h3 className="font-semibold text-[15px] text-ink-primary mb-1.5">
              No favourites yet
            </h3>
            <p className="text-sm text-ink-tertiary max-w-xs leading-relaxed mb-6">
              Tap the heart icon on any car to save it here for quick access later.
            </p>
            <button
              onClick={() => navigate("/browse")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-black transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #F5A623, #E8831A)" }}
            >
              Discover cars <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
            {cars.map((car, i) => (
              <CarCard
                key={car.id}
                car={car}
                index={i}
                isFavorite={isFavorite(String(car.id))}
                onFavorite={(id) => toggleFavorite(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

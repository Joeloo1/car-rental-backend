import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { favoriteService } from "../services/favorite.service";

const LOCAL_KEY = "car_favorites";

const getLocalFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
};

const setLocalFavorites = (ids: string[]) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
};

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      if (isAuthenticated) {
        try {
          const ids = await favoriteService.getFavorites();
          if (!cancelled) setFavorites(ids);
        } catch {
          if (!cancelled) setFavorites(getLocalFavorites());
        }
      } else {
        if (!cancelled) setFavorites(getLocalFavorites());
      }
      if (!cancelled) setIsLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const isFavorite = useCallback((carId: string) => favorites.includes(carId), [favorites]);

  const toggleFavorite = useCallback(async (carId: string) => {
    const adding = !favorites.includes(carId);

    setFavorites((prev) =>
      adding ? [...prev, carId] : prev.filter((id) => id !== carId)
    );

    if (!isAuthenticated) {
      setLocalFavorites(adding ? [...favorites, carId] : favorites.filter((id) => id !== carId));
    } else {
      try {
        if (adding) {
          await favoriteService.addFavorite(carId);
        } else {
          await favoriteService.removeFavorite(carId);
        }
      } catch {
        setFavorites((prev) =>
          adding ? prev.filter((id) => id !== carId) : [...prev, carId]
        );
        toast.error("Failed to update wishlist");
        return;
      }
    }

    toast.success(adding ? "Added to wishlist" : "Removed from wishlist", {
      id: `fav-${carId}`,
    });
  }, [favorites, isAuthenticated]);

  const clearFavorites = useCallback(async () => {
    setFavorites([]);
    if (!isAuthenticated) {
      setLocalFavorites([]);
    } else {
      try {
        await Promise.all(favorites.map((id) => favoriteService.removeFavorite(id)));
      } catch {
        // best-effort
      }
    }
    toast.success("Wishlist cleared");
  }, [favorites, isAuthenticated]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite: (carId: string) => toggleFavorite(carId),
    removeFavorite: (carId: string) => toggleFavorite(carId),
    clearFavorites,
    isLoading,
  };
};

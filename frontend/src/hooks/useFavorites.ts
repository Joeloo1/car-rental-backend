import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const FAVORITES_KEY = "car_favorites";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isLoading]);

  const isFavorite = (carId: string): boolean => {
    return favorites.includes(carId);
  };

  const toggleFavorite = (carId: string): void => {
    setFavorites((prev) => {
      if (prev.includes(carId)) {
        toast.success("Removed from wishlist", {
          icon: "🗑️",
          id: `fav-${carId}`,
        });
        return prev.filter((id) => id !== carId);
      } else {
        toast.success("Added to wishlist", {
          icon: "❤️",
          id: `fav-${carId}`,
        });
        return [...prev, carId];
      }
    });
  };

  const addFavorite = (carId: string): void => {
    if (!favorites.includes(carId)) {
      setFavorites((prev) => [...prev, carId]);
      toast.success("Added to wishlist", {
        icon: "❤️",
        id: `fav-${carId}`,
      });
    }
  };

  const removeFavorite = (carId: string): void => {
    if (favorites.includes(carId)) {
      setFavorites((prev) => prev.filter((id) => id !== carId));
      toast.success("Removed from wishlist", {
        icon: "🗑️",
        id: `fav-${carId}`,
      });
    }
  };

  const clearFavorites = (): void => {
    setFavorites([]);
    toast.success("Wishlist cleared");
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    isLoading,
  };
};

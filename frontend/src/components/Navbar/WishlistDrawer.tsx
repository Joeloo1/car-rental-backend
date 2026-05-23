import React from "react";
import { X, Heart, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { carService } from "../../services/car.service";
import { useFavorites } from "../../hooks/useFavorites";
import { getImageUrl } from "../../utils/image";
import { motion, AnimatePresence } from "framer-motion";
import "./WishlistDrawer.css";

interface WishlistDrawerProps {
  onClose: () => void;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

  // Fetch all cars in the wishlist
  const carQueries = useQueries({
    queries: favorites.map((id) => ({
      queryKey: ["car", id],
      queryFn: () => carService.getById(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = carQueries.some((query) => query.isLoading);
  const wishlistCars = carQueries
    .map((query) => query.data)
    .filter((car) => car !== undefined);

  const handleCarClick = (carId: string | number) => {
    navigate(`/car/${carId}`);
    onClose();
  };

  return (
    <div className="wishlist-overlay" onClick={onClose}>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="wishlist-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wishlist-header">
          <div className="wishlist-header-content">
            <Heart size={20} className="text-red-500 fill-red-500" />
            <h3>Your Wishlist</h3>
            {favorites.length > 0 && (
              <span className="wishlist-count">{favorites.length}</span>
            )}
          </div>
          <div className="wishlist-actions">
            {favorites.length > 0 && (
              <button
                className="clear-btn"
                onClick={clearFavorites}
                title="Clear wishlist"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="wishlist-content">
          {isLoading ? (
            <div className="wishlist-loading">
              <div className="loader"></div>
              <p>Loading your favorites...</p>
            </div>
          ) : wishlistCars.length === 0 ? (
            <div className="wishlist-empty">
              <div className="empty-icon-wrapper">
                <Heart size={48} className="text-gray-600" />
              </div>
              <h4>Your wishlist is empty</h4>
              <p>Explore our collection and save your favorite cars for later.</p>
              <button
                className="browse-btn"
                onClick={() => {
                  navigate("/browse");
                  onClose();
                }}
              >
                Browse Cars
              </button>
            </div>
          ) : (
            <div className="wishlist-items">
              <AnimatePresence>
                {wishlistCars.map((car) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="wishlist-item"
                    onClick={() => handleCarClick(car.id)}
                  >
                    <div className="item-image">
                      <img
                        src={car.images?.[0]?.imageUrl ? getImageUrl(car.images[0].imageUrl, 200) : "/placeholder-car.jpg"}
                        alt={`${car.brand} ${car.model}`}
                      />
                    </div>
                    <div className="item-details">
                      <div className="item-header">
                        <h4>{car.brand} {car.model}</h4>
                        <button
                          className="remove-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(String(car.id));
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="item-category">{car.category?.name || "Premium"}</p>
                      <div className="item-footer">
                        <span className="item-price">
                          ${car.pricePerDay}<span>/day</span>
                        </span>
                        <div className="view-link">
                          View <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {wishlistCars.length > 0 && (
          <div className="wishlist-footer">
            <button
              className="checkout-btn"
              onClick={() => {
                navigate("/browse");
                onClose();
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

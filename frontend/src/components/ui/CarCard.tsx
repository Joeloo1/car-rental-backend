import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Fuel, Gauge, Star, Heart } from 'lucide-react';
import { getImageUrl } from '../../utils/image';
import Badge from './Badge';

interface CarCardProps {
  car: {
    id: number;
    brand: string;
    model: string;
    year: number;
    pricePerDay: number;
    location?: string;
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
}

const CarCard: React.FC<CarCardProps> = ({ car, onFavorite, isFavorite = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/car/${car.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(car.id);
    }
  };

  const imageUrl = car.images && car.images.length > 0
    ? getImageUrl(car.images[0].imageUrl)
    : '/placeholder-car.jpg';

  return (
    <div className="car-card premium-card" onClick={handleCardClick}>
      <div className="car-card-image-wrapper">
        <img
          src={imageUrl}
          alt={`${car.brand} ${car.model}`}
          className="car-card-image"
          loading="lazy"
        />
        
        {/* Favorite Button */}
        <button
          className={`car-card-favorite ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label="Add to favorites"
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Category Badge */}
        {car.category && (
          <div className="car-card-category">
            <Badge variant="neutral">{car.category.name}</Badge>
          </div>
        )}

        {/* Availability Badge */}
        {car.isAvailable !== undefined && (
          <div className="car-card-status">
            <Badge variant={car.isAvailable ? 'success' : 'danger'}>
              {car.isAvailable ? 'Available' : 'Booked'}
            </Badge>
          </div>
        )}
      </div>

      <div className="car-card-content">
        <div className="car-card-header">
          <h3 className="car-card-title">
            {car.brand} {car.model}
          </h3>
          <span className="car-card-year">{car.year}</span>
        </div>

        {/* Rating */}
        {car.averageRating !== undefined && car.averageRating > 0 && (
          <div className="car-card-rating">
            <Star size={16} fill="currentColor" />
            <span className="rating-value">{car.averageRating.toFixed(1)}</span>
            {car.totalReviews !== undefined && car.totalReviews > 0 && (
              <span className="rating-count">({car.totalReviews})</span>
            )}
          </div>
        )}

        {/* Specifications */}
        <div className="car-card-specs">
          {car.seats && (
            <div className="spec-item">
              <Users size={16} />
              <span>{car.seats} Seats</span>
            </div>
          )}
          {car.fuelType && (
            <div className="spec-item">
              <Fuel size={16} />
              <span>{car.fuelType}</span>
            </div>
          )}
          {car.transmission && (
            <div className="spec-item">
              <Gauge size={16} />
              <span>{car.transmission}</span>
            </div>
          )}
        </div>

        {/* Location */}
        {car.location && (
          <div className="car-card-location">
            <MapPin size={14} />
            <span>{car.location}</span>
          </div>
        )}

        {/* Price */}
        <div className="car-card-footer">
          <div className="car-card-price">
            <span className="price-amount">${car.pricePerDay}</span>
            <span className="price-period">/day</span>
          </div>
          <button className="btn-primary btn-sm" onClick={handleCardClick}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;

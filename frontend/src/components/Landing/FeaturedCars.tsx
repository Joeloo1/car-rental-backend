import React from "react";
import { Link } from "react-router-dom";
import type { Car } from "../../types/index";
import { useFavorites } from "../../hooks/useFavorites.ts";
import CarCard from "../ui/CarCard";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import EmptyState from "../ui/EmptyState";
import { Car as CarIcon } from "lucide-react";
import "../ui/CarCard.css";
import "./FeaturedCars.css";

interface FeaturedCarsProps {
  cars?: Car[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
}

const FeaturedCars: React.FC<FeaturedCarsProps> = ({
  cars,
  title = "Featured Premium Fleet",
  subtitle = "Experience the finest selection of luxury vehicles.",
  isLoading,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  if (isLoading) {
    return (
      <section className="featured-cars section-padding bg-alt">
        <div className="container">
          <div className="section-header">
            <div className="header-text">
              <LoadingSkeleton variant="title" width="300px" />
              <LoadingSkeleton variant="text" width="400px" />
            </div>
          </div>
          <div className="cars-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="car-card-skeleton">
                <LoadingSkeleton variant="custom" height="240px" />
                <div style={{ padding: "1.25rem" }}>
                  <LoadingSkeleton variant="title" width="70%" />
                  <LoadingSkeleton variant="text" count={3} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <section className="featured-cars section-padding bg-alt">
        <div className="container">
          <EmptyState
            icon={CarIcon}
            title="No cars found"
            description="Try adjusting your filters or search terms to find the perfect vehicle."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="featured-cars section-padding bg-alt">
      <div className="container">
        <div className="section-header justify-between flex items-center">
          <div className="header-text">
            <h2
              className="section-title"
              dangerouslySetInnerHTML={{ __html: title }}
            ></h2>
            <p className="section-subtitle">{subtitle}</p>
          </div>
          <Link to="/browse" className="btn-secondary desktop-only">
            View All Cars
          </Link>
        </div>

        <div className="cars-grid animate-fade-in">
          {cars.map((car, index) => (
            <div
              key={car.id}
              className={`animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}
            >
              <CarCard
                car={car}
                isFavorite={isFavorite(String(car.id))}
                onFavorite={() => toggleFavorite(String(car.id))}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Calendar,
  Car,
  Shield,
  Zap,
  Users,
  Star,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { carService } from "../services/car.service.ts";
import { getImageUrl } from "../utils/image";
import "./LandingPage.css";

const LandingPagePro: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const { data: carsData, isLoading } = useQuery({
    queryKey: ["featured-cars"],
    queryFn: () => carService.getAll({ limit: 6 }),
  });

  const cars = carsData?.data?.cars || [];

  return (
    <div className="landing-page-pro">
      {/* Hero Section */}
      <section className="hero-pro">
        <div className="hero-overlay"></div>
        <div className="hero-background"></div>
        <div className="container hero-content-pro">
          <div className={`hero-text ${isVisible ? "fade-in" : ""}`}>
            <h1 className="hero-title-pro">
              Drive Your Dream Car
              <span className="gradient-text"> Today</span>
            </h1>
            <p className="hero-subtitle-pro">
              Premium car rentals from verified hosts. Experience luxury,
              performance, and style with our curated collection of exotic
              vehicles.
            </p>

            {/* Search Bar */}
            <div className="search-card">
              <div className="search-item">
                <MapPin className="search-icon" size={20} />
                <div className="search-input-wrapper">
                  <label>Location</label>
                  <input type="text" placeholder="Where to?" />
                </div>
              </div>
              <div className="search-divider"></div>
              <div className="search-item">
                <Calendar className="search-icon" size={20} />
                <div className="search-input-wrapper">
                  <label>Dates</label>
                  <input type="text" placeholder="Add dates" />
                </div>
              </div>
              <div className="search-divider"></div>
              <div className="search-item">
                <Car className="search-icon" size={20} />
                <div className="search-input-wrapper">
                  <label>Type</label>
                  <select>
                    <option>All Categories</option>
                    <option>Luxury</option>
                    <option>SUV</option>
                    <option>Sports</option>
                  </select>
                </div>
              </div>
              <button
                className="search-btn-pro"
                onClick={() => navigate("/browse")}
              >
                <Search size={20} />
                <span>Search</span>
              </button>
            </div>

            {/* Stats */}
            <div className="hero-stats-pro">
              <div className="stat-item">
                <div className="stat-value">500+</div>
                <div className="stat-label">Premium Cars</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-value">50+</div>
                <div className="stat-label">Cities</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-value">4.9★</div>
                <div className="stat-label">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose LuxeDrive</h2>
            <p className="section-subtitle">
              Experience the difference with our premium service
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue">
                <Shield size={28} />
              </div>
              <h3>Fully Insured</h3>
              <p>
                Comprehensive coverage on all rentals for complete peace of mind
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple">
                <Zap size={28} />
              </div>
              <h3>Instant Booking</h3>
              <p>Book your dream car in seconds with our streamlined process</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">
                <Users size={28} />
              </div>
              <h3>Verified Hosts</h3>
              <p>All car owners are thoroughly vetted and verified</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">
                <Award size={28} />
              </div>
              <h3>Premium Selection</h3>
              <p>Curated collection of luxury and exotic vehicles</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon pink">
                <Clock size={28} />
              </div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer service for your convenience</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon cyan">
                <TrendingUp size={28} />
              </div>
              <h3>Best Prices</h3>
              <p>Competitive rates with no hidden fees or surprises</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="featured-cars-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Vehicles</h2>
            <p className="section-subtitle">
              Explore our handpicked selection of premium cars
            </p>
          </div>

          {isLoading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="car-card-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length > 0 ? (
            <div className="cars-grid">
              {cars.map((car: any) => (
                <div
                  key={car.id}
                  className="car-card-pro"
                  onClick={() => navigate(`/car/${car.id}`)}
                >
                  <div className="car-image-wrapper">
                    <img
                      src={
                        car.images?.[0]?.imageUrl
                          ? getImageUrl(car.images[0].imageUrl)
                          : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"
                      }
                      alt={car.title}
                      className="car-image"
                    />
                    <div className="car-badge">
                      {car.category?.name || "Luxury"}
                    </div>
                  </div>
                  <div className="car-content">
                    <h3 className="car-title">{car.title}</h3>
                    <div className="car-meta">
                      <span className="car-location">
                        <MapPin size={14} />
                        {car.locationCity || "Available"}
                      </span>
                      {car.reviews && (
                        <span className="car-rating">
                          <Star size={14} fill="currentColor" />
                          4.8
                        </span>
                      )}
                    </div>
                    <div className="car-specs">
                      <span>{car.seats || 4} seats</span>
                      <span>•</span>
                      <span>{car.transmission || "Auto"}</span>
                      <span>•</span>
                      <span>{car.fuelType || "Petrol"}</span>
                    </div>
                    <div className="car-footer">
                      <div className="car-price">
                        <span className="price-amount">${car.pricePerDay}</span>
                        <span className="price-period">/day</span>
                      </div>
                      <button className="btn-book">Book Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Car size={64} strokeWidth={1} />
              <h3>No cars available</h3>
              <p>Check back soon for amazing vehicles</p>
            </div>
          )}

          <div className="section-cta">
            <button
              className="btn-view-all"
              onClick={() => navigate("/browse")}
            >
              View All Cars
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-pro">
        <div className="container">
          <div className="cta-card-pro">
            <div className="cta-content">
              <h2>Ready to Start Your Journey?</h2>
              <p>
                Join thousands of satisfied customers and experience the luxury
                of driving your dream car
              </p>
              <div className="cta-buttons">
                <button
                  className="btn-primary-large"
                  onClick={() => navigate("/browse")}
                >
                  Browse Cars
                </button>
                <button
                  className="btn-secondary-large"
                  onClick={() => navigate("/register")}
                >
                  Become a Host
                </button>
              </div>
            </div>
            <div className="cta-image">
              <div className="cta-badge">
                <Award size={24} />
                <div>
                  <div className="badge-title">Trusted Platform</div>
                  <div className="badge-subtitle">10,000+ Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPagePro;

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Star,
  Zap,
  Users,
  Fuel,
  Gauge,
  MessageCircle,
  Share2,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { carService } from "../services/car.service.ts";
import { useFavorites } from "../hooks/useFavorites.ts";
import Map from "../components/common/Map.tsx";

import ChatWindow from "../components/Chat/ChatWindow.tsx";

import "./CarDetails.css";

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const {
    data: car,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["car", id],
    queryFn: () => carService.getById(id!),
    enabled: !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: (data: { startDate: string; endDate: string }) =>
      carService.reserve(id!, data),
    onSuccess: () => {
      toast.success("Reservation successful!");
      navigate("/dashboard");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err.response?.data?.message || "Failed to book car. Please try again.",
      );
    },
  });

  const handleReserve = () => {
    if (!dates.startDate || !dates.endDate) {
      toast.error("Please select pickup and return dates");
      return;
    }
    bookingMutation.mutate(dates);
  };

  const calculateTotal = () => {
    if (!dates.startDate || !dates.endDate || !car) return 0;
    const start = new Date(dates.startDate);
    const end = new Date(dates.endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    return car.pricePerDay * days + 65; // $65 service fee
  };

  if (isLoading)
    return (
      <div className="details-page">
        <div className="container">Loading car details...</div>
      </div>
    );
  if (error || !car)
    return (
      <div className="details-page">
        <div className="container">Car not found.</div>
      </div>
    );

  return (
    <>
      <div className="details-page animate-fade-in">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-link">
            <ArrowLeft size={20} />
            <span>Back to results</span>
          </button>

          {/* Header */}
          <div className="details-header">
            <div className="header-main">
              <h1 className="car-title">{car.title}</h1>
              <div className="header-meta">
                <div className="meta-item">
                  <Star
                    size={16}
                    fill="var(--warning)"
                    color="var(--warning)"
                  />
                  <span>
                    {car.averageRating || "0.0"} ({car.totalReviews || 0}{" "}
                    reviews)
                  </span>
                </div>
                <div className="meta-item">•</div>
                <div className="meta-item">
                  {car.category?.name || "Luxury"}
                </div>
                <div className="meta-item">•</div>
                <div className="meta-item">{car.locationCity}</div>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="action-btn-circle"
                onClick={() => {
                  const url = `${window.location.origin}/car/${id}`;
                  navigator.clipboard
                    .writeText(url)
                    .then(() => {
                      toast.success("Link copied to clipboard!");
                    })
                    .catch(() => {
                      toast.error("Failed to copy link");
                    });
                }}
                title="Share this car"
              >
                <Share2 size={20} />
              </button>
              <button
                className={`action-btn-circle ${isFavorite(id!) ? "favorite-active" : ""}`}
                onClick={() => {
                  toggleFavorite(id!);
                  toast.success(
                    isFavorite(id!)
                      ? "Removed from favorites"
                      : "Added to favorites",
                  );
                }}
                title={
                  isFavorite(id!) ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  size={20}
                  fill={isFavorite(id!) ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          {/* Gallery */}
          <div className="details-gallery">
            <div className="main-image">
              <img
                src={
                  car.images?.[0]?.imageUrl ||
                  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"
                }
                alt={car.title}
              />
            </div>
            <div className="side-images">
              <img
                src={
                  car.images?.[1]?.imageUrl ||
                  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200"
                }
                alt={car.title}
              />
              <img
                src={
                  car.images?.[2]?.imageUrl ||
                  "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200"
                }
                alt={car.title}
              />
            </div>
          </div>

          {/* Content Grid */}
          <div className="details-grid">
            <div className="details-main-content">
              <div className="overview-section">
                <h2>Overview</h2>
                <div className="specs-grid">
                  <div className="spec-card glass">
                    <Fuel size={24} />
                    <span>{car.fuelType || "Petrol"}</span>
                  </div>
                  <div className="spec-card glass">
                    <Gauge size={24} />
                    <span>
                      {car.topSpeed ? `${car.topSpeed} km/h` : "320 km/h"}
                    </span>
                  </div>
                  <div className="spec-card glass">
                    <Users size={24} />
                    <span>{car.seats || 4} Seats</span>
                  </div>
                  <div className="spec-card glass">
                    <Zap size={24} />
                    <span>{car.transmission || "Automatic"}</span>
                  </div>
                </div>
              </div>

              <div className="description-section">
                <h2>About this car</h2>
                <p>{car.description}</p>
              </div>

              <div className="host-section glass">
                <img
                  src={
                    car.lender?.profileImage ||
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                  }
                  alt={car.lender?.name}
                  className="host-avatar"
                />
                <div className="host-info">
                  <h3>Hosted by {car.lender?.name}</h3>
                  <p>
                    ★ 5.0 • {car.lender?.totalTrips || 0} trips • Joined{" "}
                    {new Date(
                      car.lender?.createdAt || Date.now(),
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  className="contact-host-btn desktop-only"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageCircle size={18} />
                  <span>Message Host</span>
                </button>
              </div>

              <div className="location-map-section">
                <h2>Location</h2>
                <p className="location-address">{car.locationCity}</p>
                <Map
                  center={[car.latitude || 51.505, car.longitude || -0.09]}
                  zoom={14}
                  markerTitle={car.title}
                  address={car.locationCity}
                />
              </div>
            </div>

            {/* Booking Widget */}
            <div className="booking-widget-container">
              <div className="booking-widget glass sticky">
                <div className="widget-header">
                  <div className="widget-price">
                    <span className="price">${car.pricePerDay}</span>
                    <span className="unit">/ day</span>
                  </div>
                </div>

                <div className="widget-form">
                  <div className="form-group-combined">
                    <div className="date-input">
                      <label>Pickup</label>
                      <input
                        type="date"
                        value={dates.startDate}
                        onChange={(e) =>
                          setDates({ ...dates, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="date-input">
                      <label>Return</label>
                      <input
                        type="date"
                        value={dates.endDate}
                        onChange={(e) =>
                          setDates({ ...dates, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="price-breakdown">
                  <div className="breakdown-item">
                    <span>Daily Rate</span>
                    <span>${car.pricePerDay}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Service Fee</span>
                    <span>$65</span>
                  </div>
                  <div className="breakdown-total">
                    <span>Total Est.</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>

                <button
                  className="btn-primary w-full"
                  onClick={handleReserve}
                  disabled={bookingMutation.isPending}
                >
                  {bookingMutation.isPending ? "Processing..." : "Reserve Now"}
                </button>
                <p className="widget-hint">Selection of dates required</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Popup */}
      {isChatOpen && car && (
        <ChatWindow
          carId={car.id}
          lenderId={car.lenderId}
          lenderName={car.lender?.name || "Host"}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
};

export default CarDetails;

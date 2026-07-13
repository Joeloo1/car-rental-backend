import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/user.service";
import { carService } from "../../services/car.service";
import { Car as CarIcon, Star, Loader2, CheckCircle2 } from "@/lib/icons";
import CarCard from "../../components/ui/CarCard";

const LenderProfilePage: React.FC = () => {
  const { lenderId } = useParams<{ lenderId: string }>();

  const { data: lender, isLoading: lenderLoading, isError } = useQuery({
    queryKey: ["lender-profile", lenderId],
    queryFn: () => userService.getPublicLenderProfile(lenderId!),
    enabled: !!lenderId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: cars = [], isLoading: carsLoading } = useQuery({
    queryKey: ["lender-cars-public", lenderId],
    queryFn: () => carService.getByLender(lenderId!),
    enabled: !!lenderId,
    staleTime: 5 * 60 * 1000,
  });

  const carsArr = Array.isArray(cars) ? cars : (cars as any)?.cars ?? [];

  if (lenderLoading || carsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <Loader2 size={24} className="animate-spin text-ink-tertiary" />
      </div>
    );
  }

  if (isError || !lender) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center">
          <p className="text-ink-tertiary mb-4">Host not found.</p>
          <Link to="/browse" className="text-gold hover:underline text-sm">Browse cars</Link>
        </div>
      </div>
    );
  }

  const memberSince = new Date(lender.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: "var(--color-bg)" }}>
      <div className="container max-w-5xl">

        {/* Host header card */}
        <div
          className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border border-[#1c1c1c]"
          style={{ background: "var(--color-surface-2)" }}
        >
          {lender.profileImage ? (
            <img
              src={lender.profileImage}
              alt={lender.name}
              className="w-20 h-20 rounded-full object-cover border-2 flex-shrink-0"
              style={{ borderColor: "rgba(212,151,42,0.35)" }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)" }}
            >
              {lender.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-heading font-bold text-ink-primary">{lender.name}</h1>
              <CheckCircle2 size={16} className="text-gold flex-shrink-0" />
            </div>
            <p className="text-sm text-ink-tertiary mb-4">Member since {memberSince}</p>

            <div className="flex flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(212,151,42,0.10)", border: "1px solid rgba(212,151,42,0.20)" }}>
                  <CarIcon size={14} className="text-gold" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-primary">{lender.totalCars}</p>
                  <p className="text-[10px] text-ink-tertiary">Vehicles listed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(74,142,232,0.10)", border: "1px solid rgba(74,142,232,0.20)" }}>
                  <Star size={14} className="text-teal" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-primary">{lender.completedTrips}</p>
                  <p className="text-[10px] text-ink-tertiary">Trips completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-ink-primary">
            {lender.name?.split(" ")[0]}&apos;s Vehicles
          </h2>
          <span className="text-sm text-ink-tertiary">{carsArr.length} listing{carsArr.length !== 1 ? "s" : ""}</span>
        </div>

        {carsArr.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-[#252525]" style={{ background: "var(--color-surface-1)" }}>
            <CarIcon size={36} className="mx-auto text-ink-tertiary mb-3 opacity-30" />
            <p className="text-ink-tertiary text-sm">No active listings at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {carsArr.map((car: any) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LenderProfilePage;

import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { carService } from "../services/car.service";
import { getImageUrl } from "../utils/image";
import {
  Star, ArrowLeft, CheckCircle2, XCircle,
} from "@/lib/icons";
import type { Car } from "../types/index";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=60&w=600";

interface RowProps {
  label: string;
  values: (string | number | undefined | null)[];
}
const Row: React.FC<RowProps> = ({ label, values }) => (
  <tr className="border-b border-[#1c1c1c] group">
    <td
      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
      style={{ color: "var(--color-text-muted)", width: "140px" }}
    >
      {label}
    </td>
    {values.map((v, i) => (
      <td
        key={i}
        className="px-4 py-3 text-sm font-medium text-center"
        style={{ color: v ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
      >
        {v ?? <span className="opacity-30">—</span>}
      </td>
    ))}
  </tr>
);

const ComparePage: React.FC = () => {
  const [params] = useSearchParams();
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean).slice(0, 4);

  const results = useQueries({
    queries: ids.map(id => ({
      queryKey: ["car", id],
      queryFn: () => carService.getById(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const cars: Car[] = results
    .map(r => r.data)
    .filter((c): c is Car => !!c);

  const isLoading = results.some(r => r.isLoading);

  if (!ids.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: "var(--color-bg)" }}>
        <p className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>No cars selected for comparison</p>
        <Link to="/browse" className="text-sm font-semibold" style={{ color: "var(--color-gold)" }}>
          ← Back to browse
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/browse"
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseOver={e => (e.currentTarget.style.color = "var(--color-gold)")}
            onMouseOut={e  => (e.currentTarget.style.color = "var(--color-text-secondary)")}
          >
            <ArrowLeft size={15} /> Back to browse
          </Link>
          <div
            className="h-4 w-px"
            style={{ background: "var(--color-border)" }}
          />
          <h1
            className="font-heading font-bold"
            style={{ fontSize: "clamp(20px, 3vw, 26px)", color: "var(--color-text-primary)" }}
          >
            Comparing {cars.length} car{cars.length !== 1 ? "s" : ""}
          </h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(255,255,255,0.12)", borderTopColor: "var(--color-gold)" }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#1c1c1c]" style={{ background: "var(--color-surface)" }}>
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-[#1c1c1c]">
                  {/* Label column header */}
                  <th className="px-4 py-4 text-left" style={{ width: "140px" }} />
                  {cars.map(car => {
                    const imgSrc = car.images?.[0]?.imageUrl
                      ? getImageUrl(car.images[0].imageUrl, 400)
                      : PLACEHOLDER;
                    return (
                      <th key={car.id} className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-full max-w-[160px] h-28 rounded-xl overflow-hidden mx-auto">
                            <img src={imgSrc} alt={car.brand} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-heading font-bold text-base leading-tight" style={{ color: "var(--color-text-primary)" }}>
                              {car.brand} {car.model}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                              {car.year}
                            </p>
                          </div>
                          <Link
                            to={`/car/${car.id}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            style={{
                              background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
                              color: "#000",
                            }}
                          >
                            View details
                          </Link>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Price */}
                <tr className="border-b border-[#1c1c1c] bg-[rgba(212,151,42,0.03)]">
                  <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    Price / Day
                  </td>
                  {cars.map(car => (
                    <td key={car.id} className="px-4 py-3 text-center">
                      <span className="font-price font-bold text-xl" style={{ color: "var(--color-gold)" }}>
                        ${car.pricePerDay}
                      </span>
                    </td>
                  ))}
                </tr>

                <Row label="Location" values={cars.map(c => c.locationCity)} />
                <Row label="Category" values={cars.map(c => c.category?.name)} />
                <Row label="Fuel type" values={cars.map(c => c.fuelType)} />
                <Row label="Transmission" values={cars.map(c => c.transmission)} />
                <Row label="Seats" values={cars.map(c => c.seats)} />
                <Row label="Top speed" values={cars.map(c => c.topSpeed ? `${c.topSpeed} km/h` : null)} />
                <Row label="0–100 km/h" values={cars.map(c => c.acceleration)} />
                <Row label="Engine" values={cars.map(c => c.enginePower)} />

                {/* Rating */}
                <tr className="border-b border-[#1c1c1c]">
                  <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    Rating
                  </td>
                  {cars.map(car => (
                    <td key={car.id} className="px-4 py-3 text-center">
                      {car.averageRating && car.averageRating > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--color-gold)" }}>
                          <Star size={13} fill="var(--color-gold)" />
                          {car.averageRating.toFixed(1)}
                          <span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>
                            ({car.totalReviews})
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs italic" style={{ color: "var(--color-text-muted)" }}>No reviews</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Availability */}
                <tr>
                  <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    Available
                  </td>
                  {cars.map(car => (
                    <td key={car.id} className="px-4 py-3 text-center">
                      {car.availabilityStatus === "available" ? (
                        <CheckCircle2 size={18} className="mx-auto text-green" />
                      ) : (
                        <XCircle size={18} className="mx-auto text-red" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;

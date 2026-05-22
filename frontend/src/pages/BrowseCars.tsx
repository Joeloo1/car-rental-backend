import React, { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Car as CarIcon,
  MapPin,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { carService } from "../services/car.service.ts";
import { categoryService } from "../services/category.service.ts";
import { useDebounce } from "../hooks/useDebounce.ts";
import { useFavorites } from "../hooks/useFavorites.ts";
import CarCard from "../components/ui/CarCard.tsx";
import type { Car } from "../types";

// ── Filter section component (used in both sidebar and mobile panel) ──────────
interface FilterPanelProps {
  minPrice: number | "";
  maxPrice: number | "";
  fuelType: string;
  transmission: string;
  seats: number | "";
  sortBy: string;
  locationCity: string;
  onMinPrice: (v: number | "") => void;
  onMaxPrice: (v: number | "") => void;
  onFuelType: (v: string) => void;
  onTransmission: (v: string) => void;
  onSeats: (v: number | "") => void;
  onSortBy: (v: string) => void;
  onLocationCity: (v: string) => void;
  onClear: () => void;
  hasActive: boolean;
  compact?: boolean;
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="pb-5 border-b border-white/5 last:border-0 last:pb-0">
    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{title}</p>
    {children}
  </div>
);

const SelectField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      className="w-full bg-black/30 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/40 appearance-none transition-colors pr-8"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#111115]">
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={14}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
    />
  </div>
);

const FiltersPanel: React.FC<FilterPanelProps> = ({
  minPrice,
  maxPrice,
  fuelType,
  transmission,
  seats,
  sortBy,
  locationCity,
  onMinPrice,
  onMaxPrice,
  onFuelType,
  onTransmission,
  onSeats,
  onSortBy,
  onLocationCity,
  onClear,
  hasActive,
}) => (
  <div className="space-y-5">
    {hasActive && (
      <button
        onClick={onClear}
        className="w-full flex items-center justify-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-semibold py-2 rounded-xl bg-blue-500/5 border border-blue-500/15 hover:bg-blue-500/10 transition-all"
      >
        <X size={12} />
        Clear all filters
      </button>
    )}

    <FilterSection title="Price / Day">
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min $"
          className="w-full bg-black/30 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-colors"
          value={minPrice}
          onChange={(e) => onMinPrice(e.target.value ? Number(e.target.value) : "")}
        />
        <span className="text-gray-600 flex-shrink-0">—</span>
        <input
          type="number"
          placeholder="Max $"
          className="w-full bg-black/30 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-colors"
          value={maxPrice}
          onChange={(e) => onMaxPrice(e.target.value ? Number(e.target.value) : "")}
        />
      </div>
    </FilterSection>

    <FilterSection title="Fuel Type">
      <SelectField
        value={fuelType}
        onChange={onFuelType}
        options={[
          { value: "", label: "Any Fuel" },
          { value: "Petrol", label: "Petrol" },
          { value: "Diesel", label: "Diesel" },
          { value: "Electric", label: "Electric" },
          { value: "Hybrid", label: "Hybrid" },
        ]}
      />
    </FilterSection>

    <FilterSection title="Transmission">
      <SelectField
        value={transmission}
        onChange={onTransmission}
        options={[
          { value: "", label: "Any" },
          { value: "Automatic", label: "Automatic" },
          { value: "Manual", label: "Manual" },
        ]}
      />
    </FilterSection>

    <FilterSection title="Seats">
      <SelectField
        value={String(seats)}
        onChange={(v) => onSeats(v ? Number(v) : "")}
        options={[
          { value: "", label: "Any" },
          { value: "2", label: "2 Seats" },
          { value: "4", label: "4 Seats" },
          { value: "5", label: "5 Seats" },
          { value: "7", label: "7+ Seats" },
        ]}
      />
    </FilterSection>

    <FilterSection title="City">
      <SelectField
        value={locationCity}
        onChange={onLocationCity}
        options={[
          { value: "", label: "Any City" },
          { value: "Lagos", label: "Lagos" },
          { value: "Abuja", label: "Abuja" },
          { value: "Lekki", label: "Lekki" },
          { value: "Ikeja", label: "Ikeja" },
          { value: "Victoria Island", label: "Victoria Island" },
          { value: "Port Harcourt", label: "Port Harcourt" },
          { value: "Ibadan", label: "Ibadan" },
          { value: "Kano", label: "Kano" },
          { value: "Enugu", label: "Enugu" },
        ]}
      />
    </FilterSection>

    <FilterSection title="Sort By">
      <SelectField
        value={sortBy}
        onChange={onSortBy}
        options={[
          { value: "createdAt", label: "Newest First" },
          { value: "pricePerDay", label: "Price: Low → High" },
          { value: "averageRating", label: "Top Rated" },
        ]}
      />
    </FilterSection>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const BrowseCars: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [seats, setSeats] = useState<number | "">("");
  const [locationCity, setLocationCity] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedMinPrice = useDebounce(minPrice, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);

  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialCategory = params.get("category");
    if (categories && initialCategory) {
      const matched = categories.find(
        (c) => c.name.toLowerCase() === initialCategory.toLowerCase(),
      );
      if (matched) setSelectedCategory(matched.id);
    }
  }, [categories, location.search]);

  const { data: carsData, isLoading } = useQuery({
    queryKey: [
      "cars",
      debouncedSearch,
      selectedCategory,
      debouncedMinPrice,
      debouncedMaxPrice,
      sortBy,
      fuelType,
      transmission,
      seats,
      locationCity,
    ],
    queryFn: () =>
      carService.getAll({
        brand: debouncedSearch,
        categoryId: selectedCategory || undefined,
        minPrice: debouncedMinPrice || undefined,
        maxPrice: debouncedMaxPrice || undefined,
        fuelType: fuelType || undefined,
        transmission: transmission || undefined,
        seats: seats || undefined,
        locationCity: locationCity || undefined,
        sortBy,
      }),
    placeholderData: keepPreviousData,
  });

  const cars: Car[] = Array.isArray(carsData)
    ? carsData
    : (carsData as any)?.data?.cars || (carsData as any)?.cars || [];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setMinPrice("");
    setMaxPrice("");
    setFuelType("");
    setTransmission("");
    setSeats("");
    setLocationCity("");
    setSortBy("createdAt");
  };

  const hasActiveFilters =
    !!(searchTerm || selectedCategory || minPrice !== "" || maxPrice !== "" ||
    fuelType || transmission || seats !== "" || locationCity);

  const filterProps = {
    minPrice,
    maxPrice,
    fuelType,
    transmission,
    seats,
    sortBy,
    locationCity,
    onMinPrice: setMinPrice,
    onMaxPrice: setMaxPrice,
    onFuelType: setFuelType,
    onTransmission: setTransmission,
    onSeats: setSeats,
    onSortBy: setSortBy,
    onLocationCity: setLocationCity,
    onClear: clearFilters,
    hasActive: hasActiveFilters,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans relative overflow-hidden">

      {/* ── Hero banner ──────────────────────────────────────────────────────── */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1800"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/70 via-[#0a0a0b]/50 to-[#0a0a0b]" />
        <div className="absolute inset-0 bg-blue-900/15" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold mb-4"
          >
            <MapPin size={12} />
            Premium vehicles from verified hosts
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-display font-bold mb-2"
          >
            Browse Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Collection
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-sm max-w-md"
          >
            Find and book the perfect vehicle for your next journey
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl pt-6 pb-20">

        {/* ── Category tabs ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-x-auto hide-scrollbar"
        >
          <div className="flex gap-2 pb-1 justify-start md:justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all border text-sm flex-shrink-0 ${
                selectedCategory === null
                  ? "bg-blue-500/20 border-blue-500/60 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              All Vehicles
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all border text-sm flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-blue-500/20 border-blue-500/60 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Main layout: sidebar + content ───────────────────────────────── */}
        <div className="flex gap-6 items-start">

          {/* Desktop filter sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-28"
          >
            <div className="p-5 rounded-2xl bg-[#111115] border border-white/8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-blue-400" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                    Active
                  </span>
                )}
              </div>
              <FiltersPanel {...filterProps} />
            </div>
          </motion.aside>

          {/* Right side content */}
          <div className="flex-1 min-w-0">

            {/* Search bar + mobile filter button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="flex gap-3 mb-4"
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search by brand or model…"
                  className="w-full bg-[#111115] border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40 transition-colors text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className={`lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all flex-shrink-0 border ${
                  isMobileFilterOpen || hasActiveFilters
                    ? "bg-blue-500/20 border-blue-500/60 text-blue-400"
                    : "bg-[#111115] border-white/8 text-gray-300 hover:text-white"
                }`}
              >
                <SlidersHorizontal size={16} />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                )}
              </button>
            </motion.div>

            {/* Mobile filter panel */}
            <AnimatePresence>
              {isMobileFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden lg:hidden mb-5"
                >
                  <div className="p-5 rounded-2xl bg-[#111115] border border-white/8">
                    <FiltersPanel {...filterProps} />
                    <div className="mt-5 pt-4 border-t border-white/5">
                      <button
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results count */}
            {!isLoading && (
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-400">
                  {cars.length === 0 ? (
                    "No vehicles found"
                  ) : (
                    <>
                      <span className="text-white font-semibold">{cars.length}</span>{" "}
                      vehicle{cars.length !== 1 ? "s" : ""} available
                    </>
                  )}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
                  >
                    <X size={12} />
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Car grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : cars.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/5"
              >
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
                  <CarIcon size={36} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No vehicles found</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                  Try adjusting your filters or search terms to find the perfect vehicle.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 font-semibold text-sm hover:bg-blue-500/25 transition-all"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {cars.map((car, index) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    index={index}
                    isFavorite={isFavorite(String(car.id))}
                    onFavorite={() => toggleFavorite(String(car.id))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Content-shaped skeleton so users see familiar proportions while data loads
const CarCardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-[#111115] border border-white/8 overflow-hidden animate-pulse">
    <div className="h-52 bg-white/5" />
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded-lg bg-white/8" />
          <div className="h-3.5 w-1/2 rounded-lg bg-white/5" />
        </div>
        <div className="h-8 w-16 rounded-lg bg-white/5" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-white/5" />
        ))}
      </div>
      <div className="h-4 w-1/2 rounded-full bg-white/5" />
      <div className="h-px bg-white/5" />
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-20 rounded-lg bg-white/8" />
          <div className="h-3 w-28 rounded-full bg-white/5" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-white/8" />
      </div>
    </div>
  </div>
);

export default BrowseCars;

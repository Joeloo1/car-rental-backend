import React, { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Search, SlidersHorizontal, Car as CarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { carService } from "../services/car.service.ts";
import { categoryService } from "../services/category.service.ts";
import { useDebounce } from "../hooks/useDebounce.ts";
import { useFavorites } from "../hooks/useFavorites.ts";
import CarCard from "../components/ui/CarCard.tsx";
import type { Car } from "../types";

const BrowseCars: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [seats, setSeats] = useState<number | "">("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedMinPrice = useDebounce(minPrice, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);

  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: Infinity,   // categories almost never change
    gcTime: Infinity,
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialCategoryName = searchParams.get("category");
    if (categories && initialCategoryName) {
      const matched = categories.find(
        (c) => c.name.toLowerCase() === initialCategoryName.toLowerCase(),
      );
      if (matched) setSelectedCategory(matched.id);
    }
  }, [categories, location.search]);

  const { data: carsData, isLoading } = useQuery({
    queryKey: [
      "cars",
      debouncedSearchTerm,
      selectedCategory,
      debouncedMinPrice,
      debouncedMaxPrice,
      sortBy,
      fuelType,
      transmission,
      seats,
    ],
    queryFn: () =>
      carService.getAll({
        brand: debouncedSearchTerm,
        categoryId: selectedCategory || undefined,
        minPrice: debouncedMinPrice || undefined,
        maxPrice: debouncedMaxPrice || undefined,
        fuelType: fuelType || undefined,
        transmission: transmission || undefined,
        seats: seats || undefined,
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
    setSortBy("createdAt");
  };

  const hasActiveFilters =
    searchTerm || selectedCategory || minPrice !== "" || maxPrice !== "" ||
    fuelType || transmission || seats !== "";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-20 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-900/15 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Browse Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Collection
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover premium vehicles from our exclusive host network. Filter to
            find your perfect match.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar justify-start md:justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-all border text-sm flex-shrink-0 ${
                selectedCategory === null
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              All Vehicles
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-all border text-sm flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row gap-3 items-stretch p-3 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-xl">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by brand or model…"
                className="w-full bg-black/20 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40 transition-colors text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all flex-shrink-0 ${
                isFilterOpen || hasActiveFilters
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/8 border border-white/10 text-gray-300 hover:bg-white/15 hover:text-white"
              }`}
            >
              <SlidersHorizontal size={18} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Expandable Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-1.5 lg:col-span-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Price / Day
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min $"
                        className="w-full bg-black/20 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-colors"
                        value={minPrice}
                        onChange={(e) =>
                          setMinPrice(e.target.value ? Number(e.target.value) : "")
                        }
                      />
                      <span className="text-gray-600">—</span>
                      <input
                        type="number"
                        placeholder="Max $"
                        className="w-full bg-black/20 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-colors"
                        value={maxPrice}
                        onChange={(e) =>
                          setMaxPrice(e.target.value ? Number(e.target.value) : "")
                        }
                      />
                    </div>
                  </div>

                  {[
                    {
                      label: "Fuel Type",
                      value: fuelType,
                      onChange: setFuelType,
                      options: [
                        { value: "", label: "Any Fuel" },
                        { value: "Petrol", label: "Petrol" },
                        { value: "Diesel", label: "Diesel" },
                        { value: "Electric", label: "Electric" },
                        { value: "Hybrid", label: "Hybrid" },
                      ],
                    },
                    {
                      label: "Transmission",
                      value: transmission,
                      onChange: setTransmission,
                      options: [
                        { value: "", label: "Any Transmission" },
                        { value: "Automatic", label: "Automatic" },
                        { value: "Manual", label: "Manual" },
                      ],
                    },
                    {
                      label: "Seats",
                      value: String(seats),
                      onChange: (v: string) => setSeats(v ? Number(v) : ""),
                      options: [
                        { value: "", label: "Any Seats" },
                        { value: "2", label: "2 Seats" },
                        { value: "4", label: "4 Seats" },
                        { value: "5", label: "5 Seats" },
                        { value: "7", label: "7+ Seats" },
                      ],
                    },
                    {
                      label: "Sort By",
                      value: sortBy,
                      onChange: setSortBy,
                      options: [
                        { value: "createdAt", label: "Newest First" },
                        { value: "pricePerDay", label: "Price: Low → High" },
                        { value: "averageRating", label: "Top Rated" },
                      ],
                    },
                  ].map((field) => (
                    <div key={field.label} className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {field.label}
                      </label>
                      <select
                        className="w-full bg-black/20 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/40 appearance-none transition-colors"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#111115]">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-end gap-3 border-t border-white/5 pt-5">
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all"
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <p className="text-sm text-gray-400">
              {cars.length === 0
                ? "No vehicles found"
                : (
                  <>
                    <span className="text-white font-semibold">{cars.length}</span>{" "}
                    vehicle{cars.length !== 1 ? "s" : ""} available
                  </>
                )}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        )}

        {/* Car Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <h3 className="text-xl font-bold text-white mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Try adjusting your filters or search terms to find the perfect
              vehicle.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 font-semibold text-sm hover:bg-blue-500/25 transition-all"
            >
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
};

// Content-shaped skeleton so users see familiar proportions while data loads
const CarCardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-[#111115] border border-white/8 overflow-hidden animate-pulse">
    {/* image area */}
    <div className="h-56 bg-white/5" />
    {/* content */}
    <div className="p-5 space-y-4">
      {/* title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded-lg bg-white/8" />
          <div className="h-3.5 w-1/2 rounded-lg bg-white/5" />
        </div>
        <div className="h-8 w-16 rounded-lg bg-white/5" />
      </div>
      {/* specs */}
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-14 rounded-lg bg-white/5" />
        ))}
      </div>
      {/* location */}
      <div className="h-4 w-1/2 rounded-full bg-white/5" />
      {/* divider */}
      <div className="h-px bg-white/5" />
      {/* footer */}
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

import React, { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Car as CarIcon,
  MapPin,
  X,
  LayoutGrid,
  Map as MapIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { carService } from "../services/car.service.ts";
import { categoryService } from "../services/category.service.ts";
import { useDebounce } from "../hooks/useDebounce.ts";
import { useFavorites } from "../hooks/useFavorites.ts";
import CarCard from "../components/ui/CarCard.tsx";
import { CarCardSkeleton } from "../components/ui/LoadingSkeleton.tsx";
import MapView from "../components/Browse/MapView.tsx";
import Button from "../components/ui/Button.tsx";
import Input from "../components/ui/Input.tsx";
import Select from "../components/ui/Select.tsx";
import { cn } from "../utils/cn";
import type { Car } from "../types/index";

// ── Filter section component ────────────────────────────────────────────────
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
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="space-y-3 pb-6 border-b border-border last:border-0 last:pb-0">
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
    {children}
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
  <div className="space-y-6">
    {hasActive && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="w-full text-xs text-primary"
        leftIcon={<X size={12} />}
      >
        Clear all filters
      </Button>
    )}

    <FilterSection title="Price Range / Day">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min"
          className="h-10 text-xs"
          value={minPrice}
          onChange={(e) => onMinPrice(e.target.value ? Number(e.target.value) : "")}
        />
        <span className="text-muted-foreground">—</span>
        <Input
          type="number"
          placeholder="Max"
          className="h-10 text-xs"
          value={maxPrice}
          onChange={(e) => onMaxPrice(e.target.value ? Number(e.target.value) : "")}
        />
      </div>
    </FilterSection>

    <FilterSection title="Fuel Type">
      <Select
        value={fuelType}
        onChange={(e) => onFuelType(e.target.value)}
        className="h-10 text-xs"
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
      <div className="flex gap-2">
        {["", "Automatic", "Manual"].map((type) => (
          <button
            key={type}
            onClick={() => onTransmission(type)}
            className={cn(
              "flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all",
              transmission === type
                ? "bg-primary/10 border-primary text-primary shadow-sm"
                : "bg-background border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            {type || "Any"}
          </button>
        ))}
      </div>
    </FilterSection>

    <FilterSection title="Seats">
      <Select
        value={String(seats)}
        onChange={(e) => onSeats(e.target.value ? Number(e.target.value) : "")}
        className="h-10 text-xs"
        options={[
          { value: "", label: "Any" },
          { value: "2", label: "2 Seats" },
          { value: "4", label: "4 Seats" },
          { value: "5", label: "5 Seats" },
          { value: "7", label: "7+ Seats" },
        ]}
      />
    </FilterSection>

    <FilterSection title="Location">
      <Select
        value={locationCity}
        onChange={(e) => onLocationCity(e.target.value)}
        className="h-10 text-xs"
        options={[
          { value: "", label: "Any City" },
          { value: "Lagos", label: "Lagos" },
          { value: "Abuja", label: "Abuja" },
          { value: "Port Harcourt", label: "Port Harcourt" },
          { value: "Ibadan", label: "Ibadan" },
        ]}
      />
    </FilterSection>

    <FilterSection title="Sort By">
      <Select
        value={sortBy}
        onChange={(e) => onSortBy(e.target.value)}
        className="h-10 text-xs"
        options={[
          { value: "createdAt", label: "Newest First" },
          { value: "pricePerDay", label: "Price: Low → High" },
          { value: "averageRating", label: "Top Rated" },
        ]}
      />
    </FilterSection>
  </div>
);

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
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedMinPrice = useDebounce(minPrice, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);

  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: Infinity,
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
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
      
      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1800"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-4"
          >
            <MapPin size={12} />
            Verified Hosts & Premium Vehicles
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight"
          >
            Browse Our <span className="text-primary">Collection</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-sm md:text-base max-w-lg"
          >
            From electric sedans to luxury SUVs, find the perfect match for your journey.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        
        {/* ── Toolbar: Search & View Toggle ────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by brand or model..."
              className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="bg-card border border-border rounded-2xl p-1 flex shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <LayoutGrid size={18} />
                Grid
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  viewMode === "map" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <MapIcon size={18} />
                Map
              </button>
            </div>
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              <SlidersHorizontal size={18} />
            </Button>
          </div>
        </div>

        {/* ── Category filtering ─────────────────────────────────────────── */}
        <div className="flex gap-2 mb-10 overflow-x-auto hide-scrollbar pb-2">
          <Button
            variant={selectedCategory === null ? "primary" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setSelectedCategory(null)}
          >
            All Vehicles
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "primary" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        <div className="flex gap-10 items-start">
          {/* ── Sidebar Filters (Desktop) ────────────────────────────────── */}
          <aside className="hidden lg:block w-72 sticky top-28">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <SlidersHorizontal size={20} className="text-primary" />
                  Filters
                </h3>
              </div>
              <FiltersPanel {...filterProps} />
            </div>
          </aside>

          {/* ── Main Content Area ────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filters */}
            <AnimatePresence>
              {isMobileFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden mb-8 overflow-hidden bg-card border border-border rounded-3xl p-6"
                >
                  <FiltersPanel {...filterProps} />
                  <Button className="w-full mt-6" onClick={() => setIsMobileFilterOpen(false)}>
                    Show Results
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* View Mode Content */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <CarCardSkeleton key={i} />)}
              </div>
            ) : viewMode === "map" ? (
              <MapView cars={cars} />
            ) : cars.length === 0 ? (
              <div className="text-center py-32 bg-card border border-border rounded-3xl shadow-sm">
                <CarIcon size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-display font-bold mb-2">No vehicles found</h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Try adjusting your filters or search terms to find the perfect vehicle.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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

export default BrowseCars;

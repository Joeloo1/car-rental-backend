import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { carService } from "../services/car.service.ts";
import { categoryService } from "../services/category.service.ts";
import { useDebounce } from "../hooks/useDebounce.ts";
import FeaturedCars from "../components/Landing/FeaturedCars.tsx";

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

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedMinPrice = useDebounce(minPrice, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);

  const location = useLocation();

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  // Handle URL category parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialCategoryName = searchParams.get("category");

    // We can also initialize search from location param if we wanted.

    if (categories && initialCategoryName) {
      const matched = categories.find(
        (c) => c.name.toLowerCase() === initialCategoryName.toLowerCase(),
      );
      if (matched) {
        setSelectedCategory(matched.id);
      }
    }
  }, [categories, location.search]);

  // Fetch cars with filters
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
  });

  const cars = Array.isArray(carsData)
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

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 pb-20 font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Browse Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Collection</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover premium vehicles from our exclusive host network. Use the filters below to find the perfect match for your journey.
          </p>
        </motion.div>

        {/* Search & Categories */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <div className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar mb-6 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all border ${
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
                className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id 
                  ? "bg-blue-500/20 border-blue-500 text-blue-400" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="relative w-full flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by brand (e.g. Porsche)..."
                className="w-full bg-black/20 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all ${
                isFilterOpen ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <SlidersHorizontal size={20} />
              Filters
            </button>
          </div>
        </motion.div>

        {/* Expanding Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-sm font-medium text-gray-400">Price Range / Day</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Fuel Type</label>
                    <select
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                    >
                      <option value="" className="bg-[#111115]">Any Fuel</option>
                      <option value="Petrol" className="bg-[#111115]">Petrol</option>
                      <option value="Diesel" className="bg-[#111115]">Diesel</option>
                      <option value="Electric" className="bg-[#111115]">Electric</option>
                      <option value="Hybrid" className="bg-[#111115]">Hybrid</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Transmission</label>
                    <select
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                    >
                      <option value="" className="bg-[#111115]">Any Transmission</option>
                      <option value="Automatic" className="bg-[#111115]">Automatic</option>
                      <option value="Manual" className="bg-[#111115]">Manual</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Seats</label>
                    <select
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="" className="bg-[#111115]">Any Seats</option>
                      <option value="2" className="bg-[#111115]">2 Seats</option>
                      <option value="4" className="bg-[#111115]">4 Seats</option>
                      <option value="5" className="bg-[#111115]">5 Seats</option>
                      <option value="7" className="bg-[#111115]">7+ Seats</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Sort By</label>
                    <select
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="createdAt" className="bg-[#111115]">Newest Arrivals</option>
                      <option value="pricePerDay" className="bg-[#111115]">Price: Low to High</option>
                      <option value="averageRating" className="bg-[#111115]">Top Rated</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
                  <button onClick={clearFilters} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FeaturedCars
          cars={cars}
          isLoading={isLoading}
          title=""
          subtitle=""
        />
      </div>
    </div>
  );
};

export default BrowseCars;

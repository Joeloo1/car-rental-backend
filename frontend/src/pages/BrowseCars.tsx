import React, { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { carService } from "../services/car.service";
import { categoryService } from "../services/category.service";
import { useDebounce } from "../hooks/useDebounce";
import { useFavorites } from "../hooks/useFavorites";
import CarCard from "../components/ui/CarCard";
import type { Car } from "../types/index";

interface Filters {
  minPrice:     number | "";
  maxPrice:     number | "";
  fuelType:     string;
  transmission: string;
  seats:        number | "";
  sortBy:       string;
  locationCity: string;
  categoryId:   number | null;
}

const INITIAL_FILTERS: Filters = {
  minPrice: "", maxPrice: "", fuelType: "", transmission: "",
  seats: "", sortBy: "createdAt", locationCity: "", categoryId: null,
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-bold text-ink-tertiary uppercase tracking-[0.12em] mb-2.5">
    {children}
  </p>
);

const CardSkeleton: React.FC = () => (
  <div>
    <div className="skeleton rounded-2xl aspect-[16/10] mb-3.5" />
    <div className="skeleton h-4 w-3/4 rounded mb-2" />
    <div className="skeleton h-3 w-1/2 rounded" />
  </div>
);

const BrowseCars: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [search,      setSearch]      = useState("");
  const [filters,     setFilters]     = useState<Filters>(INITIAL_FILTERS);
  const [page,        setPage]        = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const debouncedSearch  = useDebounce(search, 400);
  const debouncedFilters = useDebounce(filters, 300);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: Infinity,
  });

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const cityParam = p.get("locationCity");
    const catParam  = p.get("category");
    if (cityParam || catParam) {
      setFilters(prev => ({
        ...prev,
        ...(cityParam ? { locationCity: cityParam } : {}),
      }));
      if (catParam && categories) {
        const match = categories.find(c => c.name.toLowerCase() === catParam.toLowerCase());
        if (match) setFilters(prev => ({ ...prev, categoryId: match.id }));
      }
    }
  }, [categories, location.search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, debouncedFilters]);

  const { data: carsData, isLoading, isFetching, isError } = useQuery({
    queryKey: ["cars", debouncedSearch, debouncedFilters, page],
    queryFn: () =>
      carService.getAll({
        brand:        debouncedSearch || undefined,
        categoryId:   debouncedFilters.categoryId || undefined,
        minPrice:     debouncedFilters.minPrice || undefined,
        maxPrice:     debouncedFilters.maxPrice || undefined,
        fuelType:     debouncedFilters.fuelType || undefined,
        transmission: debouncedFilters.transmission || undefined,
        seats:        debouncedFilters.seats || undefined,
        locationCity: debouncedFilters.locationCity || undefined,
        sortBy:       debouncedFilters.sortBy,
        page,
        limit: 12,
      }),
    placeholderData: keepPreviousData,
  });

  const cars: Car[] = carsData?.cars ?? [];
  const pagination  = carsData?.pagination;
  const totalPages  = pagination?.totalPages ?? 1;
  const totalCount  = pagination?.total ?? 0;

  const hasActiveFilters =
    !!(search || filters.categoryId || filters.minPrice !== "" ||
       filters.maxPrice !== "" || filters.fuelType || filters.transmission ||
       filters.seats !== "" || filters.locationCity);

  const clearFilters = () => {
    setSearch("");
    setFilters(INITIAL_FILTERS);
    setPage(1);
    navigate("/browse", { replace: true });
  };

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  // ── Active filter chips ───────────────────────────────────────────────────
  const activeChips: { label: string; clear: () => void }[] = [];
  if (filters.categoryId && categories) {
    const cat = categories.find(c => c.id === filters.categoryId);
    if (cat) activeChips.push({ label: cat.name, clear: () => setFilter("categoryId", null) });
  }
  if (filters.locationCity) activeChips.push({ label: `📍 ${filters.locationCity}`, clear: () => setFilter("locationCity", "") });
  if (filters.minPrice !== "" || filters.maxPrice !== "") {
    const label = filters.minPrice !== "" && filters.maxPrice !== ""
      ? `$${filters.minPrice}–$${filters.maxPrice}`
      : filters.minPrice !== "" ? `From $${filters.minPrice}` : `Up to $${filters.maxPrice}`;
    activeChips.push({ label, clear: () => setFilters(p => ({ ...p, minPrice: "", maxPrice: "" })) });
  }
  if (filters.transmission) activeChips.push({ label: filters.transmission, clear: () => setFilter("transmission", "") });
  if (filters.fuelType)     activeChips.push({ label: filters.fuelType,     clear: () => setFilter("fuelType", "") });
  if (filters.seats !== "") activeChips.push({ label: `${filters.seats}+ seats`, clear: () => setFilter("seats", "") });

  // ── Filter panel ──────────────────────────────────────────────────────────
  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      {(categories?.length ?? 0) > 0 && (
        <div>
          <SectionLabel>Category</SectionLabel>
          <div className="space-y-0.5">
            <button
              onClick={() => setFilter("categoryId", null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all border-l-2 ${
                !filters.categoryId
                  ? "border-blue text-ink-primary bg-blue/[0.08] pl-3"
                  : "border-transparent text-ink-tertiary hover:text-ink-secondary hover:bg-surface-2"
              }`}
            >
              All vehicles
            </button>
            {categories!.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter("categoryId", cat.id === filters.categoryId ? null : cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all border-l-2 ${
                  filters.categoryId === cat.id
                    ? "border-blue text-ink-primary bg-blue/[0.08]"
                    : "border-transparent text-ink-tertiary hover:text-ink-secondary hover:bg-surface-2"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[#1c1c1c]" />

      {/* Price per day */}
      <div>
        <SectionLabel>Price per day</SectionLabel>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-tertiary pointer-events-none">$</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={e => setFilter("minPrice", e.target.value ? Number(e.target.value) : "")}
              className="input-base pl-6 text-sm"
              min={0}
            />
          </div>
          <span className="text-ink-disabled text-sm flex-shrink-0">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-tertiary pointer-events-none">$</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={e => setFilter("maxPrice", e.target.value ? Number(e.target.value) : "")}
              className="input-base pl-6 text-sm"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Transmission */}
      <div>
        <SectionLabel>Transmission</SectionLabel>
        <div className="flex gap-1.5">
          {(["", "Automatic", "Manual"] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter("transmission", filters.transmission === t ? "" : t)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                filters.transmission === t
                  ? "bg-surface-3 border-[#333] text-ink-primary"
                  : "border-[#222] text-ink-tertiary hover:border-[#2e2e2e] hover:text-ink-secondary"
              }`}
            >
              {t || "Any"}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel type */}
      <div>
        <SectionLabel>Fuel type</SectionLabel>
        <select
          value={filters.fuelType}
          onChange={e => setFilter("fuelType", e.target.value)}
          className="input-base text-sm"
        >
          <option value="">Any fuel type</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      {/* Seats */}
      <div>
        <SectionLabel>Seats</SectionLabel>
        <div className="flex gap-1.5 flex-wrap">
          {(["", "2", "4", "5", "7"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter("seats", s ? Number(s) : "")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                String(filters.seats) === s
                  ? "bg-surface-3 border-[#333] text-ink-primary"
                  : "border-[#222] text-ink-tertiary hover:border-[#2e2e2e] hover:text-ink-secondary"
              }`}
            >
              {s || "Any"}{s === "7" ? "+" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <SectionLabel>City</SectionLabel>
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="e.g. Lagos, Abuja"
            value={filters.locationCity}
            onChange={e => setFilter("locationCity", e.target.value)}
            className="input-base pl-8 text-sm"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <div className="border-t border-[#1c1c1c]" />
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-red hover:text-red/80 transition-colors"
          >
            <X size={13} /> Clear all filters
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] pt-14">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-[#161616] bg-[#080808]/80 backdrop-blur-sm sticky top-14 z-20">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
              <input
                type="text"
                placeholder="Search brand or model…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base pl-10 pr-3 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-primary transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end">
              {/* Result count */}
              {!isLoading && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-1 border border-[#1c1c1c] text-xs font-medium text-ink-secondary whitespace-nowrap">
                  {totalCount.toLocaleString()} vehicle{totalCount !== 1 ? "s" : ""}
                  {isFetching && <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />}
                </span>
              )}

              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={e => setFilter("sortBy", e.target.value)}
                className="input-base text-sm w-auto"
              >
                <option value="createdAt">Newest first</option>
                <option value="pricePerDay">Price: low → high</option>
                <option value="averageRating">Top rated</option>
              </select>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(v => !v)}
                className={`sm:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  sidebarOpen || hasActiveFilters
                    ? "bg-surface-3 border-[#333] text-ink-primary"
                    : "bg-surface-1 border-[#1c1c1c] text-ink-secondary"
                }`}
              >
                <SlidersHorizontal size={14} />
                Filters
                {hasActiveFilters && (
                  <span className="w-4 h-4 rounded-full bg-blue text-white text-[9px] font-bold flex items-center justify-center">
                    {activeChips.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {activeChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={chip.clear}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-[#282828] text-xs font-medium text-ink-secondary hover:border-[#333] hover:text-ink-primary transition-all group"
                >
                  {chip.label}
                  <X size={11} className="text-ink-tertiary group-hover:text-ink-secondary" />
                </button>
              ))}
              <button
                onClick={clearFilters}
                className="px-2.5 py-1 rounded-full text-xs font-medium text-red hover:text-red/80 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="container py-7">
        <div className="flex gap-7">

          {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
          <aside className="hidden sm:block w-52 flex-shrink-0">
            <div className="sticky top-32 rounded-2xl bg-surface-1 border border-[#1c1c1c] p-5">
              <FilterPanel />
            </div>
          </aside>

          {/* ── Grid ─────────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Mobile filter drawer */}
            {sidebarOpen && (
              <div className="sm:hidden mb-5 rounded-2xl bg-surface-1 border border-[#1c1c1c] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-ink-primary">Filters</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-surface-2 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
                <FilterPanel />
              </div>
            )}

            {isError ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-[#282828] flex items-center justify-center mb-4">
                  <span className="text-2xl">!</span>
                </div>
                <h3 className="font-semibold text-[15px] text-ink-primary mb-1.5">Could not load vehicles</h3>
                <p className="text-sm text-ink-tertiary mb-5 max-w-sm">
                  The server is not responding. Make sure the backend is running and try again.
                </p>
                <button onClick={() => window.location.reload()} className="btn-secondary text-sm">
                  Retry
                </button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-10">
                {Array.from({ length: 9 }, (_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : cars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-[#282828] flex items-center justify-center mb-4">
                  <Search size={22} className="text-ink-tertiary" />
                </div>
                <h3 className="font-semibold text-[15px] text-ink-primary mb-1.5">No vehicles found</h3>
                <p className="text-sm text-ink-tertiary mb-5 max-w-sm">
                  Try broadening your search or adjusting the filters.
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-secondary text-sm">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile count */}
                <p className="sm:hidden text-xs text-ink-tertiary mb-4">
                  {totalCount.toLocaleString()} vehicle{totalCount !== 1 ? "s" : ""}
                </p>

                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-10 transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}>
                  {cars.map((car, i) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      index={i}
                      isFavorite={isFavorite(String(car.id))}
                      onFavorite={toggleFavorite}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-12 pt-6 border-t border-[#161616]">
                    <p className="text-sm text-ink-tertiary">
                      Page {page} of {totalPages}
                      <span className="hidden sm:inline text-ink-disabled"> · {totalCount.toLocaleString()} vehicles</span>
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-[#222] text-ink-tertiary hover:text-ink-primary hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                          if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "…" ? (
                            <span key={`e${i}`} className="px-2 text-ink-tertiary text-sm select-none">…</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setPage(p as number)}
                              className={`min-w-[36px] h-9 px-2.5 rounded-lg text-sm font-medium border transition-all ${
                                page === p
                                  ? "bg-surface-3 border-[#333] text-ink-primary"
                                  : "border-[#222] text-ink-tertiary hover:border-[#333] hover:text-ink-primary"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )
                      }

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border border-[#222] text-ink-tertiary hover:text-ink-primary hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Next page"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseCars;

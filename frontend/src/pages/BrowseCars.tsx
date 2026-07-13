import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, X, ChevronLeft, ChevronRight,
  MapPin, Car as CarIcon, Zap, Truck, Mountain, Briefcase,
  LayoutGrid, List, GitCompare, Clock, DollarSign, Settings,
} from "@/lib/icons";
import { carService } from "../services/car.service";
import { categoryService } from "../services/category.service";
import { useDebounce } from "../hooks/useDebounce";
import { useFavorites } from "../hooks/useFavorites";
import CarCard from "../components/ui/CarCard";
import type { Car } from "../types/index";

/* ── Category icons ─────────────────────────────────────────────────────── */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Luxury: CarIcon, SUV: Mountain, Sport: Zap, Electric: Zap,
  Sedan: CarIcon, Van: Truck, Truck: Truck, Business: Briefcase,
};

/* ── Types ──────────────────────────────────────────────────────────────── */
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

interface RecentCar {
  id: string; brand: string; model: string;
  year?: number; pricePerDay: number;
  locationCity?: string; image: string | null;
  categoryName?: string;
}

const INITIAL_FILTERS: Filters = {
  minPrice: "", maxPrice: "", fuelType: "", transmission: "",
  seats: "", sortBy: "createdAt", locationCity: "", categoryId: null,
};

const RECENT_KEY = "luxedrive_recent";

/* ── Skeleton card ───────────────────────────────────────────────────────── */
const CardSkeleton: React.FC = () => (
  <div>
    <div className="skeleton animate-shimmer rounded-2xl mb-3.5" style={{ height: "200px" }} />
    <div className="skeleton animate-shimmer h-4 w-3/4 rounded mb-2" />
    <div className="skeleton animate-shimmer h-3 w-1/2 rounded" />
  </div>
);

/* ── Empty state ─────────────────────────────────────────────────────────── */
const EmptyState: React.FC<{ hasFilters: boolean; onClear: () => void }> = ({ hasFilters, onClear }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <svg viewBox="0 0 200 130" className="w-44 mb-6" fill="none" style={{ opacity: 0.45 }}>
      <path d="M18 95L38 62L64 46H136L162 62L182 95H18Z" fill="rgba(212,151,42,0.12)" stroke="rgba(212,151,42,0.25)" strokeWidth="1.5" />
      <circle cx="54" cy="95" r="18" fill="none" stroke="rgba(212,151,42,0.30)" strokeWidth="2" />
      <circle cx="146" cy="95" r="18" fill="none" stroke="rgba(212,151,42,0.30)" strokeWidth="2" />
      <circle cx="152" cy="36" r="22" fill="none" stroke="rgba(212,151,42,0.35)" strokeWidth="2.5" />
      <line x1="167" y1="51" x2="180" y2="64" stroke="rgba(212,151,42,0.35)" strokeWidth="3" strokeLinecap="round" />
      <line x1="145" y1="29" x2="145" y2="43" stroke="rgba(212,151,42,0.20)" strokeWidth="2" strokeLinecap="round" />
      <line x1="138" y1="36" x2="152" y2="36" stroke="rgba(212,151,42,0.20)" strokeWidth="2" strokeLinecap="round" />
    </svg>
    <h3 className="font-heading font-bold text-xl mb-2" style={{ color: "var(--color-text-primary)" }}>No cars found</h3>
    <p className="text-sm max-w-xs mb-6" style={{ color: "var(--color-text-secondary)" }}>
      Try adjusting your filters or search in a different city
    </p>
    {hasFilters && (
      <button
        onClick={onClear}
        className="px-6 rounded-xl font-semibold text-sm text-black transition-all duration-[180ms] hover:brightness-110"
        style={{ height: "44px", background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))" }}
      >
        Clear all filters
      </button>
    )}
  </div>
);

/* ── Comparison sticky bar ───────────────────────────────────────────────── */
const CompareBar: React.FC<{
  compareSet: Set<string>;
  cars: Car[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}> = ({ compareSet, cars, onRemove, onClearAll }) => {
  const navigate = useNavigate();
  const selected = cars.filter(c => compareSet.has(String(c.id)));
  if (compareSet.size < 2) return null;

  const handleViewComparison = () => {
    const ids = Array.from(compareSet).join(",");
    navigate(`/compare?ids=${ids}`);
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl animate-slide-up"
      style={{
        background: "rgba(17,17,20,0.96)",
        border: "1.5px solid rgba(212,151,42,0.30)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <GitCompare size={16} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
      <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
        Comparing {compareSet.size} car{compareSet.size > 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-1.5">
        {selected.map(car => (
          <div
            key={car.id}
            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{ background: "var(--color-surface-3)", color: "var(--color-text-secondary)" }}
          >
            {car.brand} {car.model}
            <button onClick={() => onRemove(String(car.id))} className="ml-0.5 transition-colors hover:text-red-400" style={{ color: "var(--color-text-muted)" }}>
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleViewComparison}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-black"
        style={{ background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))" }}
      >
        View comparison →
      </button>
      <button
        onClick={onClearAll}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: "var(--color-text-muted)" }}
        onMouseOver={e => (e.currentTarget.style.color = "var(--color-text-primary)")}
        onMouseOut={e  => (e.currentTarget.style.color = "var(--color-text-muted)")}
      >
        <X size={14} />
      </button>
    </div>
  );
};

/* ── Pill toggle ─────────────────────────────────────────────────────────── */
const PillBtn: React.FC<{
  active: boolean; onClick: () => void; children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className="px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 flex-shrink-0"
    style={active
      ? { background: "rgba(212,151,42,0.16)", border: "1.5px solid rgba(212,151,42,0.45)", color: "var(--color-gold)" }
      : { background: "transparent", border: "1.5px solid var(--color-border)", color: "var(--color-text-muted)" }
    }
    onMouseOver={e => { if (!active) e.currentTarget.style.color = "var(--color-text-secondary)"; }}
    onMouseOut={e  => { if (!active) e.currentTarget.style.color = "var(--color-text-muted)"; }}
  >
    {children}
  </button>
);

/* ── Price dropdown ──────────────────────────────────────────────────────── */
const PriceDropdown: React.FC<{
  minPrice: number | "";
  maxPrice: number | "";
  onMin: (v: number | "") => void;
  onMax: (v: number | "") => void;
  onClose: () => void;
}> = ({ minPrice, maxPrice, onMin, onMax, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 z-30 p-4 rounded-2xl animate-fade-up"
      style={{
        width: "220px",
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-border)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--color-text-muted)" }}>Price per day</p>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--color-text-muted)" }}>$</span>
          <input
            type="number" placeholder="Min" value={minPrice}
            onChange={e => onMin(e.target.value ? Number(e.target.value) : "")}
            className="input-base pl-6 text-xs" style={{ height: "36px" }} min={0}
          />
        </div>
        <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>—</span>
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--color-text-muted)" }}>$</span>
          <input
            type="number" placeholder="Max" value={maxPrice}
            onChange={e => onMax(e.target.value ? Number(e.target.value) : "")}
            className="input-base pl-6 text-xs" style={{ height: "36px" }} min={0}
          />
        </div>
      </div>
      <div className="flex gap-1.5 mt-3">
        {[50, 100, 200, 300].map(p => (
          <button
            key={p}
            onClick={() => { onMax(p); onClose(); }}
            className="flex-1 text-[10px] font-semibold py-1 rounded-lg transition-all"
            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(212,151,42,0.30)"; e.currentTarget.style.color = "var(--color-gold)"; }}
            onMouseOut={e  => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
          >
            &lt;${p}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ── Recently viewed mini-card ─────────────────────────────────────────── */
const RecentMiniCard: React.FC<{ car: RecentCar; onClick: () => void }> = ({ car, onClick }) => (
  <button
    onClick={onClick}
    className="flex-shrink-0 w-44 rounded-xl overflow-hidden text-left transition-all duration-[180ms] hover:-translate-y-1"
    style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
    onMouseOver={e => (e.currentTarget.style.borderColor = "rgba(212,151,42,0.30)")}
    onMouseOut={e  => (e.currentTarget.style.borderColor = "var(--color-border)")}
  >
    <div className="relative h-24 overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
      {car.image ? (
        <img src={car.image} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <CarIcon size={24} style={{ color: "var(--color-text-muted)", opacity: 0.4 }} />
        </div>
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
      <span className="absolute bottom-2 right-2 font-price text-xs font-bold" style={{ color: "var(--color-gold)" }}>
        ${car.pricePerDay}/day
      </span>
    </div>
    <div className="p-2.5">
      <p className="font-heading font-semibold text-xs truncate" style={{ color: "var(--color-text-primary)" }}>
        {car.brand} {car.model}
      </p>
      {car.locationCity && (
        <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>{car.locationCity}</p>
      )}
    </div>
  </button>
);

/* ── Filter group label ──────────────────────────────────────────────────── */
const FilterLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="text-[10px] font-bold uppercase tracking-[0.14em] flex-shrink-0 self-center"
    style={{ color: "var(--color-text-muted)" }}
  >
    {children}
  </span>
);

/* ── Main component ──────────────────────────────────────────────────────── */
const BrowseCars: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [search,     setSearch]     = useState("");
  const [filters,    setFilters]    = useState<Filters>(INITIAL_FILTERS);
  const [page,       setPage]       = useState(1);
  const [viewMode,   setViewMode]   = useState<"grid" | "list">("grid");
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<RecentCar[]>([]);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [heroFocused, setHeroFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const debouncedSearch  = useDebounce(search, 400);
  const debouncedFilters = useDebounce(filters, 300);

  const { data: suggestions } = useQuery({
    queryKey: ["car-search-autocomplete", debouncedSearch],
    queryFn: () => carService.search(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 60 * 1000,
  });

  const hasSuggestions = !!(
    suggestions && (
      (suggestions.brands?.length ?? 0) > 0 ||
      (suggestions.models?.length ?? 0) > 0 ||
      (suggestions.cities?.length ?? 0) > 0
    )
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      setRecentlyViewed(stored);
    } catch {}
  }, []);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn:  () => categoryService.getAll(),
    staleTime: Infinity,
  });

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const cityParam = p.get("locationCity");
    if (cityParam) setFilters(prev => ({ ...prev, locationCity: cityParam }));
    const catParam = p.get("category");
    if (catParam && categories) {
      const match = categories.find(c => c.name.toLowerCase() === catParam.toLowerCase());
      if (match) setFilters(prev => ({ ...prev, categoryId: match.id }));
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

  const clearFilters = useCallback(() => {
    setSearch(""); setFilters(INITIAL_FILTERS); setPage(1);
    navigate("/browse", { replace: true });
  }, [navigate]);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleCompare = (id: string) => {
    setCompareSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); return next; }
      if (next.size >= 3) return prev;
      next.add(id);
      return next;
    });
  };

  const hasPriceFilter = filters.minPrice !== "" || filters.maxPrice !== "";
  const priceLabel = hasPriceFilter
    ? (filters.minPrice !== "" && filters.maxPrice !== ""
        ? `$${filters.minPrice}–$${filters.maxPrice}`
        : filters.minPrice !== "" ? `From $${filters.minPrice}` : `Up to $${filters.maxPrice}`)
    : null;

  return (
    <div className="min-h-screen pt-14" style={{ background: "var(--color-bg)" }}>

      {/* ── Search hero bar ──────────────────────────────────────────────── */}
      <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container py-4">
          {/* Desktop: single-row pill bar */}
          <div
            className="hidden md:flex items-center"
            style={{
              height: "60px",
              background: "var(--color-surface-2)",
              border: `1.5px solid ${heroFocused ? "var(--color-gold)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "16px",
              transition: "border-color 180ms ease-out, box-shadow 180ms ease-out",
              boxShadow: heroFocused ? "0 0 0 3px var(--color-gold-glow)" : "none",
            }}
            onFocusCapture={() => setHeroFocused(true)}
            onBlurCapture={() => setHeroFocused(false)}
          >
            <div className="relative flex items-center flex-1 min-w-0">
              <MapPin size={14} className="absolute left-4 pointer-events-none flex-shrink-0" style={{ color: "var(--color-text-muted)" }} />
              <input
                type="text" placeholder="City or location"
                value={filters.locationCity} onChange={e => setFilter("locationCity", e.target.value)}
                className="w-full bg-transparent text-sm pl-10 pr-4 focus:outline-none h-full"
                style={{ color: "var(--color-text-primary)", height: "60px" }}
              />
            </div>
            <div className="w-px self-stretch my-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="flex items-center flex-1 min-w-0 px-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] mr-2 whitespace-nowrap flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>Pick-up</span>
              <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer flex-1 min-w-0"
                style={{ color: pickupDate ? "var(--color-text-primary)" : "var(--color-text-muted)", colorScheme: "dark", height: "60px" }}
              />
            </div>
            <div className="w-px self-stretch my-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="flex items-center flex-1 min-w-0 px-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] mr-2 whitespace-nowrap flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>Return</span>
              <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer flex-1 min-w-0"
                style={{ color: returnDate ? "var(--color-text-primary)" : "var(--color-text-muted)", colorScheme: "dark", height: "60px" }}
              />
            </div>
            <div className="w-px self-stretch my-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div ref={searchWrapperRef} className="relative flex items-center" style={{ minWidth: "200px" }}>
              <Search size={13} className="absolute left-4 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
              <input type="text" placeholder="Brand or model…"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => { if (search.length >= 2) setShowSuggestions(true); }}
                className="w-full bg-transparent text-sm pl-10 pr-3 focus:outline-none"
                style={{ color: "var(--color-text-primary)", height: "60px" }}
              />
              {search && (
                <button onClick={() => { setSearch(""); setShowSuggestions(false); }} className="absolute right-3 text-ink-tertiary hover:text-ink-primary transition-colors">
                  <X size={13} />
                </button>
              )}
              {/* Autocomplete dropdown */}
              {showSuggestions && hasSuggestions && (
                <div
                  className="absolute top-full left-0 mt-1 z-40 w-72 py-2 rounded-2xl overflow-hidden"
                  style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)" }}
                >
                  {suggestions!.brands?.length > 0 && (
                    <div>
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-text-muted)" }}>Brands</p>
                      {suggestions!.brands.map(b => (
                        <button key={b} onClick={() => { setSearch(b); setShowSuggestions(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/[0.04]"
                          style={{ color: "var(--color-text-primary)" }}>
                          <CarIcon size={13} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions!.models?.length > 0 && (
                    <div>
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-text-muted)" }}>Models</p>
                      {suggestions!.models.map(m => (
                        <button key={m} onClick={() => { setSearch(m); setShowSuggestions(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/[0.04]"
                          style={{ color: "var(--color-text-primary)" }}>
                          <Search size={13} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions!.cities?.length > 0 && (
                    <div>
                      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-text-muted)" }}>Locations</p>
                      {suggestions!.cities.map(c => (
                        <button key={c} onClick={() => { setFilter("locationCity", c); setShowSuggestions(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/[0.04]"
                          style={{ color: "var(--color-text-primary)" }}>
                          <MapPin size={13} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="pr-2 flex-shrink-0">
              <button
                className="flex items-center gap-1.5 px-5 rounded-xl font-semibold text-sm text-black transition-all hover:brightness-110 active:scale-[0.97] hover:-translate-y-0.5"
                style={{ height: "44px", background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))", boxShadow: "0 4px 12px rgba(212,151,42,0.22)" }}
              >
                <Search size={13} />
                Search
              </button>
            </div>
          </div>

          {/* Mobile: stacked cards */}
          <div className="flex flex-col gap-2 md:hidden">
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
              <input type="text" placeholder="City or location"
                value={filters.locationCity} onChange={e => setFilter("locationCity", e.target.value)}
                className="w-full pl-9 pr-4 text-sm focus:outline-none transition-all"
                style={{ height: "48px", background: "var(--color-surface-2)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "var(--color-text-primary)" }}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                  className="w-full px-3 text-sm focus:outline-none transition-all cursor-pointer [color-scheme:dark]"
                  style={{ height: "48px", background: "var(--color-surface-2)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: pickupDate ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
                />
              </div>
              <div className="relative flex-1">
                <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                  className="w-full px-3 text-sm focus:outline-none transition-all cursor-pointer [color-scheme:dark]"
                  style={{ height: "48px", background: "var(--color-surface-2)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: returnDate ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
                />
              </div>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
              <input type="text" placeholder="Brand or model…"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => { if (search.length >= 2) setShowSuggestions(true); }}
                className="w-full pl-9 pr-8 text-sm focus:outline-none transition-all"
                style={{ height: "48px", background: "var(--color-surface-2)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "var(--color-text-primary)" }}
              />
              {search && (
                <button onClick={() => { setSearch(""); setShowSuggestions(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-primary transition-colors">
                  <X size={13} />
                </button>
              )}
              {showSuggestions && hasSuggestions && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 z-40 py-2 rounded-2xl overflow-hidden"
                  style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)" }}
                >
                  {suggestions!.brands?.map(b => (
                    <button key={b} onClick={() => { setSearch(b); setShowSuggestions(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-white/[0.04]"
                      style={{ color: "var(--color-text-primary)" }}>
                      <CarIcon size={13} style={{ color: "var(--color-gold)" }} /> {b}
                    </button>
                  ))}
                  {suggestions!.models?.map(m => (
                    <button key={m} onClick={() => { setSearch(m); setShowSuggestions(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-white/[0.04]"
                      style={{ color: "var(--color-text-primary)" }}>
                      <Search size={13} style={{ color: "var(--color-text-muted)" }} /> {m}
                    </button>
                  ))}
                  {suggestions!.cities?.map(c => (
                    <button key={c} onClick={() => { setFilter("locationCity", c); setShowSuggestions(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-white/[0.04]"
                      style={{ color: "var(--color-text-primary)" }}>
                      <MapPin size={13} style={{ color: "var(--color-gold)" }} /> {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category tabs ─────────────────────────────────────────────────── */}
      <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-3">
            {/* All vehicles tab */}
            <button
              onClick={() => setFilter("categoryId", null)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-all duration-150"
              style={!filters.categoryId
                ? {
                    background: "linear-gradient(135deg, rgba(212,151,42,0.20), rgba(184,121,30,0.10))",
                    border: "1.5px solid rgba(212,151,42,0.50)",
                    color: "var(--color-gold)",
                  }
                : {
                    background: "#18181C",
                    border: "1.5px solid rgba(255,255,255,0.07)",
                    color: "#8A8A96",
                  }
              }
            >
              <CarIcon size={14} />
              All
            </button>

            {(categories ?? []).map(cat => {
              const Icon = CATEGORY_ICONS[cat.name] ?? CarIcon;
              const active = filters.categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter("categoryId", active ? null : cat.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-all duration-150"
                  style={active
                    ? {
                        background: "linear-gradient(135deg, rgba(212,151,42,0.20), rgba(184,121,30,0.10))",
                        border: "1.5px solid rgba(212,151,42,0.50)",
                        color: "var(--color-gold)",
                      }
                    : {
                        background: "#18181C",
                        border: "1.5px solid rgba(255,255,255,0.07)",
                        color: "#8A8A96",
                      }
                  }
                  onMouseOver={e => { if (!active) { e.currentTarget.style.color = "var(--color-text-primary)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; } }}
                  onMouseOut={e  => { if (!active) { e.currentTarget.style.color = "#8A8A96"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; } }}
                >
                  <Icon size={14} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Filter chips row — desktop only ──────────────────────────────── */}
      <div className="hidden md:block" style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">

            {/* Transmission */}
            <div className="flex items-center gap-1.5">
              <FilterLabel>Trans</FilterLabel>
              {(["", "Automatic", "Manual"] as const).map(t => (
                <PillBtn
                  key={t}
                  active={filters.transmission === t}
                  onClick={() => setFilter("transmission", filters.transmission === t ? "" : t)}
                >
                  {t || "Any"}
                </PillBtn>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-4 self-center flex-shrink-0" style={{ background: "var(--color-border)" }} />

            {/* Fuel */}
            <div className="flex items-center gap-1.5">
              <FilterLabel>Fuel</FilterLabel>
              {(["", "Petrol", "Diesel", "Electric", "Hybrid"] as const).map(f => (
                <PillBtn
                  key={f}
                  active={filters.fuelType === f}
                  onClick={() => setFilter("fuelType", filters.fuelType === f ? "" : f)}
                >
                  {f || "Any"}
                </PillBtn>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-4 self-center flex-shrink-0" style={{ background: "var(--color-border)" }} />

            {/* Seats */}
            <div className="flex items-center gap-1.5">
              <FilterLabel>Seats</FilterLabel>
              {(["", "2", "4", "5", "7"] as const).map(s => (
                <PillBtn
                  key={s}
                  active={String(filters.seats) === s}
                  onClick={() => setFilter("seats", s ? Number(s) : "")}
                >
                  {s || "Any"}{s === "7" ? "+" : ""}
                </PillBtn>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-4 self-center flex-shrink-0" style={{ background: "var(--color-border)" }} />

            {/* Price chip */}
            <div className="relative">
              <button
                onClick={() => setShowPriceDropdown(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                style={hasPriceFilter || showPriceDropdown
                  ? { background: "rgba(212,151,42,0.16)", border: "1.5px solid rgba(212,151,42,0.45)", color: "var(--color-gold)" }
                  : { background: "transparent", border: "1.5px solid var(--color-border)", color: "var(--color-text-muted)" }
                }
              >
                <DollarSign size={11} />
                {priceLabel ?? "Price"}
              </button>
              {showPriceDropdown && (
                <PriceDropdown
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                  onMin={v => setFilter("minPrice", v)}
                  onMax={v => setFilter("maxPrice", v)}
                  onClose={() => setShowPriceDropdown(false)}
                />
              )}
            </div>

            {/* City chip */}
            <div className="relative">
              <div className="flex items-center">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                  style={filters.locationCity
                    ? { background: "rgba(212,151,42,0.16)", border: "1.5px solid rgba(212,151,42,0.45)", color: "var(--color-gold)" }
                    : { background: "transparent", border: "1.5px solid var(--color-border)", color: "var(--color-text-muted)" }
                  }
                >
                  <MapPin size={11} />
                  <input
                    type="text"
                    placeholder="City"
                    value={filters.locationCity}
                    onChange={e => setFilter("locationCity", e.target.value)}
                    className="bg-transparent focus:outline-none w-20 text-xs"
                    style={{ color: filters.locationCity ? "var(--color-gold)" : "var(--color-text-muted)" }}
                    onFocus={e => (e.currentTarget.parentElement!.style.borderColor = "rgba(212,151,42,0.45)")}
                    onBlur={e => {
                      if (!filters.locationCity) e.currentTarget.parentElement!.style.borderColor = "var(--color-border)";
                    }}
                  />
                  {filters.locationCity && (
                    <button onClick={() => setFilter("locationCity", "")} className="ml-1 hover:opacity-70">
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Clear all — only when active */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-semibold transition-all duration-150 animate-fade-in"
                style={{ color: "var(--color-red)" }}
                onMouseOver={e => (e.currentTarget.style.opacity = "0.75")}
                onMouseOut={e  => (e.currentTarget.style.opacity = "1")}
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results bar — sticky ──────────────────────────────────────────── */}
      <div
        className="sticky z-20"
        style={{
          top: "56px",
          background: "rgba(10,10,12,0.92)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container py-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Count */}
            {!isLoading && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs flex-shrink-0"
                style={{ background: "rgba(212,151,42,0.07)", border: "1.5px solid rgba(212,151,42,0.18)" }}
              >
                <span className="font-heading font-bold" style={{ color: "var(--color-gold)" }}>
                  {totalCount.toLocaleString()}
                </span>
                <span style={{ color: "var(--color-text-muted)" }}>
                  vehicle{totalCount !== 1 ? "s" : ""}
                </span>
                {isFetching && (
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-gold)" }} />
                )}
              </span>
            )}

            {/* Mobile: Filters button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold transition-all"
              style={{
                height: "34px",
                background: hasActiveFilters ? "rgba(212,151,42,0.12)" : "var(--color-surface-2)",
                border: hasActiveFilters ? "1.5px solid rgba(212,151,42,0.35)" : "1.5px solid var(--color-border)",
                color: hasActiveFilters ? "var(--color-gold)" : "var(--color-text-muted)",
              }}
            >
              <Settings size={12} />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black" style={{ background: "var(--color-gold)" }}>
                  {[filters.categoryId, filters.fuelType, filters.transmission, filters.seats !== "" ? "s" : null, hasPriceFilter ? "p" : null, filters.locationCity].filter(Boolean).length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={e => setFilter("sortBy", e.target.value)}
                className="text-xs rounded-xl px-3 focus:outline-none cursor-pointer appearance-none"
                style={{
                  height: "34px",
                  background: "var(--color-surface-2)",
                  border: "1.5px solid var(--color-border)",
                  color: "var(--color-text-secondary)",
                  paddingRight: "28px",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234A4A55' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  colorScheme: "dark",
                }}
              >
                <option value="createdAt">Newest first</option>
                <option value="pricePerDay">Price: low → high</option>
                <option value="pricePerDayDesc">Price: high → low</option>
                <option value="averageRating">Top rated</option>
              </select>

              {/* Grid / List toggle */}
              <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--color-border)" }}>
                {[
                  { mode: "grid" as const, icon: <LayoutGrid size={13} /> },
                  { mode: "list" as const, icon: <List size={13} /> },
                ].map(({ mode, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="p-2 transition-all duration-[180ms]"
                    style={viewMode === mode
                      ? { background: "rgba(212,151,42,0.14)", color: "var(--color-gold)" }
                      : { background: "transparent", color: "var(--color-text-muted)" }
                    }
                    aria-label={`${mode} view`}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Comparison mode toggle */}
              <button
                onClick={() => compareSet.size > 0 && setCompareSet(new Set())}
                className="hidden sm:flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold transition-all duration-[180ms]"
                style={{
                  height: "34px",
                  background: compareSet.size > 0 ? "rgba(212,151,42,0.12)" : "var(--color-surface-2)",
                  border: compareSet.size > 0 ? "1.5px solid rgba(212,151,42,0.30)" : "1.5px solid var(--color-border)",
                  color: compareSet.size > 0 ? "var(--color-gold)" : "var(--color-text-muted)",
                }}
              >
                <GitCompare size={12} />
                {compareSet.size > 0 ? `Comparing ${compareSet.size}` : "Compare"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl max-h-[80vh] overflow-y-auto"
            style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)" }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#1c1c1c]">
              <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} style={{ color: "var(--color-text-muted)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-5">
              {/* Transmission */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "var(--color-text-muted)" }}>Transmission</p>
                <div className="flex gap-2 flex-wrap">
                  {["", "Automatic", "Manual"].map(t => (
                    <PillBtn key={t} active={filters.transmission === t} onClick={() => setFilter("transmission", filters.transmission === t ? "" : t)}>
                      {t || "Any"}
                    </PillBtn>
                  ))}
                </div>
              </div>
              {/* Fuel */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "var(--color-text-muted)" }}>Fuel type</p>
                <div className="flex gap-2 flex-wrap">
                  {["", "Petrol", "Diesel", "Electric", "Hybrid"].map(f => (
                    <PillBtn key={f} active={filters.fuelType === f} onClick={() => setFilter("fuelType", filters.fuelType === f ? "" : f)}>
                      {f || "Any"}
                    </PillBtn>
                  ))}
                </div>
              </div>
              {/* Seats */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "var(--color-text-muted)" }}>Seats</p>
                <div className="flex gap-2 flex-wrap">
                  {(["", "2", "4", "5", "7"] as const).map(s => (
                    <PillBtn key={s} active={String(filters.seats) === s} onClick={() => setFilter("seats", s ? Number(s) : "")}>
                      {s || "Any"}{s === "7" ? "+" : ""}
                    </PillBtn>
                  ))}
                </div>
              </div>
              {/* Price */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "var(--color-text-muted)" }}>Price per day</p>
                <div className="flex gap-3">
                  <input
                    type="number" placeholder="Min $"
                    value={filters.minPrice}
                    onChange={e => setFilter("minPrice", e.target.value ? Number(e.target.value) : "")}
                    className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ background: "var(--color-surface-2)", border: "1.5px solid var(--color-border)", color: "var(--color-text-primary)" }}
                  />
                  <input
                    type="number" placeholder="Max $"
                    value={filters.maxPrice}
                    onChange={e => setFilter("maxPrice", e.target.value ? Number(e.target.value) : "")}
                    className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ background: "var(--color-surface-2)", border: "1.5px solid var(--color-border)", color: "var(--color-text-primary)" }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-8 pt-3 border-t border-[#1c1c1c]">
              <button
                onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                Clear all
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black"
                style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)" }}
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Car grid — full width ─────────────────────────────────────────── */}
      <div className="container py-8">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--color-surface-2)", border: "1.5px solid var(--color-border)" }}>
              <X size={22} style={{ color: "var(--color-red)" }} />
            </div>
            <h3 className="font-semibold text-[15px] mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Could not load vehicles
            </h3>
            <p className="text-sm mb-5 max-w-sm" style={{ color: "var(--color-text-muted)" }}>
              The server is not responding. Make sure the backend is running and try again.
            </p>
            <button onClick={() => window.location.reload()} className="btn-secondary text-sm">Retry</button>
          </div>
        ) : isLoading ? (
          <div className={`grid gap-x-5 gap-y-10 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`}>
            {Array.from({ length: 12 }, (_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : cars.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
        ) : (
          <>
            <div
              className={`transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"} grid gap-x-5 gap-y-10 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {cars.map((car, i) => (
                <CarCard
                  key={car.id}
                  car={car}
                  index={i}
                  isFavorite={isFavorite(String(car.id))}
                  onFavorite={toggleFavorite}
                  isCompared={compareSet.has(String(car.id))}
                  onCompare={handleCompare}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-12 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Page {page} of {totalPages}
                  <span className="hidden sm:inline"> · {totalCount.toLocaleString()} vehicles</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg transition-all disabled:opacity-30"
                    style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text-muted)" }}
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
                        <span key={`e${i}`} className="px-2 text-sm" style={{ color: "var(--color-text-muted)" }}>…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className="min-w-[36px] h-9 px-2.5 rounded-lg text-sm font-medium transition-all"
                          style={page === p
                            ? { background: "rgba(212,151,42,0.12)", border: "1.5px solid rgba(212,151,42,0.30)", color: "var(--color-gold)" }
                            : { border: "1.5px solid var(--color-border)", color: "var(--color-text-muted)" }
                          }
                        >
                          {p}
                        </button>
                      )
                    )
                  }

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg transition-all disabled:opacity-30"
                    style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text-muted)" }}
                    aria-label="Next page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Recently viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16 pt-8" style={{ borderTop: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-2 mb-5">
              <Clock size={15} style={{ color: "var(--color-gold)" }} />
              <h2 className="font-heading font-semibold text-base" style={{ color: "var(--color-text-primary)" }}>
                Recently Viewed
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {recentlyViewed.map(car => (
                <RecentMiniCard
                  key={car.id}
                  car={car}
                  onClick={() => navigate(`/car/${car.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Compare sticky bar ────────────────────────────────────────────── */}
      <CompareBar
        compareSet={compareSet}
        cars={cars}
        onRemove={id => handleCompare(id)}
        onClearAll={() => setCompareSet(new Set())}
      />
    </div>
  );
};

export default BrowseCars;

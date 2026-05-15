import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Search, Grid, List as ListIcon, SlidersHorizontal } from 'lucide-react';
import { carService } from '../services/car.service.ts';
import { categoryService } from '../services/category.service.ts';
import FeaturedCars from '../components/Landing/FeaturedCars.tsx';
import './BrowseCars.css';

const BrowseCars: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [seats, setSeats] = useState<number | ''>('');

  const location = useLocation();
  
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  // Handle URL category parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialCategoryName = searchParams.get('category');
    
    if (categories && initialCategoryName) {
      const matched = categories.find(c => c.name.toLowerCase() === initialCategoryName.toLowerCase());
      if (matched) {
        setSelectedCategory(matched.id);
      }
    }
  }, [categories, location.search]);


  // Fetch cars with filters
  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars', searchTerm, selectedCategory, minPrice, maxPrice, sortBy],
    queryFn: () => carService.getAll({ 
      brand: searchTerm, 
      categoryId: selectedCategory || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      fuelType: fuelType || undefined,
      transmission: transmission || undefined,
      seats: seats || undefined,
      sortBy
    }),

  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setFuelType('');
    setTransmission('');
    setSeats('');
    setSortBy('createdAt');
  };


  return (
    <div className="browse-page section-padding">
      <div className="container">
        <div className="browse-header animate-fade-in">
          <h1 className="hero-title">Browse Our <span className="text-gradient">Collection</span></h1>
          <p className="section-subtitle">Discover premium vehicles from our exclusive host network.</p>
        </div>
        
        {/* Category Scroll Bar */}
        <div className="category-nav-wrapper animate-fade-in">
          <div className="category-nav">
            <button 
              className={`category-item ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Vehicles
            </button>
            {categories?.map((cat) => (
              <button 
                key={cat.id} 
                className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-bar glass animate-fade-in">
          <div className="search-input-group">
            <Search size={20} className="icon" />
            <input 
              type="text" 
              placeholder="Search by brand (e.g. Porsche)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-actions">
            <button 
              className={`filter-btn ${isFilterOpen ? 'active' : ''}`} 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </button>
            <div className="view-toggle desktop-only">
              <button className="toggle-btn active"><Grid size={18} /></button>
              <button className="toggle-btn"><ListIcon size={18} /></button>
            </div>
          </div>
        </div>

        {/* Floating Filter Panel */}
        {isFilterOpen && (
          <div className="filter-panel glass animate-slide-down">
            <div className="filter-panel-content">
              <div className="filter-section">
                <h4>Price Range / Day</h4>
                <div className="price-inputs">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice} 
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')} 
                  />
                  <span>to</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')} 
                  />
                </div>
              </div>

              <div className="filter-section">
                <h4>Fuel Type</h4>
                <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                  <option value="">Any Fuel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="filter-section">
                <h4>Transmission</h4>
                <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                  <option value="">Any Transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="filter-section">
                <h4>Seats</h4>
                <select value={seats} onChange={(e) => setSeats(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Any Seats</option>
                  <option value="2">2 Seats</option>
                  <option value="4">4 Seats</option>
                  <option value="5">5 Seats</option>
                  <option value="7">7+ Seats</option>
                </select>
              </div>

              <div className="filter-section">
                <h4>Sort By</h4>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="createdAt">Newest Arrivals</option>
                  <option value="pricePerDay">Price: Low to High</option>
                  <option value="averageRating">Top Rated</option>
                </select>
              </div>


              <div className="filter-panel-actions">
                <button className="btn-text" onClick={clearFilters}>Clear All</button>
                <button className="btn-primary-sm" onClick={() => setIsFilterOpen(false)}>Apply</button>
              </div>
            </div>
          </div>
        )}

        <div className="results-container">
          <FeaturedCars 
            cars={cars} 
            isLoading={isLoading} 
            title="Available <span class='text-gradient'>Listings</span>" 
            subtitle={`Found ${cars?.length || 0} luxury vehicles for you.`}
          />
        </div>
      </div>
    </div>
  );
};

export default BrowseCars;

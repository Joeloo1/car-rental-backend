import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Landing/Hero.tsx';
import FeaturedCars from '../components/Landing/FeaturedCars.tsx';
import Categories from '../components/Landing/Categories.tsx';
import { carService } from '../services/car.service.ts';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: carsData, isLoading } = useQuery({
    queryKey: ['featured-cars'],
    queryFn: () => carService.getAll({ limit: 4 })
  });

  const cars = carsData?.cars;

  return (
    <div className="landing-page">
      <Hero />
      <Categories />
      <FeaturedCars cars={cars} isLoading={isLoading} />
      
      <section className="cta-section section-padding">
        <div className="container">
          <div className="cta-card glass animate-fade-in">
            <h2>Ready to hit the road?</h2>
            <p>Join thousands of satisfied travelers and car owners today.</p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate('/browse')}>Find a Car</button>
              <button className="btn-secondary" onClick={() => navigate('/list-car')}>List Your Car</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

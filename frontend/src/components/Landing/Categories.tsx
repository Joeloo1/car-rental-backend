import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Compass } from 'lucide-react';

import './Categories.css';

const categories = [
  { id: 1, name: 'Luxury', icon: <Shield size={26} />, description: 'Top-tier prestige & comfort', count: 12 },
  { id: 2, name: 'Sport', icon: <Zap size={26} />, description: 'High performance & speed', count: 8 },
  { id: 3, name: 'SUV', icon: <Compass size={26} />, description: 'Adventure, utility & space', count: 15 },
  { id: 4, name: 'Electric', icon: <Zap size={26} />, description: 'Sustainable modern power', count: 4 },
];

const Categories: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="categories section-padding">
      <div className="container">
        <div className="section-header center">
          <h2 className="section-title">Browse by <span className="text-gradient">Category</span></h2>
          <p className="section-subtitle">Find the perfect match for your lifestyle and needs.</p>
        </div>
        
        <div className="categories-grid animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="category-card glass"
              onClick={() => navigate(`/browse?category=${category.name}`)}
            >
              <div className="category-icon-box">
                {category.icon}
              </div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-desc">{category.description}</p>
              <div className="category-footer">
                <span className="car-count">{category.count} cars available</span>
                <button className="btn-text">Explore →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;

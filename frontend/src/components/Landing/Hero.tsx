import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Car } from 'lucide-react';
import './Hero.css';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <div className="hero-text-container animate-fade-in">
          <h1 className="hero-title">Experience the <span className="text-gradient">Ultimate Drive</span></h1>
          <p className="hero-subtitle">
            Rent premium cars from local hosts. Whether it's a weekend getaway or a business trip, 
            drive the car of your dreams.
          </p>
          
          <div className="search-bar-wrapper animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="search-bar glass">
              <div className="search-item">
                <div className="item-icon">
                  <MapPin size={20} />
                </div>
                <div className="item-text">
                  <label>Location</label>
                  <input type="text" placeholder="Where are you going?" />
                </div>
              </div>
              
              <div className="divider-v"></div>
              
              <div className="search-item">
                <div className="item-icon">
                  <Calendar size={20} />
                </div>
                <div className="item-text">
                  <label>Rental Dates</label>
                  <input type="text" placeholder="Pick up - Return" />
                </div>
              </div>
              
              <div className="divider-v"></div>
              
              <div className="search-item">
                <div className="item-icon">
                  <Car size={20} />
                </div>
                <div className="item-text">
                  <label>Car Type</label>
                  <select>
                    <option value="">All Categories</option>
                    <option value="luxury">Luxury</option>
                    <option value="suv">SUV</option>
                    <option value="sport">Sport</option>
                  </select>
                </div>
              </div>
              
              <button className="search-btn" onClick={() => navigate('/browse')}>
                <Search size={20} />
                <span>Search</span>
              </button>
            </div>
          </div>

          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">500+</span>
              <span className="stat-label">Luxury Cars</span>
            </div>
            <div className="stat">
              <span className="stat-value">50+</span>
              <span className="stat-label">Cities</span>
            </div>
            <div className="stat">
              <span className="stat-value">4.9/5</span>
              <span className="stat-label">User Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

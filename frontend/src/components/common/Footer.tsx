import { Car, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="logo-icon">
                <Car size={24} color="#3b82f6" />
              </div>
              <span className="logo-text">LuxeDrive</span>
            </Link>
            <p className="footer-desc">
              Redefining the car rental experience with a curated fleet of premium vehicles 
              and a seamless, mobile-first booking process.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><Globe size={20} /></a>
              <a href="#" className="social-link"><Globe size={20} /></a>
              <a href="#" className="social-link"><Globe size={20} /></a>
              <a href="#" className="social-link"><Globe size={20} /></a>
            </div>
          </div>
          
          <div className="footer-links-grid">
            <div className="links-group">
              <h3>Company</h3>
              <Link to="/about">About Us</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/press">Press</Link>
            </div>
            
            <div className="links-group">
              <h3>Services</h3>
              <Link to="/browse">Rent a Car</Link>
              <Link to="/list-car">Host a Car</Link>
              <Link to="/enterprise">Enterprise</Link>
              <Link to="/insurance">Insurance</Link>
            </div>
            
            <div className="links-group">
              <h3>Support</h3>
              <Link to="/help">Help Center</Link>
              <Link to="/safety">Safety</Link>
              <Link to="/tos">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
          
          <div className="footer-contact">
            <h3>Get in Touch</h3>
            <div className="contact-item">
              <Mail size={18} />
              <span>support@luxedrive.com</span>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="contact-item">
              <MapPin size={18} />
              <span>123 Elite Ave, Beverly Hills, CA</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} LuxeDrive Rental Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

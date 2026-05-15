import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  Settings, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Compass
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext.tsx';
import { bookingService } from '../../services/booking.service.ts';
import AddCarModal from '../../components/Dashboard/AddCarModal.tsx';
import CarsList from '../../components/Dashboard/CarsList.tsx';
import ReviewModal from '../../components/Dashboard/ReviewModal.tsx';

import './Dashboard.css';


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<any>(null);
  const queryClient = useQueryClient();


  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: bookingService.getDashboardStats,
    enabled: !!user,
  });

  const { data: bookings, isLoading: isBookingsLoading } = useQuery({
    queryKey: ['dashboardBookings'],
    queryFn: () => user?.role === 'lender' ? bookingService.getLenderBookings() : bookingService.getMyBookings(),
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isAuthLoading || isStatsLoading || isBookingsLoading) {
    return <div className="dashboard-container"><div className="container">Loading Dashboard...</div></div>;
  }

  const statCards = [
    { label: 'Total Trips', value: stats?.totalTrips || 0, icon: <Compass size={24} />, color: '#3b82f6' },
    { label: 'Total Earnings', value: `$${stats?.totalEarnings || 0}`, icon: <TrendingUp size={24} />, color: '#10b981' },
    { label: 'Active Rentals', value: stats?.activeRentals || 0, icon: <Clock size={24} />, color: '#f59e0b' },
    { label: 'Verified Cars', value: stats?.verifiedCars || 0, icon: <CheckCircle size={24} />, color: '#8b5cf6' }
  ];

  const recentBookings = bookings?.slice(0, 5) || [];

  return (
    <div className="dashboard-container section-padding">
      <div className="container dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar glass" style={{ height: 'fit-content' }}>
          <div className="sidebar-header">
            <div className="user-avatar-large">
              <img src={user?.profileImage || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"} alt="User" />
            </div>
            <h3>{user?.name || 'User'}</h3>
            <p>{user?.role === 'lender' ? 'Elite Lender' : 'Premium Member'}</p>
          </div>
          
          <nav className="sidebar-nav">
            <a href="#overview" className="nav-item active">
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </a>
            <a href="#bookings" className="nav-item">
              <Calendar size={20} />
              <span>My Bookings</span>
            </a>
            {user?.role === 'lender' && (
              <a href="#cars" className="nav-item">
                <Car size={20} />
                <span>My Cars</span>
              </a>
            )}
            <a href="#profile" className="nav-item">
              <UserIcon size={20} />
              <span>Profile</span>
            </a>
            <a href="#settings" className="nav-item">
              <Settings size={20} />
              <span>Settings</span>
            </a>
          </nav>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <header className="content-header">
            <div>
              <h1 className="hero-title">Dashboard</h1>
              <p>Welcome back! Here's what's happening today.</p>
            </div>
            {user?.role === 'lender' && (
              <button className="btn-primary" onClick={() => setIsAddCarModalOpen(true)}>
                <Plus size={18} />
                <span>Add New Car</span>
              </button>
            )}
          </header>

          {/* Stats Grid */}
          <div className="stats-grid">
            {statCards.map((stat, i) => (
              <div key={i} className="stat-card glass animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <section className="activity-section">
            <div className="section-header">
              <h2>Recent Bookings</h2>
            </div>
            
            <div className="activity-table-container glass">
              {recentBookings.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent bookings found.</div>
              ) : (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Car</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking: any) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="table-car-info">
                            <img src={booking.car.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=100"} alt="Car" />
                            <span>{booking.car.title}</span>
                          </div>
                        </td>
                        <td>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge-status ${booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'warning'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>${booking.totalPrice}</td>
                        <td>
                          {booking.status === 'completed' && (
                            <button className="btn-text" onClick={() => setReviewBooking(booking)}>
                              Rate Car
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Lender's Cars Section */}
          {user?.role === 'lender' && (
            <section className="activity-section" style={{ marginTop: '2rem' }}>
              <div className="section-header">
                <h2>My Cars</h2>
              </div>
              
              <div className="activity-table-container glass">
                <CarsList lenderId={user.id} />
              </div>
            </section>
          )}
        </main>
      </div>
      
      {isAddCarModalOpen && (
        <AddCarModal onClose={() => setIsAddCarModalOpen(false)} />
      )}

      {reviewBooking && (
        <ReviewModal 
          carId={reviewBooking.carId} 
          carTitle={reviewBooking.car.title}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['dashboardBookings'] })}
        />
      )}
    </div>
  );
};

export default Dashboard;

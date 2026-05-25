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
  Compass,
  ChevronRight,
  Star,
  Bell,
  Key,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import ProfileEditor from '../../components/common/ProfileEditor';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.tsx';
import { bookingService } from '../../services/booking.service.ts';
import AddCarModal from '../../components/Dashboard/AddCarModal.tsx';
import CarsList from '../../components/Dashboard/CarsList.tsx';
import ReviewModal from '../../components/Dashboard/ReviewModal.tsx';

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<any>(null);
  const [activeNav, setActiveNav] = useState('overview');
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
    queryFn: () =>
      user?.role === 'lender'
        ? bookingService.getLenderBookings()
        : bookingService.getMyBookings(),
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isAuthLoading || isStatsLoading || isBookingsLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] pt-24 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-6xl px-6">
          <div className="h-10 w-48 rounded-xl bg-white/5 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Trips',
      value: stats?.totalTrips || 0,
      icon: Compass,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      change: '+12%',
    },
    {
      label: 'Total Earnings',
      value: `$${stats?.totalEarnings || 0}`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      change: '+8%',
    },
    {
      label: 'Active Rentals',
      value: stats?.activeRentals || 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      change: null,
    },
    {
      label: 'Verified Cars',
      value: stats?.verifiedCars || 0,
      icon: CheckCircle,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      change: '+1',
    },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    ...(user?.role === 'lender' ? [{ id: 'cars', label: 'My Cars', icon: Car }] : []),
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const allBookings = (bookings as any[]) || [];
  const recentBookings = allBookings.slice(0, 6);

  const BookingsTable = ({ items }: { items: any[] }) => (
    <div className="rounded-2xl bg-[#111115] border border-white/8 overflow-hidden">
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <Calendar size={40} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400 font-medium">No bookings yet</p>
          <p className="text-sm text-gray-600 mt-1">Your bookings will appear here</p>
          <button
            onClick={() => navigate('/browse')}
            className="mt-5 px-5 py-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 font-semibold text-sm hover:bg-blue-500/25 transition-all"
          >
            Browse Cars
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" />
              </tr>
            </thead>
            <tbody>
              {items.map((booking: any, idx: number) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.04 * idx }}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          booking.car?.images?.[0]?.imageUrl ||
                          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=100'
                        }
                        alt={booking.car?.title}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-sm text-white">
                          {booking.car?.title || `${booking.car?.brand} ${booking.car?.model}`}
                        </p>
                        {booking.car?.locationCity && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            {booking.car.locationCity}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(booking.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    –{' '}
                    {new Date(booking.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                        statusStyles[booking.status] || statusStyles.pending
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">
                    ${booking.totalPrice}
                  </td>
                  <td className="px-6 py-4">
                    {booking.status === 'completed' && (
                      <button
                        onClick={() => setReviewBooking(booking)}
                        className="flex items-center gap-1.5 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        <Star size={14} />
                        Rate
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans pt-20 relative overflow-hidden">
      <div className="fixed top-0 right-0 w-[35%] h-[40%] bg-blue-600/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">

        {/* Mobile Tab Bar */}
        <div className="lg:hidden mb-6 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 pb-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex-shrink-0 ${
                  activeNav === item.id
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 bg-white/5 border border-white/8 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-28"
          >
            <div className="p-6 rounded-3xl bg-[#111115] border border-white/8 space-y-6">
              {/* Profile */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-white/8">
                <button
                  onClick={() => setActiveNav('profile')}
                  className="relative mb-4 group focus:outline-none"
                  title="Edit profile"
                >
                  <img
                    src={
                      user?.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=3b82f6&color=fff&size=200`
                    }
                    alt={user?.name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-400/60 transition-all"
                  />
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#111115]" />
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">Edit</span>
                  </div>
                </button>
                <h3 className="font-bold text-white text-lg">{user?.name || 'User'}</h3>
                <span className="text-xs text-gray-400 mt-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  {user?.role === 'lender' ? 'Elite Lender' : user?.role === 'admin' ? 'Administrator' : 'Premium Member'}
                </span>
              </div>

              {/* Nav */}
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      activeNav === item.id
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {activeNav === item.id && <ChevronRight size={14} className="ml-auto" />}
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <div className="pt-4 border-t border-white/8">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-8">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  {activeNav === 'overview' && (
                    <>Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{user?.name?.split(' ')[0]}</span></>
                  )}
                  {activeNav === 'bookings' && 'My Bookings'}
                  {activeNav === 'cars' && 'My Cars'}
                  {activeNav === 'profile' && 'My Profile'}
                  {activeNav === 'settings' && 'Settings'}
                </h1>
                <p className="text-gray-400 mt-1 text-sm">
                  {activeNav === 'overview' && "Here's what's happening with your account today."}
                  {activeNav === 'bookings' && 'Manage and track all your rental bookings.'}
                  {activeNav === 'cars' && 'Manage your listed vehicles.'}
                  {activeNav === 'profile' && 'View and manage your account information.'}
                  {activeNav === 'settings' && 'Manage your preferences and account security.'}
                </p>
              </div>
              {user?.role === 'lender' && activeNav === 'overview' && (
                <button
                  onClick={() => setIsAddCarModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:shadow-[0_8px_24px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-all flex-shrink-0"
                >
                  <Plus size={18} />
                  Add New Car
                </button>
              )}
              {user?.role === 'lender' && activeNav === 'cars' && (
                <button
                  onClick={() => setIsAddCarModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:shadow-[0_8px_24px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-all flex-shrink-0"
                >
                  <Plus size={18} />
                  Add New Car
                </button>
              )}
            </motion.div>

            {/* ── OVERVIEW ── */}
            {activeNav === 'overview' && (
              <>
                {/* Stats Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="grid grid-cols-2 xl:grid-cols-4 gap-4"
                >
                  {statCards.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05 }}
                      className="p-5 rounded-2xl bg-[#111115] border border-white/8 hover:border-white/15 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <stat.icon size={20} className={stat.color} />
                        </div>
                        {stat.change && (
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                            {stat.change}
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Recent Bookings */}
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-display font-bold">Recent Bookings</h2>
                    {allBookings.length > 6 && (
                      <button
                        onClick={() => setActiveNav('bookings')}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        View all <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                  <BookingsTable items={recentBookings} />
                </motion.section>

                {/* Lender Cars */}
                {user?.role === 'lender' && (
                  <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-display font-bold">My Cars</h2>
                      <button
                        onClick={() => setActiveNav('cars')}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        Manage <ChevronRight size={14} />
                      </button>
                    </div>
                    <CarsList lenderId={user.id} limit={3} />
                  </motion.section>
                )}
              </>
            )}

            {/* ── BOOKINGS ── */}
            {activeNav === 'bookings' && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <BookingsTable items={allBookings} />
              </motion.section>
            )}

            {/* ── CARS (lender) ── */}
            {activeNav === 'cars' && user?.role === 'lender' && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className=""
              >
                <CarsList lenderId={user.id} />
              </motion.section>
            )}

            {/* ── PROFILE ── */}
            {activeNav === 'profile' && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <ProfileEditor theme="dark" />

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {statCards.map((stat, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-[#111115] border border-white/8 text-center"
                    >
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ── SETTINGS ── */}
            {activeNav === 'settings' && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Security */}
                <div className="p-6 rounded-2xl bg-[#111115] border border-white/8">
                  <h3 className="text-lg font-display font-bold mb-5 flex items-center gap-2">
                    <Key size={18} className="text-blue-400" />
                    Security
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/forgot-password')}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] hover:border-white/15 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-400/10 flex items-center justify-center">
                          <Key size={16} className="text-blue-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">Change Password</p>
                          <p className="text-xs text-gray-500">Update your account password</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="p-6 rounded-2xl bg-[#111115] border border-white/8">
                  <h3 className="text-lg font-display font-bold mb-5 flex items-center gap-2">
                    <Bell size={18} className="text-purple-400" />
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Booking confirmations', desc: 'Get notified when a booking is confirmed', defaultOn: true },
                      { label: 'New messages', desc: 'Receive alerts for new chat messages', defaultOn: true },
                      { label: 'Promotional offers', desc: 'Hear about deals and discounts', defaultOn: false },
                      { label: 'Platform updates', desc: 'Stay informed about new features', defaultOn: false },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{item.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                          <input
                            type="checkbox"
                            defaultChecked={item.defaultOn}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="p-6 rounded-2xl bg-red-500/[0.04] border border-red-500/20">
                  <h3 className="text-lg font-display font-bold mb-2 flex items-center gap-2 text-red-400">
                    <AlertTriangle size={18} />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-gray-400 mb-5">
                    Permanently delete your account and all associated data. This action cannot be
                    undone.
                  </p>
                  <button className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-sm hover:bg-red-500/20 transition-all">
                    Delete My Account
                  </button>
                </div>
              </motion.section>
            )}
          </main>
        </div>
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

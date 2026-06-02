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
  ArrowRight,
  Loader2,
  Banknote,
  Sparkles,
} from 'lucide-react';
import ProfileEditor from '../../components/common/ProfileEditor';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.tsx';
import { bookingService } from '../../services/booking.service.ts';
import { userService } from '../../services/user.service.ts';
import { useMutation } from '@tanstack/react-query';
import AddCarModal from '../../components/Dashboard/AddCarModal.tsx';
import CarsList from '../../components/Dashboard/CarsList.tsx';
import ReviewModal from '../../components/Dashboard/ReviewModal.tsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_PILL: Record<string, string> = {
  completed: 'text-green bg-green/10 border-green/20',
  cancelled:  'text-red bg-red/[0.1] border-red/20',
  pending:    'text-amber bg-amber/10 border-amber/20',
  confirmed:  'text-blue-light bg-blue/10 border-blue/20',
  active:     'text-blue-light bg-blue/10 border-blue/20',
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ── Booking table ─────────────────────────────────────────────────────────────
const BookingsTable: React.FC<{
  items: any[];
  onReview: (b: any) => void;
  onBrowse: () => void;
}> = ({ items, onReview, onBrowse }) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-surface-1 border border-[#1c1c1c] py-16 flex flex-col items-center text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-[#282828] flex items-center justify-center mb-4">
          <Calendar size={22} className="text-ink-tertiary" />
        </div>
        <p className="font-semibold text-[15px] text-ink-primary mb-1">No bookings yet</p>
        <p className="text-sm text-ink-tertiary mb-5">Your bookings will appear here</p>
        <button
          onClick={onBrowse}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black"
          style={{ background: 'linear-gradient(135deg, #fcd34d, #d97706)' }}
        >
          Browse Cars <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface-1 border border-[#1c1c1c] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1c1c1c]">
              {['Vehicle', 'Dates', 'Status', 'Total', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-ink-tertiary uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((booking: any, idx: number) => (
              <motion.tr
                key={booking.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.04 * idx }}
                className="border-b border-[#1c1c1c] last:border-0 hover:bg-surface-2 transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-surface-2">
                      <img
                        src={booking.car?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=100'}
                        alt={booking.car?.brand}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-ink-primary leading-tight">
                        {booking.car?.brand} {booking.car?.model}
                      </p>
                      {booking.car?.locationCity && (
                        <p className="text-xs text-ink-tertiary flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          {booking.car.locationCity}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-ink-secondary whitespace-nowrap">
                  {fmt(booking.startDate)} → {fmt(booking.endDate)}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_PILL[booking.status] ?? STATUS_PILL.pending}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-bold text-ink-primary">
                  ${booking.totalPrice?.toLocaleString()}
                </td>
                <td className="px-5 py-4">
                  {booking.status === 'completed' && (
                    <button
                      onClick={() => onReview(booking)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber hover:text-amber/80 transition-colors"
                    >
                      <Star size={12} className="fill-amber" /> Rate
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<any>(null);
  const [activeNav, setActiveNav] = useState('overview');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) navigate('/login');
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

  const upgradeMutation = useMutation({
    mutationFn: userService.upgradeToLender,
    onSuccess: (updated) => {
      updateUser({ role: updated.role });
      toast.success("You're now a Lender! You can start listing cars.");
      setActiveNav('cars');
    },
    onError: () => toast.error('Upgrade failed. Please try again.'),
  });

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await userService.deleteAccount();
      await logout();
      navigate('/');
    } catch {
      setIsDeletingAccount(false);
    }
  };

  if (isAuthLoading || isStatsLoading || isBookingsLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-ink-tertiary" />
      </div>
    );
  }

  const roleLabel =
    user?.role === 'lender' ? 'Lender' : user?.role === 'admin' ? 'Admin' : 'Renter';

  const rolePill =
    user?.role === 'lender'
      ? 'text-amber bg-amber/10 border-amber/20'
      : user?.role === 'admin'
      ? 'text-red bg-red/[0.1] border-red/20'
      : 'text-blue-light bg-blue/10 border-blue/20';

  const statCards = [
    {
      label:       'Total Trips',
      value:       stats?.totalTrips ?? 0,
      icon:        Compass,
      iconColor:   '#3b82f6',
      iconBg:      'rgba(37,99,235,0.12)',
      iconBorder:  'rgba(37,99,235,0.22)',
      change:      '+12%',
      changeColor: 'text-green bg-green/10 border-green/20',
    },
    {
      label:       'Total Earnings',
      value:       `$${(stats?.totalEarnings ?? 0).toLocaleString()}`,
      icon:        TrendingUp,
      iconColor:   '#22c55e',
      iconBg:      'rgba(34,197,94,0.12)',
      iconBorder:  'rgba(34,197,94,0.22)',
      change:      '+8%',
      changeColor: 'text-green bg-green/10 border-green/20',
    },
    {
      label:       'Active Rentals',
      value:       stats?.activeRentals ?? 0,
      icon:        Clock,
      iconColor:   '#f59e0b',
      iconBg:      'rgba(245,158,11,0.12)',
      iconBorder:  'rgba(245,158,11,0.22)',
      change:      null,
      changeColor: '',
    },
    {
      label:       'Verified Cars',
      value:       stats?.verifiedCars ?? 0,
      icon:        CheckCircle,
      iconColor:   '#a855f7',
      iconBg:      'rgba(168,85,247,0.12)',
      iconBorder:  'rgba(168,85,247,0.22)',
      change:      '+1',
      changeColor: 'text-green bg-green/10 border-green/20',
    },
  ];

  const navItems = [
    { id: 'overview',  label: 'Overview',    icon: LayoutDashboard },
    { id: 'bookings',  label: 'My Bookings', icon: Calendar },
    ...(user?.role === 'lender' ? [{ id: 'cars', label: 'My Cars', icon: Car }] : []),
    { id: 'profile',   label: 'Profile',     icon: UserIcon },
    { id: 'settings',  label: 'Settings',    icon: Settings },
  ];

  const allBookings = (bookings as any[]) ?? [];
  const recentBookings = allBookings.slice(0, 6);

  const pageTitle: Record<string, React.ReactNode> = {
    overview: (
      <>
        Welcome back,{' '}
        <span style={{ background: 'linear-gradient(to right, #fcd34d, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {user?.name?.split(' ')[0]}
        </span>
      </>
    ),
    bookings: 'My Bookings',
    cars:     'My Cars',
    profile:  'My Profile',
    settings: 'Settings',
  };

  const pageSubtitle: Record<string, string> = {
    overview: "Here's what's happening with your account today.",
    bookings: 'Manage and track all your rental bookings.',
    cars:     'Manage your listed vehicles.',
    profile:  'View and update your account information.',
    settings: 'Manage preferences and account security.',
  };

  const showAddCar = user?.role === 'lender' && (activeNav === 'overview' || activeNav === 'cars');

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-20 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[40%] h-[35%] opacity-[0.04] blur-[120px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
      <div className="fixed bottom-0 left-0 w-[30%] h-[30%] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">

        {/* Mobile tab bar */}
        <div className="lg:hidden mb-6 overflow-x-auto">
          <div className="flex gap-1.5 pb-1 w-max">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                  activeNav === item.id
                    ? 'bg-surface-3 text-ink-primary border border-[#333]'
                    : 'text-ink-tertiary bg-surface-1 border border-[#1c1c1c] hover:text-ink-secondary'
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-7 items-start">

          {/* ── Sidebar ── */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-28"
          >
            <div className="rounded-2xl bg-surface-1 border border-[#1c1c1c] overflow-hidden">

              {/* Profile block */}
              <div className="p-5 border-b border-[#1c1c1c]">
                <div className="flex flex-col items-center text-center">
                  <button
                    onClick={() => setActiveNav('profile')}
                    className="relative mb-3 group focus:outline-none"
                    title="Edit profile"
                  >
                    <img
                      src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=1c1c1c&color=a1a1aa&size=200`}
                      alt={user?.name}
                      className="w-16 h-16 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
                    />
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green rounded-full border-2 border-surface-1" />
                  </button>
                  <p className="font-semibold text-[15px] text-ink-primary leading-tight">{user?.name}</p>
                  <span className={`mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${rolePill}`}>
                    {roleLabel}
                  </span>
                </div>
              </div>

              {/* Nav */}
              <div className="p-2.5">
                <nav className="space-y-0.5">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeNav === item.id
                          ? 'bg-surface-3 text-ink-primary border border-[#333]'
                          : 'text-ink-tertiary hover:text-ink-secondary hover:bg-surface-2'
                      }`}
                    >
                      <item.icon size={15} />
                      {item.label}
                      {activeNav === item.id && <ChevronRight size={13} className="ml-auto text-ink-tertiary" />}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Logout */}
              <div className="px-2.5 pb-2.5">
                <div className="border-t border-[#1c1c1c] pt-2.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red hover:bg-red/[0.08] transition-all"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0 space-y-7">

            {/* Page header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {pageTitle[activeNav]}
                </h1>
                <p className="text-sm text-ink-tertiary mt-1">{pageSubtitle[activeNav]}</p>
              </div>
              {showAddCar && (
                <button
                  onClick={() => setIsAddCarModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-black flex-shrink-0 transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #fcd34d, #d97706)' }}
                >
                  <Plus size={16} /> Add New Car
                </button>
              )}
            </motion.div>

            {/* ── OVERVIEW ── */}
            {activeNav === 'overview' && (
              <>
                {/* Stat cards */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="grid grid-cols-2 xl:grid-cols-4 gap-4"
                >
                  {statCards.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05 }}
                      className="p-5 rounded-2xl bg-surface-1 border border-[#1c1c1c] hover:border-[#272727] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: stat.iconBg, border: `1px solid ${stat.iconBorder}` }}
                        >
                          <stat.icon size={18} style={{ color: stat.iconColor }} />
                        </div>
                        {stat.change && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${stat.changeColor}`}>
                            {stat.change}
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-ink-primary mb-0.5">{stat.value}</p>
                      <p className="text-xs text-ink-tertiary">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Recent bookings */}
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-ink-primary">Recent Bookings</h2>
                    {allBookings.length > 6 && (
                      <button
                        onClick={() => setActiveNav('bookings')}
                        className="flex items-center gap-1 text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
                      >
                        View all <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                  <BookingsTable items={recentBookings} onReview={setReviewBooking} onBrowse={() => navigate('/browse')} />
                </motion.section>

                {/* Lender cars */}
                {user?.role === 'lender' && (
                  <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-ink-primary">My Cars</h2>
                      <button
                        onClick={() => setActiveNav('cars')}
                        className="flex items-center gap-1 text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
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
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <BookingsTable items={allBookings} onReview={setReviewBooking} onBrowse={() => navigate('/browse')} />
              </motion.section>
            )}

            {/* ── CARS ── */}
            {activeNav === 'cars' && user?.role === 'lender' && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <CarsList lenderId={user.id} />
              </motion.section>
            )}

            {/* ── PROFILE ── */}
            {activeNav === 'profile' && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <ProfileEditor />

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {statCards.map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-surface-1 border border-[#1c1c1c] text-center">
                      <p className="text-xl font-bold text-ink-primary">{stat.value}</p>
                      <p className="text-xs text-ink-tertiary mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ── SETTINGS ── */}
            {activeNav === 'settings' && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Security */}
                <div className="p-6 rounded-2xl bg-surface-1 border border-[#1c1c1c]">
                  <h3 className="font-semibold text-[15px] text-ink-primary mb-5 flex items-center gap-2">
                    <Key size={16} className="text-blue-light" /> Security
                  </h3>
                  <button
                    onClick={() => navigate('/forgot-password')}
                    className="w-full flex items-center justify-between py-3 px-3 -mx-1 rounded-xl hover:bg-surface-2 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-3 border border-[#282828] flex items-center justify-center">
                        <Key size={14} className="text-ink-secondary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-ink-primary">Change Password</p>
                        <p className="text-xs text-ink-tertiary">Send a reset link to your email</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-ink-tertiary group-hover:text-ink-secondary transition-colors" />
                  </button>
                </div>

                {/* Notifications */}
                <div className="p-6 rounded-2xl bg-surface-1 border border-[#1c1c1c]">
                  <h3 className="font-semibold text-[15px] text-ink-primary mb-5 flex items-center gap-2">
                    <Bell size={16} className="text-blue-light" /> Notifications
                  </h3>
                  <div className="space-y-1">
                    {[
                      { label: 'Booking confirmations', desc: 'Get notified when a booking is confirmed', on: true },
                      { label: 'New messages',           desc: 'Receive alerts for new chat messages',     on: true },
                      { label: 'Promotional offers',     desc: 'Hear about deals and discounts',           on: false },
                      { label: 'Platform updates',       desc: 'Stay informed about new features',         on: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-3.5 border-b border-[#1c1c1c] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-ink-primary">{item.label}</p>
                          <p className="text-xs text-ink-tertiary mt-0.5">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                          <input type="checkbox" defaultChecked={item.on} className="sr-only peer" />
                          <div className="w-10 h-5 bg-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger zone */}
                <div className="p-6 rounded-2xl bg-red/[0.03] border border-red/20">
                  <h3 className="font-semibold text-[15px] text-red mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} /> Danger Zone
                  </h3>
                  <p className="text-sm text-ink-tertiary mb-5 leading-relaxed">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>

                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red border border-red/20 bg-red/[0.06] hover:bg-red/[0.12] transition-colors"
                    >
                      Delete My Account
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-red/[0.06] border border-red/20 space-y-3">
                      <p className="text-sm font-semibold text-red">Are you absolutely sure?</p>
                      <p className="text-xs text-ink-tertiary">This will permanently remove all your data.</p>
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red text-white hover:bg-red/80 disabled:opacity-60 transition-colors"
                        >
                          {isDeletingAccount ? <Loader2 size={13} className="animate-spin" /> : null}
                          Yes, delete
                        </button>
                        <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </main>
        </div>
      </div>

      {isAddCarModalOpen && <AddCarModal onClose={() => setIsAddCarModalOpen(false)} />}

      {reviewBooking && (
        <ReviewModal
          carId={reviewBooking.carId}
          carTitle={`${reviewBooking.car?.brand} ${reviewBooking.car?.model}`}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['dashboardBookings'] })}
        />
      )}
    </div>
  );
};

export default Dashboard;

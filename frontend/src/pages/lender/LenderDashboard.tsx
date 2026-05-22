import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Car,
  Calendar,
  TrendingUp,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Star,
  DollarSign,
  MapPin,
  LayoutDashboard,
  Trash2,
  Eye,
  MessageCircle,
  Fuel,
  Gauge,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Banknote,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { carService } from '../../services/car.service';
import { bookingService } from '../../services/booking.service';
import { chatService } from '../../services/chat.service';
import AddCarModal from '../../components/Dashboard/AddCarModal';
import { getImageUrl } from '../../utils/image';
import LenderChatInbox from '../../components/Chat/LenderChatInbox';

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const CAR_PLACEHOLDER =
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&q=70';

// ─── Delete confirmation modal ───────────────────────────────────────────────
const DeleteConfirmModal: React.FC<{
  car: any;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ car, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative w-full max-w-sm rounded-2xl bg-[#111115] border border-white/10 p-6 shadow-2xl"
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle size={22} className="text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">Remove Listing?</h3>
      <p className="text-sm text-gray-400 mb-5">
        <span className="text-white font-medium">
          {car.title || `${car.brand} ${car.model}`}
        </span>{' '}
        will be permanently removed from your listings. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Trash2 size={14} />
              Remove
            </>
          )}
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Individual car management card ──────────────────────────────────────────
const CarsManageCard: React.FC<{
  car: any;
  onView: (id: string) => void;
  onDelete: (car: any) => void;
  index: number;
}> = ({ car, onView, onDelete, index }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isAvailable = car.availabilityStatus === 'available' || car.isAvailable !== false;

  const imgSrc = car.images?.[0]?.imageUrl
    ? getImageUrl(car.images[0].imageUrl, 600)
    : CAR_PLACEHOLDER;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.07 }}
      className="group relative rounded-2xl bg-[#111115] border border-white/8 overflow-hidden
                 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-400"
    >
      {/* ── Image ── */}
      <div className="relative h-52 overflow-hidden bg-[#0d0d11]">
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={imgSrc}
          alt={car.title || `${car.brand} ${car.model}`}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-black/20 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md ${
              isAvailable
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            {isAvailable ? 'Available' : 'Booked'}
          </span>
        </div>

        {/* Year badge */}
        {car.year && (
          <div className="absolute top-3 right-3">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/50 border border-white/20 backdrop-blur-md text-gray-200">
              {car.year}
            </span>
          </div>
        )}

        {/* Category badge at bottom-left */}
        {car.category?.name && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 backdrop-blur-md uppercase tracking-wider">
              {car.category.name}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 space-y-3">
        {/* Title & Price */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-snug truncate group-hover:text-blue-400 transition-colors">
              {car.title || `${car.brand} ${car.model}`}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {car.brand} &middot; {car.model}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-white">${car.pricePerDay}</p>
            <p className="text-[11px] text-gray-500">/day</p>
          </div>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 flex-wrap">
          {car.locationCity && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} className="text-blue-400" />
              {car.locationCity}
            </span>
          )}
          {car.fuelType && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Fuel size={11} className="text-blue-400" />
              {car.fuelType}
            </span>
          )}
          {car.transmission && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Gauge size={11} className="text-blue-400" />
              {car.transmission}
            </span>
          )}
          {car.seats && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Users size={11} className="text-blue-400" />
              {car.seats}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        {/* Rating + Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {car.averageRating && car.averageRating > 0 ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-lg border border-yellow-500/20">
                <Star size={11} fill="#fbbf24" />
                {car.averageRating.toFixed(1)}
                {car.totalReviews > 0 && (
                  <span className="text-gray-500 font-normal">({car.totalReviews})</span>
                )}
              </span>
            ) : (
              <span className="text-xs text-gray-600 italic">No reviews yet</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(car)}
              className="p-2 rounded-lg bg-red-500/8 text-red-400/70 border border-red-500/10 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/25 transition-all"
              title="Remove listing"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => onView(car.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold hover:bg-blue-500/20 hover:border-blue-500/35 transition-all"
            >
              <Eye size={13} />
              View Listing
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Cars grid ────────────────────────────────────────────────────────────────
interface CarsGridProps {
  cars: any[];
  onView: (id: string) => void;
  onDelete: (car: any) => void;
}

const CarsGrid: React.FC<CarsGridProps> = ({ cars, onView, onDelete }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {cars.map((car: any, i: number) => (
      <CarsManageCard key={car.id} car={car} onView={onView} onDelete={onDelete} index={i} />
    ))}
  </div>
);

// ─── Bookings list ────────────────────────────────────────────────────────────
interface BookingsListProps {
  bookings: any[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  showActions?: boolean;
}

const BookingsList: React.FC<BookingsListProps> = ({ bookings, onAccept, onDecline, showActions }) => (
  <div className="space-y-3">
    {bookings.map((booking: any, i: number) => (
      <motion.div
        key={booking.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-[#111115] border border-white/8 hover:border-white/15 transition-all"
      >
        <div className="relative w-full sm:w-16 h-28 sm:h-12 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={
              booking.car?.images?.[0]?.imageUrl ||
              CAR_PLACEHOLDER
            }
            alt={booking.car?.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {booking.car?.title || `${booking.car?.brand} ${booking.car?.model}`}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' – '}
            {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-sm font-bold text-white">${booking.totalPrice}</span>
          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => onAccept(booking.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
              >
                <CheckCircle size={13} /> Accept
              </button>
              <button
                onClick={() => onDecline(booking.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all"
              >
                <XCircle size={13} /> Decline
              </button>
            </div>
          )}
        </div>
      </motion.div>
    ))}
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const LenderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'bookings' | 'messages'>('overview');
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['lender-stats'],
    queryFn: bookingService.getDashboardStats,
    enabled: !!user && user.role === 'lender',
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['lender-bookings'],
    queryFn: bookingService.getLenderBookings,
    enabled: !!user && user.role === 'lender',
  });

  const { data: myCars = [], isLoading: carsLoading } = useQuery({
    queryKey: ['lender-cars', user?.id],
    queryFn: () => carService.getByLender(user!.id),
    enabled: !!user && user.role === 'lender',
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['lender-chats'],
    queryFn: chatService.getChats,
    enabled: !!user && user.role === 'lender',
    refetchInterval: 30_000,
  });

  const unreadChatCount = (chats as any[]).filter((c: any) => {
    const last = c.messages?.[0];
    return last && last.senderId !== user?.id && last.status !== 'read';
  }).length;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingService.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lender-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['lender-stats'] });
      toast.success('Booking updated');
    },
    onError: () => toast.error('Failed to update booking'),
  });

  const deleteCarMutation = useMutation({
    mutationFn: (id: string) => carService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lender-cars'] });
      queryClient.invalidateQueries({ queryKey: ['lender-stats'] });
      toast.success('Listing removed successfully');
      setCarToDelete(null);
    },
    onError: () => toast.error('Failed to remove listing'),
  });

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  if (user.role !== 'lender') {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <Car size={36} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Lender Access Required</h2>
          <p className="text-gray-400 mb-6">
            This dashboard is for car hosts. If you want to list your car and earn money, switch to a
            lender account.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all text-sm"
            >
              My Dashboard
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition-all text-sm"
            >
              Become a Host
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Data ────────────────────────────────────────────────────────────────────
  const allBookings = (bookings as any[]) || [];
  const pendingBookings = allBookings.filter((b: any) => b.status === 'pending');
  const activeBookings = allBookings.filter(
    (b: any) => b.status === 'confirmed' || b.status === 'active',
  );
  const cars = (myCars as any[]);

  const statCards = [
    {
      label: 'Cars Listed',
      value: cars.length,
      icon: Car,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/15',
      sub: `${cars.filter((c) => c.isAvailable !== false).length} available`,
      trend: null,
    },
    {
      label: 'Total Earnings',
      value: `$${(stats?.totalEarnings || 0).toLocaleString()}`,
      icon: Banknote,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/15',
      sub: 'All time',
      trend: null,
    },
    {
      label: 'Active Rentals',
      value: activeBookings.length,
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/15',
      sub: 'Currently rented',
      trend: null,
    },
    {
      label: 'Pending',
      value: pendingBookings.length,
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/15',
      sub: 'Awaiting approval',
      trend: null,
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'cars', label: 'My Cars', icon: Car },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
  ] as const;

  const isLoading = bookingsLoading || carsLoading;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans pt-20 pb-16">
      {/* Background glows */}
      <div className="fixed top-0 right-0 w-[35%] h-[35%] bg-blue-600/4 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[30%] h-[30%] bg-emerald-600/4 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Car size={18} className="text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Host Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                {user.name.split(' ')[0]}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {cars.length} listing{cars.length !== 1 ? 's' : ''} · {pendingBookings.length} pending
            </p>
          </div>
          <button
            onClick={() => setIsAddCarOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm
                       hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all self-start sm:self-auto flex-shrink-0"
          >
            <Plus size={18} />
            Add New Car
          </button>
        </motion.div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                  : 'text-gray-400 bg-white/5 border border-white/8 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'bookings' && pendingBookings.length > 0 && (
                <span className="ml-0.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
              {tab.id === 'messages' && unreadChatCount > 0 && (
                <span className="ml-0.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl skeleton" />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-2xl skeleton" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ────────── OVERVIEW ────────── */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {statCards.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`relative p-5 rounded-2xl bg-[#111115] border ${stat.border} hover:border-opacity-40 transition-all group overflow-hidden`}
                    >
                      {/* glow accent */}
                      <div className={`absolute -top-4 -right-4 w-16 h-16 ${stat.bg} blur-xl opacity-60 rounded-full`} />
                      <div
                        className={`relative w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                      >
                        <stat.icon size={18} className={stat.color} />
                      </div>
                      <p className="text-2xl font-bold text-white relative">{stat.value}</p>
                      <p className="text-xs font-semibold text-gray-400 mt-0.5">{stat.label}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Pending requests */}
                {pendingBookings.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-display font-bold flex items-center gap-2">
                        <Clock size={18} className="text-amber-400" />
                        Pending Requests
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs font-bold">
                          {pendingBookings.length}
                        </span>
                      </h2>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        All bookings <ChevronRight size={14} />
                      </button>
                    </div>
                    <BookingsList
                      bookings={pendingBookings.slice(0, 3)}
                      onAccept={(id) => updateStatusMutation.mutate({ id, status: 'confirmed' })}
                      onDecline={(id) => updateStatusMutation.mutate({ id, status: 'cancelled' })}
                      showActions
                    />
                  </section>
                )}

                {/* My listings preview */}
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-display font-bold flex items-center gap-2">
                      <Car size={18} className="text-blue-400" />
                      My Listings
                    </h2>
                    <button
                      onClick={() => setActiveTab('cars')}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 transition-colors group"
                    >
                      Manage all{' '}
                      <ArrowUpRight
                        size={14}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </button>
                  </div>
                  {cars.length === 0 ? (
                    <div className="text-center py-14 rounded-2xl bg-[#111115] border border-white/8 border-dashed">
                      <Car size={36} className="mx-auto text-gray-700 mb-3" />
                      <p className="text-gray-400 font-medium">No listings yet</p>
                      <button
                        onClick={() => setIsAddCarOpen(true)}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-all"
                      >
                        + Add your first car
                      </button>
                    </div>
                  ) : (
                    <CarsGrid
                      cars={cars.slice(0, 3)}
                      onView={(id) => navigate(`/car/${id}`)}
                      onDelete={setCarToDelete}
                    />
                  )}
                </section>
              </motion.div>
            )}

            {/* ────────── MY CARS ────────── */}
            {activeTab === 'cars' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-bold">My Listings</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {cars.length} car{cars.length !== 1 ? 's' : ''} ·{' '}
                      {cars.filter((c) => c.isAvailable !== false).length} available
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddCarOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Plus size={15} />
                    Add Car
                  </button>
                </div>

                {cars.length === 0 ? (
                  <div className="text-center py-20 rounded-3xl bg-[#111115] border border-white/8 border-dashed">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                      <Car size={28} className="text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No cars listed yet</h3>
                    <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">
                      Start earning by listing your first vehicle on LuxeDrive.
                    </p>
                    <button
                      onClick={() => setIsAddCarOpen(true)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition-all"
                    >
                      <Plus size={16} className="inline mr-1.5 -mt-0.5" />
                      List Your First Car
                    </button>
                  </div>
                ) : (
                  <CarsGrid
                    cars={cars}
                    onView={(id) => navigate(`/car/${id}`)}
                    onDelete={setCarToDelete}
                  />
                )}
              </motion.div>
            )}

            {/* ────────── MESSAGES ────────── */}
            {activeTab === 'messages' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <LenderChatInbox />
              </motion.div>
            )}

            {/* ────────── BOOKINGS ────────── */}
            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {pendingBookings.length > 0 && (
                  <section>
                    <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                      <Clock size={16} className="text-amber-400" />
                      Pending Approval
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs font-bold">
                        {pendingBookings.length}
                      </span>
                    </h2>
                    <BookingsList
                      bookings={pendingBookings}
                      onAccept={(id) => updateStatusMutation.mutate({ id, status: 'confirmed' })}
                      onDecline={(id) => updateStatusMutation.mutate({ id, status: 'cancelled' })}
                      showActions
                    />
                  </section>
                )}

                <section>
                  <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-400" />
                    All Bookings
                  </h2>
                  {allBookings.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-[#111115] border border-white/8">
                      <Calendar size={36} className="mx-auto text-gray-600 mb-3" />
                      <p className="text-gray-400 font-medium">No bookings yet</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Bookings for your cars will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#111115] border border-white/8 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/5">
                              {['Vehicle', 'Dates', 'Status', 'Total', ''].map((h) => (
                                <th
                                  key={h}
                                  className={`text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                                    h === 'Dates' ? 'hidden sm:table-cell' : ''
                                  }`}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {allBookings.map((booking: any, idx: number) => (
                              <motion.tr
                                key={booking.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={booking.car?.images?.[0]?.imageUrl || CAR_PLACEHOLDER}
                                      alt={booking.car?.title}
                                      className="w-12 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div>
                                      <p className="text-sm font-semibold text-white truncate max-w-[130px]">
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
                                <td className="px-5 py-3.5 hidden sm:table-cell text-sm text-gray-400">
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
                                <td className="px-5 py-3.5">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                                      statusStyles[booking.status] || statusStyles.pending
                                    }`}
                                  >
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-sm font-semibold text-white">
                                  ${booking.totalPrice}
                                </td>
                                <td className="px-5 py-3.5">
                                  {booking.status === 'pending' && (
                                    <div className="flex gap-1.5 justify-end">
                                      <button
                                        onClick={() =>
                                          updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })
                                        }
                                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                        title="Accept"
                                      >
                                        <CheckCircle size={14} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })
                                        }
                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                        title="Decline"
                                      >
                                        <XCircle size={14} />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {isAddCarOpen && (
        <AddCarModal
          onClose={() => {
            setIsAddCarOpen(false);
            queryClient.invalidateQueries({ queryKey: ['lender-cars'] });
          }}
        />
      )}

      <AnimatePresence>
        {carToDelete && (
          <DeleteConfirmModal
            car={carToDelete}
            onConfirm={() => deleteCarMutation.mutate(carToDelete.id)}
            onCancel={() => setCarToDelete(null)}
            isLoading={deleteCarMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LenderDashboard;

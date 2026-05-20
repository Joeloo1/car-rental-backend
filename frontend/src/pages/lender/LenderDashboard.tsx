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
  Shield,
  MapPin,
  LayoutDashboard,
  Settings,
  Trash2,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { carService } from '../../services/car.service';
import { bookingService } from '../../services/booking.service';
import AddCarModal from '../../components/Dashboard/AddCarModal';
import { getImageUrl } from '../../utils/image';

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const LenderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'bookings'>('overview');
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
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

  const allBookings = (bookings as any[]) || [];
  const pendingBookings = allBookings.filter((b: any) => b.status === 'pending');
  const activeBookings = allBookings.filter(
    (b: any) => b.status === 'confirmed' || b.status === 'active',
  );

  const statCards = [
    {
      label: 'Cars Listed',
      value: (myCars as any[]).length || 0,
      icon: Car,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      sub: 'Active listings',
    },
    {
      label: 'Total Earnings',
      value: `$${stats?.totalEarnings || 0}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      sub: 'All time',
    },
    {
      label: 'Active Rentals',
      value: activeBookings.length,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      sub: 'Currently rented',
    },
    {
      label: 'Pending Requests',
      value: pendingBookings.length,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      sub: 'Awaiting approval',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'cars', label: 'My Cars', icon: Car },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
  ] as const;

  const isLoading = bookingsLoading || carsLoading;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans pt-20 pb-16">
      <div className="fixed top-0 right-0 w-[30%] h-[30%] bg-blue-600/5 blur-[90px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[25%] h-[25%] bg-emerald-600/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Car size={18} className="text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Host Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Welcome,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                {user.name.split(' ')[0]}
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your listings and track your earnings.
            </p>
          </div>
          <button
            onClick={() => setIsAddCarOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:shadow-[0_8px_24px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-all self-start sm:self-auto flex-shrink-0"
          >
            <Plus size={18} />
            Add New Car
          </button>
        </motion.div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex-shrink-0 relative ${
                activeTab === tab.id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 bg-white/5 border border-white/8 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'bookings' && pendingBookings.length > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {statCards.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-5 rounded-2xl bg-[#111115] border border-white/8 hover:border-white/15 transition-all group"
                    >
                      <div
                        className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <stat.icon size={20} className={stat.color} />
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Pending Requests */}
                {pendingBookings.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <Clock size={18} className="text-amber-400" />
                        Pending Requests
                        <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs font-bold">
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
                      bookings={pendingBookings}
                      onAccept={(id) => updateStatusMutation.mutate({ id, status: 'confirmed' })}
                      onDecline={(id) => updateStatusMutation.mutate({ id, status: 'cancelled' })}
                      showActions
                    />
                  </section>
                )}

                {/* My Cars Preview */}
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                      <Car size={18} className="text-blue-400" />
                      My Listings
                    </h2>
                    <button
                      onClick={() => setActiveTab('cars')}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      Manage <ChevronRight size={14} />
                    </button>
                  </div>
                  <CarsGrid cars={(myCars as any[]).slice(0, 4)} onView={(id) => navigate(`/car/${id}`)} />
                </section>
              </motion.div>
            )}

            {/* MY CARS */}
            {activeTab === 'cars' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                {(myCars as any[]).length === 0 ? (
                  <div className="text-center py-20 rounded-3xl bg-white/[0.02] border border-white/5">
                    <Car size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No cars listed yet</h3>
                    <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                      Start earning by listing your first vehicle.
                    </p>
                    <button
                      onClick={() => setIsAddCarOpen(true)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm"
                    >
                      List Your First Car
                    </button>
                  </div>
                ) : (
                  <CarsGrid cars={myCars as any[]} onView={(id) => navigate(`/car/${id}`)} />
                )}
              </motion.div>
            )}

            {/* BOOKINGS */}
            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Pending */}
                {pendingBookings.length > 0 && (
                  <section>
                    <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                      <Clock size={16} className="text-amber-400" /> Pending Approval
                    </h2>
                    <BookingsList
                      bookings={pendingBookings}
                      onAccept={(id) => updateStatusMutation.mutate({ id, status: 'confirmed' })}
                      onDecline={(id) => updateStatusMutation.mutate({ id, status: 'cancelled' })}
                      showActions
                    />
                  </section>
                )}

                {/* All bookings */}
                <section>
                  <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-400" /> All Bookings
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
                              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Vehicle
                              </th>
                              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                Dates
                              </th>
                              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                              <th className="px-5 py-3.5" />
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
                                      src={
                                        booking.car?.images?.[0]?.imageUrl ||
                                        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&q=60'
                                      }
                                      alt={booking.car?.title}
                                      className="w-12 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div>
                                      <p className="text-sm font-semibold text-white truncate max-w-[130px]">
                                        {booking.car?.title ||
                                          `${booking.car?.brand} ${booking.car?.model}`}
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
                                          updateStatusMutation.mutate({
                                            id: booking.id,
                                            status: 'confirmed',
                                          })
                                        }
                                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                        title="Accept"
                                      >
                                        <CheckCircle size={14} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateStatusMutation.mutate({
                                            id: booking.id,
                                            status: 'cancelled',
                                          })
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

      {isAddCarOpen && (
        <AddCarModal
          onClose={() => {
            setIsAddCarOpen(false);
            queryClient.invalidateQueries({ queryKey: ['lender-cars'] });
          }}
        />
      )}
    </div>
  );
};

interface BookingsListProps {
  bookings: any[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  showActions?: boolean;
}

const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  onAccept,
  onDecline,
  showActions,
}) => (
  <div className="space-y-3">
    {bookings.map((booking: any, i: number) => (
      <motion.div
        key={booking.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-[#111115] border border-white/8 hover:border-white/15 transition-all"
      >
        <img
          src={
            booking.car?.images?.[0]?.imageUrl ||
            'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&q=60'
          }
          alt={booking.car?.title}
          className="w-full sm:w-16 h-32 sm:h-12 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {booking.car?.title || `${booking.car?.brand} ${booking.car?.model}`}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
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

interface CarsGridProps {
  cars: any[];
  onView: (id: string) => void;
}

const CarsGrid: React.FC<CarsGridProps> = ({ cars, onView }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {cars.map((car: any, i: number) => (
      <motion.div
        key={car.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="rounded-2xl bg-[#111115] border border-white/8 overflow-hidden hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
      >
        <div className="relative h-40 overflow-hidden">
          <img
            src={
              car.images?.[0]?.imageUrl
                ? getImageUrl(car.images[0].imageUrl, 400)
                : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=70'
            }
            alt={car.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111115] via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                car.availabilityStatus === 'available' || car.isAvailable !== false
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/15 text-red-400 border-red-500/20'
              }`}
            >
              {car.availabilityStatus === 'available' || car.isAvailable !== false
                ? 'Available'
                : 'Unavailable'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white text-sm mb-1 truncate">
            {car.title || `${car.brand} ${car.model}`}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin size={11} />
                {car.locationCity || '—'}
              </p>
              <p className="text-sm font-semibold text-white mt-1">${car.pricePerDay}/day</p>
            </div>
            <button
              onClick={() => onView(car.id)}
              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
              title="View listing"
            >
              <Eye size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default LenderDashboard;

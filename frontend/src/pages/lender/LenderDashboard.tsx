import React, { useState, Suspense, lazy } from 'react';
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
  MapPin,
  LayoutDashboard,
  Trash2,
  MessageCircle,
  Fuel,
  Gauge,
  AlertTriangle,
  Banknote,
  User as UserIcon,
} from '@/lib/icons';
import ProfileEditor from '../../components/common/ProfileEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { carService } from '../../services/car.service';
import { bookingService } from '../../services/booking.service';
import { chatService } from '../../services/chat.service';
import AddCarModal from '../../components/Dashboard/AddCarModal';
import { getImageUrl } from '../../utils/image';
import LenderChatInbox from '../../components/Chat/LenderChatInbox';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
const EarningsChart = lazy(() =>
  import('../../components/Dashboard/DashboardCharts').then((m) => ({ default: m.EarningsChart }))
);

const statusVariants: Record<string, "success" | "destructive" | "warning" | "primary" | "secondary"> = {
  completed: 'success',
  cancelled: 'destructive',
  pending: 'warning',
  confirmed: 'primary',
  active: 'primary',
};

const CAR_PLACEHOLDER =
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&q=70';

const LenderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'bookings' | 'messages' | 'profile'>('overview');
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['lender-stats'],
    queryFn: bookingService.getDashboardStats,
    enabled: !!user && user.role === 'lender',
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['lender-bookings'],
    queryFn: () => bookingService.getLenderBookings(),
    enabled: !!user && user.role === 'lender',
  });
  const bookings: any[] = (bookingsData as any)?.data ?? [];

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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.10)', borderTopColor: 'var(--color-gold)' }} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  if (user.role !== 'lender') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(212,151,42,0.10)', border: '1px solid rgba(212,151,42,0.22)' }}>
            <Car size={36} className="text-gold" />
          </div>
          <h2 className="text-2xl font-display font-bold text-ink-primary mb-2">Lender Access Required</h2>
          <p className="text-ink-tertiary mb-6 text-sm leading-relaxed">
            This dashboard is for car hosts. If you want to list your car and earn money, switch to a
            lender account.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/dashboard')} variant="outline">My Dashboard</Button>
            <Button onClick={() => navigate('/register')}>Become a Host</Button>
          </div>
        </div>
      </div>
    );
  }

  const allBookings = (bookings as any[]) || [];
  const pendingBookings = allBookings.filter((b: any) => b.status === 'pending');
  const activeBookings = allBookings.filter((b: any) => b.status === 'confirmed' || b.status === 'active');
  const cars = (myCars as any[]);

  const availableCars = cars.filter((c) => c.isAvailable !== false).length;
  const totalTrips    = allBookings.filter((b: any) => b.status === 'completed').length;

  const statCards = [
    {
      label: 'Fleet Size',
      value: cars.length,
      icon: Car,
      color: 'text-gold',
      bg: 'bg-gold/10',
      sub: `${availableCars} of ${cars.length} available`,
      trend: availableCars > 0 ? `+${availableCars}` : null,
      trendUp: true,
    },
    {
      label: 'Total Earnings',
      value: `₦${(stats?.totalEarnings || 0).toLocaleString()}`,
      icon: Banknote,
      color: 'text-teal',
      bg: 'bg-teal/10',
      sub: 'All time',
      trend: totalTrips > 0 ? `${totalTrips} trips` : null,
      trendUp: true,
    },
    {
      label: 'Active Rentals',
      value: activeBookings.length,
      icon: TrendingUp,
      color: 'text-amber',
      bg: 'bg-amber/10',
      sub: 'Currently on road',
      trend: activeBookings.length > 0 ? 'Live' : null,
      trendUp: true,
    },
    {
      label: 'Pending Requests',
      value: pendingBookings.length,
      icon: Clock,
      color: pendingBookings.length > 0 ? 'text-amber' : 'text-teal',
      bg:    pendingBookings.length > 0 ? 'bg-amber/10' : 'bg-teal/10',
      sub: pendingBookings.length > 0 ? 'Action required' : 'All clear',
      trend: null,
      trendUp: false,
    },
  ];

  const isLoading = bookingsLoading || carsLoading;

  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[40%] h-[35%] opacity-[0.04] blur-[120px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #D4972A, transparent)' }} />
      <div className="fixed bottom-0 left-0 w-[30%] h-[30%] opacity-[0.03] blur-[100px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4A8EE8, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div>
            <Badge variant="secondary" className="mb-2 uppercase tracking-widest text-[10px]">
              Host Management
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-ink-primary">
              Welcome back,{' '}
              <span style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {user.name.split(' ')[0]}
              </span>
            </h1>
          </div>
          <Button
            onClick={() => setIsAddCarOpen(true)}
            leftIcon={<Plus size={18} />}
            size="lg"
            className="rounded-2xl shadow-lg"
          >
            Add New Vehicle
          </Button>
        </motion.div>

        {/* Tab Bar */}
        <div className="flex gap-1.5 mb-10 overflow-x-auto hide-scrollbar pb-1 p-1 bg-surface-1 border border-[#1c1c1c] rounded-2xl w-fit max-w-full">
          {[
            { id: 'overview',  label: 'Overview',    icon: LayoutDashboard },
            { id: 'cars',      label: 'My Vehicles', icon: Car },
            { id: 'bookings',  label: 'Bookings',    icon: Calendar,       badge: pendingBookings.length },
            { id: 'messages',  label: 'Messages',    icon: MessageCircle,  badge: unreadChatCount },
            { id: 'profile',   label: 'Profile',     icon: UserIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 relative ${
                activeTab === tab.id
                  ? 'bg-surface-3 text-ink-primary border border-[#333] shadow-sm'
                  : 'text-ink-tertiary hover:text-ink-secondary'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
              {tab.badge ? (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-black bg-gold">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-2xl skeleton animate-shimmer" />)}
            </div>
            <div className="h-96 rounded-2xl skeleton animate-shimmer" />
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05 }}
                      className="p-5 rounded-2xl border border-[#1c1c1c] hover:border-[#282828] hover:-translate-y-1 transition-all duration-200"
                      style={{ background: 'var(--color-surface-2)' }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                          <stat.icon size={16} className={stat.color} />
                        </div>
                        {stat.trend && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stat.trendUp ? 'text-teal bg-teal/10' : 'text-amber bg-amber/10'}`}>
                            {stat.trend}
                          </span>
                        )}
                      </div>
                      <p className="font-price text-[22px] font-bold text-ink-primary mb-0.5 leading-none">{stat.value}</p>
                      <p className="text-[11px] font-medium text-ink-secondary mt-1">{stat.label}</p>
                      <p className="text-[10px] text-ink-tertiary mt-2 pt-2 border-t border-[#1c1c1c]">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 rounded-2xl bg-surface-1 border border-[#1c1c1c] p-6">
                    <h3 className="font-semibold text-[15px] text-ink-primary mb-5 flex items-center gap-2">
                      <TrendingUp size={16} className="text-gold" /> Earnings Performance
                    </h3>
                    <Suspense fallback={<div className="h-[200px] rounded-xl skeleton animate-shimmer" />}>
                      <EarningsChart />
                    </Suspense>
                  </div>

                  {pendingBookings.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[15px] text-ink-primary">Pending Requests</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber/10 text-amber border border-amber/20">
                          {pendingBookings.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {pendingBookings.slice(0, 3).map((booking: any) => (
                          <div key={booking.id} className="p-4 rounded-2xl bg-surface-1 border border-[#1c1c1c] flex items-center gap-3 hover:border-[#272727] transition-colors">
                            <img src={booking.car?.images?.[0]?.imageUrl || CAR_PLACEHOLDER} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-ink-primary truncate">{booking.car?.brand} {booking.car?.model}</p>
                              <p className="text-[11px] text-ink-tertiary">₦{booking.totalPrice?.toLocaleString()} · Pending</p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-teal hover:bg-teal/10 transition-colors"
                                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-red hover:bg-red/[0.08] transition-colors"
                                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                              >
                                <XCircle size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <section>
                   <div className="flex items-center justify-between mb-5">
                     <h2 className="text-lg font-bold text-ink-primary flex items-center gap-2">
                       <Car size={18} className="text-gold" /> Active Listings
                     </h2>
                     <button
                       onClick={() => setActiveTab('cars')}
                       className="flex items-center gap-1 text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
                     >
                       Manage all <span className="text-xs">→</span>
                     </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {cars.slice(0, 3).map((car, i) => (
                       <CarsManageCard key={car.id} car={car} onView={(id) => navigate(`/car/${id}`)} onDelete={setCarToDelete} index={i} />
                     ))}
                   </div>
                </section>
              </motion.div>
            )}

            {/* MY CARS */}
            {activeTab === 'cars' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-ink-primary">Vehicle Fleet</h2>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-ink-tertiary bg-surface-2 border border-[#252525]">
                    {cars.length} listing{cars.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {cars.length === 0 ? (
                   <div className="text-center py-24 rounded-2xl border border-dashed border-[#252525] bg-surface-1">
                     <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-[#282828] flex items-center justify-center mx-auto mb-4">
                       <Car size={26} className="text-ink-tertiary" />
                     </div>
                     <h3 className="font-semibold text-[15px] text-ink-primary mb-2">No vehicles listed</h3>
                     <p className="text-sm text-ink-tertiary mb-7 max-w-xs mx-auto leading-relaxed">Start earning by listing your first vehicle on the platform.</p>
                     <Button onClick={() => setIsAddCarOpen(true)}>List Your First Car</Button>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cars.map((car, i) => (
                      <CarsManageCard key={car.id} car={car} onView={(id) => navigate(`/car/${id}`)} onDelete={setCarToDelete} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'messages' && <LenderChatInbox />}

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-2xl">

                {/* Host performance summary */}
                <div className="rounded-2xl border border-[#1c1c1c] overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="px-5 py-4 border-b border-[#1c1c1c] flex items-center gap-2">
                    <TrendingUp size={13} className="text-ink-tertiary" />
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-tertiary">Host performance</span>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-[#1c1c1c]">
                    {[
                      { label: 'Total earned',  value: `₦${(stats?.totalEarnings || 0).toLocaleString()}`, color: 'text-gold' },
                      { label: 'Trips completed', value: allBookings.filter((b: any) => b.status === 'completed').length, color: 'text-teal' },
                      { label: 'Vehicles',       value: cars.length, color: 'text-ink-primary' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="px-5 py-4 text-center">
                        <p className={`font-price text-xl font-bold ${color} leading-none`}>{value}</p>
                        <p className="text-[10px] text-ink-tertiary mt-1.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <ProfileEditor />

                {/* Quick links */}
                <div className="rounded-2xl border border-[#1c1c1c] overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="px-5 py-4 border-b border-[#1c1c1c] flex items-center gap-2">
                    <Banknote size={13} className="text-ink-tertiary" />
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-tertiary">Earnings & payouts</span>
                  </div>
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(212,151,42,0.10)', border: '1px solid rgba(212,151,42,0.20)' }}>
                      <Banknote size={15} className="text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-primary">Payout settings</p>
                      <p className="text-xs text-ink-tertiary">Bank account & transfer preferences</p>
                    </div>
                    <span className="text-[10px] font-semibold text-ink-tertiary border border-[#282828] rounded-full px-2 py-0.5"
                      style={{ background: 'var(--color-surface-3)' }}>
                      Coming soon
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'bookings' && (
               <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                 <h2 className="text-xl font-bold text-ink-primary">Reservation History</h2>
                 <div className="rounded-2xl bg-surface-1 border border-[#1c1c1c] overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full">
                       <thead>
                         <tr className="border-b border-[#1c1c1c]">
                           {['Vehicle', 'Schedule', 'Status', 'Total', ''].map((h) => (
                             <th key={h} className={`text-left px-5 py-3.5 text-xs font-semibold text-ink-tertiary uppercase tracking-wider ${h === 'Schedule' ? 'hidden sm:table-cell' : ''}`}>
                               {h}
                             </th>
                           ))}
                         </tr>
                       </thead>
                       <tbody>
                         {allBookings.map((booking: any, idx: number) => (
                           <motion.tr key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                             className="border-b border-[#1c1c1c] last:border-0 hover:bg-surface-2 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-surface-2">
                                    <img src={booking.car?.images?.[0]?.imageUrl || CAR_PLACEHOLDER} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-ink-primary truncate max-w-[130px]">{booking.car?.brand} {booking.car?.model}</p>
                                    <p className="text-[10px] text-ink-tertiary mt-0.5">{booking.car?.locationCity}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 hidden sm:table-cell text-xs text-ink-secondary whitespace-nowrap">
                                {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-5 py-4">
                                <Badge variant={statusVariants[booking.status] || 'secondary'} className="capitalize">{booking.status}</Badge>
                              </td>
                              <td className="px-5 py-4 text-sm font-bold text-ink-primary">₦{booking.totalPrice?.toLocaleString()}</td>
                              <td className="px-5 py-4">
                                {booking.status === 'pending' && (
                                  <div className="flex justify-end gap-1">
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-teal hover:bg-teal/10 transition-colors"
                                      onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}>
                                      <CheckCircle size={14} />
                                    </button>
                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red hover:bg-red/[0.08] transition-colors"
                                      onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}>
                                      <XCircle size={14} />
                                    </button>
                                  </div>
                                )}
                                {booking.status === 'confirmed' && new Date(booking.endDate) < new Date() && (
                                  <div className="flex justify-end">
                                    <button
                                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-teal hover:bg-teal/10 border border-teal/20 transition-colors flex items-center gap-1"
                                      onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'completed' })}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      <CheckCircle size={11} /> Mark complete
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
               </motion.div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isAddCarOpen && (
        <AddCarModal onClose={() => { setIsAddCarOpen(false); queryClient.invalidateQueries({ queryKey: ['lender-cars'] }); }} />
      )}

      <AnimatePresence>
        {carToDelete && (
          <DeleteConfirmModal car={carToDelete} onConfirm={() => deleteCarMutation.mutate(carToDelete.id)} onCancel={() => setCarToDelete(null)} isLoading={deleteCarMutation.isPending} />
        )}
      </AnimatePresence>
    </div>
  );
};

const CarsManageCard: React.FC<{ car: any; onView: (id: string) => void; onDelete: (car: any) => void; index: number }> = ({ car, onView, onDelete, index }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isAvailable = car.availabilityStatus === 'available' || car.isAvailable !== false;
  const imgSrc = car.images?.[0]?.imageUrl ? getImageUrl(car.images[0].imageUrl, 600) : CAR_PLACEHOLDER;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.07 }}
      className="rounded-2xl border border-[#1c1c1c] overflow-hidden group hover:border-[#2a2a2a] hover:-translate-y-1 transition-all duration-200"
      style={{ background: 'var(--color-surface-1)' }}
    >
      <div className="relative h-48 overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
        {!imgLoaded && <div className="absolute inset-0 skeleton animate-shimmer" />}
        <img
          src={imgSrc}
          alt={car.title}
          className={cn("w-full h-full object-cover group-hover:scale-105 transition-transform duration-700", imgLoaded ? 'opacity-100' : 'opacity-0')}
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge variant={isAvailable ? 'success' : 'destructive'}>
            {isAvailable ? 'Available' : 'Booked'}
          </Badge>
        </div>
        {car.category?.name && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="uppercase tracking-widest text-[9px] backdrop-blur-md">
              {car.category.name}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-[15px] text-ink-primary leading-tight truncate">{car.brand} {car.model}</h3>
            <p className="text-[11px] text-ink-tertiary flex items-center gap-1 mt-1">
              <MapPin size={10} /> {car.locationCity}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <p className="font-price text-lg font-bold text-gold">₦{car.pricePerDay?.toLocaleString()}</p>
            <p className="text-[9px] text-ink-tertiary uppercase tracking-wide">per day</p>
          </div>
        </div>

        <div className="flex gap-4 pb-4 mb-4 border-b border-[#1c1c1c]">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
            <Fuel size={12} className="text-gold/60" /> {car.fuelType}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
            <Gauge size={12} className="text-gold/60" /> {car.transmission}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 py-2 rounded-xl text-sm font-medium text-ink-secondary border border-[#252525] hover:border-[#333] hover:text-ink-primary transition-all"
            onClick={() => onView(car.id)}
          >
            View listing
          </button>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-tertiary hover:text-red hover:bg-red/[0.08] border border-[#252525] hover:border-red/20 transition-all"
            onClick={() => onDelete(car)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const DeleteConfirmModal: React.FC<{ car: any; onConfirm: () => void; onCancel: () => void; isLoading: boolean }> = ({ car, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(10,10,12,0.82)' }} onClick={onCancel} />
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="relative w-full max-w-sm rounded-2xl p-7 shadow-2xl border"
      style={{ background: 'var(--color-surface-2)', borderColor: '#252525' }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)' }}>
        <AlertTriangle size={22} className="text-red" />
      </div>
      <h3 className="text-[17px] font-semibold text-ink-primary mb-2">Remove Listing?</h3>
      <p className="text-sm text-ink-tertiary mb-7 leading-relaxed">
        This will permanently remove <span className="text-ink-primary font-semibold">{car.brand} {car.model}</span> from your listings and cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-ink-secondary border border-[#2a2a2a] hover:border-[#333] hover:text-ink-primary transition-all"
        >
          Cancel
        </button>
        <Button variant="danger" isLoading={isLoading} onClick={onConfirm} leftIcon={<Trash2 size={15} />} className="flex-1">
          Remove
        </Button>
      </div>
    </motion.div>
  </div>
);

export default LenderDashboard;

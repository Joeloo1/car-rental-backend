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
  MapPin,
  LayoutDashboard,
  Trash2,
  MessageCircle,
  Fuel,
  Gauge,
  AlertTriangle,
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
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import { EarningsChart } from '../../components/Dashboard/DashboardCharts';

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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  if (user.role !== 'lender') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <Car size={36} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Lender Access Required</h2>
          <p className="text-muted-foreground mb-6">
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

  const statCards = [
    {
      label: 'Cars Listed',
      value: cars.length,
      icon: Car,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      sub: `${cars.filter((c) => c.isAvailable !== false).length} available`,
    },
    {
      label: 'Total Earnings',
      value: `$${(stats?.totalEarnings || 0).toLocaleString()}`,
      icon: Banknote,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      sub: 'This month',
    },
    {
      label: 'Active Rentals',
      value: activeBookings.length,
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      sub: 'Currently on road',
    },
    {
      label: 'New Requests',
      value: pendingBookings.length,
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      sub: 'Action required',
    },
  ];

  const isLoading = bookingsLoading || carsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-24 pb-16">
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
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Welcome back, <span className="text-primary">{user.name.split(' ')[0]}</span>
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
        <div className="flex gap-2 mb-10 overflow-x-auto hide-scrollbar pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'cars', label: 'My Vehicles', icon: Car },
            { id: 'bookings', label: 'Bookings', icon: Calendar, badge: pendingBookings.length },
            { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadChatCount },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="rounded-full h-10 relative"
              leftIcon={<tab.icon size={16} />}
            >
              {tab.label}
              {tab.badge ? (
                <span className="ml-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-3xl bg-muted" />)}
            </div>
            <div className="h-96 rounded-3xl bg-muted" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statCards.map((stat, i) => (
                    <Card key={i} hover>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                            <stat.icon size={22} className={stat.color} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold font-display">{stat.value}</p>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium border-t border-border pt-3 mt-1">{stat.sub}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Earnings Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EarningsChart />
                    </CardContent>
                  </Card>
                  
                  {pendingBookings.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-lg">Quick Actions</h3>
                        <Badge variant="warning">{pendingBookings.length} Requests</Badge>
                      </div>
                      <div className="space-y-3">
                        {pendingBookings.slice(0, 3).map((booking: any) => (
                          <div key={booking.id} className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
                             <img src={booking.car?.images?.[0]?.imageUrl || CAR_PLACEHOLDER} className="w-12 h-12 rounded-xl object-cover" />
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold truncate">{booking.car?.brand} {booking.car?.model}</p>
                               <p className="text-[10px] text-muted-foreground">${booking.totalPrice} · Pending</p>
                             </div>
                             <div className="flex gap-1">
                               <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}>
                                 <CheckCircle size={14} />
                               </Button>
                               <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}>
                                 <XCircle size={14} />
                               </Button>
                             </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <section>
                   <div className="flex items-center justify-between mb-6">
                     <h2 className="text-xl font-display font-bold flex items-center gap-2">
                       <Car size={20} className="text-primary" /> Active Listings
                     </h2>
                     <Button variant="ghost" size="sm" onClick={() => setActiveTab('cars')}>Manage All</Button>
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
                  <h2 className="text-2xl font-display font-bold">Vehicle Fleet</h2>
                  <Badge>{cars.length} Listings</Badge>
                </div>
                {cars.length === 0 ? (
                   <div className="text-center py-32 bg-card border border-border border-dashed rounded-3xl">
                     <Car size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                     <h3 className="text-xl font-display font-bold mb-2">No vehicles listed</h3>
                     <p className="text-muted-foreground mb-8">Start earning by listing your first vehicle on the platform.</p>
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

            {activeTab === 'bookings' && (
               <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <h2 className="text-2xl font-display font-bold">Reservation History</h2>
                 <div className="bg-card border border-border rounded-3xl overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full">
                       <thead>
                         <tr className="border-b border-border bg-muted/30">
                           <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vehicle</th>
                           <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Schedule</th>
                           <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                           <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                           <th className="px-6 py-4" />
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-border">
                         {allBookings.map((booking: any, idx: number) => (
                           <motion.tr key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <img src={booking.car?.images?.[0]?.imageUrl || CAR_PLACEHOLDER} className="w-14 h-10 rounded-lg object-cover border border-border" />
                                  <div>
                                    <p className="text-sm font-bold truncate max-w-[140px]">{booking.car?.brand} {booking.car?.model}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{booking.car?.locationCity}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 hidden sm:table-cell">
                                <p className="text-xs font-medium">
                                  {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={statusVariants[booking.status] || 'secondary'}>{booking.status}</Badge>
                              </td>
                              <td className="px-6 py-4 font-bold">${booking.totalPrice}</td>
                              <td className="px-6 py-4 text-right">
                                {booking.status === 'pending' && (
                                  <div className="flex justify-end gap-2">
                                    <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-500" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}>
                                      <CheckCircle size={14} />
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8 text-destructive" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}>
                                      <XCircle size={14} />
                                    </Button>
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
    >
      <Card hover className="overflow-hidden group">
        <div className="relative h-52 overflow-hidden bg-muted">
          <img
            src={imgSrc}
            alt={car.title}
            className={cn("w-full h-full object-cover group-hover:scale-110 transition-transform duration-700", imgLoaded ? 'opacity-100' : 'opacity-0')}
            onLoad={() => setImgLoaded(true)}
          />
          <div className="absolute top-3 left-3">
             <Badge variant={isAvailable ? 'success' : 'destructive'} className="backdrop-blur-md bg-opacity-80">
               {isAvailable ? 'Available' : 'Booked'}
             </Badge>
          </div>
          <div className="absolute bottom-3 left-3">
             <Badge variant="secondary" className="backdrop-blur-md bg-opacity-80 uppercase tracking-widest text-[8px]">
               {car.category?.name}
             </Badge>
          </div>
        </div>
        <CardContent className="p-5">
           <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg leading-tight truncate">{car.brand} {car.model}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin size={10} /> {car.locationCity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">${car.pricePerDay}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">per day</p>
              </div>
           </div>
           
           <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Fuel size={14} className="text-primary" /> {car.fuelType}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Gauge size={14} className="text-primary" /> {car.transmission}
              </div>
           </div>

           <div className="flex gap-2">
             <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(car.id)}>View</Button>
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(car)}>
               <Trash2 size={16} />
             </Button>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DeleteConfirmModal: React.FC<{ car: any; onConfirm: () => void; onCancel: () => void; isLoading: boolean }> = ({ car, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel} />
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm rounded-3xl bg-card border border-border p-8 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
        <AlertTriangle size={28} className="text-destructive" />
      </div>
      <h3 className="text-xl font-display font-bold mb-2">Remove Listing?</h3>
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        Are you sure you want to remove <span className="text-foreground font-bold">{car.brand} {car.model}</span>? This action cannot be undone.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" isLoading={isLoading} onClick={onConfirm} leftIcon={<Trash2 size={16} />}>Remove</Button>
      </div>
    </motion.div>
  </div>
);

export default LenderDashboard;

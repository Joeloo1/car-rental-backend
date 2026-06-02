import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Car,
  LayoutDashboard,
  Trash2,
  Shield,
  TrendingUp,
  CheckCircle,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  User as UserIcon,
} from 'lucide-react';
import ProfileEditor from '../../components/common/ProfileEditor';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/admin.service';
const OverviewChart = lazy(() =>
  import('../../components/Dashboard/DashboardCharts').then((m) => ({ default: m.OverviewChart }))
);
const CategoryChart = lazy(() =>
  import('../../components/Dashboard/DashboardCharts').then((m) => ({ default: m.CategoryChart }))
);
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { cn } from '../../utils/cn';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'cars' | 'profile'>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [carSearch, setCarSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
    enabled: !!user && user.role === 'admin',
  });

  const { data: cars = [], isLoading: carsLoading } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: adminService.getAllCars,
    enabled: !!user && user.role === 'admin',
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted');
      setDeletingId(null);
    },
    onError: () => {
      toast.error('Failed to delete user');
      setDeletingId(null);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminService.updateUser(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role updated');
    },
    onError: () => toast.error('Failed to update role'),
  });

  const deleteCarMutation = useMutation({
    mutationFn: adminService.deleteCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      toast.success('Car removed');
      setDeletingId(null);
    },
    onError: () => {
      toast.error('Failed to remove car');
      setDeletingId(null);
    },
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-5">
            <Shield size={36} className="text-destructive" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2 text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You don't have permission to view this page.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const totalLenders = users.filter((u) => u.role === 'lender').length;
  
  const statCards = [
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      trend: '+12%',
      trendUp: true,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Active Listings',
      value: cars.length,
      icon: Car,
      trend: '+5%',
      trendUp: true,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      label: 'Verified Hosts',
      value: totalLenders,
      icon: CheckCircle,
      trend: '+8%',
      trendUp: true,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Growth Rate',
      value: '24%',
      icon: TrendingUp,
      trend: '+2.4%',
      trendUp: true,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
  ];

  const categoryData = [
    { name: 'Luxury', value: 30 },
    { name: 'SUV', value: 45 },
    { name: 'Sports', value: 15 },
    { name: 'Electric', value: 10 },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const filteredCars = cars.filter(
    (c) =>
      c.brand.toLowerCase().includes(carSearch.toLowerCase()) ||
      c.model.toLowerCase().includes(carSearch.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(carSearch.toLowerCase()),
  );

  const isLoading = usersLoading || carsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6"
        >
          <div>
            <Badge variant="secondary" className="mb-2 uppercase tracking-widest text-[10px]">
              Admin Control Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Platform <span className="text-primary">Overview</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')} leftIcon={<ChevronRight size={16} className="rotate-180" />}>
              Main Dashboard
            </Button>
            <Button leftIcon={<Shield size={16} />}>Security Audit</Button>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-10 overflow-x-auto hide-scrollbar pb-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'cars', label: 'Vehicle Listings', icon: Car },
            { id: 'profile', label: 'My Profile', icon: UserIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="rounded-full h-10"
              leftIcon={<tab.icon size={16} />}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-muted" />
              ))}
            </div>
            <div className="h-96 rounded-3xl bg-muted" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statCards.map((stat, i) => (
                    <Card key={i} hover className="border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                            <stat.icon size={22} className={stat.color} />
                          </div>
                          <div className={cn(
                            "flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full",
                            stat.trendUp ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
                          )}>
                            {stat.trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {stat.trend}
                          </div>
                        </div>
                        <p className="text-3xl font-bold font-display">{stat.value}</p>
                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Growth Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-xl" />}>
                        <OverviewChart />
                      </Suspense>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fleet Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-xl" />}>
                        <CategoryChart data={categoryData} />
                      </Suspense>
                      <div className="space-y-3 mt-4">
                        {categoryData.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="font-bold">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <section>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <Users size={20} className="text-primary" /> Newest Users
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('users')}>
                        View all
                      </Button>
                    </div>
                    <UserTable
                      users={users.slice(0, 5)}
                      onDelete={(id) => { setDeletingId(id); deleteUserMutation.mutate(id); }}
                      onRoleChange={(id, role) => updateRoleMutation.mutate({ id, role })}
                      deletingId={deletingId}
                    />
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <Car size={20} className="text-primary" /> Recent Listings
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('cars')}>
                        View all
                      </Button>
                    </div>
                    <CarTable
                      cars={cars.slice(0, 5)}
                      onDelete={(id) => { setDeletingId(id); deleteCarMutation.mutate(id); }}
                      deletingId={deletingId}
                    />
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Input
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="max-w-md"
                    leftIcon={<Search size={18} />}
                  />
                  <span className="text-sm text-muted-foreground ml-auto">
                    {filteredUsers.length} Users found
                  </span>
                </div>
                <UserTable
                  users={filteredUsers}
                  onDelete={(id) => { setDeletingId(id); deleteUserMutation.mutate(id); }}
                  onRoleChange={(id, role) => updateRoleMutation.mutate({ id, role })}
                  deletingId={deletingId}
                />
              </motion.div>
            )}

            {activeTab === 'cars' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Input
                    placeholder="Search vehicles by brand, model, or title..."
                    value={carSearch}
                    onChange={(e) => setCarSearch(e.target.value)}
                    className="max-w-md"
                    leftIcon={<Search size={18} />}
                  />
                  <span className="text-sm text-muted-foreground ml-auto">
                    {filteredCars.length} Vehicles listed
                  </span>
                </div>
                <CarTable
                  cars={filteredCars}
                  onDelete={(id) => { setDeletingId(id); deleteCarMutation.mutate(id); }}
                  deletingId={deletingId}
                />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl"
              >
                <ProfileEditor />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const UserTable: React.FC<{ users: any[], onDelete: (id: string) => void, onRoleChange: (id: string, role: string) => void, deletingId: string | null }> = ({ users, onDelete, onRoleChange, deletingId }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-20 rounded-3xl bg-card border border-border">
        <Users size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium">No users found</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Role</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Status</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u: any, i: number) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-sm font-bold border border-white/5">
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[120px]">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <select
                    value={u.role}
                    onChange={(e) => onRoleChange(u.id, e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-border bg-background cursor-pointer outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="User">User</option>
                    <option value="lender">Lender</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  {u.isVerified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(u.id)}
                    disabled={deletingId === u.id}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {deletingId === u.id ? (
                      <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CarTable: React.FC<{ cars: any[], onDelete: (id: string) => void, deletingId: string | null }> = ({ cars, onDelete, deletingId }) => {
  const navigate = useNavigate();

  if (cars.length === 0) {
    return (
      <div className="text-center py-20 rounded-3xl bg-card border border-border">
        <Car size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium">No vehicles found</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vehicle</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Host</th>
              <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pricing</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cars.map((car: any, i: number) => (
              <motion.tr
                key={car.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={car.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&q=60'}
                      alt={car.title}
                      className="w-14 h-10 rounded-lg object-cover border border-border"
                    />
                    <div>
                      <p className="text-sm font-bold truncate max-w-[140px]">
                        {car.title || `${car.brand} ${car.model}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{car.locationCity}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-xs font-medium text-muted-foreground">{car.lender?.name || '—'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-primary">${car.pricePerDay}<span className="text-[10px] text-muted-foreground font-normal">/day</span></span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/car/${car.id}`)}
                    >
                      <TrendingUp size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(car.id)}
                      disabled={deletingId === car.id}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {deletingId === car.id ? (
                        <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from 'react';
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
  XCircle,
  Search,
  ChevronRight,
  AlertTriangle,
  Crown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/admin.service';

const roleColors: Record<string, string> = {
  admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  lender: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  User: 'bg-white/10 text-gray-300 border-white/20',
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'cars'>('overview');
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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <Shield size={36} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don't have permission to view this page.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const totalLenders = users.filter((u) => u.role === 'lender').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  const statCards = [
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      sub: `${totalLenders} lenders`,
    },
    {
      label: 'Total Cars',
      value: cars.length,
      icon: Car,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      sub: `${cars.filter((c) => (c as any).isAvailable !== false).length} available`,
    },
    {
      label: 'Verified Hosts',
      value: totalLenders,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      sub: 'Active lenders',
    },
    {
      label: 'Admin Accounts',
      value: totalAdmins,
      icon: Crown,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      sub: 'Platform admins',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'cars', label: 'Cars', icon: Car },
  ] as const;

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
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans pt-20 pb-16">
      <div className="fixed top-0 right-0 w-[35%] h-[35%] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[25%] h-[25%] bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                <Crown size={18} className="text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">
                Admin Panel
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Platform{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Control
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage users, cars, and platform activity.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            My Dashboard
            <ChevronRight size={14} />
          </button>
        </motion.div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 bg-white/5 border border-white/8 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {statCards.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-5 rounded-2xl bg-[#111115] border border-white/8 hover:border-white/15 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <stat.icon size={20} className={stat.color} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Users */}
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                      <Users size={18} className="text-blue-400" /> Recent Users
                    </h2>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  <UserTable
                    users={users.slice(0, 8)}
                    onDelete={(id) => { setDeletingId(id); deleteUserMutation.mutate(id); }}
                    onRoleChange={(id, role) => updateRoleMutation.mutate({ id, role })}
                    deletingId={deletingId}
                  />
                </section>

                {/* Recent Cars */}
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                      <Car size={18} className="text-purple-400" /> Recent Listings
                    </h2>
                    <button
                      onClick={() => setActiveTab('cars')}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  <CarTable
                    cars={cars.slice(0, 6)}
                    onDelete={(id) => { setDeletingId(id); deleteCarMutation.mutate(id); }}
                    deletingId={deletingId}
                  />
                </section>
              </motion.div>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search users…"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-[#111115] border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40 transition-colors text-sm"
                    />
                  </div>
                  <span className="text-sm text-gray-500">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
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

            {/* CARS */}
            {activeTab === 'cars' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search cars…"
                      value={carSearch}
                      onChange={(e) => setCarSearch(e.target.value)}
                      className="w-full bg-[#111115] border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40 transition-colors text-sm"
                    />
                  </div>
                  <span className="text-sm text-gray-500">
                    {filteredCars.length} car{filteredCars.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <CarTable
                  cars={filteredCars}
                  onDelete={(id) => { setDeletingId(id); deleteCarMutation.mutate(id); }}
                  deletingId={deletingId}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface UserTableProps {
  users: any[];
  onDelete: (id: string) => void;
  onRoleChange: (id: string, role: string) => void;
  deletingId: string | null;
}

const UserTable: React.FC<UserTableProps> = ({ users, onDelete, onRoleChange, deletingId }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl bg-[#111115] border border-white/8">
        <Users size={36} className="mx-auto text-gray-600 mb-3" />
        <p className="text-gray-400 font-medium">No users found</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#111115] border border-white/8 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {users.map((u: any, i: number) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-[120px]">{u.name}</p>
                      <p className="text-xs text-gray-500 sm:hidden truncate max-w-[120px]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden sm:table-cell">
                  <span className="text-sm text-gray-400 truncate max-w-[180px] block">{u.email}</span>
                </td>
                <td className="px-5 py-3.5">
                  <select
                    value={u.role}
                    onChange={(e) => onRoleChange(u.id, e.target.value)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border bg-transparent cursor-pointer appearance-none outline-none ${
                      roleColors[u.role] || roleColors['User']
                    }`}
                  >
                    <option value="User" className="bg-[#111115]">User</option>
                    <option value="lender" className="bg-[#111115]">Lender</option>
                    <option value="admin" className="bg-[#111115]">Admin</option>
                  </select>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      u.isVerified
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}
                  >
                    {u.isVerified ? (
                      <><CheckCircle size={11} /> Verified</>
                    ) : (
                      <><AlertTriangle size={11} /> Pending</>
                    )}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => onDelete(u.id)}
                    disabled={deletingId === u.id}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                    title="Delete user"
                  >
                    {deletingId === u.id ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface CarTableProps {
  cars: any[];
  onDelete: (id: string) => void;
  deletingId: string | null;
}

const CarTable: React.FC<CarTableProps> = ({ cars, onDelete, deletingId }) => {
  const navigate = useNavigate();

  if (cars.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl bg-[#111115] border border-white/8">
        <Car size={36} className="mx-auto text-gray-600 mb-3" />
        <p className="text-gray-400 font-medium">No cars found</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#111115] border border-white/8 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Host</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Location</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {cars.map((car: any, i: number) => (
              <motion.tr
                key={car.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={car.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&q=60'}
                      alt={car.title}
                      className="w-12 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-[140px]">
                        {car.title || `${car.brand} ${car.model}`}
                      </p>
                      <p className="text-xs text-gray-500">{car.year}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden sm:table-cell">
                  <span className="text-sm text-gray-400 truncate block max-w-[120px]">
                    {car.lender?.name || '—'}
                  </span>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className="text-sm text-gray-400">{car.locationCity || '—'}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm font-semibold text-white">${car.pricePerDay}/day</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/car/${car.id}`)}
                      className="p-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      title="View car"
                    >
                      <TrendingUp size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(car.id)}
                      disabled={deletingId === car.id}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                      title="Delete car"
                    >
                      {deletingId === car.id ? (
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
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

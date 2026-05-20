import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Car,
  LogIn,
  User as UserIcon,
  LogOut,
  Bell,
  Search,
  Heart,
  Settings,
  ChevronDown,
  Crown,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notification.service.ts";
import NotificationDrawer from "../Navbar/NotificationDrawer.tsx";
import { clsx } from "clsx";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService
        .getAll()
        .then((notifs) => {
          setUnreadCount(notifs.filter((n) => !n.isRead).length);
        })
        .catch(() => {
          console.log("Could not fetch notifications");
        });
    }
  }, [isAuthenticated]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-[#0a0a0b]/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
            : "bg-transparent",
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
              aria-label="LuxeDrive Home"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
              >
                <Car size={22} className="text-white" />
              </motion.div>
              <span className="text-2xl font-display font-bold text-white group-hover:text-blue-400 transition-colors">
                LuxeDrive
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink to="/browse" active={isActivePath("/browse")}>
                Browse Cars
              </NavLink>
              <NavLink
                to="/how-it-works"
                active={isActivePath("/how-it-works")}
              >
                How it Works
              </NavLink>
              {isAuthenticated && user?.role === 'lender' && (
                <NavLink to="/lender" active={isActivePath("/lender")}>
                  Host Hub
                </NavLink>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <NavLink to="/admin" active={isActivePath("/admin")}>
                  Admin
                </NavLink>
              )}
              {isAuthenticated && (
                <NavLink to="/dashboard" active={isActivePath("/dashboard")}>
                  Dashboard
                </NavLink>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Search Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    aria-label="Search"
                  >
                    <Search size={20} />
                  </motion.button>

                  {/* Favorites Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    aria-label="Favorites"
                  >
                    <Heart size={20} />
                  </motion.button>

                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    onClick={() => setIsNotifOpen(true)}
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </motion.span>
                    )}
                  </motion.button>

                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-all border border-white/10"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <UserIcon size={18} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-white max-w-[100px] truncate">
                        {user?.name || "User"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={clsx(
                          "text-gray-400 transition-transform",
                          isUserMenuOpen && "rotate-180",
                        )}
                      />
                    </motion.button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-56 bg-dark-500 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                        >
                          <div className="p-3 border-b border-white/10">
                            <p className="text-sm font-semibold text-white truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user?.email}
                            </p>
                          </div>
                          <div className="p-2">
                            <button
                              onClick={() => { navigate("/dashboard"); setIsUserMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                              <LayoutDashboard size={16} />
                              Dashboard
                            </button>
                            {user?.role === 'lender' && (
                              <button
                                onClick={() => { navigate("/lender"); setIsUserMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
                              >
                                <Car size={16} />
                                Host Hub
                              </button>
                            )}
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => { navigate("/admin"); setIsUserMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all"
                              >
                                <Crown size={16} />
                                Admin Panel
                              </button>
                            )}
                          </div>
                          <div className="p-2 border-t border-white/10">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 px-4 py-2.5 text-white hover:bg-white/10 rounded-lg transition-all font-medium"
                  >
                    <LogIn size={18} />
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/register")}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all"
                  >
                    Sign Up
                  </motion.button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-dark-600 border-l border-white/10 z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-display font-bold text-white">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* User Info */}
                {isAuthenticated && user && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                        <UserIcon size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-2">
                  <MobileNavLink to="/browse" icon={<Search size={20} />}>
                    Browse Cars
                  </MobileNavLink>
                  <MobileNavLink to="/how-it-works" icon={<Car size={20} />}>
                    How it Works
                  </MobileNavLink>
                  {isAuthenticated && (
                    <>
                      <MobileNavLink to="/dashboard" icon={<LayoutDashboard size={20} />}>
                        Dashboard
                      </MobileNavLink>
                      {user?.role === 'lender' && (
                        <MobileNavLink to="/lender" icon={<Car size={20} />}>
                          Host Hub
                        </MobileNavLink>
                      )}
                      {user?.role === 'admin' && (
                        <MobileNavLink to="/admin" icon={<Crown size={20} />}>
                          Admin Panel
                        </MobileNavLink>
                      )}
                      <MobileNavLink to="/favorites" icon={<Heart size={20} />}>
                        Favorites
                      </MobileNavLink>
                    </>
                  )}
                </nav>

                {/* Actions */}
                <div className="pt-6 border-t border-white/10 space-y-3">
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all font-semibold"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white hover:bg-white/15 rounded-lg transition-all font-semibold"
                      >
                        <LogIn size={18} />
                        Login
                      </button>
                      <button
                        onClick={() => navigate("/register")}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Drawer */}
      {isNotifOpen && (
        <NotificationDrawer
          onClose={() => {
            setIsNotifOpen(false);
            notificationService.getAll().then((notifs) => {
              setUnreadCount(notifs.filter((n) => !n.isRead).length);
            });
          }}
        />
      )}
    </>
  );
};

// Desktop Nav Link Component
const NavLink: React.FC<{
  to: string;
  active: boolean;
  children: React.ReactNode;
}> = ({ to, active, children }) => (
  <Link
    to={to}
    className={clsx(
      "px-4 py-2 rounded-lg font-medium transition-all relative",
      active
        ? "text-white bg-white/10"
        : "text-gray-300 hover:text-white hover:bg-white/5",
    )}
  >
    {children}
    {active && (
      <motion.div
        layoutId="activeNav"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
      />
    )}
  </Link>
);

// Mobile Nav Link Component
const MobileNavLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ to, icon, children }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
  >
    {icon}
    {children}
  </Link>
);

export default Navbar;

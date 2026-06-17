import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Bell, ChevronDown, LogOut, LayoutDashboard, Car, Settings, Heart, Calendar } from "@/lib/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { notificationService } from "../../services/notification.service";
import NotificationDrawer from "../Navbar/NotificationDrawer";

const Navbar: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { socket } = useSocket();

  const [solid,       setSolid]       = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [userOpen,    setUserOpen]    = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [unread,      setUnread]      = useState(0);
  const userRef = useRef<HTMLDivElement>(null);

  // Transparent on hero pages, solid elsewhere
  const isHeroPage = location.pathname === "/";

  useEffect(() => {
    if (!isHeroPage) { setSolid(true); return; }
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHeroPage]);

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  // Click-outside for user dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    notificationService.getAll()
      .then((res: any) => {
        const arr = Array.isArray(res) ? res : (res?.notifications ?? []);
        setUnread(arr.filter((n: any) => !n.isRead).length);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;
    const inc = () => setUnread(c => c + 1);
    socket.on("new_notification", inc);
    return () => { socket.off("new_notification", inc); };
  }, [socket]);

  const handleLogout = async () => {
    setUserOpen(false);
    await logout();
    navigate("/");
  };

  const handleNotifClose = () => {
    setNotifOpen(false);
    notificationService.getAll()
      .then((res: any) => {
        const arr = Array.isArray(res) ? res : (res?.notifications ?? []);
        setUnread(arr.filter((n: any) => !n.isRead).length);
      })
      .catch(() => {});
  };

  const navLinks = [
    { label: "Browse Cars",  to: "/browse" },
    { label: "How It Works", to: "/how-it-works" },
  ];

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      <header
        className={`
          fixed top-0 inset-x-0 z-50 h-14 transition-all duration-300
          ${solid
            ? "border-b border-white/[0.07] backdrop-blur-xl"
            : "border-b border-transparent"
          }
        `}
        style={solid ? { background: "rgba(13,13,15,0.82)" } : {}}
      >
        <div className="container h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
              style={{ background: "linear-gradient(135deg, rgba(212,151,42,0.20), rgba(184,121,30,0.10))", border: "1px solid rgba(212,151,42,0.35)" }}
            >
              <Car size={13} className="text-gold" />
            </div>
            <span className="font-heading font-bold text-[17px] tracking-tight"
              style={{ background: "linear-gradient(to right, #F2F0EC, #c8c6c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              LuxeDrive
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {[
              ...navLinks,
              ...(isAuthenticated ? [{ label: "Dashboard", to: "/dashboard" }] : []),
              ...(isAuthenticated && user?.role === "lender" ? [{ label: "Host Hub", to: "/lender" }] : []),
              ...(isAuthenticated && user?.role === "admin"  ? [{ label: "Admin",    to: "/admin"  }] : []),
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`relative px-3.5 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive(to) ? "text-ink-primary" : "text-ink-tertiary hover:text-ink-secondary"
                }`}
              >
                {label}
                {isActive(to) && (
                  <span
                    className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full"
                    style={{ background: "linear-gradient(to right, #D4972A, #B8791E)" }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <button
                  onClick={() => setNotifOpen(true)}
                  className="relative p-2 rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-surface-2 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={17} />
                  {unread > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full text-[9px] font-bold text-black animate-fade-in"
                      style={{ background: "var(--color-gold)" }}>
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>

                {/* User menu */}
                <div ref={userRef} className="relative">
                  <button
                    onClick={() => setUserOpen(v => !v)}
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg border border-[#2a2a2a] bg-surface-2 hover:bg-surface-3 hover:border-[#333] transition-all duration-150"
                  >
                    <img
                      src={
                        user?.profileImage ||
                        `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name ?? "U")}&backgroundColor=F5A623&textColor=0A0A0C&fontSize=40`
                      }
                      alt={user?.name}
                      className="w-6 h-6 rounded-md object-cover"
                    />
                    <span className="text-sm font-medium text-ink-primary max-w-[96px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-ink-tertiary transition-transform duration-150 ${userOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {userOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 mt-1.5 w-52 rounded-xl bg-[#111] border border-[#222] shadow-dropdown overflow-hidden"
                      >
                        {/* User info */}
                        <div className="px-3.5 py-3 border-b border-[#1f1f1f]">
                          <p className="text-sm font-semibold text-ink-primary truncate">{user?.name}</p>
                          <p className="text-xs text-ink-tertiary truncate mt-0.5">{user?.email}</p>
                        </div>

                        {/* Links */}
                        <div className="py-1">
                          <MenuLink icon={LayoutDashboard} label="Dashboard"   onClick={() => { navigate("/dashboard"); setUserOpen(false); }} />
                          <MenuLink icon={Calendar}        label="My Bookings" onClick={() => { navigate("/bookings"); setUserOpen(false); }} />
                          <MenuLink icon={Heart}           label="Favourites"  onClick={() => { navigate("/favorites"); setUserOpen(false); }} />
                          {user?.role === "lender" && (
                            <MenuLink icon={Car}          label="Host Hub"     onClick={() => { navigate("/lender"); setUserOpen(false); }} />
                          )}
                          {user?.role === "admin" && (
                            <MenuLink icon={Settings}     label="Admin Panel"  onClick={() => { navigate("/admin"); setUserOpen(false); }} />
                          )}
                        </div>

                        <div className="py-1 border-t border-[#1f1f1f]">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:bg-surface-2 transition-colors"
                          >
                            <LogOut size={14} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="btn-ghost text-sm"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-xl font-semibold text-sm text-black transition-opacity hover:opacity-90 active:scale-[0.98] whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)" }}
                >
                  Get started
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-md text-ink-tertiary hover:text-ink-primary hover:bg-surface-2 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#111] border-l border-[#1f1f1f] flex flex-col md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f]">
                <span className="font-semibold text-ink-primary">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-md text-ink-tertiary hover:text-ink-primary hover:bg-surface-2 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User */}
              {isAuthenticated && user && (
                <div className="p-4 border-b border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profileImage || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name ?? "U")}&backgroundColor=F5A623&textColor=0A0A0C`}
                      className="w-9 h-9 rounded-lg object-cover"
                      alt={user.name}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-primary truncate">{user.name}</p>
                      <p className="text-xs text-ink-tertiary truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav */}
              <nav className="flex-1 p-3 overflow-y-auto">
                {[
                  ...navLinks,
                  ...(isAuthenticated ? [
                    { label: "Dashboard",   to: "/dashboard" },
                    { label: "My Bookings", to: "/bookings" },
                    { label: "Favourites",  to: "/favorites" },
                  ] : []),
                  ...(isAuthenticated && user?.role === "lender" ? [{ label: "Host Hub", to: "/lender" }] : []),
                  ...(isAuthenticated && user?.role === "admin"  ? [{ label: "Admin",    to: "/admin"  }] : []),
                ].map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`
                      flex items-center px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors
                      ${isActive(to) ? "bg-surface-3 text-ink-primary" : "text-ink-secondary hover:bg-surface-2 hover:text-ink-primary"}
                    `}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Actions */}
              <div className="p-3 border-t border-[#1f1f1f]">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-surface-2 transition-colors"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button onClick={() => navigate("/login")}    className="btn-secondary w-full justify-center py-2.5">Sign in</button>
                    <button onClick={() => navigate("/register")} className="btn-primary w-full justify-center py-2.5">Get started</button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {notifOpen && <NotificationDrawer onClose={handleNotifClose} />}
    </>
  );
};

const MenuLink: React.FC<{ icon: React.ElementType; label: string; onClick: () => void }> = ({
  icon: Icon, label, onClick,
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink-secondary hover:text-ink-primary hover:bg-surface-2 transition-colors"
  >
    <Icon size={14} />
    {label}
  </button>
);

export default Navbar;

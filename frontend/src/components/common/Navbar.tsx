import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Car,
  LogIn,
  User as UserIcon,
  LogOut,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
// import { useSocket } from '../../context/SocketContext.tsx';
import { notificationService } from "../../services/notification.service.ts";
import NotificationDrawer from "../Navbar/NotificationDrawer.tsx";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // const { socket } = useSocket();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setIsMobileMenuOpen(false);
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
          // Silently handle notification fetch errors
          console.log("Could not fetch notifications");
        });
    }
  }, [isAuthenticated]);

  // Temporarily disabled socket notifications until SocketProvider is added
  // useEffect(() => {
  //   if (socket && isAuthenticated) {
  //     const handleNewNotif = () => setUnreadCount(prev => prev + 1);
  //     socket.on('new_notification', handleNewNotif);
  //     return () => {
  //       socket.off('new_notification', handleNewNotif);
  //     };
  //   }
  // }, [socket, isAuthenticated]);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Car size={24} color="#3b82f6" />
          </div>
          <span className="logo-text">LuxeDrive</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-only">
          <Link to="/browse" className="nav-link">
            Browse Cars
          </Link>
          <Link to="/how-it-works" className="nav-link">
            How it Works
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          )}
        </div>

        <div className="nav-actions desktop-only">
          {isAuthenticated ? (
            <div className="user-nav-group">
              <button
                className={`btn-icon-circular ${unreadCount > 0 ? "has-unread" : ""}`}
                onClick={() => setIsNotifOpen(true)}
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>
              <div className="user-profile-simple">
                <UserIcon size={20} />
                <span>{user?.name || "User"}</span>
              </div>
              <button
                className="btn-icon-circular"
                onClick={handleLogout}
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="btn-login">
                <LogIn size={18} />
                <span>Login</span>
              </button>
              <button
                onClick={() => navigate("/register")}
                className="btn-signup"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <Link to="/browse" onClick={() => setIsMobileMenuOpen(false)}>
          Browse Cars
        </Link>
        <Link to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)}>
          How it Works
        </Link>
        {isAuthenticated && (
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
            Dashboard
          </Link>
        )}
        <hr className="divider" />
        {isAuthenticated ? (
          <>
            <div className="mobile-user-info">
              <UserIcon size={20} />
              <span>{user?.name}</span>
            </div>
            <button className="mobile-logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              Login
            </Link>
            <Link
              to="/register"
              className="mobile-signup-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {isNotifOpen && (
        <NotificationDrawer
          onClose={() => {
            setIsNotifOpen(false);
            // Re-fetch unread count after closing the drawer as they might have been read
            notificationService.getAll().then((notifs) => {
              setUnreadCount(notifs.filter((n) => !n.isRead).length);
            });
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;

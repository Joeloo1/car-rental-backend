import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle,
  Info,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
// import { useSocket } from '../../context/SocketContext';
import { notificationService } from "../../services/notification.service";
import type { Notification } from "../../services/notification.service";

import { formatDistanceToNow } from "date-fns";
import "./NotificationDrawer.css";

interface NotificationDrawerProps {
  onClose: () => void;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Socket integration temporarily disabled
    // if (socket) {
    //   const handleNewNotification = (notif: Notification) => {
    //     setNotifications(prev => [notif, ...prev]);
    //   };

    //   socket.on('new_notification', handleNewNotification);
    //   return () => {
    //     socket.off('new_notification', handleNewNotification);
    //   };
    // }
  }, []);

  const markRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="notif-icon success" size={18} />;
      case "warning":
        return <AlertTriangle className="notif-icon warning" size={18} />;
      case "booking":
        return <Bell className="notif-icon booking" size={18} />;
      case "message":
        return <MessageSquare className="notif-icon message" size={18} />;
      default:
        return <Info className="notif-icon info" size={18} />;
    }
  };

  return (
    <div className="notif-drawer-overlay" onClick={onClose}>
      <div
        className="notif-drawer glass animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notif-drawer-header">
          <div className="header-title">
            <Bell size={20} />
            <h3>Notifications</h3>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="unread-count">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </div>
          <div className="header-actions">
            <button
              className="btn-icon"
              title="Mark all as read"
              onClick={markAllRead}
            >
              <CheckCircle size={18} />
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="notif-list">
          {isLoading ? (
            <div className="notif-empty">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <Bell size={48} className="empty-icon" />
              <p>You're all caught up!</p>
              <span>New alerts will appear here.</span>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-item ${!notif.isRead ? "unread" : ""}`}
                onClick={() => !notif.isRead && markRead(notif.id)}
              >
                <div className="notif-icon-wrapper">{getIcon(notif.type)}</div>
                <div className="notif-content">
                  <h4 className="notif-title">{notif.title}</h4>
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {!notif.isRead && <div className="unread-dot"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;

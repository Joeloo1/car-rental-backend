import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle,
  Info,
  AlertTriangle,
  MessageSquare,
} from "@/lib/icons";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notification.service";
import type { Notification } from "../../services/notification.service";
import { formatDistanceToNow } from "date-fns";

interface NotificationDrawerProps {
  onClose: () => void;
}

const ICON_CFG: Record<string, { icon: React.ElementType; bg: string; cls: string }> = {
  success: { icon: CheckCircle,   bg: "bg-teal/10",   cls: "text-teal"         },
  warning: { icon: AlertTriangle, bg: "bg-amber/10",  cls: "text-amber"        },
  booking: { icon: Bell,          bg: "bg-gold/10",   cls: "text-gold"         },
  message: { icon: MessageSquare, bg: "bg-teal/10",   cls: "text-teal"         },
  info:    { icon: Info,          bg: "bg-surface-3", cls: "text-ink-tertiary" },
};

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const { socket }  = useSocket();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  useEffect(() => {
    notificationService.getAll()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (notif: Notification) =>
      setNotifications((prev) => prev.some((n) => n.id === notif.id) ? prev : [notif, ...prev]);
    socket.on("new_notification", handleNew);
    return () => { socket.off("new_notification", handleNew); };
  }, [socket]);

  const markRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleClick = (notif: Notification) => {
    if (!notif.isRead) markRead(notif.id);
    const dest = notif.link ?? (notif.type === "message"
      ? (user?.role === "lender" ? "/lender" : "/dashboard")
      : null);
    if (dest) { navigate(dest); onClose(); }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[2000] flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] h-full flex flex-col animate-slide-in-right"
        style={{
          background:  "var(--color-surface)",
          borderLeft:  "1px solid rgba(255,255,255,0.07)",
          boxShadow:   "-20px 0 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(212,151,42,0.10)", border: "1px solid rgba(212,151,42,0.22)" }}
            >
              <Bell size={15} className="text-gold" />
            </div>
            <span className="font-semibold text-[15px] text-ink-primary">Notifications</span>
            {unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold bg-gold text-black leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gold hover:bg-gold/10 transition-colors"
              >
                <CheckCircle size={12} /> All read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-tertiary hover:bg-surface-2 hover:text-ink-primary transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
          {isLoading ? (
            <div className="space-y-0.5 p-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl">
                  <div className="w-9 h-9 rounded-full skeleton animate-shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-3/4 rounded skeleton animate-shimmer" />
                    <div className="h-2.5 w-full rounded skeleton animate-shimmer" />
                    <div className="h-2 w-1/3 rounded skeleton animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-[#282828] flex items-center justify-center mb-4">
                <Bell size={26} className="text-ink-tertiary opacity-30" />
              </div>
              <p className="font-semibold text-[15px] text-ink-primary mb-1.5">All caught up!</p>
              <span className="text-sm text-ink-tertiary">New alerts will appear here.</span>
            </div>
          ) : (
            notifications.map((notif) => {
              const cfg      = ICON_CFG[notif.type] ?? ICON_CFG.info;
              const IconEl   = cfg.icon;
              const clickable = !!(notif.link || notif.type === "message");
              return (
                <div
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`flex gap-3 p-4 rounded-xl mb-0.5 relative transition-colors ${clickable ? "cursor-pointer" : ""} ${
                    !notif.isRead ? "bg-gold/[0.04] hover:bg-gold/[0.07]" : "hover:bg-surface-2"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.bg}`}>
                      <IconEl size={16} className={cfg.cls} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pr-5">
                    <p className="text-sm font-semibold text-ink-primary mb-0.5 leading-snug">{notif.title}</p>
                    <p className="text-xs text-ink-tertiary leading-relaxed mb-1.5">{notif.message}</p>
                    <span className="text-[11px] text-ink-tertiary">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gold" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;

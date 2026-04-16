import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { referralService } from "../services/referralService";
import { Notification } from "../types";
import { formatDateTime } from "../utils/format";

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const loadNotifications = async () => {
    try {
      const nextNotifications = await referralService.getNotifications();
      setNotifications(nextNotifications);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const markAsRead = async (notificationId: string) => {
    try {
      await referralService.markNotificationAsRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setOpen(false);
    } catch {
      return;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-full border border-slate-200 p-2 text-slate-700 transition hover:border-primary/30 hover:bg-cyan-50"
      >
        <Bell size={18} />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
            <div>
              <p className="font-semibold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500">Click once to mark read and close</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    void markAsRead(notification.id);
                  }}
                  className={`block w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-cyan-50 ${
                    notification.read ? "bg-white" : "bg-cyan-50"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

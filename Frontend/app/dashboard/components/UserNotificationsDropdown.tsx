"use client";

import React, { useState, useEffect, useRef } from "react";
import { Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/proxy";

export interface NotificationItem {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function UserNotificationsDropdown({
  open,
  onClose,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await api.get("/v1/users/appointments?limit=5");
        const activities: any[] = res.data?.appointments || [];
        const mapped: NotificationItem[] = activities.map((a: any, i: number) => ({
          id: a._id || `notif-${i}`,
          type: a.status === "CANCELLED" ? "warning" : a.status === "COMPLETED" ? "success" : "info",
          title: a.status === "CONFIRMED" ? "Appointment Confirmed" : a.status === "CANCELLED" ? "Appointment Cancelled" : "Appointment Update",
          message: `${a.doctorName || "Doctor"} • ${a.hospitalName || "Hospital"} — ${a.status || "PENDING"}`,
          time: a.date ? new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently",
          read: a.status === "COMPLETED" || a.status === "CANCELLED",
        }));
        if (mapped.length === 0) {
          mapped.push(
            { id: "sys-1", type: "success", title: "Welcome to Mediconnect", message: "Your health dashboard is ready", time: "Now", read: false },
          );
        }
        setNotifications(mapped);
      } catch {
        setNotifications([
          { id: "err", type: "warning", title: "Connection Issue", message: "Could not fetch notifications", time: "Now", read: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const iconMap = {
    info: <Info size={14} className="text-blue-500" />,
    success: <CheckCircle2 size={14} className="text-emerald-500" />,
    warning: <AlertTriangle size={14} className="text-amber-500" />,
  };
  const bgMap = {
    info: "bg-blue-50 border-blue-100",
    success: "bg-emerald-50 border-emerald-100",
    warning: "bg-amber-50 border-amber-100",
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={ref}
      className="absolute right-6 top-16 z-50 w-[360px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <button
          onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-[380px] overflow-y-auto">
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-medium">Loading...</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`px-5 py-3.5 border-b border-gray-50 flex items-start gap-3 transition-colors hover:bg-gray-50/50 ${!n.read ? "bg-blue-50/30" : ""}`}
            >
              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center border ${bgMap[n.type]}`}>
                {iconMap[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12.5px] font-bold text-gray-800 truncate">{n.title}</p>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">{n.message}</p>
              </div>
              {!n.read && <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100">
        <button
          onClick={onClose}
          className="w-full py-2 text-[12px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

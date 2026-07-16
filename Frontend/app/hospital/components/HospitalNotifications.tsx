"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, CheckCheck, ClipboardCheck, FileText } from "lucide-react";
import { getHospitalNotifications, markAllHospitalNotificationsRead, markHospitalNotificationRead } from "@/lib/api/hospital";

type Notification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  icon: "appointment" | "check-in" | "record";
};

const iconStyles = {
  appointment: { Icon: CalendarDays, tone: "bg-blue-50 text-[#0057d9]" },
  "check-in": { Icon: ClipboardCheck, tone: "bg-emerald-50 text-emerald-600" },
  record: { Icon: FileText, tone: "bg-violet-50 text-violet-600" },
};

export function HospitalNotifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    getHospitalNotifications().then((data) => setNotifications(data.notifications.map((notification: { _id: string; title: string; detail: string; type: Notification["icon"]; read: boolean; createdAt: string }) => ({ id: notification._id, title: notification.title, detail: notification.detail, icon: notification.type, read: notification.read, time: new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round((new Date(notification.createdAt).getTime() - Date.now()) / 60000), "minute") })))).catch(() => setNotifications([]));
  }, []);

  const markAllAsRead = async () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    try { await markAllHospitalNotificationsRead(); } catch { /* Retain the local state until the next refresh. */ }
  };
  const markAsRead = async (id: string) => {
    setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: true } : notification));
    try { await markHospitalNotificationRead(id); } catch { /* Retain the local state until the next refresh. */ }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell size={17} />
        {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[8px] font-extrabold text-white ring-2 ring-white">{unreadCount}</span>}
      </button>

      {open && (
        <section className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl" role="menu" aria-label="Hospital notifications">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div><h2 className="text-sm font-extrabold text-slate-900">Notifications</h2><p className="mt-0.5 text-[11px] font-medium text-slate-400">{unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You’re all caught up"}</p></div>
            {unreadCount > 0 && <button type="button" onClick={markAllAsRead} className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0057d9] hover:text-blue-700"><CheckCheck size={14} /> Mark all read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {notifications.map((notification) => {
              const { Icon, tone } = iconStyles[notification.icon];
              return <button type="button" role="menuitem" key={notification.id} onClick={() => markAsRead(notification.id)} className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 ${notification.read ? "opacity-65" : "bg-blue-50/35"}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon size={15} /></span>
                <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="text-xs font-bold text-slate-700">{notification.title}</span>{!notification.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0057d9]" />}</span><span className="mt-0.5 block truncate text-[11px] font-medium text-slate-400">{notification.detail}</span><span className="mt-1 block text-[10px] font-medium text-slate-400">{notification.time}</span></span>
              </button>;
            })}
          </div>
        </section>
      )}
    </div>
  );
}

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
        <section className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200" role="menu" aria-label="Hospital notifications">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h2 className="text-sm font-extrabold text-slate-900">Notifications</h2><p className="mt-0.5 text-[11px] font-medium text-slate-400">{unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You’re all caught up"}</p></div>
            {unreadCount > 0 && <button type="button" onClick={markAllAsRead} className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0057d9] hover:text-blue-700"><CheckCheck size={14} /> Mark all read</button>}
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.map((notification) => {
              const { Icon, tone } = iconStyles[notification.icon];
              return <button type="button" role="menuitem" key={notification.id} onClick={() => markAsRead(notification.id)} className={`flex w-full items-start gap-3 border-b border-slate-50 px-5 py-3.5 text-left transition-colors hover:bg-slate-50/50 ${notification.read ? "" : "bg-blue-50/30"}`}>
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon size={14} /></span>
                <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[12.5px] font-bold text-slate-800">{notification.title}</span><span className="whitespace-nowrap text-[10px] font-medium text-slate-400">{notification.time}</span></span><span className="mt-0.5 block truncate text-[11px] font-medium text-slate-500">{notification.detail}</span></span>
                {!notification.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
              </button>;
            })}
            {notifications.length === 0 && <p className="px-5 py-12 text-center text-xs font-medium text-slate-400">No notifications yet.</p>}
          </div>
          <div className="border-t border-slate-100 px-5 py-3"><button type="button" onClick={() => setOpen(false)} className="w-full rounded-lg py-2 text-[12px] font-bold text-blue-600 transition-colors hover:bg-blue-50">Close</button></div>
        </section>
      )}
    </div>
  );
}

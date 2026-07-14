"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Grid,
  Users,
  Building2,
  Stethoscope,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  X,
  Moon,
  Sun,
  Shield,
  Key,
  Globe,
  Database,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Camera,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

function adminAvatarUrl(imagePath?: string) {
  if (!imagePath) return "";
  return imagePath.startsWith("http") ? imagePath : `http://localhost:5000${imagePath}`;
}

// ── Notification Item ─────────────────────────────────────────────────────────
interface NotificationItem {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// ── Profile Edit Modal ────────────────────────────────────────────────────────
interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (updatedUser: any) => void;
}

function ProfileModal({ open, onClose, user, onUpdate }: ProfileModalProps) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      setPreviewUrl(user.adminProfileImage ? adminAvatarUrl(user.adminProfileImage) : "");
    }
  }, [user, open]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("http://localhost:5000/api/v1/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setSuccess(true);
      onUpdate(data.user);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl text-xs font-semibold flex items-center gap-2 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
              <AlertTriangle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
              <CheckCircle2 size={14} className="shrink-0" />
              Profile updated successfully!
            </div>
          )}

          {/* Profile Image Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-750 flex items-center justify-center text-blue-600 text-2xl font-bold overflow-hidden shadow-inner">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  fullName.slice(0, 2).toUpperCase() || "AD"
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-[#0057d9] text-white rounded-lg hover:bg-blue-700 shadow-md transition-all group-hover:scale-105"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Click camera icon to change picture</span>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-750 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0057d9] outline-none transition"
                  placeholder="e.g. Admin Root"
                />
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-750 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0057d9] outline-none transition"
                  placeholder="e.g. admin@mediconnect.com"
                />
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-750 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#0057d9] outline-none transition"
                  placeholder="e.g. +1 555-0199"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-750 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-sm font-semibold bg-[#0057d9] text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Notifications Dropdown ────────────────────────────────────────────────────
function NotificationsDropdown({
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
        const token = localStorage.getItem("adminToken");
        const res = await fetch("http://localhost:5000/api/v1/admin/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const activities: any[] = data.recentActivities || [];
        const mapped: NotificationItem[] = activities.slice(0, 8).map((a: any, i: number) => ({
          id: a._id || `notif-${i}`,
          type: a.status === "CANCELLED" ? "warning" : a.status === "COMPLETED" ? "success" : "info",
          title: a.reason || a.type || "System Activity",
          message: `${a.doctorName || "Doctor"} • ${a.hospitalName || "Hospital"} — ${a.status || "PENDING"}`,
          time: a.date ? new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently",
          read: a.status === "COMPLETED",
        }));
        if (mapped.length === 0) {
          mapped.push(
            { id: "sys-1", type: "success", title: "System Online", message: "All services are operational", time: "Now", read: false },
            { id: "sys-2", type: "info", title: "Database Synced", message: "Last sync completed successfully", time: "2m ago", read: true },
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
    info: "bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50",
    success: "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50",
    warning: "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50",
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={ref}
      className="absolute right-16 top-14 z-50 w-[360px] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
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
            <p className="text-xs text-slate-400 font-medium">Loading...</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 flex items-start gap-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${!n.read ? "bg-blue-50/30 dark:bg-blue-950/20" : ""}`}
            >
              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center border ${bgMap[n.type]}`}>
                {iconMap[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12.5px] font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">{n.message}</p>
              </div>
              {!n.read && <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onClose}
          className="w-full py-2 text-[12px] font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────
interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  adminUser: any;
  onOpenProfile: () => void;
}

function SettingsPanel({
  open,
  onClose,
  darkMode,
  onToggleDarkMode,
  adminUser,
  onOpenProfile,
}: SettingsPanelProps) {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");

  if (!open) return null;

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
    >
      <span
        className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "left-[22px]" : "left-[3px]"}`}
      />
    </button>
  );

  const SettingRow = ({
    icon: Icon,
    label,
    desc,
    children,
  }: {
    icon: any;
    label: string;
    desc: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
          <Icon size={16} className="text-slate-500 dark:text-slate-450" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{label}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-[400px] bg-white dark:bg-slate-900 shadow-[-20px_0_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,87,217,0.25)]">
              <Settings size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">System Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Profile Section */}
          <div
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-800/20 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md overflow-hidden shrink-0">
                {adminUser?.adminProfileImage ? (
                  <img src={adminAvatarUrl(adminUser.adminProfileImage)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  adminUser?.fullName?.slice(0, 2).toUpperCase() || "AR"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                  {adminUser?.fullName || "Admin Root"}
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {adminUser?.email || "admin@mediconnect.com"}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5">
                    <Shield size={11} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-550 uppercase tracking-wider">
                      {adminUser?.role || "Admin"}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-600 dark:text-blue-450 font-bold group-hover:underline">Edit Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Appearance</p>
            <div className="bg-white dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 px-4 divide-y divide-slate-50 dark:divide-slate-800/50">
              <SettingRow icon={darkMode ? Moon : Sun} label="Dark Mode" desc="Toggle dark interface theme">
                <Toggle checked={darkMode} onChange={onToggleDarkMode} />
              </SettingRow>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Notifications</p>
            <div className="bg-white dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 px-4 divide-y divide-slate-50 dark:divide-slate-800/50">
              <SettingRow icon={Bell} label="Email Alerts" desc="Receive critical system alerts">
                <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
              </SettingRow>
            </div>
          </div>

          {/* System */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">System</p>
            <div className="bg-white dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 px-4 divide-y divide-slate-50 dark:divide-slate-800/50">
              <SettingRow icon={Database} label="Auto Sync" desc="Auto-sync data with cloud">
                <Toggle checked={autoSync} onChange={() => setAutoSync(!autoSync)} />
              </SettingRow>
              <SettingRow icon={Clock} label="Session Timeout" desc="Auto-logout after inactivity">
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="text-[12px] font-bold text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-750 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-455"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </SettingRow>
              <SettingRow icon={Globe} label="API Version" desc="Current backend version">
                <span className="text-[12px] font-bold text-slate-655 bg-slate-100 dark:bg-slate-800 dark:text-slate-350 px-2.5 py-1 rounded-lg">v1.0.0</span>
              </SettingRow>
              <SettingRow icon={Key} label="JWT Secret" desc="Token signing algorithm">
                <span className="text-[12px] font-bold text-slate-655 bg-slate-100 dark:bg-slate-800 dark:text-slate-350 px-2.5 py-1 rounded-lg">HS256</span>
              </SettingRow>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <p className="text-[10px] font-bold text-red-400 dark:text-red-500 uppercase tracking-wider mb-2">Danger Zone</p>
            <div className="bg-red-50/50 dark:bg-red-950/10 rounded-xl border border-red-100 dark:border-red-900/30 p-4">
              <p className="text-[12px] font-bold text-red-700 dark:text-red-450 mb-1">Clear All Sessions</p>
              <p className="text-[11px] text-red-400 dark:text-red-500/80 font-medium mb-3">
                This will invalidate all active admin sessions and require re-authentication.
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  window.location.href = "/admin/login";
                }}
                className="px-4 py-2 bg-red-650 text-white text-[12px] font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Sessions & Logout
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center">
            Mediconnect Admin • v1.0.0 • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Always use light theme to match the user portal
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
    localStorage.setItem("adminDarkMode", "false");
    setDarkMode(false);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('adminDarkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('adminDarkMode', 'false');
    }
  };

  // Fetch admin user data on mount
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/v1/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data.user);
      }
    } catch (err) {
      console.error("Failed to fetch admin profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    router.push("/login");
  };

  const coreLinks = [
    { name: "Overview", href: "/admin/dashboard", icon: Grid },
    { name: "Patients", href: "/admin/dashboard/patients", icon: Users },
    { name: "Hospitals", href: "/admin/dashboard/facilities", icon: Building2 },
    { name: "Doctors", href: "/admin/dashboard/staff", icon: Stethoscope },
    { name: "Appointments", href: "/admin/dashboard/appointments", icon: CalendarDays },
  ];

  const opsLinks = [
    { name: "Analytics", href: "/admin/dashboard/analytics", icon: BarChart3 },
  ];

  const renderNavLinks = (links: typeof coreLinks) => {
    return links.map((link) => {
      const isActive = pathname === link.href;
      const Icon = link.icon;
      return (
        <button
          key={link.name}
          onClick={() => router.push(link.href)}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-bold transition-all ${
            isActive
              ? "bg-[#0052cc] text-white shadow-sm shadow-blue-600/10"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Icon size={18} strokeWidth={2.5} className={isActive ? "text-white" : "text-gray-400"} />
          {link.name}
        </button>
      );
    });
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden font-sans antialiased text-gray-900">
      {/* Settings Panel */}
      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        adminUser={adminUser}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Profile Modal */}
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={adminUser}
        onUpdate={(updatedUser) => setAdminUser(updatedUser)}
      />

      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-gray-200/80 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 pt-8">
            <BrandLogo
              size={40}
              showText
              subtitle="Admin Portal"
              textClassName="text-[20px] font-black tracking-tight text-[#0057d9] leading-none"
              subtitleClassName="text-[11px] font-bold text-gray-400 tracking-wide mt-1"
            />
          </div>

          {/* Navigation */}
          <div className="px-4 space-y-5 mt-2">
            <div>
              <p className="px-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">Core</p>
              <nav className="space-y-1">{renderNavLinks(coreLinks)}</nav>
            </div>
            <div>
              <p className="px-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">Ops</p>
              <nav className="space-y-1">{renderNavLinks(opsLinks)}</nav>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="p-6 border-t border-gray-100 space-y-1">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3.5 px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors text-xs font-bold rounded-lg hover:bg-gray-50"
          >
            <Settings size={16} strokeWidth={2.5} className="text-gray-400" />
            Settings
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3.5 px-3 py-2 text-red-600 hover:text-red-700 transition-colors text-xs font-bold rounded-lg hover:bg-red-50"
          >
            <LogOut size={16} strokeWidth={2.5} className="text-red-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f3f4f6]">
        <header className="h-20 bg-white border-b border-gray-100 px-6 md:px-8 flex items-center justify-between shrink-0 relative shadow-sm">
          <div className="relative w-80 max-w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search infrastructure..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] outline-none text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full text-emerald-600 text-[12px] font-semibold border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              SYNC LIVE
            </div>
            <button
              ref={bellRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                showNotifications
                  ? "border-blue-100 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Bell size={17} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Settings size={17} />
            </button>
            <div
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 pl-2 border-l border-gray-200 cursor-pointer group"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden border border-gray-200">
                {adminUser?.adminProfileImage ? (
                  <img src={adminAvatarUrl(adminUser.adminProfileImage)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  adminUser?.fullName?.slice(0, 2).toUpperCase() || "AR"
                )}
              </div>
              <span className="hidden sm:inline text-sm font-semibold text-gray-700 group-hover:text-[#0057d9] transition-colors">
                {adminUser?.fullName || "Admin Root"}
              </span>
            </div>
          </div>

          {/* Notifications Dropdown */}
          <NotificationsDropdown
            open={showNotifications}
            onClose={() => setShowNotifications(false)}
            anchorRef={bellRef}
          />
        </header>

        <main className="flex-1 overflow-auto bg-[#f3f4f6] p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
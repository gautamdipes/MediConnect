"use client";

import React, { useState } from "react";
import { Settings, X, Shield, Bell, Key, Globe, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export interface UserSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function UserSettingsPanel({
  open,
  onClose,
}: UserSettingsPanelProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);

  if (!open) return null;

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${checked ? "bg-blue-600" : "bg-gray-200"}`}
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
        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          <Icon size={16} className="text-gray-500" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-800">{label}</p>
          <p className="text-[11px] text-gray-400 font-medium">{desc}</p>
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
      <div className="fixed right-0 top-0 z-50 h-full w-[400px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,87,217,0.25)]">
              <Settings size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Settings</h2>
              <p className="text-[11px] text-gray-400 font-medium">Account Preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
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
              router.push("/dashboard/profile");
            }}
            className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 border border-blue-100 cursor-pointer hover:border-blue-400 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md overflow-hidden shrink-0">
                {user?.profileImage ? (
                  <img src={`http://localhost:5000${user.profileImage}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.slice(0, 2).toUpperCase() || "US"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {user?.fullName || "User"}
                </p>
                <p className="text-[12px] text-gray-500 font-medium truncate">
                  {user?.email || "user@mediconnect.com"}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5">
                    <Shield size={11} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {user?.role || "Patient"}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-600 font-bold group-hover:underline">View Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Notifications</p>
            <div className="bg-white rounded-xl border border-gray-100 px-4 divide-y divide-gray-50">
              <SettingRow icon={Bell} label="Email Alerts" desc="Receive important updates via email">
                <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
              </SettingRow>
              <SettingRow icon={Bell} label="SMS Alerts" desc="Get text messages for appointments">
                <Toggle checked={smsNotifs} onChange={() => setSmsNotifs(!smsNotifs)} />
              </SettingRow>
            </div>
          </div>

          {/* Privacy & Security */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Privacy & Security</p>
            <div className="bg-white rounded-xl border border-gray-100 px-4 divide-y divide-gray-50">
              <SettingRow icon={Globe} label="Data Sharing" desc="Share anonymized data for research">
                <Toggle checked={false} onChange={() => {}} />
              </SettingRow>
              <SettingRow icon={Key} label="Two-Factor Auth" desc="Extra security for your account">
                <button className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-colors">
                  Setup
                </button>
              </SettingRow>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">Account Actions</p>
            <div className="bg-red-50/50 rounded-xl border border-red-100 p-4">
              <p className="text-[12px] font-bold text-red-700 mb-1">Sign Out</p>
              <p className="text-[11px] text-red-500/80 font-medium mb-3">
                You will need to re-enter your credentials next time.
              </p>
              <button
                onClick={() => {
                  if (logout) logout();
                  router.push("/login");
                }}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-red-600 text-white text-[12px] font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50">
          <p className="text-[10px] text-gray-400 font-medium text-center">
            Mediconnect Patient Portal • v1.0.0
          </p>
        </div>
      </div>
    </>
  );
}

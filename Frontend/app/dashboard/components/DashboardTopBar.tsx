"use client";

import React, { createContext, useContext } from "react";
import Link from "next/link";
import { Bell, Search, Settings } from "lucide-react";
import { useAuth } from "@/app/dashboard/context/AuthContext";
import { UserNotificationsDropdown } from "./UserNotificationsDropdown";

type DashboardUIContextType = {
  openSettings: () => void;
};

const DashboardUIContext = createContext<DashboardUIContextType | undefined>(undefined);

export function DashboardUIProvider({
  children,
  openSettings,
}: {
  children: React.ReactNode;
  openSettings: () => void;
}) {
  return (
    <DashboardUIContext.Provider value={{ openSettings }}>
      {children}
    </DashboardUIContext.Provider>
  );
}

function useDashboardUI() {
  const ctx = useContext(DashboardUIContext);
  return ctx ?? { openSettings: () => {} };
}

type DashboardTopBarProps = {
  placeholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export function DashboardTopBar({
  placeholder = "Search doctors, hospitals, records...",
  searchValue,
  onSearchChange,
}: DashboardTopBarProps) {
  const { user } = useAuth();
  const { openSettings } = useDashboardUI();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const bellRef = React.useRef<HTMLButtonElement>(null);

  const profilePicSrc = user?.profileImage
    ? `http://localhost:5000${user.profileImage}`
    : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop";

  return (
    <header className="h-20 shrink-0 border-b border-gray-100 bg-white px-6 shadow-sm md:px-8">
      <div className="grid h-full grid-cols-[1fr_minmax(0,420px)_1fr] items-center gap-4">
        <div aria-hidden />

        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-[13px] outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <button
              ref={bellRef}
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                showNotifications
                  ? "border-blue-100 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Bell size={17} />
            </button>
            <UserNotificationsDropdown
              open={showNotifications}
              onClose={() => setShowNotifications(false)}
              anchorRef={bellRef}
            />
          </div>

          <button
            type="button"
            onClick={openSettings}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <Settings size={17} />
          </button>

          <Link href="/dashboard/profile">
            <img
              src={profilePicSrc}
              alt="Profile"
              className="h-9 w-9 rounded-full border border-gray-200 object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

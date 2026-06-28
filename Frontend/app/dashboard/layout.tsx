"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { 
  LayoutDashboard, 
  FolderPlus, 
  Calendar, 
  Bot, 
  User, 
  Plus, 
  HelpCircle, 
  LogOut,
  BriefcaseMedical
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = () => {
    if (logout) logout();
    router.push("/");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Medical Records", href: "/dashboard/medical-records", icon: FolderPlus },
    { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
    { name: "AI Chatbot", href: "/dashboard/ai-chatbot", icon: Bot },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden antialiased font-sans text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-[260px] bg-white border-r border-gray-200/80 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Brand Header with Exact Logo from image_edee59.png */}
          <div className="p-6 pt-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0052cc] text-white rounded-[22px] flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
              <BriefcaseMedical size={22} strokeWidth={2.5} fill="currentColor" className="text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-black tracking-tight text-[#0052cc] leading-none">Mediconnect</h2>
              <p className="text-[11px] font-bold text-gray-400 tracking-wide mt-1">Clinical Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 px-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-[14px] transition-all duration-150 ${
                    isActive 
                      ? "bg-[#0052cc] text-white shadow-sm shadow-blue-600/10" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon 
                    size={18} 
                    strokeWidth={2.5} 
                    className={isActive ? "text-white" : "text-gray-400"} 
                  />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-6">
          <div className="border-t border-gray-100 pt-5 flex flex-col gap-4">
            <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#0052cc] text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={16} strokeWidth={3} />
              New Appointment
            </button>

            <div className="flex flex-col gap-1">
              <button className="flex items-center gap-3.5 px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors text-xs font-bold rounded-lg hover:bg-gray-50">
                <HelpCircle size={16} strokeWidth={2.5} className="text-gray-400" />
                Support
              </button>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3.5 px-3 py-2 text-red-600 hover:text-red-700 transition-colors text-xs font-bold rounded-lg hover:bg-red-50"
              >
                <LogOut size={16} strokeWidth={2.5} className="text-red-400" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout Container Container */}
      <main className="flex-1 overflow-auto bg-[#f3f4f6]">
        {children}
      </main>
    </div>
  );
}
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderPlus, 
  Calendar, 
  Bot, 
  User, 
  Plus, 
  HelpCircle, 
  LogOut 
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Medical Records", href: "/dashboard/medical-records", icon: FolderPlus },
    { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
    { name: "AI Chatbot", href: "/dashboard/ai-chatbot", icon: Bot },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#f3f4f6] border-r border-gray-200 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 pt-8">
            <h2 className="text-[24px] font-bold text-[#0057d9]">Mediconnect</h2>
            <p className="text-[13px] font-bold text-gray-500 mt-1">Clinical Portal</p>
          </div>

          <nav className="mt-4 px-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg font-bold transition-colors ${
                    isActive 
                      ? "bg-[#0057d9] text-white shadow-md" 
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon 
                    size={22} 
                    strokeWidth={2.5} 
                    className={isActive ? "text-white" : "text-gray-600"} 
                  />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 mb-4">
          <div className="border-t border-gray-300 pt-8 flex flex-col gap-6">
            <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#0057d9] text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
              <Plus size={20} strokeWidth={3} />
              New Appointment
            </button>

            <div className="flex flex-col gap-4 pl-2 mt-2">
              <button className="flex items-center gap-4 text-gray-700 hover:text-gray-900 transition-colors text-[15px] font-bold">
                <HelpCircle size={20} strokeWidth={2.5} className="text-gray-500" />
                Support
              </button>
              <button className="flex items-center gap-4 text-red-600 hover:text-red-700 transition-colors text-[15px] font-bold">
                <LogOut size={20} strokeWidth={2.5} className="text-red-600" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-[#f3f4f6]">
        {children}
      </main>
    </div>
  );
}

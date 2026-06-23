import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FolderHeart, 
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
  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#f8f9fa] border-r border-gray-200 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 pt-8">
            <h2 className="text-[22px] font-bold text-[#0057d9]">Mediconnect</h2>
            <p className="text-sm font-medium text-gray-500">Clinical Portal</p>
          </div>

          <nav className="mt-4 px-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold transition-colors">
              <LayoutDashboard size={20} className="text-gray-500" />
              Dashboard
            </Link>
            
            <Link href="/dashboard/medical-records" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold transition-colors">
              <FolderHeart size={20} className="text-gray-500" />
              Medical Records
            </Link>
            
            <Link href="/dashboard/appointments" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold transition-colors">
              <Calendar size={20} className="text-gray-500" />
              Appointments
            </Link>

            <Link href="/dashboard/ai-chatbot" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold transition-colors">
              <Bot size={20} className="text-gray-500" />
              AI Chatbot
            </Link>

            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#0057d9] text-white font-semibold shadow-md transition-colors mt-2">
              <User size={20} className="text-white" />
              Profile
            </Link>
          </nav>
        </div>

        <div className="p-4 px-6 mb-4">
          <div className="border-t border-gray-200 pt-6 flex flex-col gap-4">
            <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#0057d9] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={20} />
              New Appointment
            </button>

            <div className="flex flex-col gap-2 mt-2">
              <button className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-semibold">
                <HelpCircle size={18} />
                Support
              </button>
              <button className="flex items-center gap-3 px-2 py-2 text-red-600 hover:text-red-700 transition-colors text-sm font-semibold">
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-[#f8f9fa]">
        {children}
      </main>
    </div>
  );
}

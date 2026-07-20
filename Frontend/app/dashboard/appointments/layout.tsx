'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  FolderHeart,
  CalendarDays, 
  MessageSquare, 
  User, 
  AlertOctagon, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Medical Records', href: '/dashboard/medical-records', icon: FolderHeart },
    { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays },
    { name: 'AI Chatbot', href: '/dashboard/chatbot', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] text-[#1E293B] antialiased overflow-hidden">
      
      {/* PERSISTENT LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between h-full p-6 shrink-0 z-20">
        <div>
          {/* Brand Identity */}
          <div className="mb-8">
            <h1 className="text-[22px] font-extrabold tracking-tight text-[#0284C7]">Mediconnect</h1>
            <p className="text-xs font-semibold text-[#94A3B8] tracking-wide mt-0.5">Clinical Portal</p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#0284C7] text-white shadow-sm shadow-blue-500/10' 
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-4">
          <button className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2 font-bold transition-colors shadow-sm text-sm">
            <AlertOctagon size={16} />
            <span>Emergency Alert</span>
          </button>
          
          <div className="pt-4 border-t border-[#E2E8F0] space-y-1">
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all">
              <HelpCircle size={16} />
              <span>Support</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[#DC2626] hover:bg-red-50 transition-all">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTAINER COLUMN FOR MASTER PAGES */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Global Inner Search Bar Layer */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 shrink-0 z-10">
          <div className="relative w-96">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search medical data, files, doctors..." className="w-full bg-[#F1F5F9] pl-10 pr-4 py-2 rounded-xl text-xs border border-transparent focus:outline-none focus:border-[#0284C7] transition-all" />
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-[#64748B] hover:text-[#0F172A] relative"><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full"></span><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg></button>
            <button className="p-2 text-[#64748B] hover:text-[#0F172A]"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></button>
            <div className="flex items-center space-x-3 border-l pl-4 border-[#E2E8F0]">
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100" className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]" alt="Dr. Sarah Jenkins" />
            </div>
          </div>
        </header>

        {/* WORKSPACE VIEW RENDERING MOUNT */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
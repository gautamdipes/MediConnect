"use client";

import React, { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Search,
  Calendar as CalendarIcon, 
  MapPin, 
  Star, 
  Clock, 
  FileText, 
  Download, 
  Eye,
  HeartPulse,
  Activity,
  BotMessageSquare,
  Stethoscope,
  CalendarCheck,
  PlusSquare,
  Cross
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const profilePicSrc = user?.profileImage 
    ? `http://localhost:5000${user.profileImage}` 
    : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop";

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Sarah";

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Top Application Header containing Search Input Controls */}
      <header className="h-20 bg-[#f3f4f6] px-6 md:px-8 flex items-center justify-between shrink-0">
        <div className="relative w-80 max-w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search for doctors, reports..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200/80 rounded-full text-xs font-medium outline-none text-gray-770 shadow-sm placeholder-gray-400 focus:border-gray-300 transition-all" 
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-full text-xs font-bold text-gray-700 shadow-sm">
            <CalendarIcon size={14} className="text-gray-400" />
            <span>June 25, 2026</span>
          </div>
          <button className="p-2 bg-white border border-gray-100 rounded-full hover:bg-gray-50 text-gray-600 transition-colors shadow-sm">
            <Bell size={18} strokeWidth={2.5} />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ml-1 shrink-0">
            <img 
              src={profilePicSrc} 
              alt="User Profile" 
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout Panel */}
      <div className="px-6 md:px-8 max-w-[1400px] w-full mx-auto space-y-6 pb-20">
        
        {/* Workspace Greeting Area */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Good Morning, {firstName} <span className="text-3xl">👋</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            Manage your healthcare journey easily with Mediconnect
          </p>
        </div>

        {/* Quick Action Matrix Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <PlusSquare size={22} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-[15px] text-gray-800 leading-tight">Find Hospital</span>
          </button>

          <button className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group text-left">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
              <Stethoscope size={22} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-[15px] text-gray-800 leading-tight">Find Doctor</span>
          </button>

          <button className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group text-left">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
              <CalendarCheck size={22} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-[15px] text-gray-800 leading-tight">Book Appointment</span>
          </button>

          <button className="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100 flex items-center gap-4 hover:shadow-md transition-shadow group text-left">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-red-600/10">
              <Cross size={22} strokeWidth={3} className="rotate-45" />
            </div>
            <span className="font-extrabold text-[15px] text-red-700 leading-tight">Emergency Care</span>
          </button>
        </div>

        {/* Multi-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Layout Stream (Left Area) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Nearby Hospital Directory Rows */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">Nearby Hospitals</h2>
                <button className="text-blue-600 font-bold text-xs hover:underline">See All</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hospital Card item 1 */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                  <div className="h-40 relative w-full bg-gray-100">
                    <img 
                      src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400&auto=format&fit=crop" 
                      alt="City Hospital" 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-3 right-3 bg-white px-2 py-0.5 rounded-md text-xs font-black flex items-center gap-0.5 shadow-sm text-gray-800">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      4.8
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">City Hospital Kathmandu</h3>
                      <p className="text-gray-400 text-xs flex items-center gap-1 mt-1 font-bold">
                        <MapPin size={13} /> Maharajgunj, Kathmandu
                      </p>
                    </div>
                    <button className="w-full mt-4 py-2 border border-blue-600 text-blue-600 rounded-xl text-xs font-bold bg-white hover:bg-blue-50/40 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Hospital Card item 2 */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                  <div className="h-40 relative w-full bg-gray-100">
                    <img 
                      src="https://images.unsplash.com/photo-1538108149393-cebb609b7c84?q=80&w=400&auto=format&fit=crop" 
                      alt="MediPlus" 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-3 right-3 bg-white px-2 py-0.5 rounded-md text-xs font-black flex items-center gap-0.5 shadow-sm text-gray-800">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      4.6
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">MediPlus Specialist Center</h3>
                      <p className="text-gray-400 text-xs flex items-center gap-1 mt-1 font-bold">
                        <MapPin size={13} /> New Baneshwor, Kathmandu
                      </p>
                    </div>
                    <button className="w-full mt-4 py-2 border border-blue-600 text-blue-600 rounded-xl text-xs font-bold bg-white hover:bg-blue-50/40 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Medical Documentation History Section Row */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Medical Records</h2>
                <button className="text-blue-600 font-bold text-xs hover:underline">View All</button>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-5">Record Name</div>
                  <div className="col-span-3">Date</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>

                {/* Table row element 1 */}
                <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <FileText size={18} />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">Blood Test Report</span>
                  </div>
                  <div className="col-span-3 text-gray-500 text-xs font-semibold">12 June 2026</div>
                  <div className="col-span-2">
                    <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full">
                      Completed
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button className="p-1.5 border border-gray-100 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                      <Download size={15} />
                    </button>
                  </div>
                </div>

                {/* Table row element 2 */}
                <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-gray-500 shrink-0">
                      <FileText size={18} />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">General Prescription</span>
                  </div>
                  <div className="col-span-3 text-gray-500 text-xs font-semibold">08 June 2026</div>
                  <div className="col-span-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button className="p-1.5 border border-gray-100 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                      <Eye size={15} />
                    </button>
                  </div>
                </div>

                {/* Table row element 3 */}
                <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/40 transition-colors">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                      <FileText size={18} />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">X-Ray (Chest)</span>
                  </div>
                  <div className="col-span-3 text-gray-500 text-xs font-semibold">25 May 2026</div>
                  <div className="col-span-2">
                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full">
                      Archived
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button className="p-1.5 border border-gray-100 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                      <Download size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Secondary Layout Sidebar Stream (Right Area) */}
          <div className="space-y-6">
            
            {/* Appointment Preview Element Banner */}
            <section>
              <h2 className="text-lg font-black text-gray-900 tracking-tight mb-3">Upcoming Appointment</h2>
              <div className="bg-[#0057d9] rounded-2xl p-5 text-white shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-blue-400 shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100&auto=format&fit=crop" 
                      alt="Dr. John Smith" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">Dr. John Smith</h3>
                    <p className="text-blue-200 text-xs font-semibold mt-0.5">Senior Cardiologist</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-3">
                    <CalendarIcon className="text-blue-200" size={16} />
                    <div>
                      <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider">Date</p>
                      <p className="font-bold text-sm">25 June 2026</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-3">
                    <Clock className="text-blue-200" size={16} />
                    <div>
                      <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider">Time</p>
                      <p className="font-bold text-sm">10:30 AM</p>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2.5 bg-white text-[#0057d9] font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                  Manage Appointment
                </button>
              </div>
            </section>

            {/* Health Statistics Module */}
            <section>
              <h2 className="text-lg font-black text-gray-900 tracking-tight mb-3">Health Overview</h2>
              <div className="space-y-3">
                {/* Pulse Metric */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                      <HeartPulse size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Heart Rate</p>
                      <p className="text-xl font-black text-gray-900 mt-0.5">72 <span className="text-xs font-semibold text-gray-400">bpm</span></p>
                    </div>
                  </div>
                  <div className="text-teal-600 flex items-center gap-0.5 text-[10px] font-black bg-teal-50 px-2.5 py-0.5 rounded-full">
                    <Activity size={11} strokeWidth={2.5} /> Normal
                  </div>
                </div>

                {/* Pressure Metric */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500 shrink-0">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Blood Pressure</p>
                      <p className="text-xl font-black text-gray-900 mt-0.5">120/80</p>
                    </div>
                  </div>
                  <div className="text-teal-600 flex items-center gap-0.5 text-[10px] font-black bg-teal-50 px-2.5 py-0.5 rounded-full">
                    <Activity size={11} strokeWidth={2.5} /> Optimal
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Floating Chat Interface Trigger Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-teal-700 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-800 transition-colors z-50">
        <BotMessageSquare size={26} />
      </button>
    </div>
  );
}
"use client";

import React, { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Bell, 
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
  Building2,
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

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Manash";

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto relative pb-20">
      {/* Header Area */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Good Morning, {firstName} <span className="text-3xl">👋</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your healthcare journey easily with Mediconnect
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-700">
            <CalendarIcon size={16} />
            <span>June 25, 2026</span>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
            <Bell size={22} strokeWidth={2.5} />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ml-2 shrink-0">
            <img 
              src={profilePicSrc} 
              alt="User" 
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <PlusSquare size={24} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] text-gray-900 leading-tight text-left">Find<br/>Hospital</span>
        </button>

        <button className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Stethoscope size={24} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] text-gray-900 leading-tight text-left">Find<br/>Doctor</span>
        </button>

        <button className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
            <CalendarCheck size={24} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] text-gray-900 leading-tight text-left">Book<br/>Appointment</span>
        </button>

        <button className="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white">
            <Cross size={24} strokeWidth={3} className="rotate-45" />
          </div>
          <span className="font-bold text-[15px] text-red-700 leading-tight text-left">Emergency<br/>Care</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Nearby Hospitals */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nearby Hospitals</h2>
              <button className="text-blue-600 font-semibold text-sm hover:underline">See All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <div className="h-40 relative w-full bg-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400&auto=format&fit=crop" 
                    alt="City Hospital" 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-sm font-bold flex items-center gap-1 shadow-sm">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    4.8
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">City Hospital Kathmandu</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <MapPin size={14} /> Maharajgunj, Kathmandu
                    </p>
                  </div>
                  <button className="w-full mt-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <div className="h-40 relative w-full bg-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1538108149393-cebb609b7c84?q=80&w=400&auto=format&fit=crop" 
                    alt="MediPlus" 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-sm font-bold flex items-center gap-1 shadow-sm">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    4.6
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">MediPlus Specialist Center</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <MapPin size={14} /> New Baneshwor, Kathmandu
                    </p>
                  </div>
                  <button className="w-full mt-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Medical Records */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Medical Records</h2>
              <button className="text-blue-600 font-semibold text-sm hover:underline">View All</button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Record Name</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {/* Record 1 */}
              <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                  <span className="font-bold text-gray-800">Blood Test Report</span>
                </div>
                <div className="col-span-3 text-gray-500 text-sm">
                  12 June 2026
                </div>
                <div className="col-span-2">
                  <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full">
                    Completed
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              </div>

              {/* Record 2 */}
              <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    <FileText size={20} />
                  </div>
                  <span className="font-bold text-gray-800">General Prescription</span>
                </div>
                <div className="col-span-3 text-gray-500 text-sm">
                  08 June 2026
                </div>
                <div className="col-span-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                    Active
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye size={18} />
                  </button>
                </div>
              </div>

              {/* Record 3 */}
              <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                    <FileText size={20} />
                  </div>
                  <span className="font-bold text-gray-800">X-Ray (Chest)</span>
                </div>
                <div className="col-span-3 text-gray-500 text-sm">
                  25 May 2026
                </div>
                <div className="col-span-2">
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                    Archived
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* Right Column (Sidebar content) */}
        <div className="space-y-6">
          
          {/* Upcoming Appointment */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointment</h2>
            <div className="bg-[#0057d9] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-blue-400">
                  <img 
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100&auto=format&fit=crop" 
                    alt="Dr. John Smith" 
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Dr. John Smith</h3>
                  <p className="text-blue-200 text-sm">Senior Cardiologist</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="bg-white/10 rounded-xl p-3 flex items-center gap-4">
                  <CalendarIcon className="text-blue-200" size={20} />
                  <div>
                    <p className="text-xs text-blue-200 font-medium">Date</p>
                    <p className="font-bold">25 June 2026</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 flex items-center gap-4">
                  <Clock className="text-blue-200" size={20} />
                  <div>
                    <p className="text-xs text-blue-200 font-medium">Time</p>
                    <p className="font-bold">10:30 AM</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-colors relative z-10">
                Manage Appointment
              </button>
            </div>
          </section>

          {/* Health Overview */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Health Overview</h2>
            <div className="space-y-4">
              {/* Heart Rate */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                    <HeartPulse size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Heart Rate</p>
                    <p className="text-2xl font-bold text-gray-900">72 <span className="text-sm font-medium text-gray-500">bpm</span></p>
                  </div>
                </div>
                <div className="text-teal-600 flex items-center gap-1 text-sm font-bold bg-teal-50 px-2 py-1 rounded-md">
                  <Activity size={14} /> Normal
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Blood Pressure</p>
                    <p className="text-2xl font-bold text-gray-900">120/80</p>
                  </div>
                </div>
                <div className="text-teal-600 flex items-center gap-1 text-sm font-bold bg-teal-50 px-2 py-1 rounded-md">
                  <Activity size={14} /> Optimal
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-teal-700 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-800 transition-colors z-50">
        <BotMessageSquare size={28} />
      </button>
    </div>
  );
}
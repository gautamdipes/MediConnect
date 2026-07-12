'use client';

import React, { useState } from 'react';
import { 
  CalendarPlus, 
  ArrowUpRight, 
  Search, 
  HeartPulse, 
  Brain, 
  ChevronLeft, 
  ChevronRight, 
  Video,
  SlidersHorizontal
} from 'lucide-react';

// --- MOCK DATA DATASTORES ---
const METRICS_DATA = [
  { id: 1, title: "Total Bookings", value: "1,284", subtext: "12% vs last month", status: "trend" },
  { id: 2, title: "Upcoming", value: "42", subtext: "Next 7 days", status: "normal" },
  { id: 3, title: "Completed", value: "1,156", subtext: "Total to date", status: "success" },
  { id: 4, title: "Cancelled", value: "86", subtext: "Rate: 6.7%", status: "alert" },
  { id: 5, title: "Emergency", value: "12", subtext: "Immediate Priority", status: "urgent" },
];

const UPCOMING_VISITS = [
  {
    id: 1,
    title: "Cardiology Consultation",
    hospital: "St. Mary's General Hospital",
    icon: HeartPulse,
    iconColor: "text-[#0284C7] bg-blue-50",
    hasCall: false
  },
  {
    id: 2,
    title: "Neurology Check-up",
    hospital: "Dr. Alan Turing",
    icon: Brain,
    iconColor: "text-indigo-600 bg-indigo-50",
    hasCall: true
  }
];

const HOSPITALS = [
  { id: 1, name: "City Heart Institute", meta: "2.4 miles • Cardiology", img: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=300" },
  { id: 2, name: "Westside Medical", meta: "3.1 miles • General", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=300" },
  { id: 3, name: "Metropolis Wellness", meta: "5.0 miles • Specialist", img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=300" }
];

const HISTORY_ROWS = [
  { id: "#MC-9824", hospital: "St. Mary's General", status: "DONE", color: "bg-[#DCFCE7] text-[#15803D]" },
  { id: "#MC-9810", hospital: "City Heart Institute", status: "CANCEL", color: "bg-[#FEE2E2] text-[#991B1B]" },
  { id: "#MC-9755", hospital: "Westside Medical", status: "DONE", color: "bg-[#DCFCE7] text-[#15803D]" },
  { id: "#MC-9742", hospital: "Metropolis Wellness", status: "DONE", color: "bg-[#DCFCE7] text-[#15803D]" },
  { id: "#MC-9688", hospital: "St. Mary's General", status: "DONE", color: "bg-[#DCFCE7] text-[#15803D]" },
  { id: "#MC-9650", hospital: "City Heart Institute", status: "DONE", color: "bg-[#DCFCE7] text-[#15803D]" },
  { id: "#MC-9612", hospital: "Westside Medical", status: "CANCEL", color: "bg-[#FEE2E2] text-[#991B1B]" },
  { id: "#MC-9590", hospital: "Metropolis Wellness", status: "DONE", color: "bg-[#DCFCE7] text-[#15803D]" }
];

const DOCTORS = [
  { name: "Dr. Sarah Smith", specialty: "Cardiologist", rating: "4.9", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100" },
  { name: "Dr. David Miller", specialty: "Neurologist", rating: "4.8", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100" },
  { name: "Dr. Elena Rodriguez", specialty: "Pediatrician", rating: "5.0", img: "https://images.unsplash.com/photo-1594824813573-246434e3b96f?auto=format&fit=crop&q=80&w=100" }
];

const CALENDAR_DAYS = [
  { label: 'S', date: '24' },
  { label: 'M', date: '25' },
  { label: 'T', date: '26', isCurrent: true },
  { label: 'W', date: '27' },
  { label: 'T', date: '28' },
  { label: 'F', date: '29' },
  { label: 'S', date: '30' }
];

export default function AppointmentsDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#F8FAFC] min-h-screen">
      
      {/* 1. TOP BANNER ACTION SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Appointments</h2>
          <p className="text-sm text-[#64748B]">Manage clinical visits and track patient journey with precision.</p>
        </div>
        <button className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center space-x-2 shadow-sm">
          <CalendarPlus size={16} />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* 2. METRIC STRIP GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {METRICS_DATA.map((item) => {
          if (item.status === 'urgent') {
            return (
              <div key={item.id} className="bg-[#0284C7] text-white p-4 rounded-xl shadow-sm">
                <p className="text-xs font-bold opacity-80 uppercase tracking-wide">{item.title}</p>
                <p className="text-xl font-bold mt-1">{item.value}</p>
                <p className="text-[11px] opacity-90 mt-2">{item.subtext}</p>
              </div>
            );
          }
          return (
            <div key={item.id} className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide">{item.title}</p>
              <p className={`text-xl font-bold mt-1 ${
                item.status === 'success' ? 'text-[#15803D]' : item.status === 'alert' ? 'text-[#DC2626]' : 'text-[#0F172A]'
              }`}>
                {item.value}
              </p>
              <p className={`text-[11px] mt-2 flex items-center font-medium ${item.status === 'trend' ? 'text-[#15803D]' : 'text-[#64748B]'}`}>
                {item.status === 'trend' && <ArrowUpRight size={12} className="mr-0.5" />}
                {item.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* 3. CORE SUB-GRID STRUCTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN: PRIMARY DASHBOARD CONTROLS & TABLES */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#E2E8F0] p-2 rounded-xl shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
              <input 
                type="text" 
                placeholder="Search by doctor or hospital..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F1F5F9] pl-10 pr-4 py-2 rounded-lg text-sm border border-transparent focus:outline-none focus:border-[#0284C7] transition"
              />
            </div>
            <div className="flex gap-2">
              <select className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#0284C7] bg-none cursor-pointer">
                <option>Status: All</option>
              </select>
              <select className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#0284C7] bg-none cursor-pointer">
                <option>Department</option>
              </select>
            </div>
          </div>

          {/* UPCOMING VISITS GRID */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-[#0F172A]">Upcoming Visits</h3>
              <button className="text-xs font-bold text-[#0284C7] hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {UPCOMING_VISITS.map((visit) => {
                const IconComponent = visit.icon;
                return (
                  <div key={visit.id} className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className={`p-3 rounded-xl ${visit.iconColor}`}>
                        <IconComponent size={20} />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-[#0F172A]">{visit.title}</h4>
                        <p className="text-xs text-[#64748B]">{visit.hospital}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-[#F1F5F9] text-[#475569] font-semibold text-xs py-2 rounded-lg hover:bg-slate-200 transition">Reschedule</button>
                      {visit.hasCall ? (
                        <button className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-xs py-2 rounded-lg transition">Join Call</button>
                      ) : (
                        <button className="border border-[#0284C7] text-[#0284C7] font-semibold text-xs py-2 rounded-lg hover:bg-blue-50 transition">View Details</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NEARBY LOCATIONS CARD GALLERY */}
          <div>
            <h3 className="font-bold text-sm text-[#0F172A] mb-3">Nearby Hospitals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {HOSPITALS.map((hospital) => (
                <div key={hospital.id} className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <img src={hospital.img} alt={hospital.name} className="h-32 w-full object-cover" />
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">{hospital.name}</h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">{hospital.meta}</p>
                    </div>
                    <button className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-xs py-2 rounded-lg transition">Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORY RECORDS TABLE */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-[#E2E8F0]">
              <h3 className="font-bold text-sm text-[#0F172A]">History</h3>
              <button className="text-xs text-[#0284C7] font-semibold hover:underline">Export</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                    <th className="p-3 pl-4">ID</th>
                    <th className="p-3">Hospital</th>
                    <th className="p-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#334155]">
                  {HISTORY_ROWS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="p-3 pl-4 font-semibold text-[#0284C7]">{row.id}</td>
                      <td className="p-3">{row.hospital}</td>
                      <td className="p-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${row.color}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SECONDARY APP COMPONENT UTILITIES */}
        <div className="space-y-6">
          
          {/* MINI WEEKLY CALENDAR CARD */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#0F172A]">Schedule</h3>
              <div className="flex space-x-1 text-gray-400">
                <button className="hover:text-black p-1 transition"><ChevronLeft size={16} /></button>
                <button className="hover:text-black p-1 transition"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center text-xs gap-y-2">
              {CALENDAR_DAYS.map((d, index) => (
                <span key={`lbl-${index}`} className="text-gray-400 font-medium">{d.label}</span>
              ))}
              {CALENDAR_DAYS.map((d, index) => (
                <span
                  key={`date-${index}`}
                  className={`p-1 flex items-center justify-center transition-all cursor-pointer ${
                    d.isCurrent ? 'bg-[#0284C7] text-white rounded-full font-bold h-6 w-6 mx-auto' : 'text-gray-700 hover:bg-slate-100 rounded-full'
                  }`}
                >
                  {d.date}
                </span>
              ))}
            </div>
          </div>

          {/* DOCTORS AVAILABLE WIDGET */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#0F172A]">Available Doctors</h3>
              <button className="text-xs text-[#0284C7] font-semibold hover:underline">Explore All</button>
            </div>
            <div className="space-y-3.5">
              {DOCTORS.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={doc.img} alt={doc.name} className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0]" />
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">{doc.name}</p>
                      <p className="text-[10px] text-[#64748B]">{doc.specialty} • ★ {doc.rating}</p>
                    </div>
                  </div>
                  <button className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-semibold px-3 py-1 rounded-md transition shadow-sm">
                    Book
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* EMERGENCY VIRTUAL BANNER */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-sm mb-3">Virtual Care 24/7</h3>
            <button className="bg-white text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition relative z-10">
              Consult Now
            </button>
            <Video className="absolute bottom-2 right-4 text-white/10 w-16 h-16 pointer-events-none transform rotate-12" />
          </div>

        </div>

      </div>
    </main>
  );
}
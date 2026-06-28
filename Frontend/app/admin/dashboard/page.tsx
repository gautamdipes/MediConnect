"use client";
import React from "react";
import { Plus, Download, MoreVertical } from "lucide-react";

export default function AdminDashboardPage() {
  const hospitalData = [
    { name: "St. Mary's Medical Center", location: "Downtown, NY", status: "VERIFIED", docs: 142 },
    { name: "Northwest General", location: "Seattle, WA", status: "VERIFIED", docs: 89 },
    { name: "Central Children's", location: "Austin, TX", status: "PENDING", docs: 56 },
    { name: "Riverside Medical", location: "Portland, OR", status: "VERIFIED", docs: 64 },
    { name: "Mercy General", location: "Chicago, IL", status: "VERIFIED", docs: 112 },
    { name: "East Bay Clinic", location: "Oakland, CA", status: "PENDING", docs: 28 },
    { name: "South Shore Medical", location: "Miami, FL", status: "VERIFIED", docs: 124 },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Top action layout row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Systems Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Infrastructure: <span className="text-emerald-600 font-semibold">100% Operational</span> across 12 hospitals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#0057d9] text-white rounded-lg shadow-sm hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> New Hospital
          </button>
        </div>
      </div>

      {/* 3 Metric Card Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex justify-between items-start shadow-sm">
          <div className="space-y-4">
            <div className="p-2.5 bg-blue-50 text-[#0057d9] rounded-xl w-fit">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Active Users</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-0.5">12,482</h3>
            </div>
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">↗ +12.4%</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex justify-between items-start shadow-sm">
          <div className="space-y-4 w-full">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl w-fit">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div className="flex justify-between items-end w-full">
              <div>
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Hospitals</span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-0.5">48</h3>
              </div>
              <div className="w-24 pb-2">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full w-4/5 rounded-full"></div>
                </div>
              </div>
            </div>
            <span className="text-slate-500 text-xs font-medium flex items-center gap-1">⏱ 2 Pending</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex justify-between items-start shadow-sm">
          <div className="space-y-4 w-full">
            <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl w-fit">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div className="flex justify-between items-end w-full">
              <div>
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Doctors</span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-0.5">856</h3>
              </div>
              <svg className="w-20 h-6 stroke-slate-400 fill-none" strokeWidth={1.5}>
                <path d="M0 20 Q 10 5, 20 15 T 40 8 T 60 18 T 80 12" />
              </svg>
            </div>
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">✓ Verified</span>
          </div>
        </div>
      </div>

      {/* Network Health Index Banner */}
      <div className="bg-[#0057d9] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-6 z-10">
          <div className="flex items-end gap-1 h-12 w-16 opacity-40">
            {[40, 60, 45, 75, 90, 65, 95, 80].map((h, i) => (
              <div key={i} className="bg-white w-1 rounded-full" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-blue-200 uppercase">Network Health Index</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black">98.4</span>
              <span className="text-xl font-medium text-blue-200">%</span>
            </div>
            <p className="text-[11px] text-blue-100/80 mt-1">Uptime: 99.99% &nbsp;•&nbsp; Latency: 14ms</p>
          </div>
        </div>
        <div className="flex items-center gap-6 w-full md:w-auto z-10">
          <div className="hidden lg:block w-64 h-1.5 bg-blue-700 rounded-full overflow-hidden">
            <div className="bg-white h-full w-[98.4%] rounded-full"></div>
          </div>
          <button className="whitespace-nowrap px-5 py-2.5 bg-white text-[#0057d9] text-sm font-bold rounded-xl shadow-sm hover:bg-blue-50 transition w-full md:w-auto">
            Launch Multi-Site View
          </button>
        </div>
      </div>

      {/* Two-Column Master Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hospital Management Table Section */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Hospital Management</h3>
            <button className="text-xs font-bold text-[#0057d9] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Docs</th>
                  <th className="pb-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {hospitalData.map((hospital, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-bold text-slate-800">{hospital.name}</td>
                    <td className="py-3.5 text-slate-500">{hospital.location}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hospital.status === "VERIFIED" 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        {hospital.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">{hospital.docs}</td>
                    <td className="py-3.5 text-right text-slate-400">
                      <button className="p-1 hover:text-slate-600 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar Widget Stack */}
        <div className="space-y-6">
          {/* Appointments Block */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Appointments</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "Jane Doe", dept: "Cardiology", time: "10:30 AM", status: "Confirmed", initial: "JD", bg: "bg-blue-50 text-blue-600" },
                { name: "Mike Smith", dept: "GP", time: "11:15 AM", status: "Confirmed", initial: "MS", bg: "bg-teal-50 text-teal-600" },
                { name: "Robert King", dept: "Neuro", time: "12:00 PM", status: "Waiting", initial: "RK", bg: "bg-slate-100 text-slate-600" },
              ].map((apt, idx) => (
                <div key={idx} className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${apt.bg}`}>
                      {apt.initial}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{apt.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{apt.dept} • {apt.time}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold ${apt.status === "Confirmed" ? "text-emerald-600" : "text-slate-400"}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition">
              Schedule
            </button>
          </div>

          {/* Doctors Status Block */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Doctors Status</h3>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>

            <div className="space-y-2">
              {[
                { label: "Active Doctors", count: 742, dotColor: "bg-emerald-500" },
                { label: "On Leave", count: 114, dotColor: "bg-slate-400" },
                { label: "Emergency", count: 12, dotColor: "bg-red-500" },
              ].map((status, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${status.dotColor}`}></span>
                    <span className="text-sm font-medium text-slate-700">{status.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{status.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
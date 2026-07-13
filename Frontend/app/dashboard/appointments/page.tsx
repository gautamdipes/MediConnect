'use client';

import {
  Search, Bell, Settings, Plus, ChevronLeft, ChevronRight,
  HeartPulse, Brain, Video,
} from 'lucide-react';

const stats = [
  { label: 'Total bookings', value: '1,284', sub: '↑ 12% vs last month' },
  { label: 'Upcoming', value: '42', sub: 'Next 7 days' },
  { label: 'Completed', value: '1,156', sub: 'Total to date', color: 'text-emerald-600' },
  { label: 'Cancelled', value: '86', sub: 'Rate 4.7%', color: 'text-red-500' },
  { label: 'Emergency', value: '12', sub: 'Immediate priority', emergency: true },
];

const visits = [
  { icon: HeartPulse, title: 'Cardiology consultation', sub: "St. Mary's General Hospital", action: 'View details' },
  { icon: Brain, title: 'Neurology check-up', sub: 'Dr. Alan Turing', action: 'Join call' },
];

const hospitals = [
  { name: 'City Heart Institute', meta: '2.4 miles • Cardiology', img: 'photo-1519494026892-80bbd2d6fd0d' },
  { name: 'Westside Medical', meta: '3.1 miles • General', img: 'photo-1586773860418-d37222d8fce3' },
  { name: 'Metropolis Wellness', meta: '5.0 miles • Specialist', img: 'photo-1587351021759-3e566b6af7cc' },
];

const doctors = [
  { name: 'Dr. Sarah Smith', role: 'Cardiologist', rating: 4.9, img: 'photo-1559839734-2b71ea197ec2' },
  { name: 'Dr. David Miller', role: 'Neurologist', rating: 4.8, img: 'photo-1622253692010-333f2da6031d' },
  { name: 'Dr. Elena Rodriguez', role: 'Pediatrician', rating: 5.0, img: 'photo-1594824476967-48c8b964273f' },
];

const history = [
  { id: '#MC-9824', hospital: "St. Mary's General", status: 'Done' },
  { id: '#MC-9810', hospital: 'City Heart Institute', status: 'Cancel' },
  { id: '#MC-9755', hospital: 'Westside Medical', status: 'Done' },
  { id: '#MC-9742', hospital: 'Metropolis Wellness', status: 'Done' },
  { id: '#MC-9688', hospital: "St. Mary's General", status: 'Done' },
  { id: '#MC-9650', hospital: 'City Heart Institute', status: 'Done' },
  { id: '#MC-9612', hospital: 'Westside Medical', status: 'Cancel' },
  { id: '#MC-9590', hospital: 'Metropolis Wellness', status: 'Done' },
];

const week = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dates = [24, 25, 26, 27, 28, 29, 30];

const card = 'rounded-xl border border-gray-100 bg-white p-4';
const img = (id: string, size = 400) => `https://images.unsplash.com/${id}?w=${size}&h=${size / 1.6}&fit=crop&crop=faces`;

function Card({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className={`mb-4 ${card}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">{title}</h3>
        {action && <button className="text-[12.5px] font-semibold text-blue-600">{action}</button>}
      </div>
      {children}
    </section>
  );
}

// This component renders ONLY the page content — no sidebar.
// Mount it inside your app's existing layout (the one with your nav/sidebar).
export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f8] px-8 py-6 text-[#171d2d]">
      {/* Top bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-[360px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search medical data..." className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-[13px] outline-none" />
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600"><Bell size={17} /></button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600"><Settings size={17} /></button>
        <img src={img('photo-1633332755192-727a05c4013d', 100)} alt="Profile" className="h-9 w-9 rounded-full border border-gray-200 object-cover" />
      </div>

      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-[23px] font-bold">Appointments</h2>
          <p className="text-[13px] text-gray-400">Manage clinical visits and track patient journey with precision.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[13.5px] font-semibold text-white">
          <Plus size={15} /> Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-[repeat(4,1fr)_150px] gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.emergency ? 'bg-blue-600 text-white' : 'border border-gray-100 bg-white'}`}>
            <p className={`mb-2 text-[10px] font-semibold uppercase ${s.emergency ? 'text-blue-100' : 'text-gray-400'}`}>{s.label}</p>
            <p className={`text-[21px] font-bold ${s.emergency ? '' : s.color ?? ''}`}>{s.value}</p>
            <p className={`mt-1 text-[11px] ${s.emergency ? 'text-blue-100' : 'text-gray-400'}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_235px] items-start gap-4">
        {/* Left column */}
        <div>
          <div className="mb-4 flex gap-2.5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search by doctor or hospital..." className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-[13px] outline-none" />
            </div>
            <select className="rounded-lg border border-gray-200 px-3 text-[13px] text-gray-600"><option>Status: All</option></select>
            <select className="rounded-lg border border-gray-200 px-3 text-[13px] text-gray-600"><option>Department</option></select>
          </div>

          <Card title="Upcoming visits" action="View all">
            <div className="grid grid-cols-2 gap-3">
              {visits.map((v) => (
                <div key={v.title} className="rounded-xl border border-gray-100 p-3.5">
                  <div className="mb-3.5 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white"><v.icon size={18} /></div>
                    <div>
                      <p className="text-[13.5px] font-bold">{v.title}</p>
                      <p className="text-[11.5px] text-gray-400">{v.sub}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-md border border-gray-200 bg-gray-50 py-2 text-[12.5px] font-semibold">Reschedule</button>
                    <button className="flex-1 rounded-md border border-blue-600 py-2 text-[12.5px] font-semibold text-blue-600">{v.action}</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Nearby hospitals">
            <div className="grid grid-cols-3 gap-3">
              {hospitals.map((h) => (
                <div key={h.name}>
                  <img src={img(h.img)} alt={h.name} className="mb-2.5 h-[92px] w-full rounded-lg object-cover" />
                  <p className="text-[13px] font-bold">{h.name}</p>
                  <p className="mb-2.5 text-[11.5px] text-gray-400">{h.meta}</p>
                  <button className="w-full rounded-md bg-blue-600 py-2 text-[12.5px] font-semibold text-white">Book now</button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="History" action="Export">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10.5px] font-semibold uppercase text-gray-400">
                  <th className="py-2">ID</th><th className="py-2">Hospital</th><th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-none">
                    <td className="py-2.5 font-semibold text-blue-600">{r.id}</td>
                    <td className="py-2.5">{r.hospital}</td>
                    <td className="py-2.5">
                      <span className={`rounded px-2.5 py-1 text-[10.5px] font-bold ${r.status === 'Done' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right column */}
        <div>
          <Card title="Schedule">
            <div className="grid grid-cols-7 gap-y-2 text-center">
              {week.map((d, i) => <div key={i} className="text-[10.5px] font-semibold text-gray-400">{d}</div>)}
              {dates.map((d) => (
                <div key={d} className={`mx-0.5 rounded-md py-1.5 text-[12.5px] ${d === 26 ? 'bg-blue-600 font-bold text-white' : ''}`}>{d}</div>
              ))}
            </div>
          </Card>

          <Card title="Available doctors" action="Explore all">
            {doctors.map((d) => (
              <div key={d.name} className="flex items-center gap-2.5 py-2.5">
                <img src={img(d.img, 100)} alt={d.name} className="h-[34px] w-[34px] rounded-full object-cover" />
                <div>
                  <p className="text-[12.5px] font-bold">{d.name}</p>
                  <p className="text-[11px] text-gray-400">{d.role} • {d.rating}★</p>
                </div>
                <button className="ml-auto rounded-md bg-blue-600 px-3.5 py-1.5 text-[11.5px] font-semibold text-white">Book</button>
              </div>
            ))}
          </Card>

          <section className="flex items-center justify-between rounded-xl bg-blue-600 p-4 text-white">
            <div>
              <h3 className="mb-2.5 text-[14px] font-bold">Virtual Care 24/7</h3>
              <button className="rounded-md bg-white px-3.5 py-2 text-[12.5px] font-bold text-blue-600">Consult now</button>
            </div>
            <Video size={26} strokeWidth={1.6} />
          </section>
        </div>
      </div>
    </div>
  );
}
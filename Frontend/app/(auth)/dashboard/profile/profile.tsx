"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  LayoutDashboard, FileText, Calendar, Bot, User, 
  Plus, LifeBuoy, LogOut, Heart, Droplet, MessageSquare, Bell
} from "lucide-react";
import { useAuth } from "../../../dashboard/context/AuthContext";
import type { User } from "../../../dashboard/context/AuthContext";
import { apiRequest } from "../../../lib/proxy";
import { useState, useEffect } from "react";

// 1. Define runtime schema validation matching your setup specifications
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is invalid"),
  dob: z.string().min(1, "Date of birth is required"),
});

// Define the shape of the response from the whoami endpoint
interface WhoAmIResponse {
  user: User;
}

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { setUser } = useAuth(); // helper to sync AuthContext
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Load current user details on mount
  useEffect(() => {
    apiRequest({ method: "get", url: "/v1/auth/whoami" })
      .then((data: WhoAmIResponse) => {
        // Populate form defaults and sync AuthContext
        setUser(data.user);
        reset({
          fullName: data.user.fullName || "",
          email: data.user.email || "",
          phone: data.user.phoneNumber || "",
          dob: data.user.dob?.split("T")[0] || "",
        });
      })
      .catch((err: unknown) => console.error("whoami error", err));
  }, []);

  const router = useRouter();

  const sidebarItemClass = "flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[13px] font-semibold text-[#6b7280] transition hover:bg-gray-50 hover:text-[#171717]";
  const activeSidebarItemClass = "flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[13px] font-semibold bg-[#0057d9] text-white shadow-sm";
  const labelClass = "mb-2 block text-[12px] font-semibold text-[#222]";
  const inputClass = "h-[48px] w-full rounded-[6px] border border-[#d1d5db] bg-white px-4 text-[14px] text-[#171717] outline-none transition placeholder:text-[#9ca3af] focus:border-[#0057d9] focus:ring-1 focus:ring-[#0057d9] aria-invalid:border-red-500";

  // 2. Initialize React Hook Form with Zod runtime validation bounds
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const { token } = useAuth();
  const onSubmit = async (data: ProfileFormData) => {
    const form = new FormData();
    form.append("fullName", data.fullName);
    form.append("email", data.email);
    form.append("phone", data.phone);
    form.append("dob", data.dob);
    if (avatarFile) {
      form.append("file", avatarFile);
    }
    try {
      console.log('Submitting profile update, token:', token);
      await apiRequest({
        method: "post",
        url: "/v1/auth/update",
        data: form,
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      // Refresh context after successful update
      const refreshed = await apiRequest({ method: "get", url: "/v1/auth/whoami" });
      setUser(refreshed.user);
      alert("Profile updated!");
    } catch (err: any) {
      console.error(err);
      alert("Update failed: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9fafb] font-sans antialiased text-[#171717]">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-64 border-r border-[#e5e7eb] bg-white p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="mb-8 px-2 mt-2">
            <h1 className="text-[20px] font-bold text-[#0057d9] tracking-tight leading-none">Mediconnect</h1>
            <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mt-1.5">Clinical Portal</p>
          </div>

          <nav className="space-y-1">
            <Link href="/dashboard" className={sidebarItemClass}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link href="/records" className={sidebarItemClass}>
              <FileText size={18} /> Medical Records
            </Link>
            <Link href="/appointments" className={sidebarItemClass}>
              <Calendar size={18} /> Appointments
            </Link>
            <Link href="/chatbot" className={sidebarItemClass}>
              <Bot size={18} /> AI Chatbot
            </Link>
            <Link href="/profile" className={activeSidebarItemClass}>
              <User size={18} /> Profile
            </Link>
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#e5e7eb]">
          <button type="button" className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[6px] bg-[#0057d9] text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#0048b5]">
            <Plus size={16} /> New Appointment
          </button>
          <div className="space-y-1 text-[12px] font-medium">
            <Link href="/support" className="flex items-center gap-2 px-3 py-2 text-[#6b7280] hover:text-[#171717] transition">
              <LifeBuoy size={15} /> Support
            </Link>
            <button type="button" onClick={() => router.push("/login")} className="flex w-full items-center gap-2 px-3 py-2 text-red-500 hover:text-red-600 transition text-left">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN PROFILE CONTENT --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-start mb-9">
          <div>
            <h2 className="text-[26px] font-bold tracking-tight text-[#171717]">My Profile</h2>
            <p className="text-[13px] text-[#6b7280] mt-1">Manage your personal settings and health credentials</p>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="p-2 text-[#9ca3af] hover:text-[#4b5563] bg-white rounded-full border border-[#e5e7eb] shadow-sm relative">
              <Bell size={18} />
            </button>
            <div className="w-10 h-10 rounded-full border border-gray-200 shadow-sm overflow-hidden bg-gray-100">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" alt="User Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#e5e7eb] p-6 shadow-sm">
            <h3 className="text-[16px] font-bold text-[#171717] mb-6">Personal Information</h3>
            
            {/* 3. Form submission wired natively with react-hook-form handles */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label className={labelClass}>Profile Picture</label>
                <input type="file" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className={labelClass}>Full Name</label>
                  <input 
                    id="fullName" 
                    type="text" 
                    aria-invalid={Boolean(errors.fullName)}
                    {...register("fullName")}
                    className={inputClass} 
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-[12px] text-red-500">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email Address</label>
                  <input 
                    id="email" 
                    type="email" 
                    aria-invalid={Boolean(errors.email)}
                    {...register("email")}
                    className={inputClass} 
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-[12px] text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone Number</label>
                  <input 
                    id="phone" 
                    type="tel" 
                    aria-invalid={Boolean(errors.phone)}
                    {...register("phone")}
                    className={inputClass} 
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-[12px] text-red-500">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="dob" className={labelClass}>Date of Birth</label>
                  <input 
                    id="dob" 
                    type="date" 
                    aria-invalid={Boolean(errors.dob)}
                    {...register("dob")}
                    className={inputClass} 
                  />
                  {errors.dob && (
                    <p className="mt-1.5 text-[12px] text-red-500">{errors.dob.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#e5e7eb]">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-[44px] px-6 rounded-[6px] bg-[#0057d9] text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#0048b5] disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Side Panels */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-[12px] border border-[#e5e7eb] shadow-sm">
              <h3 className="text-[15px] font-bold text-[#171717] mb-4">Health Vitals Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-rose-50/50 rounded-[8px]">
                  <div className="flex items-center gap-2.5 text-rose-600">
                    <Heart size={16} fill="currentColor" />
                    <span className="text-[13px] font-semibold text-[#374151]">Pulse Rate</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#171717]">72 bpm</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-teal-50/50 rounded-[8px]">
                  <div className="flex items-center gap-2.5 text-teal-600">
                    <Droplet size={16} />
                    <span className="text-[13px] font-semibold text-[#374151]">Blood Pressure</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#171717]">120/80</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <button type="button" className="fixed bottom-6 right-6 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-700 transition z-50">
        <MessageSquare size={20} />
      </button>

    </div>
  );
} 
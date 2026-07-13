"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Bell, 
  Settings, 
  Search, 
  Camera, 
  Pencil, 
  Info, 
  Lock, 
  Eye, 
  Calendar as CalendarIcon 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { User } from "../context/AuthContext";
import { apiRequest } from "@/lib/proxy";
import { UserNotificationsDropdown } from "../components/UserNotificationsDropdown";
import React from "react";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is invalid"),
  dob: z.string().min(1, "Date of birth is required"),
  address: z.string().optional(),
  gender: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  oldPassword: z.string().min(6, "Too short"),
  newPassword: z.string().min(6, "Too short"),
  confirmPassword: z.string().min(6, "Too short"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = React.useRef<HTMLButtonElement>(null);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dob: "",
      address: "123 Wellness Avenue, Apt 4B, Medical District, NY 10001",
      gender: "Female"
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Populate/reset form defaults when user data changes
  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName || "Sarah Jenkins",
        email: user.email || "sarah.jenkins@example.com",
        phone: user.phoneNumber || "+1 (555) 123-4567",
        dob: user.dob ? user.dob.split("T")[0] : "1985-06-15",
        address: "123 Wellness Avenue, Apt 4B, Medical District, NY 10001",
        gender: "Female"
      });
    }
  }, [user, resetProfile]);

  // Fetch the latest user data (including profileImage) on mount
  useEffect(() => {
    apiRequest({ method: "get", url: "/v1/auth/whoami" })
      .then((data: { user: User }) => {
        setUser(data.user);
      })
      .catch((err: unknown) => console.error("whoami error", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setUpdateMessage(null);
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phone);
      formData.append("dob", data.dob);
      if (data.address) formData.append("address", data.address);
      if (data.gender) formData.append("gender", data.gender);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await apiRequest({
        method: "post",
        url: "/v1/auth/update",
        data: formData,
      });

      if (res.user) setUser(res.user);
      // Clear file selection so the server-side image is shown
      setSelectedFile(null);
      setImagePreview(null);
      setUpdateMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setUpdateMessage({ type: "error", text: err.message || "Failed to update profile." });
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      setPasswordMessage(null);
      await apiRequest({
        method: "put",
        url: "/v1/auth/password",
        data: { currentPassword: data.oldPassword, newPassword: data.newPassword },
      });
      resetPassword();
      setPasswordMessage({ type: "success", text: "Password updated successfully!" });
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Failed to update password." });
    }
  };

  // Use the Next.js proxy for uploaded images so we don't need a direct backend URL
  const profilePicSrc = imagePreview
    || (user?.profileImage ? user.profileImage : null)
    || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300";

  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[14px] text-gray-900 outline-none transition focus:border-[#0057d9] focus:ring-1 focus:ring-[#0057d9] placeholder:text-gray-400";
  const labelClass = "block text-[13px] font-bold text-gray-700 mb-2";

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc]">
      {/* Top Navbar */}
      <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
        <div className="relative w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full h-10 pl-11 pr-4 bg-white border border-gray-300 rounded-full text-sm outline-none focus:border-[#0057d9]"
          />
        </div>
        <div className="flex items-center gap-5">
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`text-gray-600 transition-colors ${showNotifications ? "text-blue-600" : "hover:text-gray-900"}`}
            >
              <Bell size={22} strokeWidth={2} />
            </button>
            <UserNotificationsDropdown
              open={showNotifications}
              onClose={() => setShowNotifications(false)}
              anchorRef={bellRef}
            />
          </div>
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <Settings size={22} strokeWidth={2} />
          </button>
          <div className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden ml-2">
            <img src={profilePicSrc} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8 max-w-[1200px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 mt-2 text-[15px]">
            Manage your personal information, security preferences, and account settings.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column - Profile Card */}
          <div className="w-full lg:w-[320px] bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex flex-col items-center shrink-0">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                <img src={profilePicSrc} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-1 right-1 w-8 h-8 bg-[#0057d9] text-white rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-sm hover:bg-blue-700 transition"
              >
                <Camera size={16} />
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </div>
            
            <div className="text-center mb-6 w-full">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{user?.fullName || "Sarah Jenkins"}</h2>
                <span className="bg-[#0057d9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                  PREMIUM PATIENT
                </span>
              </div>
              <p className="text-gray-500 text-[14px]">{user?.email || "sarah.jenkins@example.com"}</p>
            </div>

            <div className="w-full flex flex-col gap-3 mb-6">
              <button 
                className="w-full py-2.5 border border-gray-300 rounded-lg text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                Upload New Photo
              </button>
              <button className="w-full py-2.5 text-[14px] font-bold text-red-600 hover:bg-red-50 rounded-lg transition">
                Remove
              </button>
            </div>

            <div className="w-full border-t border-gray-200 pt-6">
              <button className="flex items-center justify-center gap-2 w-full py-2.5 text-[14px] font-bold text-[#0057d9] hover:bg-blue-50 rounded-lg transition">
                <Pencil size={16} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="flex-1 w-full flex flex-col gap-8">
            
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-gray-500 tracking-widest">PERSONAL INFORMATION</h3>
                <Info size={20} className="text-gray-400" />
              </div>
              
              <div className="p-8">
                {updateMessage && (
                  <div className={`mb-6 p-4 rounded-lg text-sm font-semibold ${updateMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {updateMessage.text}
                  </div>
                )}
                
                <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input type="text" {...registerProfile("fullName")} className={inputClass} />
                      {profileErrors.fullName && <p className="text-red-500 text-xs mt-1">{profileErrors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input type="email" {...registerProfile("email")} className={inputClass} />
                      {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input type="tel" {...registerProfile("phone")} className={inputClass} />
                      {profileErrors.phone && <p className="text-red-500 text-xs mt-1">{profileErrors.phone.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Date of Birth</label>
                      <div className="relative">
                        <input type="date" {...registerProfile("dob")} className={`${inputClass} [&::-webkit-calendar-picker-indicator]:opacity-0`} />
                        <CalendarIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                      {profileErrors.dob && <p className="text-red-500 text-xs mt-1">{profileErrors.dob.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Home Address</label>
                      <input type="text" {...registerProfile("address")} className={inputClass} />
                    </div>
                    <div className="md:col-span-1">
                      <label className={labelClass}>Gender</label>
                      <select {...registerProfile("gender")} className={`${inputClass} appearance-none`}>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 -mx-8 px-8 -mb-8 pb-6 bg-gray-50/50">
                    <button type="button" className="text-[14px] font-bold text-gray-700 hover:text-gray-900 px-4 py-2.5">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmittingProfile} className="bg-[#0057d9] text-white px-6 py-2.5 rounded-lg text-[14px] font-bold hover:bg-blue-700 transition disabled:opacity-70">
                      {isSubmittingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
              <div className="px-8 py-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-gray-500 tracking-widest">SECURITY SETTINGS</h3>
                <Lock size={20} className="text-gray-400" />
              </div>
              
              <div className="p-8">
                {passwordMessage && (
                  <div className={`mb-6 p-4 rounded-lg text-sm font-semibold ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {passwordMessage.text}
                  </div>
                )}
                
                <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2 md:w-1/2 pr-3">
                      <label className={labelClass}>Current Password</label>
                      <div className="relative">
                        <input type="password" placeholder="••••••••" {...registerPassword("oldPassword")} className={inputClass} />
                        <Eye size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
                      </div>
                      {passwordErrors.oldPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.oldPassword.message}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>New Password</label>
                      <div className="relative">
                        <input type="password" {...registerPassword("newPassword")} className={inputClass} />
                        <Eye size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
                      </div>
                      {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">PASSWORD STRENGTH</span>
                        <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wide">STRONG</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                        <div className="w-4/5 h-full bg-[#059669] rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Confirm New Password</label>
                      <div className="relative">
                        <input type="password" {...registerPassword("confirmPassword")} className={inputClass} />
                        <Eye size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
                      </div>
                      {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-6 border-t border-gray-200 -mx-8 px-8 -mb-8 pb-6 bg-gray-50/50">
                    <button type="submit" disabled={isSubmittingPassword} className="bg-[#0057d9] text-white px-6 py-2.5 rounded-lg text-[14px] font-bold hover:bg-blue-700 transition disabled:opacity-70">
                      {isSubmittingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
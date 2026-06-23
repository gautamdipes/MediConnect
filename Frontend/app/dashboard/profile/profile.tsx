"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bell, Heart, Droplet, MessageSquare, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "@/lib/proxy";

const profileSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7, "Phone number is invalid"),
    dob: z.string().min(1, "Date of birth is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const labelClass = "mb-2 block text-[12px] font-semibold text-[#222]";
    const inputClass = "h-[48px] w-full rounded-[6px] border border-[#d1d5db] bg-white px-4 text-[14px] text-[#171717] outline-none transition placeholder:text-[#9ca3af] focus:border-[#0057d9] focus:ring-1 focus:ring-[#0057d9] aria-invalid:border-red-500";

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            dob: "",
        },
    });

    // Populate/reset form defaults when user data changes
    useEffect(() => {
        if (user) {
            reset({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phoneNumber || "",
                dob: user.dob ? user.dob.split("T")[0] : "",
            });
        }
    }, [user, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        try {
            setUpdateMessage(null);
            const formData = new FormData();
            formData.append("fullName", data.fullName);
            formData.append("phone", data.phone);
            formData.append("dob", data.dob);
            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            const res = await apiRequest({
                method: "post",
                url: "/v1/auth/update",
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.user) {
                setUser(res.user);
            }
            setUpdateMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (err: any) {
            console.error(err);
            setUpdateMessage({ type: "error", text: err.message || "Failed to update profile." });
        }
    };

    const profilePicSrc = imagePreview || (user?.profileImage ? `http://localhost:5000${user.profileImage}` : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150");

    return (
        <>
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
                        <img src={profilePicSrc} alt="User Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#e5e7eb] p-6 shadow-sm">
                    <h3 className="text-[16px] font-bold text-[#171717] mb-6">Personal Information</h3>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Profile Image Upload */}
                        <div className="flex items-center gap-5 pb-6 border-b border-[#e5e7eb]">
                            <div className="relative w-20 h-20 rounded-full border border-gray-200 shadow-sm overflow-hidden bg-gray-100 group">
                                <img src={profilePicSrc} alt="User Profile Preview" className="w-full h-full object-cover" />
                                <label htmlFor="profileImageInput" className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                    <Camera size={18} />
                                </label>
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-[#171717]">Profile Picture</h4>
                                <p className="text-[12px] text-[#6b7280] mt-1 mb-2.5">Upload a new avatar (JPG, PNG, GIF up to 5MB)</p>
                                <input
                                    id="profileImageInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('profileImageInput')?.click()}
                                    className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[12px] font-semibold text-[#374151] shadow-sm transition hover:bg-gray-50"
                                >
                                    Choose Image
                                </button>
                            </div>
                        </div>

                        {updateMessage && (
                            <div className={`p-4 rounded-[6px] text-[13px] ${updateMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                                {updateMessage.text}
                            </div>
                        )}

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
                                    disabled
                                    aria-invalid={Boolean(errors.email)}
                                    {...register("email")}
                                    className={`${inputClass} bg-gray-50 cursor-not-allowed`}
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

                {/* Sidebar Summary Panels */}
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

            <button type="button" className="fixed bottom-6 right-6 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-700 transition z-50">
                <MessageSquare size={20} />
            </button>
        </>
    );
}
"use client";
import React, { useEffect, useState } from "react";

type UserForm = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
};

type Props = {
  mode: "create" | "edit";
  initialData?: Partial<UserForm & { _id: string }>;
  onSubmit: (data: UserForm) => void;
  onCancel: () => void;
  isLoading: boolean;
};

export default function UserModal({ mode, initialData, onSubmit, onCancel, isLoading }: Props) {
  const [form, setForm] = useState<UserForm>({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "user",
  });
  const [errors, setErrors] = useState<Partial<UserForm>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        password: "",
        phoneNumber: initialData.phoneNumber || "",
        role: initialData.role || "user",
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Partial<UserForm> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";
    if (mode === "create" && !form.password.trim()) newErrors.password = "Password is required";
    if (!form.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => { if (validate()) onSubmit(form); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {mode === "create" ? "Create User" : "Edit User"}
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]" placeholder="John Doe" />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]" placeholder="john@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Password {mode === "edit" && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]" placeholder="password" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]" placeholder="9800000000" />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 rounded-lg bg-[#0057d9] text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {isLoading ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

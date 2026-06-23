"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/proxy";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  oldPassword: z.string().min(6, "Too short"),
  newPassword: z.string().min(6, "Too short"),
  confirmPassword: z.string().min(6, "Too short"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

type FormData = z.infer<typeof schema>;

export default function PasswordForm() {
  const { token } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await apiRequest({
        method: "put",
        url: "/v1/auth/password",
        data: { oldPassword: data.oldPassword, newPassword: data.newPassword },
      });
      reset();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Current Password</label>
          <input
            type="password"
            {...register("oldPassword")}
            className="mt-1 block w-full border rounded p-2"
          />
          {errors.oldPassword && (
            <p className="text-red-600 text-sm">{errors.oldPassword.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            {...register("newPassword")}
            className="mt-1 block w-full border rounded p-2"
          />
          {errors.newPassword && (
            <p className="text-red-600 text-sm">{errors.newPassword.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Confirm New Password</label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="mt-1 block w-full border rounded p-2"
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
        {isSubmitSuccessful && (
          <p className="text-green-600 mt-2">Password updated successfully!</p>
        )}
      </form>
    </div>
  );
}

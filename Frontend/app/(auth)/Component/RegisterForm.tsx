"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { RegisterFormData, registerSchema } from "./schema";

type RegisterResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

export default function SignupForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const labelClass = "mb-2 block text-[12px] font-semibold text-[#222]";
  const inputClass =
    "h-[48px] w-full rounded-[6px] border border-[#d1d5db] bg-white px-4 text-[14px] text-[#171717] outline-none transition placeholder:text-[#9ca3af] focus:border-[#0057d9] focus:ring-1 focus:ring-[#0057d9]";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  });

  const onSubmit = async (formData: RegisterFormData) => {
    setSubmitError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = (await response.json()) as RegisterResponse;

      if (!response.ok || !result.success) {
        setSubmitError(result.message || "Registration failed");
        return;
      }

      router.push("/login");
    } catch {
      setSubmitError("Could not connect to the backend server");
    }
  };

  return (
    <div className="w-full max-w-[360px]">
      <h2 className="text-[32px] font-bold leading-none text-[#171717]">
        Create account
      </h2>
      <p className="mt-2 text-[12px] text-[#6b7280]">
        Enter your credentials to continue
      </p>

      <form className="mt-9" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
            className={inputClass}
          />
          {errors.fullName && (
            <p className="mt-1.5 text-[12px] text-red-500">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="mt-6">
          <label htmlFor="email" className={labelClass}>
            Work Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
            className={inputClass}
          />
          {errors.email && (
            <p className="mt-1.5 text-[12px] text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="mt-6">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
              className={`${inputClass} pr-11`}
            />
            <Eye
              size={15}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-[12px] text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 accent-[#0057d9]"
            {...register("terms")}
          />
          <label htmlFor="terms" className="text-[12px] leading-5 text-[#6b7280]">
            I agree to the{" "}
            <span className="font-semibold text-[#0057d9]">Terms of Service</span>{" "}
            and{" "}
            <span className="font-semibold text-[#0057d9]">Privacy Policy</span>.
          </label>
        </div>
        {errors.terms && (
          <p className="mt-1.5 text-[12px] text-red-500">
            {errors.terms.message}
          </p>
        )}
        {submitError && (
          <p className="mt-4 rounded-[6px] bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-7 flex h-[54px] w-full items-center justify-center rounded-[6px] bg-[#0057d9] text-[13px] font-semibold text-white shadow-[0_10px_18px_rgba(0,87,217,0.18)] transition hover:bg-[#0048b5] disabled:opacity-60"
        >
          Create Account
        </button>

        <div className="my-8 border-t border-[#e5e7eb]" />

        <button
          type="button"
          className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-semibold text-[#222] transition hover:bg-gray-50"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-200 text-[10px] font-bold text-[#4285f4]">
            G
          </span>
          Sign up with Google
        </button>

        <p className="mt-5 text-center text-[12px] text-[#6b7280]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#0057d9]">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

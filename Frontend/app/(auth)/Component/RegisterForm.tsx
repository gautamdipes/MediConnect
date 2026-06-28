"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { RegisterFormData, registerSchema } from "./schema";

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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
      terms: true,
    },
  });

  const onSubmit = () => {
    router.push("/login");
  };

  return (
    <div className="w-full max-w-[360px]">
      {/* Restored the exact original size with the black weight and tracking-tight */}
      <h2 className="text-[32px] font-black leading-none text-[#171717] tracking-tight">
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
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
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
          className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-semibold text-[#222] transition hover:bg-gray-50 shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3c.9-2.73 3.46-4.46 6.64-4.46z"/>
            <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.6-.2-2.35H12v4.46h6.46c-.28 1.47-1.1 2.72-2.35 3.56l3.66 2.84c2.14-1.98 3.38-4.9 3.38-8.51z"/>
            <path fill="#FBBC05" d="M5.36 14.5c-.23-.68-.36-1.41-.36-2.17s.13-1.49.36-2.17l-3.86-3C.68 8.71 0 10.28 0 12s.68 3.29 1.5 4.84l3.86-2.84z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.18 0-5.74-1.73-6.64-4.46l-3.86 3C3.4 20.35 7.35 23 12 23z"/>
          </svg>
          Sign up with Google
        </button>

        <p className="mt-5 text-center text-[12px] text-[#6b7280]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#0057d9] hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
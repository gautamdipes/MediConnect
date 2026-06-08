"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const labelClass = "mb-2 block text-[12px] font-semibold text-[#222]";
  const inputClass =
    "h-[50px] w-full rounded-[6px] border border-[#d1d5db] bg-white px-4 text-[14px] text-[#171717] outline-none transition placeholder:text-[#9ca3af] focus:border-[#0057d9] focus:ring-1 focus:ring-[#0057d9]";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-[360px]">
      <h2 className="text-[32px] font-bold leading-none text-[#171717]">
        Login Portal
      </h2>
      <p className="mt-2 text-[12px] text-[#6b7280]">
        Enter your credentials to continue
      </p>

      <form className="mt-9" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className={labelClass}>
            Work Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@healthcare.org"
            className={inputClass}
          />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-[12px] font-semibold text-[#222]">
              Password
            </label>
            <button
              type="button"
              className="text-[12px] font-semibold text-[#0057d9] hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={`${inputClass} pr-11`}
            />
            <Eye
              size={15}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-gray-300 accent-[#0057d9]"
          />
          <label htmlFor="remember-me" className="text-[12px] text-[#6b7280]">
            Remember me on this device
          </label>
        </div>

        <button
          type="submit"
          className="mt-7 flex h-[54px] w-full items-center justify-center gap-2 rounded-[6px] bg-[#0057d9] text-[13px] font-semibold text-white shadow-[0_10px_18px_rgba(0,87,217,0.18)] transition hover:bg-[#0048b5]"
        >
          Sign In
        </button>

        <div className="my-8 border-t border-[#e5e7eb]" />

        <button
          type="button"
          className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-semibold text-[#222] transition hover:bg-gray-50"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-200 text-[10px] font-bold text-[#4285f4]">
            G
          </span>
          Sign in with Google
        </button>

        <p className="mt-5 text-center text-[12px] text-[#6b7280]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-[#0057d9]">
            Request Access
          </Link>
        </p>
      </form>
    </div>
  );
}

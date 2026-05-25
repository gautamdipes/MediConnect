"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

export default function LoginForm() {
  return (
    <div className="flex h-full flex-col justify-center px-14">
      <h2 className="text-[46px] font-bold text-[#1a1a1a]">
        Login Portal
      </h2>

      <p className="mt-2 text-[16px] text-gray-500">
        Enter your credentials to continue
      </p>

      <form className="mt-12 flex flex-col gap-7">
        <div>
          <label className="mb-3 block text-sm font-semibold">
            Work Email
          </label>

          <input
            type="email"
            placeholder="name@healthcare.org"
            className="h-[64px] w-full rounded-md border border-gray-300 px-5 text-lg"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold">
            Password
          </label>

          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              className="h-[64px] w-full rounded-md border border-gray-300 px-5 text-lg"
            />

            <Eye
              size={18}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <button className="h-[66px] rounded-md bg-[#0057d9] text-lg font-semibold text-white">
          Sign In
        </button>

        <p className="text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#0057d9]"
          >
            Request Access
          </Link>
        </p>
      </form>
    </div>
  );
}
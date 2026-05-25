"use client";

import Link from "next/link";

export default function SignupForm() {
  return (
    <div className="flex h-full flex-col justify-center px-14">
      <h2 className="text-[46px] font-bold text-[#1a1a1a]">
        Create account
      </h2>

      <form className="mt-12 flex flex-col gap-7">
        <input
          type="text"
          placeholder="Full Name"
          className="h-[64px] w-full rounded-md border border-gray-300 px-5 text-lg"
        />

        <input
          type="email"
          placeholder="Email"
          className="h-[64px] w-full rounded-md border border-gray-300 px-5 text-lg"
        />

        <input
          type="password"
          placeholder="Password"
          className="h-[64px] w-full rounded-md border border-gray-300 px-5 text-lg"
        />

        <button className="h-[66px] rounded-md bg-[#0057d9] text-lg font-semibold text-white">
          Create Account
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#0057d9]"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
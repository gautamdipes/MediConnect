"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

export default function HospitalDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("hospitalToken");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("hospitalToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <BrandLogo
          size={36}
          showText
          subtitle="Hospital Portal"
          textClassName="text-[18px] font-black tracking-tight text-[#0057d9] leading-none"
          subtitleClassName="text-[11px] font-bold text-gray-400 tracking-wide mt-1"
        />
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs font-bold text-gray-500 hover:text-gray-900"
        >
          Log out
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Hospital login works
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Step 1 is done. Overview and Patients come in the next steps.
          </p>
        </div>
      </main>
    </div>
  );
}

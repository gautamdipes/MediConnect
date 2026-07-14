"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { AuthCareAnimation } from "@/components/AuthCareAnimation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignup = pathname.includes("/signup") || pathname.includes("/register");

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-white text-[#091E42]">
      {/* White + dark blue mix */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(165deg,#ffffff_0%,#edf4ff_32%,#d6e6fb_58%,#0a1f45_82%,#071428_100%)]" />
        <div className="absolute -left-24 top-0 h-[480px] w-[480px] rounded-full bg-[#0057d9]/16 blur-[120px]" />
        <div className="absolute right-[-8%] top-[22%] h-[400px] w-[400px] rounded-full bg-[#003da1]/20 blur-[110px]" />
        <div className="absolute bottom-[10%] left-[18%] h-[320px] w-[320px] rounded-full bg-white/55 blur-[90px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-[#0057d9]/10 bg-white/90 backdrop-blur-md">
        <div className="flex h-14 w-full items-center justify-between px-3 sm:px-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 transition hover:opacity-85"
          >
            <BrandLogo size={28} />
            <span className="font-[family-name:var(--font-display)] text-[18px] font-semibold tracking-[-0.02em] text-[#091E42]">
              MediConnect
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className={`px-2.5 py-1.5 text-[13px] font-semibold transition ${
                !isSignup
                  ? "text-[#0057d9]"
                  : "text-[#091E42] hover:text-[#0057d9]"
              }`}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-[#0057d9] px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#0048b5]"
            >
              SignUp
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-14 md:py-20">
        <section className="grid w-full max-w-[960px] overflow-hidden rounded-2xl border border-[#0057d9]/12 bg-white/95 shadow-[0_24px_60px_rgba(7,20,40,0.14)] md:grid-cols-[1.05fr_0.95fr]">
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(165deg,#0057d9_0%,#003da1_55%,#071428_100%)] px-12 py-14 text-white md:flex">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#7eb6ff]">
                MediConnect
              </p>
              <h1 className="mt-8 font-[family-name:var(--font-display)] text-[40px] font-medium leading-[1.1] tracking-[-0.02em]">
                {isSignup ? "Start your care journey." : "Welcome back."}
              </h1>
              <p className="mt-5 max-w-[32ch] text-[15px] leading-[1.7] text-white/70">
                {isSignup
                  ? "Create an account to book appointments and keep your records close."
                  : "Sign in to manage appointments, doctors, and medical records."}
              </p>
            </div>

            <div className="flex flex-1 items-center justify-center py-6">
              <AuthCareAnimation />
            </div>

            <p className="text-[12px] text-white/40">
              Secure patient access for hospitals and clinics.
            </p>
          </aside>

          <div className="flex items-center justify-center px-8 py-10 sm:px-12">{children}</div>
        </section>
      </main>

      <footer className="border-t border-[#0057d9]/10 bg-white/70 px-6 py-5 text-center text-[12px] text-[#5E6C84] backdrop-blur-sm">
        © {new Date().getFullYear()} MediConnect. All rights reserved.
      </footer>
    </div>
  );
}

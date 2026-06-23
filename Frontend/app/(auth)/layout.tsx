"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignup = pathname.includes("/signup") || pathname.includes("/register");

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] text-[#111827]">
      <header className="mx-auto flex h-[56px] w-full max-w-[1320px] items-center justify-between bg-[#f4f6f8] px-8">
        <Link href="/" className="text-[20px] font-bold text-black">
          MediConnect
        </Link>

        <nav className="hidden items-center gap-12 text-[12px] text-[#374151] md:flex">
          <Link href="/dashboard" className="hover:text-[#0057d9]">
            Hospitals
          </Link>
          <Link href="/dashboard" className="hover:text-[#0057d9]">
            Doctors
          </Link>
          <Link href="/dashboard" className="hover:text-[#0057d9]">
            About Us
          </Link>
        </nav>

        <div className="flex items-center gap-5 text-[12px]">
          <Link href="/login" className="text-[#374151] hover:text-[#0057d9]">
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-[4px] bg-[#0057d9] px-5 py-2 font-semibold text-white"
          >
            SignUp
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <section className="grid h-[640px] w-full max-w-[980px] overflow-hidden rounded-[10px] border border-[#edf0f3] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)] md:grid-cols-[1.05fr_0.95fr]">
          <aside className="hidden flex-col justify-center bg-[linear-gradient(180deg,#075fc8_0%,#003f8f_100%)] px-12 text-white md:flex">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
              Enterprise Healthcare
            </p>

            <h1 className="mt-8 text-[42px] font-bold leading-tight">
              {isSignup ? (
                <>
                  The future of
                  <br />
                  clinical efficiency
                </>
              ) : (
                "Welcome back"
              )}
            </h1>

            <p className="mt-5 max-w-[340px] text-[15px] leading-7 text-blue-100">
              {isSignup
                ? "Streamline patient care and administrative workflows with our secure, HIPAA-compliant clinical operating system."
                : "Access your clinical dashboard and patient data with enterprise-grade security."}
            </p>
          </aside>

          <div className="flex items-center justify-center px-12">{children}</div>
        </section>
      </main>

      <footer className="flex min-h-[60px] items-center justify-between border-t border-[#d4d9df] bg-[#eef0f2] px-7 text-[11px] text-[#374151]">
        <span className="font-bold text-black">MediConnect</span>
        <div className="flex gap-8 underline">
          <Link href="/dashboard">Privacy Policy</Link>
          <Link href="/dashboard">Terms of Service</Link>
          <Link href="/dashboard">HIPAA Compliance</Link>
          <Link href="/dashboard">Cookie Settings</Link>
        </div>
        <span>© 2024 MediConnect Medical Systems. All rights reserved.</span>
      </footer>
    </div>
  );
}

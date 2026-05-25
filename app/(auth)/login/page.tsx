"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] font-sans antialiased">
      {/* 1. HEADER / NAVIGATION */}
      <header className="flex h-[80px] w-full items-center justify-between bg-white px-[60px] border-b border-[#f0f0f0]">
        <div className="text-[22px] font-bold tracking-tight text-[#091e42]">
          MediConnect
        </div>
        <nav className="flex items-center gap-[40px] text-[15px] font-medium text-[#5e6c84]">
          <Link href="#" className="hover:text-[#0057d9]">Hospitals</Link>
          <Link href="#" className="hover:text-[#0057d9]">Doctors</Link>
          <Link href="#" className="hover:text-[#0057d9]">About Us</Link>
        </nav>
        <div className="flex items-center gap-[24px]">
          {/* NOW ROUNDED WITH BLUE COLOR */}
          <Link
            href="/login"
            className="rounded-[6px] bg-[#0057d9] px-[24px] py-[10px] text-[15px] font-semibold text-white transition hover:bg-[#0048b5]"
          >
            Log In
          </Link>
          {/* REVERTED TO PLAIN LINK */}
          <Link href="/signup" className="text-[15px] font-medium text-[#344563] hover:text-[#0057d9]">
            SignUp
          </Link>
        </div>
      </header>

      {/* 2. MAIN SPLIT CARD INTERFACE */}
      <main className="flex flex-1 items-center justify-center py-[60px]">
        <div className="flex w-full max-w-[1160px] h-[720px] bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden border border-[#f0f0f0]">
          
          {/* Left Side: Brand Marketing Panel */}
          <div className="relative flex w-[48%] flex-col justify-between bg-gradient-to-b from-[#005edd] to-[#003da1] p-[60px] text-white">
            <div className="flex items-center gap-[8px] text-[12px] font-bold tracking-widest uppercase opacity-80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-[14px] w-[14px]"
              >
                <path d="M12 2s6 4.5 6 10.5c0 4.5-3.5 7.5-6 7.5s-6-3.003-6-7.5C6 6.5 12 2 12 2zm0 4.25c-2.347 0-4.25 1.903-4.25 4.25S9.653 14.75 12 14.75s4.25-1.903 4.25-4.25S14.347 6.25 12 6.25z" />
              </svg>
              Enterprise Healthcare
            </div>

            <div className="mb-[40px]">
              <h1 className="text-[42px] font-bold leading-[1.15] tracking-tight">
                Welcome back
              </h1>
              <p className="mt-[20px] text-[15px] leading-[1.6] text-blue-100 max-w-[380px] font-light">
                Access your clinical dashboard and patient data with enterprise-grade security.
              </p>
            </div>
            
            <div />
          </div>

          {/* Right Side: Login Form Identity */}
          <div className="flex flex-1 flex-col justify-center px-[70px] py-[40px] bg-white">
            <h2 className="text-[32px] font-bold tracking-tight text-[#171717]">
              Login Portal
            </h2>
            <p className="mt-[6px] text-[14px] text-[#7b7b7b]">
              Enter your credentials to continue
            </p>

            <form className="mt-[36px] flex flex-col" onSubmit={(e) => e.preventDefault()}>
              {/* Work Email */}
              <div className="mb-[20px]">
                <label className="mb-[8px] block text-[13px] font-semibold text-[#222]">
                  Work Email
                </label>
                <input
                  type="email"
                  placeholder="name@healthcare.org"
                  className="h-[50px] w-full rounded-[6px] border border-[#e2e8f0] bg-white px-[16px] text-[15px] text-[#171717] placeholder-[#a0aec0] outline-none transition focus:border-[#0057d9] focus:ring-1 focus:ring-[#0057d9]"
                />
              </div>

              {/* Password Container with Split Top Layout */}
              <div className="mb-[18px]">
                <div className="mb-[8px] flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-[#222]">
                    Password
                  </label>
                  <Link href="#" className="text-[13px] font-bold text-[#0057d9] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="h-[50px] w-full rounded-[6px] border border-[#e2e8f0] bg-white px-[16px] pr-[48px] text-[15px] text-[#171717] placeholder-[#a0aec0] outline-none transition focus:border-[#0057d9] focus:ring-1 focus:ring-[#0057d9]"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="absolute right-[16px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9d9d9d]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="mb-[24px] flex items-start gap-[10px]">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="mt-[3px] h-[15px] w-[15px] rounded border-gray-300 accent-[#0057d9]"
                />
                <label htmlFor="remember-me" className="text-[13px] leading-[1.4] text-[#7a7a7a] select-none">
                  Remember me on this device
                </label>
              </div>

              {/* Action Trigger Button */}
              <button className="flex h-[50px] w-full items-center justify-center gap-[8px] rounded-[6px] bg-[#0057d9] text-[15px] font-semibold text-white transition hover:bg-[#0048b5]">
                Sign In
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="h-[16px] w-[16px]"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H8.25" />
                </svg>
              </button>

              {/* Segment Divider */}
              <div className="my-[24px] border-t border-[#eee]" />

              {/* Alternative OAuth Entry */}
              <button
                type="button"
                className="flex h-[50px] w-full items-center justify-center gap-[10px] rounded-[6px] border border-[#d9d9d9] bg-white text-[14px] font-medium text-[#444] transition hover:bg-gray-50"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                  className="h-[18px] w-[18px]"
                />
                Sign in with Google
              </button>

              {/* Alternating Sub-Router Router */}
              <p className="mt-[20px] text-center text-[13px] text-[#7a7a7a]">
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-[#0057d9] hover:underline">
                  Request Access
                </Link>
              </p>
            </form>
          </div>

        </div>
      </main>
      

      {/* 3. SITE COMPLIANCE FOOTER */}
      <footer className="flex h-[60px] items-center justify-between border-t border-[#e8e8e8] bg-[#f4f5f7] px-[60px] text-[12px] text-[#6b778c]">
        <div className="flex items-center gap-[24px]">
          <span className="font-bold text-[#42526e] text-[14px] mr-4">MediConnect</span>
          <Link href="#" className="hover:underline">Privacy Policy</Link>
          <Link href="#" className="hover:underline">Terms of Service</Link>
          <Link href="#" className="hover:underline">HIPAA Compliance</Link>
          <Link href="#" className="hover:underline">Cookie Settings</Link>
        </div>
        <div>
          © 2024 MediConnect Medical Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
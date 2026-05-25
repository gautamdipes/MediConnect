"use client";

import React, { useState } from "react";

export default function MediConnectApp() {
  // Navigation State Control: 'dashboard' | 'login' | 'signup'
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'login' | 'signup'>('dashboard');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFBFD] font-sans text-[#091E42] antialiased">
      
      {/* 1. FIXED STANDARD REPLICATED HEADER */}
      <header className="sticky top-0 z-50 flex h-[80px] w-full items-center justify-between border-b border-[#F0F0F0] bg-white px-[60px] shadow-sm">
        {/* Logo */}
        <button 
          onClick={() => setCurrentScreen('dashboard')}
          className="text-[22px] font-bold tracking-tight text-[#091E42] transition hover:opacity-80"
        >
          MediConnect
        </button>
        
        {/* Nav Links */}
        <nav className="flex items-center gap-[40px] text-[15px] font-medium text-[#5E6C84]">
          <button onClick={() => setCurrentScreen('dashboard')} className="hover:text-[#0057D9] transition">Hospitals</button>
          <button onClick={() => setCurrentScreen('dashboard')} className="hover:text-[#0057D9] transition">Doctors</button>
          <button onClick={() => setCurrentScreen('dashboard')} className="hover:text-[#0057D9] transition">About Us</button>
        </nav>

        {/* Auth Button Action Triggers */}
        <div className="flex items-center gap-[24px]">
          <button 
            onClick={() => setCurrentScreen('login')} 
            className={`text-[15px] font-medium transition ${currentScreen === 'login' ? 'text-[#0057D9] font-bold' : 'text-[#344563] hover:text-[#0057D9]'}`}
          >
            Log In
          </button>
          <button
            onClick={() => setCurrentScreen('signup')}
            className="rounded-[6px] bg-[#0057D9] px-[24px] py-[10px] text-[15px] font-semibold text-white transition hover:bg-[#0048B5] shadow-sm active:scale-95"
          >
            SignUp
          </button>
        </div>
      </header>

      {/* VIEWPORT CONTROLLER SWITCH */}
      <div className="flex-1 flex flex-col justify-between">
        
        {/* SCREEN A: PREMIUM NETWORK DASHBOARD */}
        {currentScreen === 'dashboard' && (
          <div className="animate-fadeIn flex-1 flex flex-col">
            {/* Top Stat Banner */}
            <div className="bg-gradient-to-r from-[#0057D9] to-[#003DA1] text-white text-center py-2.5 px-4 text-xs font-semibold tracking-wider uppercase">
              🚀 System Notice: Connected to over 1,200+ HIPAA Compliant Data Nodes Nationwide
            </div>

            {/* Hero Split Layout */}
            <main className="mx-auto max-w-[1300px] w-full grid lg:grid-cols-12 items-center gap-12 px-[60px] py-[80px]">
              {/* Left Column Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#0057D9]/10 border border-[#0057D9]/20 px-4 py-1.5 text-xs font-bold text-[#0057D9]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Interoperability Engine Active
                </div>
                <h1 className="text-[48px] sm:text-[56px] font-black tracking-tight text-[#091E42] leading-[1.1]">
                  The future of <br />
                  <span className="bg-gradient-to-r from-[#0057D9] to-[#00A3FF] bg-clip-text text-transparent">
                    clinical efficiency.
                  </span>
                </h1>
                <p className="text-[17px] leading-[1.75] text-[#5E6C84] max-w-[560px]">
                  Streamline patient care and administrative workflows with our secure, HIPAA-compliant clinical operating system. Connect provider directories, real-time hospital open capacity metrics, and universal diagnostic charts instantly.
                </p>

                {/* Primary Landing Page CTAs */}
                <div className="pt-4 flex flex-wrap gap-4">
                  <button 
                    onClick={() => setCurrentScreen('signup')}
                    className="rounded-lg bg-[#0057D9] text-white px-8 py-4 font-bold shadow-lg shadow-blue-500/10 transition hover:bg-[#0048B5] hover:shadow-xl"
                  >
                    Deploy Institution Node
                  </button>
                  <button 
                    onClick={() => setCurrentScreen('login')}
                    className="rounded-lg border border-[#D9D9D9] bg-white text-[#344563] px-8 py-4 font-bold transition hover:bg-gray-50"
                  >
                    Access Portal
                  </button>
                </div>
              </div>

              {/* Right Column Interactive Dynamic UI Showcase */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent blur-[100px] rounded-full" />
                <div className="relative w-full max-w-[420px] bg-white border border-[#F0F0F0] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-6 space-y-6 overflow-hidden">
                  
                  {/* Decorative Radar Ring Top */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Infrastructure</h4>
                      <p className="text-sm font-bold text-[#091E42]">Emergency Network Load</p>
                    </div>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>

                  {/* Fact Card 1 */}
                  <div className="flex items-center gap-4 bg-[#FAFBCD]/40 border border-[#F2E8F0] p-3.5 rounded-xl transition hover:scale-[1.02]">
                    <div className="text-2xl">⏳</div>
                    <div>
                      <h5 className="text-[15px] font-bold text-[#091E42]">-34% ER Wait Times</h5>
                      <p className="text-xs text-[#5E6C84]">Average patient triage processing acceleration metric.</p>
                    </div>
                  </div>

                  {/* Fact Card 2 */}
                  <div className="flex items-center gap-4 bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl transition hover:scale-[1.02]">
                    <div className="text-2xl">⚡</div>
                    <div>
                      <h5 className="text-[15px] font-bold text-[#091E42]">200ms Telemetry Sync</h5>
                      <p className="text-xs text-[#5E6C84]">Real-time hospital bed registry system update interval.</p>
                    </div>
                  </div>

                  {/* Fact Card 3 */}
                  <div className="flex items-center gap-4 bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl transition hover:scale-[1.02]">
                    <div className="text-2xl">🔐</div>
                    <div>
                      <h5 className="text-[15px] font-bold text-[#091E42]">SOC2 Type II Secure</h5>
                      <p className="text-xs text-[#5E6C84]">Military-grade cryptography wrapping clinical records.</p>
                    </div>
                  </div>

                </div>
              </div>
            </main>
          </div>
        )}

        {/* SCREEN B: PREMIUM LOGIN PORTAL */}
        {currentScreen === 'login' && (
          <main className="animate-fadeIn flex-1 flex items-center justify-center py-[60px] px-4">
            <div className="flex w-full max-w-[1160px] h-[720px] bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden border border-[#F0F0F0]">
              
              {/* Left Side: Brand Marketing Panel */}
              <div className="relative hidden md:flex w-[48%] flex-col justify-between bg-gradient-to-b from-[#005EDD] to-[#003DA1] p-[60px] text-white">
                <div className="flex items-center gap-[8px] text-[12px] font-bold tracking-widest uppercase opacity-80">
                  🌐 Enterprise Healthcare
                </div>

                <div className="mb-[40px] space-y-4">
                  <h1 className="text-[42px] font-bold leading-[1.15] tracking-tight">
                    Welcome back
                  </h1>
                  <p className="text-[15px] leading-[1.6] text-blue-100 max-w-[380px] font-light">
                    Access your clinical dashboard and patient data with enterprise-grade security layers.
                  </p>
                </div>
                
                <div className="text-[11px] font-mono text-blue-200/50">Protected via end-to-end transport layer security.</div>
              </div>

              {/* Right Side: Login Form */}
              <div className="flex flex-1 flex-col justify-center px-[40px] lg:px-[70px] py-[40px] bg-white">
                <h2 className="text-[32px] font-bold tracking-tight text-[#171717]">
                  Login Portal
                </h2>
                <p className="mt-[6px] text-[14px] text-[#7B7B7B]">
                  Enter your credentials to continue
                </p>

                <form className="mt-[36px] flex flex-col" onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-[20px]">
                    <label className="mb-[8px] block text-[13px] font-semibold text-[#222]">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@healthcare.org"
                      className="h-[50px] w-full rounded-[6px] border border-[#E2E8F0] bg-white px-[16px] text-[15px] text-[#171717] placeholder-[#A0AEC0] outline-none transition focus:border-[#0057D9] focus:ring-1 focus:ring-[#0057D9]"
                    />
                  </div>

                  <div className="mb-[18px]">
                    <div className="mb-[8px] flex items-center justify-between">
                      <label className="text-[13px] font-semibold text-[#222]">
                        Password
                      </label>
                      <button type="button" className="text-[13px] font-bold text-[#0057D9] hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="h-[50px] w-full rounded-[6px] border border-[#E2E8F0] bg-white px-[16px] pr-[48px] text-[15px] text-[#171717] placeholder-[#A0AEC0] outline-none transition focus:border-[#0057D9] focus:ring-1 focus:ring-[#0057D9]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#9D9D9D] hover:text-[#0057D9] transition text-sm font-semibold"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-[24px] flex items-start gap-[10px]">
                    <input
                      type="checkbox"
                      id="remember-me"
                      className="mt-[3px] h-[15px] w-[15px] rounded border-gray-300 accent-[#0057D9]"
                    />
                    <label htmlFor="remember-me" className="text-[13px] leading-[1.4] text-[#7A7A7A] select-none">
                      Remember me on this device
                    </label>
                  </div>

                  <button className="flex h-[50px] w-full items-center justify-center gap-[8px] rounded-[6px] bg-[#0057D9] text-[15px] font-semibold text-white transition hover:bg-[#0048B5]">
                    Sign In
                  </button>

                  <div className="my-[24px] border-t border-[#EEE]" />

                  <button
                    type="button"
                    className="flex h-[50px] w-full items-center justify-center gap-[10px] rounded-[6px] border border-[#D9D9D9] bg-white text-[14px] font-medium text-[#444] transition hover:bg-gray-50"
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google logo"
                      className="h-[18px] w-[18px]"
                    />
                    Sign in with Google
                  </button>

                  <p className="mt-[20px] text-center text-[13px] text-[#7A7A7A]">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setCurrentScreen('signup')} className="font-semibold text-[#0057D9] hover:underline">
                      Request Access
                    </button>
                  </p>
                </form>
              </div>

            </div>
          </main>
        )}

        {/* SCREEN C: PREMIUM SIGNUP / CREATE ACCOUNT */}
        {currentScreen === 'signup' && (
          <main className="animate-fadeIn flex-1 flex items-center justify-center py-[60px] px-4">
            <div className="flex w-full max-w-[1160px] h-[720px] bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden border border-[#F0F0F0]">
              
              {/* Left Side: Brand Marketing Panel */}
              <div className="relative hidden md:flex w-[48%] flex-col justify-between bg-gradient-to-b from-[#005EDD] to-[#003DA1] p-[60px] text-white">
                <div className="flex items-center gap-[8px] text-[12px] font-bold tracking-widest uppercase opacity-80">
                  🏢 ENTERPRISE HEALTHCARE
                </div>

                <div className="mb-[40px] space-y-4">
                  <h1 className="text-[42px] font-bold leading-[1.15] tracking-tight">
                    The future of <br />clinical efficiency
                  </h1>
                  <p className="text-[15px] leading-[1.6] text-blue-100 max-w-[380px] font-light">
                    Streamline patient care and administrative workflows with our secure, HIPAA-compliant clinical operating system.
                  </p>
                </div>
                
                <div className="text-[11px] font-mono text-blue-200/50">SOC2 Type II Certified Cloud Data Architecture.</div>
              </div>

              {/* Right Side: Signup Form */}
              <div className="flex flex-1 flex-col justify-center px-[40px] lg:px-[70px] py-[40px] bg-white">
                <h2 className="text-[32px] font-bold tracking-tight text-[#171717]">
                  Create account
                </h2>
                <p className="mt-[6px] text-[14px] text-[#7B7B7B]">
                  Enter your credentials to continue
                </p>

                <form className="mt-[30px] flex flex-col" onSubmit={(e) => e.preventDefault()}>
                  
                  {/* Name Input */}
                  <div className="mb-[16px]">
                    <label className="mb-[8px] block text-[13px] font-semibold text-[#222]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Alexander Wright"
                      className="h-[48px] w-full rounded-[6px] border border-[#E2E8F0] bg-white px-[16px] text-[15px] text-[#171717] placeholder-[#A0AEC0] outline-none transition focus:border-[#0057D9] focus:ring-1 focus:ring-[#0057D9]"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="mb-[16px]">
                    <label className="mb-[8px] block text-[13px] font-semibold text-[#222]">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@healthcare.org"
                      className="h-[48px] w-full rounded-[6px] border border-[#E2E8F0] bg-white px-[16px] text-[15px] text-[#171717] placeholder-[#A0AEC0] outline-none transition focus:border-[#0057D9] focus:ring-1 focus:ring-[#0057D9]"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="mb-[20px]">
                    <label className="mb-[8px] block text-[13px] font-semibold text-[#222]">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="h-[48px] w-full rounded-[6px] border border-[#E2E8F0] bg-white px-[16px] pr-[48px] text-[15px] text-[#171717] placeholder-[#A0AEC0] outline-none transition focus:border-[#0057D9] focus:ring-1 focus:ring-[#0057D9]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#9D9D9D] hover:text-[#0057D9] text-xs font-semibold"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="mb-[24px] flex items-start gap-[10px]">
                    <input
                      type="checkbox"
                      required
                      id="terms"
                      className="mt-[3px] h-[15px] w-[15px] rounded border-gray-300 accent-[#0057D9]"
                    />
                    <label htmlFor="terms" className="text-[12px] leading-[1.5] text-[#7A7A7A] select-none">
                      I agree to the <span className="text-[#0057D9] font-semibold hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#0057D9] font-semibold hover:underline cursor-pointer">Privacy Policy</span>.
                    </label>
                  </div>

                  <button className="flex h-[50px] w-full items-center justify-center rounded-[6px] bg-[#0057D9] text-[15px] font-semibold text-white transition hover:bg-[#0048B5]">
                    Create Account
                  </button>

                  <div className="my-[20px] border-t border-[#EEE]" />

                  <button
                    type="button"
                    className="flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[6px] border border-[#D9D9D9] bg-white text-[14px] font-medium text-[#444] transition hover:bg-gray-50"
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google logo"
                      className="h-[18px] w-[18px]"
                    />
                    Sign up with Google
                  </button>

                  <p className="mt-[20px] text-center text-[13px] text-[#7A7A7A]">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setCurrentScreen('login')} className="font-semibold text-[#0057D9] hover:underline">
                      Log in
                    </button>
                  </p>
                </form>
              </div>

            </div>
          </main>
        )}

        {/* 3. COMPLIANCE SITE FOOTER */}
        <footer className="flex flex-col sm:flex-row h-auto sm:h-[60px] items-center justify-between border-t border-[#E8E8E8] bg-[#F4F5F7] px-[60px] py-4 sm:py-0 text-[12px] text-[#6B778C] gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-[24px]">
            <span className="font-bold text-[#42526E] text-[14px]">MediConnect</span>
            <button onClick={() => setCurrentScreen('dashboard')} className="hover:underline">Privacy Policy</button>
            <button onClick={() => setCurrentScreen('dashboard')} className="hover:underline">Terms of Service</button>
            <button onClick={() => setCurrentScreen('dashboard')} className="hover:underline">HIPAA Compliance</button>
            <button onClick={() => setCurrentScreen('dashboard')} className="hover:underline">Cookie Settings</button>
          </div>
          <div className="text-center sm:text-right">
            © 2026 MediConnect Medical Systems. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Global CSS Style tag for fluid animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
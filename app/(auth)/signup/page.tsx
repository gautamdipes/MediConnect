"use client";

import React, { useState } from "react";

export default function SignUpPage() {
  // State management for form inputs and interactive UI elements
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    password: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API database registration request
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Account created successfully for ${formData.fullName}!`);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFBFD] font-sans text-[#091E42] antialiased">
      
      {/* 1. EXACT REPLICATED HEADER */}
      <header className="flex h-[80px] w-full items-center justify-between border-b border-[#F0F0F0] bg-white px-[60px] shadow-sm">
        <button className="text-[22px] font-bold tracking-tight text-[#091E42] transition hover:opacity-80">
          MediConnect
        </button>
        
        <nav className="flex items-center gap-[40px] text-[15px] font-medium text-[#5E6C84]">
          <button className="hover:text-[#0057D9] transition">Hospitals</button>
          <button className="hover:text-[#0057D9] transition">Doctors</button>
          <button className="hover:text-[#0057D9] transition">About Us</button>
        </nav>

        <div className="flex items-center gap-[24px]">
          <button className="text-[15px] font-medium text-[#344563] hover:text-[#0057D9] transition">
            Log In
          </button>
          <button className="rounded-[6px] bg-[#0057D9] px-[24px] py-[10px] text-[15px] font-semibold text-white transition hover:bg-[#0048B5]">
            SignUp
          </button>
        </div>
      </header>

      {/* 2. MAIN SPLIT CARD INTERFACE CONTAINER */}
      <main className="flex flex-1 items-center justify-center py-[60px] px-4 animate-fadeIn">
        <div className="flex w-full max-w-[1160px] h-[720px] bg-white rounded-[16px] shadow-[0_4px_30px_rgba(9,30,66,0.04)] overflow-hidden border border-[#F0F0F0]">
          
          {/* Left Side: Solid Enterprise Healthcare Deep Blue Branding Panel */}
          <div className="relative hidden md:flex w-[48%] flex-col justify-between bg-gradient-to-b from-[#005EDD] to-[#003DA1] p-[60px] text-white">
            <div className="flex items-center gap-[8px] text-[12px] font-bold tracking-widest uppercase opacity-80">
              <span className="text-sm">🛡️</span> Enterprise Healthcare
            </div>

            <div className="mb-[40px] space-y-4">
              <h1 className="text-[42px] font-bold leading-[1.15] tracking-tight">
                The future of <br />clinical efficiency
              </h1>
              <p className="text-[15px] leading-[1.6] text-blue-100 max-w-[380px] font-light opacity-90">
                Streamline patient care and administrative workflows with our secure, HIPAA-compliant clinical operating system.
              </p>
            </div>
            
            <div className="text-[11px] font-mono text-blue-200/50 tracking-wider">
              SOC2 TYPE II COMPLIANT CERTIFICATION SECURED
            </div>
          </div>

          {/* Right Side: Interactive Dynamic Signup Form Input Module */}
          <div className="flex flex-1 flex-col justify-center px-[40px] lg:px-[70px] py-[40px] bg-white">
            <h2 className="text-[32px] font-bold tracking-tight text-[#091E42]">
              Create account
            </h2>
            <p className="mt-[6px] text-[14px] text-[#5E6C84]">
              Enter your credentials to continue
            </p>

            <form className="mt-[30px] flex flex-col" onSubmit={handleSubmit}>
              
              {/* Full Name Input field */}
              <div className="mb-[16px]">
                <label className="mb-[8px] block text-[13px] font-semibold text-[#344563]">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Dr. Alexander Wright"
                  className="h-[48px] w-full rounded-[6px] border border-[#E2E8F0] bg-white px-[16px] text-[15px] text-[#091E42] placeholder-[#A5B1C2] outline-none transition focus:border-[#0057D9] focus:ring-1 focus:ring-[#0057D9]"
                />
              </div>

              {/* Work Email Input field */}
              <div className="mb-[16px]">
                <label className="mb-[8px] block text-[13px] font-semibold text-[#344563]">
                  Work Email
                </label>
                <input
                  type="email"
                  name="workEmail"
                  required
                  value={formData.workEmail}
                  onChange={handleInputChange}
                  placeholder="name@healthcare.org"
                  className="h-[48px] w-full rounded-[6px] border border-[#E2E8F0] bg-white px-[16px] text-[15px] text-[#091E42] placeholder-[#A5B1C2] outline-none transition focus:border-[#0057D9] focus:ring-1 focus:ring-[#0057D9]"
                />
              </div>

              {/* Password Input field with visibility toggler button */}
              <div className="mb-[20px]">
                <label className="mb-[8px] block text-[13px] font-semibold text-[#344563]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="h-[48px] w-full rounded-[6px] border border-[#E2E8F0] bg-white px-[16px] pr-[54px] text-[15px] text-[#091E42] placeholder-[#A5B1C2] outline-none transition focus:border-[#0057D9] focus:ring-1 focus:ring-[#0057D9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#5E6C84] hover:text-[#0057D9] transition uppercase tracking-wider"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions Checkbox wrapper link arrays */}
              <div className="mb-[24px] flex items-start gap-[10px]">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  id="agreeToTerms"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-[3px] h-[15px] w-[15px] rounded border-[#CBD5E1] accent-[#0057D9] cursor-pointer"
                />
                <label htmlFor="agreeToTerms" className="text-[13px] leading-[1.5] text-[#5E6C84] select-none cursor-pointer">
                  I agree to the <span className="text-[#0057D9] font-medium hover:underline">Terms of Service</span> and <span className="text-[#0057D9] font-medium hover:underline">Privacy Policy</span>.
                </label>
              </div>

              {/* Primary Action Button submit processing trigger */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-[50px] w-full items-center justify-center rounded-[6px] bg-[#0057D9] text-[15px] font-semibold text-white transition hover:bg-[#0048B5] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Provisioning Account Node...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="my-[20px] border-t border-[#F0F0F0]" />

              {/* Google OAuth Alternative Array Block */}
              <button
                type="button"
                className="flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[6px] border border-[#D9D9D9] bg-white text-[14px] font-medium text-[#344563] transition hover:bg-gray-50 active:bg-gray-100"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google G Logo Badge"
                  className="h-[18px] w-[18px]"
                />
                Sign up with Google
              </button>

              <p className="mt-[20px] text-center text-[13px] text-[#5E6C84]">
                Already have an account?{" "}
                <button type="button" className="font-semibold text-[#0057D9] hover:underline">
                  Log in
                </button>
              </p>
            </form>
          </div>

        </div>
      </main>

      {/* 3. LEGAL POLICY FOOTER ARRAY COMPLIANCE */}
      <footer className="flex flex-col sm:flex-row h-auto sm:h-[60px] items-center justify-between border-t border-[#E8E8E8] bg-[#F4F5F7] px-[60px] py-4 sm:py-0 text-[12px] text-[#6B778C] gap-4">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-[24px]">
          <span className="font-bold text-[#42526E] text-[14px]">MediConnect</span>
          <button className="hover:underline">Privacy Policy</button>
          <button className="hover:underline">Terms of Service</button>
          <button className="hover:underline">HIPAA Compliance</button>
          <button className="hover:underline">Cookie Settings</button>
        </div>
        <div className="text-center sm:text-right">
          © 2026 MediConnect Medical Systems. All rights reserved.
        </div>
      </footer>

      {/* Local Page Animation keyframe styles injection */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
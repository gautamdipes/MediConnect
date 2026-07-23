"use client";

import Link from "next/link";
import { FormEvent, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { confirmPasswordReset, requestPasswordReset, verifyPasswordResetCode } from "@/lib/api/auth";

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      if (step === "email") {
        await requestPasswordReset(email);
        setStep("code");
      } else if (step === "code") {
        if (code.length !== 6) throw new Error("Please enter all 6 digits");
        await verifyPasswordResetCode(email, code);
        setStep("password");
      } else {
        if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
        await confirmPasswordReset(email, code, newPassword);
        router.push("/login");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const title =
    step === "email"
      ? "Reset your password"
      : step === "code"
      ? "Enter verification code"
      : "Choose a new password";

  const description =
    step === "email"
      ? "Enter your account email and we will send a six-digit verification code."
      : step === "code"
      ? `We have sent a six-digit verification code to ${email}.`
      : "Your new password must contain at least eight characters.";

  const stepNumber = step === "email" ? 1 : step === "code" ? 2 : 3;

  const handleOtpBoxClick = () => {
    otpInputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-md select-none">
      {/* Back button */}
      <Link
        href="/login"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0057d9] transition-all hover:gap-3 hover:text-blue-700"
      >
        <ArrowLeft size={16} />
        Back to sign in
      </Link>

      {/* Stepper Progress */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
            stepNumber >= 1 ? "bg-[#0057d9] text-white" : "bg-gray-100 text-gray-400"
          }`}>
            1
          </div>
          <span className={`text-xs font-semibold ${stepNumber >= 1 ? "text-gray-900" : "text-gray-400"}`}>Email</span>
        </div>
        <div className={`h-[2px] flex-1 mx-2 transition-all duration-500 ${stepNumber >= 2 ? "bg-[#0057d9]" : "bg-gray-100"}`} />
        <div className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
            stepNumber >= 2 ? "bg-[#0057d9] text-white" : "bg-gray-100 text-gray-400"
          }`}>
            2
          </div>
          <span className={`text-xs font-semibold ${stepNumber >= 2 ? "text-gray-900" : "text-gray-400"}`}>Verify</span>
        </div>
        <div className={`h-[2px] flex-1 mx-2 transition-all duration-500 ${stepNumber >= 3 ? "bg-[#0057d9]" : "bg-gray-100"}`} />
        <div className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
            stepNumber >= 3 ? "bg-[#0057d9] text-white" : "bg-gray-100 text-gray-400"
          }`}>
            3
          </div>
          <span className={`text-xs font-semibold ${stepNumber >= 3 ? "text-gray-900" : "text-gray-400"}`}>Reset</span>
        </div>
      </div>

      {/* Visual Header */}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50/70 text-[#0057d9] shadow-sm relative group">
        <div className="absolute inset-0 rounded-2xl bg-[#0057d9]/5 scale-110 animate-pulse group-hover:scale-125 transition-all duration-300" />
        {step === "email" ? (
          <Mail size={24} className="relative z-10" />
        ) : step === "code" ? (
          <KeyRound size={24} className="relative z-10" />
        ) : (
          <CheckCircle2 size={24} className="relative z-10" />
        )}
      </div>

      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">
        {title}
      </h2>
      <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">
        {description}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50/80 p-3.5 text-xs font-semibold text-red-600 animate-shake">
            {error}
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === "email" && (
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              required
              autoFocus
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none transition-all duration-200 focus:border-[#0057d9] focus:ring-4 focus:ring-blue-500/5 bg-gray-50/30 focus:bg-white"
            />
          </div>
        )}

        {/* Step 2: Code Form (Premium OTP Boxes) */}
        {step === "code" && (
          <div className="space-y-4">
            {/* Hidden Input for actual value collection */}
            <input
              ref={otpInputRef}
              required
              autoFocus
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="sr-only"
            />

            {/* Premium OTP visual boxes */}
            <div className="flex justify-between gap-2.5" onClick={handleOtpBoxClick}>
              {Array.from({ length: 6 }).map((_, idx) => {
                const char = code[idx] || "";
                const isCurrent = idx === code.length;
                const isFilled = idx < code.length;
                return (
                  <div
                    key={idx}
                    className={`flex h-14 w-full items-center justify-center rounded-xl border-2 text-xl font-bold transition-all duration-150 cursor-pointer ${
                      isCurrent
                        ? "border-[#0057d9] bg-white ring-4 ring-blue-500/5 shadow-sm scale-105"
                        : isFilled
                        ? "border-gray-300 bg-white"
                        : "border-gray-200 bg-gray-50/40"
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-gray-400 font-medium">Didn't receive the code?</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setCode("");
                  requestPasswordReset(email)
                    .then(() => setError(""))
                    .catch((err) => setError(err.message));
                }}
                className="text-xs font-bold text-[#0057d9] hover:text-blue-700 hover:underline disabled:opacity-50"
              >
                Send a new code
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Password Reset Form */}
        {step === "password" && (
          <div className="space-y-4">
            {/* New Password input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                autoFocus
                type={showNewPassword ? "text" : "password"}
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password"
                className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-11 text-sm font-medium outline-none transition-all duration-200 focus:border-[#0057d9] focus:ring-4 focus:ring-blue-500/5 bg-gray-50/30 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0057d9]"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-11 text-sm font-medium outline-none transition-all duration-200 focus:border-[#0057d9] focus:ring-4 focus:ring-blue-500/5 bg-gray-50/30 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0057d9]"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Dynamic Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div className="px-1 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-medium transition-colors">
                  <div className={`h-1.5 w-1.5 rounded-full ${newPassword.length >= 8 ? "bg-green-500" : "bg-red-500"}`} />
                  <span className={newPassword.length >= 8 ? "text-green-600" : "text-red-500"}>
                    At least 8 characters long ({newPassword.length}/8)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        <button
          disabled={pending}
          className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0057d9] to-[#003da1] hover:from-[#0048b5] hover:to-[#002b7a] text-sm font-bold text-white transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
        >
          {pending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Please wait…</span>
            </>
          ) : (
            <span>
              {step === "email"
                ? "Send verification code"
                : step === "code"
                ? "Verify code"
                : "Reset password"}
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

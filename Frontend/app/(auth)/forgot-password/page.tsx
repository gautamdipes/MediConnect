"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { confirmPasswordReset, requestPasswordReset, verifyPasswordResetCode } from "@/lib/api/auth";

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      if (step === "email") {
        await requestPasswordReset(email);
        setStep("code");
      } else if (step === "code") {
        await verifyPasswordResetCode(email, code);
        setStep("password");
      } else {
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

  const title = step === "email" ? "Reset your password" : step === "code" ? "Enter verification code" : "Choose a new password";
  const description = step === "email" ? "Enter your account email and we will send a six-digit verification code." : step === "code" ? `Enter the code sent to ${email}.` : "Your new password must contain at least eight characters.";

  return <div className="w-full max-w-md"><Link href="/login" className="mb-7 inline-flex items-center gap-1.5 text-xs font-bold text-[#0057d9] hover:underline"><ArrowLeft size={14} />Back to sign in</Link><div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0057d9]">{step === "email" ? <Mail size={20} /> : step === "code" ? <KeyRound size={20} /> : <CheckCircle2 size={20} />}</div><h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h2><p className="mt-2 text-sm font-medium leading-6 text-gray-400">{description}</p><form onSubmit={submit} className="mt-8 space-y-4">{error && <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}{step === "email" && <input required autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm font-medium outline-none focus:border-[#0057d9]" />}{step === "code" && <><input required autoFocus inputMode="numeric" maxLength={6} pattern="[0-9]{6}" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" className="h-12 w-full rounded-xl border border-gray-200 px-4 text-center font-mono text-xl font-bold tracking-[0.45em] outline-none focus:border-[#0057d9]" /><button type="button" disabled={pending} onClick={() => requestPasswordReset(email).catch((err) => setError(err.message))} className="text-xs font-bold text-[#0057d9] hover:underline">Send a new code</button></>}{step === "password" && <><input required autoFocus type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm font-medium outline-none focus:border-[#0057d9]" /><input required type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm font-medium outline-none focus:border-[#0057d9]" /></>}<button disabled={pending} className="h-12 w-full rounded-xl bg-[#0057d9] text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50">{pending ? "Please wait…" : step === "email" ? "Send verification code" : step === "code" ? "Verify code" : "Reset password"}</button></form></div>;
}

"use client";

import Link from "next/link";
import { Eye, LogIn } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/dashboard/context/AuthContext";

import { loginSchema, LoginFormData } from "./schema";
import { login as loginApi, loginWithGoogle, hospitalLogin } from "@/lib/api/auth";
import GoogleSignInButton from "./GoogleSignInButton";

type PortalMode = "user" | "admin" | "hospital";

export default function LoginForm({ staffOnly = false }: { staffOnly?: boolean }) {
  const router = useRouter();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [portalMode, setPortalMode] = useState<PortalMode>(staffOnly ? "admin" : "user");
  const [showPassword, setShowPassword] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const portalCopy: Record<PortalMode, { title: string; description: string; emailLabel: string; emailPlaceholder: string }> = {
    user: { title: "User login", description: "Access your appointments, health records, and care team.", emailLabel: "Email address", emailPlaceholder: "you@example.com" },
    admin: { title: "Admin login", description: "Access the MediConnect administration portal.", emailLabel: "Admin email", emailPlaceholder: "admin@mediconnect.com" },
    hospital: { title: "Hospital login", description: "Access your hospital workspace and operations.", emailLabel: "Hospital admin email", emailPlaceholder: "admin@hospital.org" },
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const completeLogin = async (result: { token: string; user: any }) => {
    login(result.token, result.user);

    if (portalMode === "admin") {
      const adminCheck = await fetch(
        `http://localhost:5000/api/v1/admin/users?page=1&limit=1`,
        {
          headers: { Authorization: `Bearer ${result.token}` },
        }
      );
      if (!adminCheck.ok) {
        throw new Error("You do not have admin access!");
      }
      localStorage.setItem("adminToken", result.token);
      localStorage.removeItem("hospitalToken");
      router.push("/admin/dashboard");
      return;
    }

    if (portalMode === "hospital") {
      localStorage.setItem("hospitalToken", result.token);
      localStorage.removeItem("adminToken");
      router.push("/hospital/dashboard");
      return;
    }

    localStorage.removeItem("adminToken");
    localStorage.removeItem("hospitalToken");
    router.push("/dashboard");
  };

  const onSubmit = (data: LoginFormData) => {
    setError("");

    startTransition(async () => {
      try {
        const result =
          portalMode === "hospital"
            ? await hospitalLogin(data)
            : await loginApi(data);

        if (result && result.token) {
          await completeLogin(result);
        } else {
          setError("Login failed");
        }
      } catch (err: any) {
        setError(err?.message || "Login failed");
      }
    });
  };

  const handleGoogleCredential = async (idToken: string) => {
    if (portalMode === "hospital") {
      setError("Hospital portal uses email and password only for now.");
      return;
    }

    setError("");
    setGooglePending(true);
    try {
      const result = await loginWithGoogle(idToken);
      if (!result?.token) {
        throw new Error("Google sign-in failed");
      }
      await completeLogin(result);
    } finally {
      setGooglePending(false);
    }
  };

  const submitLabel =
    portalMode === "admin"
      ? "Sign In as Admin"
      : portalMode === "hospital"
        ? "Sign In as Hospital"
        : "Sign In";

  const changePortal = (mode: PortalMode) => {
    setPortalMode(mode);
    setError("");
    setShowPassword(false);
    reset();
  };

  const toggleClass = (mode: PortalMode) => {
    const active = portalMode === mode;
    if (mode === "admin" && active) {
      return "bg-[#0057d9] text-white shadow-sm";
    }
    if (mode === "hospital" && active) {
      return "bg-[#0057d9] text-white shadow-sm";
    }
    if (mode === "user" && active) {
      return "bg-white text-gray-900 shadow-sm";
    }
    return "text-gray-500 hover:text-gray-900";
  };

  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto py-6">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {portalCopy[portalMode].title}
        </h2>
        <p className="text-gray-400 text-sm font-medium mt-1">
          {portalCopy[portalMode].description}
        </p>
      </div>

      {staffOnly && <div className="mt-6 flex w-full rounded-xl border border-gray-200/40 bg-gray-100 p-1">
        <button type="button" onClick={() => changePortal("admin")} className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${toggleClass("admin")}`}>Admin</button>
        <button type="button" onClick={() => changePortal("hospital")} className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${toggleClass("hospital")}`}>Hospital</button>
      </div>}

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 block">
            {portalCopy[portalMode].emailLabel}
          </label>
          <input
            type="email"
            placeholder={portalCopy[portalMode].emailPlaceholder}
            {...register("email")}
            className={`w-full h-11 px-4 border text-sm rounded-xl outline-none transition-all placeholder:text-gray-300 font-medium ${
              errors.email ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-[11px] font-bold text-red-500 mt-0.5">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={`w-full h-11 pl-4 pr-10 border text-sm rounded-xl outline-none transition-all placeholder:text-gray-300 font-medium ${
                errors.password ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Eye size={16} />
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] font-bold text-red-500 mt-0.5">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs font-bold pt-1">
          <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#0057d9]" />
            <span>Remember me on this device</span>
          </label>
          <Link href={`/forgot-password?portal=${portalMode}`} className="text-[#0057d9] hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="w-full h-12 bg-[#0057d9] hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>{submitLabel}</span>
              <LogIn size={15} strokeWidth={2.5} />
            </>
          )}
        </button>

        {portalMode !== "hospital" && (
          <>
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <span className="relative bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-gray-300">
                or
              </span>
            </div>

            <GoogleSignInButton
              label={
                portalMode === "admin"
                  ? "Sign in with Google as Admin"
                  : "Sign in with Google"
              }
              disabled={isSubmitting || isPending || googlePending}
              onCredential={handleGoogleCredential}
              onError={setError}
            />
          </>
        )}

        {portalMode === "user" && (
          <p className="text-center text-xs font-medium text-gray-400 pt-1">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-[#0057d9] hover:underline">
              Request Access
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}

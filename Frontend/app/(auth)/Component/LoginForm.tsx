"use client";

import Link from "next/link";
import { Eye, LogIn } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/dashboard/context/AuthContext";

import { loginSchema, LoginFormData } from "./schema"; 
import { handleLoginUser } from "@/lib/actions/auth-action";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setError("");

    startTransition(async () => {
      try {
        const result = await handleLoginUser(data);

        if (result.success && result.data) {
          login(result.data.token, result.data.user);
          if (isAdmin) {
            const adminCheck = await fetch("http://localhost:5000/api/v1/admin/users?page=1&limit=1", {
              headers: { Authorization: `Bearer ${result.data.token}` },
            });
            if (!adminCheck.ok) {
              setError("You do not have admin access!");
              return;
            }
            localStorage.setItem("adminToken", result.data.token);
            router.push("/admin/dashboard");
          } else {
            router.push("/dashboard");
          }
        } else {
          setError(result.message || "Login failed");
        }
      } catch (err: any) {
        setError(err?.message || "Login failed");
      }
    });
  };

  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto py-6">
      
      {/* Header Titles */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Login Portal
        </h2>
        <p className="text-gray-400 text-sm font-medium mt-1">
          Enter your credentials to continue
        </p>
      </div>

      {/* Segmented User / Admin Toggle Row */}
      <div className="mt-6 flex bg-gray-100 p-1 rounded-xl border border-gray-200/40 w-full">
        <button
          type="button"
          onClick={() => setIsAdmin(false)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            !isAdmin 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          User Portal
        </button>
        <button
          type="button"
          onClick={() => setIsAdmin(true)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            isAdmin 
              ? "bg-[#0057d9] text-white shadow-sm" 
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Admin Control
        </button>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Error Notification Alert */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Work Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 block">
            Work Email
          </label>
          <input
            type="email"
            placeholder="name@healthcare.org"
            {...register("email")}
            className={`w-full h-11 px-4 border text-sm rounded-xl outline-none transition-all placeholder:text-gray-300 font-medium ${
              errors.email ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-[11px] font-bold text-red-500 mt-0.5">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
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

        {/* Utility Functions */}
        <div className="flex items-center justify-between text-xs font-bold pt-1">
          <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#0057d9]" />
            <span>Remember me on this device</span>
          </label>
          <Link href="#" className="text-[#0057d9] hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Action Button Gateway */}
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="w-full h-12 bg-[#0057d9] hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>{isAdmin ? "Sign In as Admin" : "Sign In"}</span>
              <LogIn size={15} strokeWidth={2.5} />
            </>
          )}
        </button>

        {/* Separator Decorator */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
          <span className="relative bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-gray-300">or</span>
        </div>

        {/* Google Authentication Provider alternative */}
        <button
          type="button"
          className="w-full h-11 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3c.9-2.73 3.46-4.46 6.64-4.46z"/>
            <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.6-.2-2.35H12v4.46h6.46c-.28 1.47-1.1 2.72-2.35 3.56l3.66 2.84c2.14-1.98 3.38-4.9 3.38-8.51z"/>
            <path fill="#FBBC05" d="M5.36 14.5c-.23-.68-.36-1.41-.36-2.17s.13-1.49.36-2.17l-3.86-3C.68 8.71 0 10.28 0 12s.68 3.29 1.5 4.84l3.86-2.84z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.18 0-5.74-1.73-6.64-4.46l-3.86 3C3.4 20.35 7.35 23 12 23z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* Alternative Route Link */}
        <p className="text-center text-xs font-medium text-gray-400 pt-1">
          Don't have an account?{" "}
          <Link href="/signup" className="font-bold text-[#0057d9] hover:underline">
            Request Access
          </Link>
        </p>
      </form>
    </div>
  );
}
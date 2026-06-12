"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { loginSchema, LoginFormData } from "./schema"; 
import { handleLoginUser } from "@/lib/actions/auth-action";

export default function LoginForm() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

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

        if (result.success) {
          router.push("/dashboard");
        } else {
          setError(result.message || "Login failed");
        }
      } catch (err: any) {
        setError(err?.message || "Login failed");
      }
    });
  };

  return (
    <div className="flex h-full flex-col justify-center px-14">
      <h2 className="text-[46px] font-bold text-[#1a1a1a]">
        Login Portal
      </h2>

      <p className="mt-2 text-[16px] text-gray-500">
        Enter your credentials to continue
      </p>

      <form
        className="mt-12 flex flex-col gap-7"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* ERROR MESSAGE */}
        {error && (
          <div className="rounded-md bg-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <div>
          <label className="mb-3 block text-sm font-semibold">
            Work Email
          </label>

          <input
            type="email"
            placeholder="name@healthcare.org"
            {...register("email")}
            className="h-[64px] w-full rounded-md border border-gray-300 px-5 text-lg"
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <label className="mb-3 block text-sm font-semibold">
            Password
          </label>

          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="h-[64px] w-full rounded-md border border-gray-300 px-5 text-lg"
            />

            <Eye
              size={18}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="h-[66px] rounded-md bg-[#0057d9] text-lg font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>

        {/* LINK */}
        <p className="text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[#0057d9]">
            Request Access
          </Link>
        </p>
      </form>
    </div>
  );
}
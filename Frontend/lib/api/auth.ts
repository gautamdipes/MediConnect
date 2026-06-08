import type { LoginFormData, RegisterFormData } from "@/app/(auth)/Component/schema";

type AuthResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

async function requestAuth<T>(path: string, body: unknown): Promise<AuthResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      message:
        typeof data?.message === "string"
          ? data.message
          : "Authentication request failed",
    };
  }

  return {
    success: true,
    message: typeof data?.message === "string" ? data.message : "Success",
    data: data?.data ?? data,
  };
}

export function register(data: RegisterFormData) {
  return requestAuth("/auth/register", data);
}

export function login(data: LoginFormData) {
  return requestAuth<{ token?: string; user?: unknown }>("/auth/login", data);
}

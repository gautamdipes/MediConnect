"use client";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

export const showToast = (message: string, type: ToastType = "info") => {
  if (typeof window !== "undefined" && message) {
    window.dispatchEvent(new CustomEvent("mediconnect:toast", { detail: { message, type } }));
  }
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const addToast = (event: Event) => {
      const { message, type } = (event as CustomEvent<{ message: string; type: ToastType }>).detail;
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, type }].slice(-4));
      window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500);
    };
    window.addEventListener("mediconnect:toast", addToast);

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const request = args[0];
      const options = args[1];
      const method = (options?.method || (request instanceof Request ? request.method : "GET")).toUpperCase();
      if (method !== "GET") {
        let payload: { message?: string } | null = null;
        try { payload = await response.clone().json(); } catch { /* A response body is optional. */ }
        const url = typeof request === "string" ? request : request instanceof Request ? request.url : request.toString();
        const fallback = url.toLowerCase().includes("login") ? "Logged in successfully." : url.toLowerCase().includes("register") ? "Registration completed successfully." : method === "DELETE" ? "Deleted successfully." : method === "POST" ? "Created successfully." : "Changes saved successfully.";
        showToast(payload?.message || fallback, response.ok ? "success" : "error");
      }
      return response;
    };

    return () => {
      window.removeEventListener("mediconnect:toast", addToast);
      window.fetch = originalFetch;
    };
  }, []);

  return <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3" aria-live="polite">
    {toasts.map((toast) => {
      const Icon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? CircleAlert : Info;
      const tone = toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : toast.type === "error" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-blue-200 bg-blue-50 text-blue-900";
      return <div key={toast.id} role="status" className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg ${tone}`}>
        <Icon size={19} className="mt-0.5 shrink-0" />
        <p className="flex-1 text-sm font-semibold">{toast.message}</p>
        <button type="button" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Dismiss notification" className="rounded p-0.5 opacity-60 hover:opacity-100"><X size={16} /></button>
      </div>;
    })}
  </div>;
}

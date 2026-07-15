"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, X, Send, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

type Role = "assistant" | "user";

interface Message {
  id: string;
  role: Role;
  content: string;
  time: string;
  actions?: { label: string; href: string }[];
}

const QUICK = [
  { label: "System overview", prompt: "Show system overview stats" },
  { label: "Doctors", prompt: "List active doctors" },
  { label: "Appointments", prompt: "Show recent appointments" },
  { label: "Patients", prompt: "How many patients do we have?" },
];

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function AdminAIChatWidget({
  adminName,
  open,
  onOpenChange,
}: {
  adminName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(isOpen) : value;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const firstName = adminName?.split(" ")[0] || "Admin";

  useEffect(() => {
    if (!isOpen) return;
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi ${firstName}! I'm your MediConnect Admin AI. Ask about patients, doctors, hospitals, appointments, or system stats.`,
          time: formatTime(),
        },
      ]);
    }
  }, [isOpen, firstName, messages.length]);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      time: formatTime(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const history = next
        .filter((m) => m.id !== "welcome")
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 60000);

      const res = await fetch("http://localhost:5000/api/v1/admin/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed, history }),
        signal: controller.signal,
      });
      window.clearTimeout(timer);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Request failed (${res.status})`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: String(data.reply || "Sorry, I couldn't generate a response."),
          time: formatTime(),
          actions: Array.isArray(data.actions) ? data.actions.slice(0, 3) : [],
        },
      ]);
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      const msg =
        err.name === "AbortError" || /aborted|timeout/i.test(err.message || "")
          ? "The AI is taking too long. Please try again."
          : err.message || "Failed to reach the AI assistant";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry — I couldn't process that right now. Please try again in a moment.",
          time: formatTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all hover:scale-105 ${
          isOpen
            ? "bg-gray-900 text-white"
            : "bg-[#0052cc] text-white shadow-blue-600/30"
        }`}
        title="Admin AI Assistant"
        aria-label="Open Admin AI Assistant"
      >
        {isOpen ? <X size={22} /> : <Bot size={24} strokeWidth={2.2} />}
        {!isOpen && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-[9px] font-black text-teal-950">
            AI
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] flex h-[520px] w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-[#0052cc] to-blue-600 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-black leading-tight">Admin AI Assistant</p>
              <p className="text-[10px] font-medium text-blue-100">Live · Gemini</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

          {error && (
            <div className="mx-3 mt-2 flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-600">
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "rounded-br-md bg-[#0052cc] text-white"
                      : "rounded-bl-md border border-gray-100 bg-gray-50 text-gray-700"
                  }`}
                >
                  <p>{m.content}</p>
                  {!!m.actions?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.actions.map((a) => (
                        <Link
                          key={a.href + a.label}
                          href={a.href}
                          className="inline-flex items-center gap-1 rounded-md bg-[#0052cc] px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-700"
                        >
                          {a.label}
                          <ArrowRight size={10} />
                        </Link>
                      ))}
                    </div>
                  )}
                  <p
                    className={`mt-1 text-[9px] font-semibold ${
                      m.role === "user" ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 px-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-gray-100 px-3 py-2">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => void send(q.prompt)}
                  className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0052cc]"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the network..."
                className="h-10 flex-1 rounded-full border border-gray-200 bg-gray-50 px-3 text-[12px] outline-none focus:border-blue-400 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0052cc] text-white hover:bg-blue-700 disabled:opacity-40"
              >
                <Send size={15} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

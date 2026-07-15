"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, X, Send, ArrowRight, Sparkles } from "lucide-react";

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

/** Frontend-only mock replies — replace with API when backend is connected */
function mockAdminReply(message: string): { content: string; actions?: Message["actions"] } {
  const text = message.toLowerCase();

  if (/\b(stats?|overview|dashboard|summary|how many|total)\b/i.test(text) || /patients do we have/i.test(text)) {
    return {
      content:
        "Here's a quick admin overview snapshot:\n\n• Patients — manage under Patients\n• Doctors — manage under Doctors\n• Hospitals — manage under Hospitals\n• Appointments — track under Appointments\n\nOpen Overview for live counts. (Live AI data will connect when the backend is enabled.)",
      actions: [
        { label: "Overview", href: "/admin/dashboard" },
        { label: "Patients", href: "/admin/dashboard/patients" },
      ],
    };
  }

  if (/\bdoctor/i.test(text)) {
    return {
      content:
        "I can help you with doctors once the backend is connected.\n\nFor now, open the Doctors page to view, add, or edit staff.\n\nTip: filter by specialty (cardiology, pediatrics, etc.) from that page.",
      actions: [{ label: "Open Doctors", href: "/admin/dashboard/staff" }],
    };
  }

  if (/\bhospital|clinic|facilit/i.test(text)) {
    return {
      content:
        "Hospital and facility management lives in the Hospitals page.\n\nYou can verify facilities, review departments, and check status there.",
      actions: [{ label: "Open Hospitals", href: "/admin/dashboard/facilities" }],
    };
  }

  if (/\bappointment/i.test(text)) {
    return {
      content:
        "Use Appointments to review bookings, statuses, and schedules across the network.\n\nWhen AI backend is connected, I'll summarize recent bookings right here.",
      actions: [{ label: "Open Appointments", href: "/admin/dashboard/appointments" }],
    };
  }

  if (/\bpatient|user/i.test(text)) {
    return {
      content:
        "Patient accounts and profiles are managed under Patients.\n\nYou can search, review status, and update records from that page.",
      actions: [{ label: "Open Patients", href: "/admin/dashboard/patients" }],
    };
  }

  return {
    content:
      "I'm your Admin AI Assistant (frontend preview).\n\nAsk me about:\n• System overview / stats\n• Doctors\n• Hospitals\n• Appointments\n• Patients\n\nI'll open the right admin page for you. Full live answers come after backend connection.",
    actions: [{ label: "Overview", href: "/admin/dashboard" }],
  };
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

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        time: formatTime(),
      },
    ]);
    setInput("");
    setLoading(true);

    window.setTimeout(() => {
      const reply = mockAdminReply(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply.content,
          time: formatTime(),
          actions: reply.actions,
        },
      ]);
      setLoading(false);
    }, 450);
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
              <p className="text-[10px] font-medium text-blue-100">Frontend preview</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

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
                  onClick={() => send(q.prompt)}
                  className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0052cc]"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
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

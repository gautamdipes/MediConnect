"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Paperclip,
  Mic,
  Send,
  Download,
  FileText,
  Stethoscope,
  Building2,
  CalendarCheck,
  Activity,
  MessageCircle,
  Pill,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/app/dashboard/context/AuthContext";
import { DashboardTopBar } from "../components/DashboardTopBar";

// ── Types ─────────────────────────────────────────────────────────────────────

type MessageRole = "assistant" | "user";

interface ChatAttachment {
  name: string;
  size: string;
  type: "pdf" | "image";
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  time: string;
  attachment?: ChatAttachment;
}

interface RecentChat {
  id: string;
  title: string;
  time: string;
  icon: "chat" | "pill";
}

// ── Mock seed data (frontend-only until backend is connected) ─────────────────

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! How can I assist you with your health questions, finding doctors or hospitals, or booking care today?",
    time: "09:12 AM",
  },
  {
    id: "2",
    role: "user",
    content: "Can you check the latest lab reports for patient Sarah Miller?",
    time: "09:15 AM",
  },
  {
    id: "3",
    role: "assistant",
    content: "I've found the most recent Blood Panel from Dec 12. Would you like me to highlight any abnormal values?",
    time: "09:15 AM",
    attachment: {
      name: "Sarah_Miller_Lab_Dec23.pdf",
      size: "1.2 MB",
      type: "pdf",
    },
  },
];

const RECENT_CHATS: RecentChat[] = [
  { id: "1", title: "Migraine symptoms...", time: "Yesterday", icon: "chat" },
  { id: "2", title: "Vitamin D dosage qu...", time: "2 days ago", icon: "pill" },
  { id: "3", title: "Nearest cardiology clinic", time: "3 days ago", icon: "chat" },
];

const QUICK_ACTIONS = [
  { label: "Check Symptoms", icon: Activity, prompt: "I'd like to check my symptoms." },
  { label: "Find Doctor", icon: Stethoscope, prompt: "Help me find a doctor near me." },
  { label: "Find Hospital", icon: Building2, prompt: "Show me nearby hospitals." },
  { label: "Book Appointment", icon: CalendarCheck, prompt: "I want to book an appointment." },
];

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function mockAssistantReply(userText: string): ChatMessage {
  const lower = userText.toLowerCase();
  let content =
    "I'm here to help with general health guidance, finding care, and understanding your records. How else can I assist you?";

  if (lower.includes("symptom")) {
    content =
      "Tell me what symptoms you're experiencing — when they started, how severe they are, and any other details. I'll help you understand possible next steps. This is not a diagnosis.";
  } else if (lower.includes("doctor")) {
    content =
      "I can help you find doctors by specialty or location. Which type of doctor are you looking for, and what city or area should I search?";
  } else if (lower.includes("hospital")) {
    content =
      "I can look up hospitals in your area. Share your city or zip code and whether you need emergency, specialty, or general care.";
  } else if (lower.includes("appointment") || lower.includes("book")) {
    content =
      "You can book an appointment from the Appointments page. Would you like me to guide you through choosing a doctor and time slot?";
  } else if (lower.includes("lab") || lower.includes("report")) {
    content =
      "I found a recent lab report in your records. Would you like a summary of key values or help understanding what they mean?";
  }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    time: formatTime(),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-white shadow-sm">
      <Bot size={18} strokeWidth={2.2} />
    </div>
  );
}

function UserAvatar({ src, name }: { src?: string; name?: string }) {
  const fallback = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-[11px] font-bold text-gray-600">
      {src ? (
        <img src={src} alt={name || "User"} className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
}

function AttachmentCard({ attachment }: { attachment: ChatAttachment }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
        <FileText size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-bold text-gray-800">{attachment.name}</p>
        <p className="text-[10px] font-medium text-gray-400">{attachment.size}</p>
      </div>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0052cc]"
        title="Download"
      >
        <Download size={16} />
      </button>
    </div>
  );
}

function ChatBubble({
  message,
  userAvatar,
  userName,
}: {
  message: ChatMessage;
  userAvatar?: string;
  userName?: string;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {isUser ? (
        <UserAvatar src={userAvatar} name={userName} />
      ) : (
        <BotAvatar />
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
            isUser
              ? "rounded-tr-md bg-[#0052cc] text-white"
              : "rounded-tl-md border border-gray-100 bg-[#f3f4f6] text-gray-700"
          }`}
        >
          <p>{message.content}</p>
          {message.attachment && <AttachmentCard attachment={message.attachment} />}
        </div>
        <span className="mt-1 px-1 text-[10px] font-semibold text-gray-400">{message.time}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AIChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const firstName = user?.fullName?.split(" ")[0] || "there";
  const profilePicSrc = user?.profileImage
    ? user.profileImage.startsWith("http")
      ? user.profileImage
      : `http://localhost:5000${user.profileImage}`
    : undefined;

  useEffect(() => {
    if (user?.fullName) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "1"
            ? {
                ...m,
                content: `Hello ${firstName}! How can I assist you with your health questions, finding doctors or hospitals, or booking care today?`,
              }
            : m
        )
      );
    }
  }, [user?.fullName, firstName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      time: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated assistant response — replace with API call later
    window.setTimeout(() => {
      setMessages((prev) => [...prev, mockAssistantReply(trimmed)]);
      setIsTyping(false);
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f4f6]">
      <DashboardTopBar placeholder="Search patient data, records, or help..." />

      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6 lg:flex-row lg:gap-5 lg:p-6">
        {/* ── Chat column ── */}
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Chat header */}
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0052cc]">
                  <Bot size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <h1 className="text-[15px] font-black text-gray-900">Mediconnect AI Health Assistant</h1>
                  <p className="mt-0.5 text-[12px] font-medium text-gray-400">
                    Ask health-related questions, find doctors or hospitals, and get general healthcare guidance.
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-5">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  userAvatar={profilePicSrc}
                  userName={user?.fullName}
                />
              ))}

              {isTyping && (
                <div className="flex gap-2.5">
                  <BotAvatar />
                  <div className="rounded-2xl rounded-tl-md border border-gray-100 bg-[#f3f4f6] px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick actions + input */}
            <div className="border-t border-gray-100 bg-white px-4 py-4 sm:px-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      inputRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#0052cc]"
                  >
                    <Icon size={13} strokeWidth={2.2} />
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  title="Attach file"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question here..."
                  className="h-11 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 text-[13px] outline-none transition focus:border-blue-400 focus:bg-white"
                />

                <button
                  type="button"
                  className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 sm:flex"
                  title="Voice input"
                >
                  <Mic size={18} />
                </button>

                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-40"
                  title="Send"
                >
                  <Send size={17} className="ml-0.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Emergency banner */}
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle size={18} />
              </div>
              <p className="text-[12px] font-semibold leading-snug text-red-800">
                Need urgent medical help? Find the nearest emergency hospital immediately.
              </p>
            </div>
            <Link
              href="/dashboard/appointments"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-red-700"
            >
              Find Emergency Hospital
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[280px]">
          {/* Recent chats */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Recent Chats</h2>
              <button type="button" className="text-[11px] font-bold text-[#0052cc] hover:underline">
                See All
              </button>
            </div>
            <ul className="space-y-1">
              {RECENT_CHATS.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      {chat.icon === "pill" ? <Pill size={16} /> : <MessageCircle size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-gray-800">{chat.title}</p>
                      <p className="text-[10px] font-medium text-gray-400">{chat.time}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tip of the day */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 p-5 text-white shadow-sm">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -right-2 h-16 w-16 rounded-full bg-white/5" />
            <div className="relative">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-teal-100" />
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-100">
                  Tip of the Day
                </span>
              </div>
              <h3 className="text-[14px] font-black leading-snug">Stay Hydrated.</h3>
              <p className="mt-2 text-[11px] font-medium leading-relaxed text-teal-50/95">
                Drinking at least 8 glasses of water daily helps maintain cognitive function and supports metabolic health.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

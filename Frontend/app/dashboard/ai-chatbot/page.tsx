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
import { api } from "@/lib/proxy";
import { DashboardTopBar } from "../components/DashboardTopBar";

// ── Types ─────────────────────────────────────────────────────────────────────

type MessageRole = "assistant" | "user";

interface ChatAttachment {
  name: string;
  size?: string;
  url?: string;
  type: "pdf" | "image" | "file";
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  time: string;
  attachments?: ChatAttachment[];
  actions?: { label: string; href: string }[];
}

interface RecentChat {
  id: string;
  title: string;
  time: string;
  icon: "chat" | "pill";
}

const QUICK_ACTIONS = [
  { label: "Check Symptoms", icon: Activity, prompt: "I'd like to check my symptoms." },
  { label: "Find Doctor", icon: Stethoscope, prompt: "Help me find a doctor near me." },
  { label: "Find Hospital", icon: Building2, prompt: "Show me nearby hospitals." },
  { label: "Book Appointment", icon: CalendarCheck, prompt: "I want to book an appointment." },
];

const DEFAULT_RECENT: RecentChat[] = [
  { id: "1", title: "Migraine symptoms...", time: "Yesterday", icon: "chat" },
  { id: "2", title: "Vitamin D dosage qu...", time: "2 days ago", icon: "pill" },
  { id: "3", title: "Nearest cardiology clinic", time: "3 days ago", icon: "chat" },
];

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function resolveFileUrl(url?: string) {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

function truncateTitle(text: string, max = 28) {
  const clean = text.trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
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
  const href = resolveFileUrl(attachment.url);
  const isImage = attachment.type === "image";

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {isImage && href ? (
        <a href={href} target="_blank" rel="noreferrer" className="block">
          <img src={href} alt={attachment.name} className="max-h-48 w-full object-contain bg-gray-50" />
        </a>
      ) : null}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-bold text-gray-800">{attachment.name}</p>
          <p className="text-[10px] font-medium text-gray-400">
            {attachment.size || (attachment.type === "pdf" ? "PDF" : "File")}
          </p>
        </div>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0052cc]"
            title="Open / Download"
          >
            <Download size={16} />
          </a>
        )}
      </div>
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
      {isUser ? <UserAvatar src={userAvatar} name={userName} /> : <BotAvatar />}

      <div className={`flex max-w-[85%] flex-col sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "rounded-tr-md bg-[#0052cc] text-white"
              : "rounded-tl-md border border-gray-100 bg-[#f3f4f6] text-gray-700"
          }`}
        >
          <p>{message.content}</p>
          {message.attachments?.map((att, i) => (
            <AttachmentCard key={`${att.name}-${i}`} attachment={att} />
          ))}
          {!!message.actions?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.actions.map((action) => (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0052cc] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700"
                >
                  {action.label}
                  <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          )}
        </div>
        <span className="mt-1 px-1 text-[10px] font-semibold text-gray-400">{message.time}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AIChatbotPage() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] || "there";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [recentChats, setRecentChats] = useState<RecentChat[]>(DEFAULT_RECENT);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const profilePicSrc = user?.profileImage
    ? user.profileImage.startsWith("http")
      ? user.profileImage
      : `http://localhost:5000${user.profileImage}`
    : undefined;

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hello ${firstName}! How can I assist you with your health questions, finding doctors or hospitals, booking appointments, or viewing your medical records today?`,
        time: formatTime(),
      },
    ]);
  }, [firstName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      time: formatTime(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsTyping(true);

    setRecentChats((prev) => [
      {
        id: crypto.randomUUID(),
        title: truncateTitle(trimmed),
        time: "Just now",
        icon: /pill|vitamin|dose|medicine/i.test(trimmed) ? "pill" : "chat",
      },
      ...prev.slice(0, 4),
    ]);

    try {
      const history = nextMessages
        .filter((m) => m.id !== "welcome")
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await api.post(
        "/v1/users/chat",
        {
          message: trimmed,
          history,
        },
        { timeout: 60000 }
      );

      const reply = String(res.data?.reply || "Sorry, I couldn't generate a response.");
      const attachments = Array.isArray(res.data?.attachments) ? res.data.attachments : [];
      const actions = Array.isArray(res.data?.actions) ? res.data.actions : [];

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          time: formatTime(),
          attachments,
          actions,
        },
      ]);
    } catch (e: unknown) {
      const err = e as {
        code?: string;
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        err.code === "ECONNABORTED" || /timeout/i.test(err.message || "")
          ? "The AI is taking too long. Please try again."
          : err.response?.data?.message || err.message || "Failed to reach the AI assistant";
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
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f4f6]">
      <DashboardTopBar placeholder="Search patient data, records, or help..." />

      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6 lg:flex-row lg:gap-5 lg:p-6">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
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

            {error && (
              <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

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

            <div className="border-t border-gray-100 bg-white px-4 py-4 sm:px-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#0052cc]"
                  >
                    <Icon size={13} strokeWidth={2.2} />
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => void sendMessage("Show my medical records and any uploaded files.")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#0052cc]"
                >
                  <FileText size={13} strokeWidth={2.2} />
                  My Records
                </button>
                <button
                  type="button"
                  onClick={() => void sendMessage("Show my appointment bookings.")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#0052cc]"
                >
                  <CalendarCheck size={13} strokeWidth={2.2} />
                  My Appointments
                </button>
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

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[280px]">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Recent Chats</h2>
              <button type="button" className="text-[11px] font-bold text-[#0052cc] hover:underline">
                See All
              </button>
            </div>
            <ul className="space-y-1">
              {recentChats.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => void sendMessage(chat.title.replace(/\.\.\.$/, ""))}
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

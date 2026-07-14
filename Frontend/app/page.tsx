"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { api } from "@/lib/proxy";
import {
  Building2,
  CalendarCheck,
  MapPin,
  Search,
  Star,
  Stethoscope,
  UserPlus,
} from "lucide-react";

type LandingStats = {
  hospitals: number;
  verifiedHospitals: number;
  doctors: number;
  activeDoctors: number;
  appointments: number;
};

type LandingHospital = {
  _id: string;
  hospitalName: string;
  city: string;
  state: string;
  departments?: string[];
  doctorsCount?: number;
  rating?: number;
  emergency?: boolean;
  type?: string;
  image?: string;
};

type LandingDoctor = {
  _id: string;
  fullName: string;
  specialization: string;
  department: string;
  hospitalName?: string;
  experience?: number;
  rating?: number;
  profileImage?: string;
};

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
}

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function StatChip({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  const count = useCountUp(value, active);
  return (
    <div className="min-w-[120px]">
      <p className="font-[family-name:var(--font-display)] text-[36px] font-medium leading-none text-white sm:text-[42px]">
        {count}
        <span className="text-[#7eb6ff]">+</span>
      </p>
      <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">
        {label}
      </p>
    </div>
  );
}

function mediaUrl(path?: string) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function LandingPage() {
  const router = useRouter();
  const go = (path: string) => router.push(path);

  const [stats, setStats] = useState<LandingStats>({
    hospitals: 0,
    verifiedHospitals: 0,
    doctors: 0,
    activeDoctors: 0,
    appointments: 0,
  });
  const [hospitals, setHospitals] = useState<LandingHospital[]>([]);
  const [doctors, setDoctors] = useState<LandingDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  const statsView = useInView<HTMLDivElement>(0.35);
  const hospitalsView = useInView<HTMLElement>(0.12);
  const doctorsView = useInView<HTMLElement>(0.12);
  const howView = useInView<HTMLElement>(0.15);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/v1/public/landing");
        if (cancelled) return;
        setStats(res.data?.stats || stats);
        setHospitals(res.data?.hospitals || []);
        setDoctors(res.data?.doctors || []);
      } catch (err) {
        console.error("Landing fetch failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="landing relative min-h-screen overflow-x-hidden bg-white text-[#091E42]">
      {/* Page atmosphere: white ↔ dark blue mix */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(165deg,#ffffff_0%,#edf4ff_28%,#d6e6fb_52%,#0a1f45_78%,#071428_100%)]" />
        <div className="absolute -left-24 top-0 h-[520px] w-[520px] rounded-full bg-[#0057d9]/18 blur-[120px]" />
        <div className="absolute right-[-10%] top-[18%] h-[420px] w-[420px] rounded-full bg-[#003da1]/22 blur-[110px]" />
        <div className="absolute bottom-[8%] left-[20%] h-[360px] w-[360px] rounded-full bg-white/50 blur-[90px]" />
      </div>

      {/* Header — brand left, nav center, auth right */}
      <header className="sticky top-0 z-50 border-b border-[#0057d9]/10 bg-white/90 backdrop-blur-md">
        <div className="relative flex h-14 w-full items-center justify-between px-3 sm:px-4">
          <button
            type="button"
            onClick={() => go("/")}
            className="relative z-10 flex shrink-0 items-center gap-2 transition hover:opacity-85"
            aria-label="MediConnect home"
          >
            <BrandLogo size={28} />
            <span className="font-[family-name:var(--font-display)] text-[18px] font-semibold tracking-[-0.02em] text-[#091E42]">
              MediConnect
            </span>
          </button>

          <nav className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
            <a
              href="#network"
              className="pointer-events-auto text-[13px] font-semibold text-[#091E42] transition hover:text-[#0057d9]"
            >
              Network
            </a>
            <a
              href="#doctors"
              className="pointer-events-auto text-[13px] font-semibold text-[#091E42] transition hover:text-[#0057d9]"
            >
              Doctors
            </a>
            <a
              href="#how"
              className="pointer-events-auto text-[13px] font-semibold text-[#091E42] transition hover:text-[#0057d9]"
            >
              How it works
            </a>
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => go("/login")}
              className="px-2.5 py-1.5 text-[13px] font-semibold text-[#091E42] transition hover:text-[#0057d9]"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => go("/signup")}
              className="rounded-md bg-[#0057d9] px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#0048b5]"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero — white + dark blue blend */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 landing-kenburns opacity-40"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2400&q=80)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(115deg,#ffffff_0%,rgba(237,244,255,0.92)_24%,rgba(0,87,217,0.55)_58%,#071428_100%)]"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 right-0 w-[55%] bg-[radial-gradient(ellipse_at_right,_rgba(7,20,40,0.55)_0%,transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[calc(100dvh-56px)] max-w-[1200px] flex-col justify-center px-6 py-20 md:px-10">
          <p className="landing-fade text-[12px] font-bold uppercase tracking-[0.2em] text-[#0057d9]">
            MediConnect Clinical Network
          </p>
          <h1 className="landing-rise mt-5 max-w-[13ch] font-[family-name:var(--font-display)] text-[48px] font-medium leading-[1.04] tracking-[-0.03em] text-[#091E42] sm:text-[64px] lg:text-[76px]">
            Care that{" "}
            <span className="bg-[linear-gradient(90deg,#0057d9,#003da1)] bg-clip-text text-transparent">
              stays connected.
            </span>
          </h1>
          <p className="landing-fade-delay mt-6 max-w-[40ch] text-[17px] leading-[1.7] text-[#3d4f6a] sm:text-[18px]">
            Book trusted doctors, choose verified hospitals, and manage your visits in one secure place.
          </p>

          <div className="landing-fade-delay mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => go("/signup")}
              className="rounded-lg bg-[#0057d9] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(0,87,217,0.28)] transition hover:bg-[#0048b5]"
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => go("/login")}
              className="rounded-lg border border-[#0057d9]/25 bg-white/80 px-7 py-3.5 text-[15px] font-semibold text-[#091E42] backdrop-blur-sm transition hover:border-[#0057d9]/45 hover:bg-white"
            >
              Sign in to portal
            </button>
          </div>

          <div
            ref={statsView.ref}
            className="landing-fade-late mt-16 flex flex-wrap gap-8 border-t border-[#0057d9]/15 pt-8 sm:gap-12"
          >
            <div className="rounded-2xl border border-white/40 bg-[#071428]/88 px-6 py-5 backdrop-blur-sm sm:min-w-[140px]">
              <StatChip
                label="Hospitals"
                value={stats.hospitals}
                active={statsView.inView && !loading}
              />
            </div>
            <div className="rounded-2xl border border-white/40 bg-[#071428]/88 px-6 py-5 backdrop-blur-sm sm:min-w-[140px]">
              <StatChip
                label="Active doctors"
                value={stats.activeDoctors || stats.doctors}
                active={statsView.inView && !loading}
              />
            </div>
            <div className="rounded-2xl border border-white/40 bg-[#071428]/88 px-6 py-5 backdrop-blur-sm sm:min-w-[140px]">
              <StatChip
                label="Appointments"
                value={stats.appointments}
                active={statsView.inView && !loading}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Network */}
      <section
        id="network"
        ref={hospitalsView.ref}
        className="scroll-mt-24 relative overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f3f7fd_40%,#e8f0fb_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#0057d9]/10 blur-[100px]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 md:px-10">
          <div
            className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between transition-all duration-700 ${
              hospitalsView.inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#0057d9]">
                Network
              </p>
              <h2 className="mt-3 max-w-[16ch] font-[family-name:var(--font-display)] text-[36px] font-medium leading-[1.12] tracking-[-0.02em] text-[#091E42] sm:text-[44px]">
                Hospitals on MediConnect
              </h2>
              <p className="mt-4 max-w-[42ch] text-[15px] leading-[1.7] text-[#5E6C84]">
                Browse live facilities connected to your care network
                {stats.verifiedHospitals > 0
                  ? ` — ${stats.verifiedHospitals} verified locations.`
                  : "."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => go("/signup")}
              className="self-start rounded-lg border border-[#0057d9]/25 bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0057d9] transition hover:border-[#0057d9] hover:bg-[#edf4ff] md:self-auto"
            >
              View all after signup
            </button>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[280px] animate-pulse overflow-hidden rounded-2xl border border-[#d7e0ec] bg-white"
                />
              ))}

            {!loading && hospitals.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-[#0057d9]/25 bg-white/70 px-8 py-14 text-center">
                <Building2 className="mx-auto text-[#0057d9]/50" size={28} />
                <p className="mt-4 text-[15px] font-medium text-[#091E42]">
                  No hospitals listed yet
                </p>
                <p className="mt-1 text-[13px] text-[#5E6C84]">
                  Facilities will appear here once added by admin.
                </p>
              </div>
            )}

            {hospitals.map((h, index) => {
              const img = mediaUrl(h.image);
              return (
                <article
                  key={h._id}
                  className={`group overflow-hidden rounded-2xl border border-[#d7e0ec] bg-white transition duration-500 hover:-translate-y-1 hover:border-[#0057d9]/35 hover:shadow-[0_20px_40px_rgba(0,87,217,0.12)] ${
                    hospitalsView.inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: hospitalsView.inView ? `${index * 90}ms` : "0ms" }}
                >
                  <div className="relative h-[128px] overflow-hidden bg-[linear-gradient(135deg,#003da1_0%,#0057d9_55%,#3d8bfd_100%)]">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="text-white/35" size={42} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071428]/55 to-transparent" />
                    {h.emergency && (
                      <span className="absolute left-3 top-3 rounded-md bg-[#071428]/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                        Emergency
                      </span>
                    )}
                    {typeof h.rating === "number" && h.rating > 0 && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-[#091E42]">
                        <Star size={11} className="text-amber-500" fill="currentColor" />
                        {h.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-[17px] font-semibold leading-snug text-[#091E42]">
                      {h.hospitalName}
                    </h3>
                    <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[#5E6C84]">
                      <MapPin size={13} className="shrink-0 text-[#0057d9]" />
                      {h.city}
                      {h.state ? `, ${h.state}` : ""}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[#eef2f7] pt-4 text-[12px] font-semibold text-[#5E6C84]">
                      <span>{h.doctorsCount ?? 0} doctors</span>
                      <span className="text-[#0057d9]">{h.type || "Hospital"}</span>
                    </div>

                    {h.departments && h.departments.length > 0 && (
                      <p className="mt-3 line-clamp-1 text-[12px] text-[#8492a6]">
                        {h.departments.slice(0, 3).join(" · ")}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section
        id="doctors"
        ref={doctorsView.ref}
        className="scroll-mt-24 relative overflow-hidden bg-[linear-gradient(180deg,#071428_0%,#0a1f45_48%,#0d2a5c_100%)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0057d9]/60 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 md:px-10">
          <div
            className={`flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between transition-all duration-700 ${
              doctorsView.inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#7eb6ff]">
                Doctors
              </p>
              <h2 className="mt-3 max-w-[16ch] font-[family-name:var(--font-display)] text-[36px] font-medium leading-[1.12] tracking-[-0.02em] text-white sm:text-[44px]">
                Specialists available now
              </h2>
              <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.7] text-white/60">
                Active clinicians from your MediConnect directory — ready for booking once you create an account.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[13px] font-semibold text-white/55">
              <span className="inline-flex h-2 w-2 rounded-sm bg-emerald-400" />
              {stats.activeDoctors || doctors.length} active now
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[168px] animate-pulse rounded-2xl border border-white/10 bg-white/5"
                />
              ))}

            {!loading && doctors.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-8 py-14 text-center">
                <Stethoscope className="mx-auto text-white/40" size={28} />
                <p className="mt-4 text-[15px] font-medium text-white">
                  No active doctors yet
                </p>
                <p className="mt-1 text-[13px] text-white/50">
                  Doctors will appear here once added by admin.
                </p>
              </div>
            )}

            {doctors.map((d, index) => {
              const photo = mediaUrl(d.profileImage);
              return (
                <article
                  key={d._id}
                  className={`relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-sm transition duration-500 hover:border-[#0057d9]/50 hover:bg-white/[0.1] ${
                    doctorsView.inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: doctorsView.inView ? `${index * 90}ms` : "0ms" }}
                >
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[80px] bg-[#0057d9]/15" />
                  <div className="relative flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#0057d9]/25 text-[#7eb6ff]">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Stethoscope size={24} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-[16px] font-semibold text-white">
                          {d.fullName}
                        </h3>
                        {typeof d.rating === "number" && d.rating > 0 && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#ffd27a]">
                            <Star size={11} fill="currentColor" />
                            {d.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] font-medium text-[#7eb6ff]">
                        {d.specialization}
                      </p>
                      <p className="mt-3 truncate text-[12px] text-white/45">
                        {d.hospitalName || d.department}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[12px] text-white/50">
                        <span>
                          {d.experience ? `${d.experience} yrs experience` : d.department}
                        </span>
                        <button
                          type="button"
                          onClick={() => go("/signup")}
                          className="font-semibold text-[#7eb6ff] transition hover:text-white"
                        >
                          Book →
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => go("/signup")}
              className="rounded-lg bg-[#0057d9] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(0,87,217,0.35)] transition hover:bg-[#1768e0]"
            >
              Create account to book
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        ref={howView.ref}
        className="scroll-mt-24 relative overflow-hidden bg-white"
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent_0%,#edf4ff_100%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 md:px-10">
          <div
            className={`mx-auto max-w-[560px] text-center transition-all duration-700 ${
              howView.inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#0057d9]">
              How it works
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[36px] font-medium leading-[1.12] tracking-[-0.02em] text-[#091E42] sm:text-[44px]">
              Three steps to your next visit
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-[#5E6C84]">
              From signup to confirmed appointment — simple, clear, and fast.
            </p>
          </div>

          <ol className="relative mt-16 grid gap-6 sm:grid-cols-3">
            <div
              className="pointer-events-none absolute left-[16%] right-[16%] top-[52px] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(0,87,217,0.35),rgba(0,87,217,0.35),transparent)] sm:block"
              aria-hidden
            />
            {[
              {
                step: "01",
                title: "Sign up",
                body: "Create your patient account in a few minutes.",
                Icon: UserPlus,
              },
              {
                step: "02",
                title: "Choose care",
                body: "Pick a doctor and hospital from live listings.",
                Icon: Search,
              },
              {
                step: "03",
                title: "Confirm visit",
                body: "Select date and time — your appointment is booked.",
                Icon: CalendarCheck,
              },
            ].map((item, index) => (
              <li
                key={item.step}
                className={`relative rounded-2xl border border-[#d7e0ec] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] p-7 text-center transition duration-500 hover:border-[#0057d9]/35 hover:shadow-[0_16px_36px_rgba(0,87,217,0.1)] ${
                  howView.inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: howView.inView ? `${index * 120}ms` : "0ms" }}
              >
                <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#0057d9_0%,#003da1_100%)] text-white shadow-[0_10px_24px_rgba(0,87,217,0.28)]">
                  <item.Icon size={26} strokeWidth={1.8} />
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0057d9]/70">
                  Step {item.step}
                </p>
                <h3 className="mt-2 text-[20px] font-semibold text-[#091E42]">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.65] text-[#5E6C84]">{item.body}</p>
              </li>
            ))}
          </ol>

          <div
            className={`mt-16 overflow-hidden rounded-2xl bg-[linear-gradient(120deg,#071428_0%,#003da1_50%,#0057d9_100%)] transition duration-700 ${
              howView.inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: howView.inView ? "280ms" : "0ms" }}
          >
            <div className="flex flex-col items-start justify-between gap-6 px-8 py-10 sm:flex-row sm:items-center sm:px-12">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-[28px] font-medium tracking-[-0.02em] text-white sm:text-[32px]">
                  Ready for better care access?
                </h3>
                <p className="mt-2 max-w-[42ch] text-[15px] text-white/70">
                  Join MediConnect and book from the hospitals and doctors listed above.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => go("/signup")}
                  className="rounded-lg bg-white px-7 py-3.5 text-[15px] font-semibold text-[#0057d9] transition hover:bg-[#edf4ff]"
                >
                  Get started
                </button>
                <button
                  type="button"
                  onClick={() => go("/login")}
                  className="rounded-lg border border-white/30 bg-white/5 px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[linear-gradient(180deg,#0a1f45_0%,#071428_100%)] text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-3">
            <BrandLogo size={28} />
            <div>
              <p className="font-[family-name:var(--font-display)] text-[18px] font-semibold">
                MediConnect
              </p>
              <p className="text-[12px] text-white/45">Clinical care, simply connected.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/55">
            <button type="button" onClick={() => go("/login")} className="hover:text-white">
              Sign in
            </button>
            <button type="button" onClick={() => go("/signup")} className="hover:text-white">
              Get started
            </button>
            <button type="button" onClick={() => go("/admin/login")} className="hover:text-white">
              Admin
            </button>
          </div>

          <p className="text-[12px] text-white/35">
            © {new Date().getFullYear()} MediConnect. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        .landing-fade {
          animation: landingFade 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .landing-fade-delay {
          animation: landingFade 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
        }
        .landing-fade-late {
          animation: landingFade 1s cubic-bezier(0.16, 1, 0.3, 1) 0.28s both;
        }
        .landing-rise {
          animation: landingRise 1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .landing-kenburns {
          animation: landingKenBurns 18s ease-out both;
        }
        @keyframes landingFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes landingRise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes landingKenBurns {
          from {
            transform: scale(1.08);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

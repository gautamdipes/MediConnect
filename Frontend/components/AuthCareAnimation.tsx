"use client";

import { HeartPulse, Stethoscope, UserRound } from "lucide-react";

/** Health-themed animation for login/signup panel */
export function AuthCareAnimation() {
  return (
    <div className="auth-health-scene relative mx-auto w-full max-w-[300px] py-2">
      {/* Live heartbeat monitor strip */}
      <div className="mb-6 overflow-hidden rounded-xl border border-white/15 bg-black/20 px-3 py-3 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="auth-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Patient vitals
          </span>
          <span className="auth-bpm tabular-nums text-[#7eb6ff]">72 BPM</span>
        </div>
        <svg
          className="auth-ecg h-12 w-full"
          viewBox="0 0 400 48"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(126,182,255,0)" />
              <stop offset="20%" stopColor="rgba(126,182,255,0.9)" />
              <stop offset="80%" stopColor="rgba(126,182,255,0.9)" />
              <stop offset="100%" stopColor="rgba(126,182,255,0)" />
            </linearGradient>
          </defs>
          <path
            className="auth-ecg-path"
            d="M0,24 L40,24 L48,24 L52,8 L56,40 L60,24 L80,24 L88,24 L92,16 L96,32 L100,24 L120,24 L128,24 L132,4 L136,44 L140,24 L160,24 L168,24 L172,12 L176,36 L180,24 L200,24 L208,24 L212,8 L216,40 L220,24 L240,24 L248,24 L252,16 L256,32 L260,24 L280,24 L288,24 L292,4 L296,44 L300,24 L320,24 L328,24 L332,12 L336,36 L340,24 L360,24 L368,24 L372,8 L376,40 L380,24 L400,24"
            fill="none"
            stroke="url(#ecgGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Doctor + care illustration */}
      <div className="relative flex h-[160px] items-end justify-center">
        {/* Heartbeat pulse rings from stethoscope */}
        <span className="auth-pulse-ring auth-pulse-1 absolute bottom-[52px] left-1/2 h-24 w-24 -translate-x-1/2 rounded-full border border-[#7eb6ff]/30" />
        <span className="auth-pulse-ring auth-pulse-2 absolute bottom-[52px] left-1/2 h-24 w-24 -translate-x-1/2 rounded-full border border-[#7eb6ff]/20" />
        <span className="auth-pulse-ring auth-pulse-3 absolute bottom-[52px] left-1/2 h-24 w-24 -translate-x-1/2 rounded-full border border-white/10" />

        {/* Doctor figure */}
        <div className="auth-doctor relative z-10 flex flex-col items-center">
          <div className="relative">
            {/* Head */}
            <div className="mx-auto h-11 w-11 rounded-full border-2 border-white/25 bg-white/10 backdrop-blur-sm" />
            {/* Coat / shoulders */}
            <div className="relative -mt-1 flex justify-center">
              <div className="h-14 w-[72px] rounded-t-[36px] border-2 border-b-0 border-white/20 bg-white/10 backdrop-blur-sm" />
              {/* Stethoscope */}
              <div className="auth-stethoscope absolute -bottom-1 left-1/2 -translate-x-1/2 text-[#7eb6ff]">
                <Stethoscope size={28} strokeWidth={1.8} />
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-white/60">Your care team</p>
        </div>

        {/* Patient (small, right) */}
        <div className="auth-patient absolute bottom-0 right-2 flex flex-col items-center opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70">
            <UserRound size={18} />
          </div>
          <p className="mt-1.5 text-[9px] font-medium text-white/45">Patient</p>
        </div>

        {/* Heart icon (left) */}
        <div className="auth-heart-badge absolute bottom-4 left-2 flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0057d9]/40 text-[#ff6b8a] backdrop-blur-sm">
            <HeartPulse size={18} className="auth-heart-icon" strokeWidth={2} />
          </div>
          <p className="mt-1.5 text-[9px] font-medium text-white/45">Health</p>
        </div>
      </div>

      {/* Care tags */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {["Trusted doctors", "Secure records", "Easy booking"].map((tag, i) => (
          <span
            key={tag}
            className="auth-tag rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/55 backdrop-blur-sm"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            {tag}
          </span>
        ))}
      </div>

      <style jsx>{`
        .auth-live-dot {
          animation: authBlink 1.2s ease-in-out infinite;
        }
        .auth-bpm {
          animation: authBpm 2s ease-in-out infinite;
        }
        .auth-ecg-path {
          stroke-dasharray: 800;
          animation: authEcgScroll 4s linear infinite;
        }
        .auth-pulse-1 {
          animation: authHeartPulse 2s ease-out infinite;
        }
        .auth-pulse-2 {
          animation: authHeartPulse 2s ease-out 0.4s infinite;
        }
        .auth-pulse-3 {
          animation: authHeartPulse 2s ease-out 0.8s infinite;
        }
        .auth-doctor {
          animation: authDoctorFloat 3.5s ease-in-out infinite;
        }
        .auth-stethoscope {
          animation: authStethoscopeSway 2.5s ease-in-out infinite;
        }
        .auth-patient {
          animation: authPatientFloat 3.5s ease-in-out 0.5s infinite;
        }
        .auth-heart-icon {
          animation: authHeartBeat 1.2s ease-in-out infinite;
        }
        .auth-tag {
          animation: authTagFade 2.5s ease-in-out infinite;
        }
        @keyframes authBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.35;
          }
        }
        @keyframes authBpm {
          0%,
          100% {
            opacity: 0.7;
          }
          15%,
          25% {
            opacity: 1;
          }
        }
        @keyframes authEcgScroll {
          from {
            stroke-dashoffset: 800;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes authHeartPulse {
          0% {
            transform: translateX(-50%) scale(0.6);
            opacity: 0.6;
          }
          100% {
            transform: translateX(-50%) scale(1.4);
            opacity: 0;
          }
        }
        @keyframes authDoctorFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes authStethoscopeSway {
          0%,
          100% {
            transform: translateX(-50%) rotate(-3deg);
          }
          50% {
            transform: translateX(-50%) rotate(3deg);
          }
        }
        @keyframes authPatientFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        @keyframes authHeartBeat {
          0%,
          100% {
            transform: scale(1);
          }
          14% {
            transform: scale(1.15);
          }
          28% {
            transform: scale(1);
          }
          42% {
            transform: scale(1.1);
          }
          56% {
            transform: scale(1);
          }
        }
        @keyframes authTagFade {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

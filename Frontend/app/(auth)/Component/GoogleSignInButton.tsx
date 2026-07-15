"use client";

import { useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = {
  credential: string;
};

type Props = {
  label?: string;
  className?: string;
  disabled?: boolean;
  onCredential: (idToken: string) => void | Promise<void>;
  onError?: (message: string) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    'script[src="https://accounts.google.com/gsi/client"]'
  );
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve());
      if (window.google?.accounts?.id) resolve();
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google sign-in"));
    document.head.appendChild(script);
  });
}

export default function GoogleSignInButton({
  label = "Sign in with Google",
  className = "",
  disabled = false,
  onCredential,
  onError,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [ready, setReady] = useState(false);

  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!CLIENT_ID) {
        onErrorRef.current?.(
          "Google sign-in is not configured (missing NEXT_PUBLIC_GOOGLE_CLIENT_ID)"
        );
        return;
      }

      try {
        await loadGoogleScript();
        if (cancelled || !overlayRef.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (response) => {
            if (!response?.credential) {
              onErrorRef.current?.("Google did not return a credential");
              return;
            }
            try {
              await onCredentialRef.current(response.credential);
            } catch (err: any) {
              onErrorRef.current?.(err?.message || "Google sign-in failed");
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        overlayRef.current.innerHTML = "";
        const width = Math.max(overlayRef.current.offsetWidth || 320, 240);
        window.google.accounts.id.renderButton(overlayRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width,
        });

        setReady(true);
      } catch (err: any) {
        onErrorRef.current?.(err?.message || "Google sign-in failed to initialize");
      }
    }

    setup();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`relative w-full ${disabled ? "pointer-events-none opacity-50" : ""}`}>
      <button
        type="button"
        disabled={disabled || !ready}
        className={
          className ||
          "w-full h-11 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-sm"
        }
        aria-hidden
        tabIndex={-1}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#EA4335"
            d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3c.9-2.73 3.46-4.46 6.64-4.46z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.25c0-.82-.07-1.6-.2-2.35H12v4.46h6.46c-.28 1.47-1.1 2.72-2.35 3.56l3.66 2.84c2.14-1.98 3.38-4.9 3.38-8.51z"
          />
          <path
            fill="#FBBC05"
            d="M5.36 14.5c-.23-.68-.36-1.41-.36-2.17s.13-1.49.36-2.17l-3.86-3C.68 8.71 0 10.28 0 12s.68 3.29 1.5 4.84l3.86-2.84z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.18 0-5.74-1.73-6.64-4.46l-3.86 3C3.4 20.35 7.35 23 12 23z"
          />
        </svg>
        <span>{label}</span>
      </button>

      {/* Invisible Google button overlay captures the real click */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-10 overflow-hidden opacity-0"
        aria-label={label}
      />
    </div>
  );
}

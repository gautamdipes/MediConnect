import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/app/dashboard/context/AuthContext";
import { ToastProvider } from "@/components/ToastProvider";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MediConnect",
  description: "Book doctors, manage appointments, and keep medical records in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable}`}>
      <body className="font-[family-name:var(--font-sans)] antialiased">
        <AuthContextProvider>
          {children}
          <ToastProvider />
        </AuthContextProvider>
      </body>
    </html>
  );
}
